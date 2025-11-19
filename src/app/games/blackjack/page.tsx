"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayingCard } from "@/components/playing-card"
import { createDeck, calculateHandValue, isBlackjack, isBust, type Card as CardType } from "@/lib/blackjack"

type GameStatus = "betting" | "playing" | "dealer" | "finished"
type Result = "win" | "lose" | "push" | "blackjack" | null

export default function BlackjackGame() {
  const [deck, setDeck] = useState<CardType[]>([])
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [dealerHand, setDealerHand] = useState<CardType[]>([])
  const [gameStatus, setGameStatus] = useState<GameStatus>("betting")
  const [result, setResult] = useState<Result>(null)
  const [balance, setBalance] = useState(0)
  const [bet, setBet] = useState(100)
  const [showDealerCards, setShowDealerCards] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/user/balance")
      if (response.ok) {
        const data = await response.json()
        setBalance(data.credits)
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveGameResult = async (gameResult: Result, betAmount: number, winAmount: number) => {
    try {
      const outcome = 
        gameResult === "blackjack" || gameResult === "win" ? "win" :
        gameResult === "push" ? "tie" :
        "loss";

      const payout = 
        gameResult === "blackjack" ? betAmount + winAmount :
        gameResult === "win" ? betAmount + winAmount :
        gameResult === "push" ? betAmount :
        0;

      const response = await fetch("/api/games/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "blackjack",
          betAmount,
          payout,
          outcome,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setBalance(data.credits)
      } else {
        await fetchBalance()
      }
    } catch (error) {
      console.error("Failed to save game result:", error)
      await fetchBalance()
    }
  }

  const startNewRound = () => {
    const newDeck = createDeck()
    const player = [newDeck[0], newDeck[2]]
    const dealer = [newDeck[1], newDeck[3]]

    setDeck(newDeck.slice(4))
    setPlayerHand(player)
    setDealerHand(dealer)
    setGameStatus("playing")
    setResult(null)
    setShowDealerCards(false)

    if (isBlackjack(player)) {
      setShowDealerCards(true)
      if (isBlackjack(dealer)) {
        setResult("push")
        saveGameResult("push", bet, bet)
      } else {
        setResult("blackjack")
        const winAmount = Math.floor(bet * 1.5)
        saveGameResult("blackjack", bet, winAmount)
      }
      setGameStatus("finished")
    }
  }

  const hit = () => {
    const newCard = deck[0]
    const newHand = [...playerHand, newCard]
    setPlayerHand(newHand)
    setDeck(deck.slice(1))

    if (isBust(newHand)) {
      setShowDealerCards(true)
      setResult("lose")
      setGameStatus("finished")
      saveGameResult("lose", bet, 0)
    }
  }

  const stand = () => {
    setShowDealerCards(true)
    setGameStatus("dealer")
    dealerPlay()
  }

  const dealerPlay = () => {
    let currentDealerHand = [...dealerHand]
    let currentDeck = [...deck]

    while (calculateHandValue(currentDealerHand) < 17) {
      currentDealerHand = [...currentDealerHand, currentDeck[0]]
      currentDeck = currentDeck.slice(1)
    }

    setDealerHand(currentDealerHand)
    setDeck(currentDeck)

    const playerValue = calculateHandValue(playerHand)
    const dealerValue = calculateHandValue(currentDealerHand)

    let gameResult: Result
    let winAmount = 0

    if (isBust(currentDealerHand)) {
      gameResult = "win"
      winAmount = bet
    } else if (playerValue > dealerValue) {
      gameResult = "win"
      winAmount = bet
    } else if (playerValue < dealerValue) {
      gameResult = "lose"
      winAmount = 0
    } else {
      gameResult = "push"
      winAmount = 0
    }

    setResult(gameResult)
    setGameStatus("finished")
    saveGameResult(gameResult, bet, winAmount)
  }

  const playerValue = calculateHandValue(playerHand)
  const dealerValue = calculateHandValue(dealerHand)

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="outline">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold text-white">Blackjack</h1>
          <div className="text-white text-xl font-semibold">Balance: ${balance.toLocaleString()}</div>
        </div>

        <div className="space-y-8">
          {/* Dealer's Hand */}
          <Card className="bg-green-800/50 border-green-700">
            <CardHeader>
              <CardTitle className="text-white flex justify-between items-center">
                <span>Dealer's Hand</span>
                {showDealerCards && <span className="text-2xl">{dealerValue}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {dealerHand.map((card, index) => (
                  <PlayingCard key={index} card={card} hidden={!showDealerCards && index === 1} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player's Hand */}
          <Card className="bg-green-800/50 border-green-700">
            <CardHeader>
              <CardTitle className="text-white flex justify-between items-center">
                <span>Your Hand</span>
                {playerHand.length > 0 && <span className="text-2xl">{playerValue}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {playerHand.map((card, index) => (
                  <PlayingCard key={index} card={card} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Controls */}
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              {gameStatus === "betting" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <label className="font-semibold">Bet Amount:</label>
                    <div className="flex gap-2">
                      {[50, 100, 250, 500, 1000].map((amount) => (
                        <Button
                          key={amount}
                          variant={bet === amount ? "default" : "outline"}
                          onClick={() => setBet(amount)}
                          disabled={amount > balance}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button size="lg" onClick={startNewRound} disabled={bet > balance}>
                      Deal Cards
                    </Button>
                  </div>
                </div>
              )}

              {gameStatus === "playing" && (
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={hit} disabled={isBust(playerHand)}>
                    Hit
                  </Button>
                  <Button size="lg" variant="secondary" onClick={stand}>
                    Stand
                  </Button>
                </div>
              )}

              {gameStatus === "finished" && result && (
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold">
                    {result === "win" && <span className="text-green-600">You Win!</span>}
                    {result === "lose" && <span className="text-red-600">You Lose!</span>}
                    {result === "push" && <span className="text-yellow-600">Push!</span>}
                    {result === "blackjack" && <span className="text-green-600">Blackjack! 🎉</span>}
                  </div>
                  <div className="text-muted-foreground">
                    {result === "win" && `You won $${bet}!`}
                    {result === "lose" && `You lost $${bet}`}
                    {result === "push" && "Bet returned"}
                    {result === "blackjack" && `You won $${Math.floor(bet * 1.5)}!`}
                  </div>
                  <Button size="lg" onClick={() => setGameStatus("betting")}>
                    New Round
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
