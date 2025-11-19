"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RouletteWheel } from "@/components/roulette-wheel"
import { spinWheel, calculateWinnings, getNumberColor, type Bet, type BetType } from "@/lib/roulette"

export default function RouletteGame() {
  const [balance, setBalance] = useState(1000)
  const [loading, setLoading] = useState(true)
  const [betAmount, setBetAmount] = useState(100)
  const [bets, setBets] = useState<Bet[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/user/balance")
        if (res.ok) {
          const data = await res.json()
          setBalance(data.credits)
        }
      } catch (error) {
        console.error("[v0] Failed to load balance:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  const placeBet = (betType: BetType) => {
    if (betAmount > balance) return

    const newBet: Bet = { type: betType, amount: betAmount }
    setBets([...bets, newBet])
    setBalance(balance - betAmount)
  }

  const clearBets = () => {
    const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0)
    setBalance(balance + totalBets)
    setBets([])
  }

  const spin = async () => {
    if (bets.length === 0) return

    setIsSpinning(true)
    const spinResult = spinWheel()
    setResult(spinResult)

    setTimeout(async () => {
      let totalWinnings = 0
      bets.forEach((bet) => {
        totalWinnings += calculateWinnings(bet, spinResult)
      })

      const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)
      const netResult = totalWinnings - totalBetAmount

      // Save game result to database
      try {
        const res = await fetch("/api/games/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "roulette",
            betAmount: totalBetAmount,
            outcome: netResult > 0 ? "win" : netResult === 0 ? "tie" : "loss",
            payout: totalWinnings,
          }),
        })
        
        if (res.ok) {
          const data = await res.json()
          console.log("[v0] Game saved, new balance:", data.credits)
          setBalance(data.credits)
        } else {
          console.error("[v0] Failed to save game")
          // Fallback to local update if API fails
          setBalance(balance + totalWinnings)
        }
      } catch (error) {
        console.error("[v0] Failed to save game result:", error)
        setBalance(balance + totalWinnings)
      }

      setHistory([spinResult, ...history.slice(0, 9)])
      setBets([])
      setIsSpinning(false)
    }, 4000)
  }

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)

  const numbers = Array.from({ length: 37 }, (_, i) => i)
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-950 via-gray-900 to-black p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="outline">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold text-white">Roulette</h1>
          <Badge variant="secondary" className="text-xl px-4 py-2">
            Balance: ${balance.toLocaleString()}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Wheel Section */}
          <div className="space-y-4">
            <Card className="bg-gray-900/70 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-center text-xl">Roulette Wheel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RouletteWheel result={result} isSpinning={isSpinning} />

                {/* Result Display */}
                {result !== null && !isSpinning && (
                  <div className="text-center">
                    <div className="text-white text-lg mb-2">Last Result:</div>
                    <Badge
                      className={`text-2xl px-6 py-2 ${
                        getNumberColor(result) === "green"
                          ? "bg-green-600"
                          : getNumberColor(result) === "red"
                            ? "bg-red-600"
                            : "bg-gray-800"
                      }`}
                    >
                      {result}
                    </Badge>
                  </div>
                )}

                {/* History */}
                <div>
                  <div className="text-white text-sm mb-2 text-center">Recent Numbers:</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {history.map((num, idx) => {
                      const color = getNumberColor(num)
                      return (
                        <Badge
                          key={idx}
                          className={`${
                            color === "green" ? "bg-green-600" : color === "red" ? "bg-red-600" : "bg-gray-800"
                          } text-white`}
                        >
                          {num}
                        </Badge>
                      )
                    })}
                    {history.length === 0 && <div className="text-gray-500 text-sm">No history yet</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Betting Section */}
          <div className="space-y-4">
            <Card className="bg-gray-900/70 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex justify-between items-center">
                  <span>Place Your Bets</span>
                  <Badge variant={totalBetAmount > 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    Total: ${totalBetAmount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Bet Amount Selection */}
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">Select Chip Value:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 50, 100, 250, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant={betAmount === amount ? "default" : "outline"}
                        onClick={() => setBetAmount(amount)}
                        size="sm"
                        disabled={isSpinning}
                        className="min-w-[70px]"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Bets */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">Colors (2:1 payout)</h3>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 h-12"
                      onClick={() => placeBet({ type: "color", color: "red" })}
                      disabled={isSpinning}
                    >
                      Red
                    </Button>
                    <Button
                      className="flex-1 bg-gray-800 hover:bg-gray-900 h-12"
                      onClick={() => placeBet({ type: "color", color: "black" })}
                      disabled={isSpinning}
                    >
                      Black
                    </Button>
                  </div>
                </div>

                {/* Even/Odd */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">Even/Odd (2:1 payout)</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent h-12 text-white"
                      onClick={() => placeBet({ type: "evenOdd", choice: "even" })}
                      disabled={isSpinning}
                    >
                      Even
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent h-12 text-white"
                      onClick={() => placeBet({ type: "evenOdd", choice: "odd" })}
                      disabled={isSpinning}
                    >
                      Odd
                    </Button>
                  </div>
                </div>

                {/* High/Low */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">High/Low (2:1 payout)</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent h-12 text-white"
                      onClick={() => placeBet({ type: "highLow", choice: "low" })}
                      disabled={isSpinning}
                    >
                      1-18
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent h-12 text-white"
                      onClick={() => placeBet({ type: "highLow", choice: "high" })}
                      disabled={isSpinning}
                    >
                      19-36
                    </Button>
                  </div>
                </div>

                {/* Dozens */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">Dozens (3:1 payout)</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent text-white"
                      onClick={() => placeBet({ type: "dozen", dozen: 1 })}
                      disabled={isSpinning}
                    >
                      1-12
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent text-white"
                      onClick={() => placeBet({ type: "dozen", dozen: 2 })}
                      disabled={isSpinning}
                    >
                      13-24
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent text-white"
                      onClick={() => placeBet({ type: "dozen", dozen: 3 })}
                      disabled={isSpinning}
                    >
                      25-36
                    </Button>
                  </div>
                </div>

                {/* Straight Numbers */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">Straight Up (35:1 payout)</h3>
                  <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1">
                    {numbers.map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        size="sm"
                        className={`text-xs h-9 ${
                          num === 0
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                            : redNumbers.includes(num)
                              ? "bg-red-600 hover:bg-red-700 text-white border-red-500"
                              : "bg-gray-800 hover:bg-gray-900 text-white border-gray-700"
                        }`}
                        onClick={() => placeBet({ type: "straight", number: num })}
                        disabled={isSpinning}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Active Bets Display */}
                {bets.length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <div className="text-white font-semibold text-sm mb-2">Active Bets:</div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {bets.map((bet, idx) => (
                        <div key={idx} className="text-xs text-gray-300 flex justify-between">
                          <span>{JSON.stringify(bet.type)}</span>
                          <span className="font-semibold">${bet.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 h-12 text-lg" size="lg" onClick={spin} disabled={isSpinning || bets.length === 0}>
                    {isSpinning ? "Spinning..." : "Spin"}
                  </Button>
                  <Button variant="outline" size="lg" className="h-12" onClick={clearBets} disabled={isSpinning || bets.length === 0}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
