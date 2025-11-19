"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayingCard } from "@/components/playing-card"
import { createDeck, shuffleDeck, type Card as CardType } from "@/lib/blackjack"
import { type Player, type GamePhase, evaluateHand, compareHands } from "@/lib/poker"
import { getAIPokerAction } from "@/lib/poker-ai"

export default function PokerGame() {
  const [credits, setCredits] = useState(1000)
  const [loading, setLoading] = useState(true)
  
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "You", chips: 1000, hand: [], bet: 0, folded: false, isDealer: false, isAI: false },
    { id: "2", name: "AI Player 1", chips: 10000, hand: [], bet: 0, folded: false, isDealer: false, isAI: true },
    { id: "3", name: "AI Player 2", chips: 10000, hand: [], bet: 0, folded: false, isDealer: false, isAI: true },
    { id: "4", name: "AI Player 3", chips: 10000, hand: [], bet: 0, folded: false, isDealer: true, isAI: true },
  ])
  const [communityCards, setCommunityCards] = useState<CardType[]>([])
  const [deck, setDeck] = useState<CardType[]>([])
  const [pot, setPot] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [phase, setPhase] = useState<GamePhase>("betting")
  const [gameStarted, setGameStarted] = useState(false)
  const [betAmount, setBetAmount] = useState(100)
  const [showdown, setShowdown] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/user/balance")
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
          setPlayers(prev => prev.map((p, idx) => 
            idx === 0 ? { ...p, chips: data.credits } : p
          ))
        }
      } catch (error) {
        console.error("[v0] Failed to load balance:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  const startNewRound = () => {
    const newDeck = shuffleDeck(createDeck())
    const updatedPlayers = players.map((player, idx) => ({
      ...player,
      hand: [newDeck[idx * 2], newDeck[idx * 2 + 1]],
      bet: 0,
      folded: false,
    }))

    setPlayers(updatedPlayers)
    setDeck(newDeck.slice(8))
    setCommunityCards([])
    setPot(0)
    setCurrentBet(0)
    setPhase("pre-flop")
    setGameStarted(true)
    setShowdown(false)
    setWinner(null)
  }

  const playerFold = () => {
    const updatedPlayers = [...players]
    updatedPlayers[0].folded = true
    setPlayers(updatedPlayers)
    checkRoundEnd()
  }

  const playerCall = () => {
    const player = players[0]
    const callAmount = currentBet - player.bet

    if (callAmount <= player.chips) {
      const updatedPlayers = [...players]
      updatedPlayers[0].chips -= callAmount
      updatedPlayers[0].bet = currentBet
      setPlayers(updatedPlayers)
      setPot(pot + callAmount)

      setTimeout(() => aiPlayersAct(), 1000)
    }
  }

  const playerRaise = () => {
    const player = players[0]
    const raiseAmount = betAmount

    if (raiseAmount <= player.chips) {
      const totalBet = currentBet + raiseAmount
      const updatedPlayers = [...players]
      updatedPlayers[0].chips -= totalBet - player.bet
      updatedPlayers[0].bet = totalBet
      setPlayers(updatedPlayers)
      setPot(pot + totalBet - currentBet)
      setCurrentBet(totalBet)

      setTimeout(() => aiPlayersAct(), 1000)
    }
  }

  const aiPlayersAct = async () => {
    const updatedPlayers = [...players]
    let newPot = pot
    let highestBet = currentBet

    // Use async OpenAI-powered poker bot for each AI player
    for (let i = 1; i < updatedPlayers.length; i++) {
      if (!updatedPlayers[i].folded) {
        // Call OpenAI-powered poker bot
        const action = await getAIPokerAction({
          playerHand: updatedPlayers[i].hand,
          communityCards,
          pot: newPot,
          currentBet: highestBet,
          playerBet: updatedPlayers[i].bet,
          playerChips: updatedPlayers[i].chips,
        })

        if (action === "fold") {
          updatedPlayers[i].folded = true
        } else if (action === "call") {
          const callAmount = highestBet - updatedPlayers[i].bet
          if (callAmount <= updatedPlayers[i].chips) {
            updatedPlayers[i].chips -= callAmount
            updatedPlayers[i].bet = highestBet
            newPot += callAmount
          } else {
            updatedPlayers[i].folded = true
          }
        } else if (action === "raise") {
          const raiseAmount = Math.min(200, updatedPlayers[i].chips)
          const totalBet = highestBet + raiseAmount
          updatedPlayers[i].chips -= totalBet - updatedPlayers[i].bet
          updatedPlayers[i].bet = totalBet
          newPot += totalBet - highestBet
          highestBet = totalBet
        }
      }
    }

    setPlayers(updatedPlayers)
    setPot(newPot)
    setCurrentBet(highestBet)

    setTimeout(() => checkRoundEnd(), 1000)
  }

  const checkRoundEnd = () => {
    const activePlayers = players.filter((p) => !p.folded)

    if (activePlayers.length === 1) {
      endGame(activePlayers[0])
      return
    }

    advancePhase()
  }

  const advancePhase = () => {
    if (phase === "pre-flop") {
      setCommunityCards([deck[0], deck[1], deck[2]])
      setDeck(deck.slice(3))
      setPhase("flop")
    } else if (phase === "flop") {
      setCommunityCards([...communityCards, deck[0]])
      setDeck(deck.slice(1))
      setPhase("turn")
    } else if (phase === "turn") {
      setCommunityCards([...communityCards, deck[0]])
      setDeck(deck.slice(1))
      setPhase("river")
    } else if (phase === "river") {
      determineWinner()
    }
  }

  const determineWinner = () => {
    const activePlayers = players.filter((p) => !p.folded)
    let bestHand = null
    let winningPlayer = null

    for (const player of activePlayers) {
      const hand = evaluateHand(player.hand, communityCards)
      if (!bestHand || compareHands(hand, bestHand) > 0) {
        bestHand = hand
        winningPlayer = player
      }
    }

    if (winningPlayer) {
      endGame(winningPlayer)
    }
  }

  const endGame = async (winningPlayer: Player) => {
    const updatedPlayers = players.map((p) => (p.id === winningPlayer.id ? { ...p, chips: p.chips + pot } : p))
    setPlayers(updatedPlayers)
    setWinner(winningPlayer)
    setShowdown(true)
    setGameStarted(false)

    const playerBet = Math.max(updatedPlayers[0].bet, betAmount)

    if (winningPlayer.id === "1") {
      try {
        const res = await fetch("/api/games/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "poker",
            betAmount: playerBet,
            outcome: "win",
            payout: pot,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          console.log("[v0] Game saved, new balance:", data.credits)
          setCredits(data.credits)
          setPlayers(prev => prev.map((p, idx) => 
            idx === 0 ? { ...p, chips: data.credits } : p
          ))
        }
      } catch (error) {
        console.error("[v0] Failed to save game result:", error)
      }
    } else {
      try {
        const res = await fetch("/api/games/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "poker",
            betAmount: playerBet,
            outcome: "loss",
            payout: 0,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          console.log("[v0] Game saved, new balance:", data.credits)
          setCredits(data.credits)
          setPlayers(prev => prev.map((p, idx) => 
            idx === 0 ? { ...p, chips: data.credits } : p
          ))
        }
      } catch (error) {
        console.error("[v0] Failed to save game result:", error)
      }
    }
  }

  const player = players[0]
  const activePlayers = players.filter((p) => !p.folded)

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="outline">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold text-white">Texas Hold'em Poker</h1>
          <div className="text-white text-xl font-semibold">Pot: ${pot.toLocaleString()}</div>
        </div>

        <div className="space-y-6">
          {/* AI Players */}
          <div className="grid md:grid-cols-3 gap-4">
            {players.slice(1).map((aiPlayer) => (
              <Card key={aiPlayer.id} className={`${aiPlayer.folded ? "opacity-50" : ""} bg-white/95`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-center text-lg">
                    <span>{aiPlayer.name}</span>
                    <Badge variant={aiPlayer.isDealer ? "default" : "outline"} className="text-xs">
                      {aiPlayer.isDealer ? "Dealer" : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2 justify-center min-h-[120px] items-center">
                      {gameStarted && !aiPlayer.folded ? (
                        <>
                          <PlayingCard card={aiPlayer.hand[0]} hidden />
                          <PlayingCard card={aiPlayer.hand[1]} hidden />
                        </>
                      ) : showdown && !aiPlayer.folded ? (
                        <>
                          <PlayingCard card={aiPlayer.hand[0]} />
                          <PlayingCard card={aiPlayer.hand[1]} />
                        </>
                      ) : null}
                    </div>
                    <div className="text-sm space-y-1 text-center">
                      <div className="font-semibold">Chips: ${aiPlayer.chips.toLocaleString()}</div>
                      <div className="text-muted-foreground">Bet: ${aiPlayer.bet}</div>
                      {aiPlayer.folded && <Badge variant="destructive" className="mt-1">Folded</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Community Cards */}
          <Card className="bg-green-800/50 border-green-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-center text-xl">
                Community Cards 
                <span className="ml-2 text-sm text-green-200">({phase})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-center flex-wrap min-h-[120px] items-center">
                {communityCards.length > 0 ? (
                  communityCards.map((card, idx) => (
                    <PlayingCard key={idx} card={card} />
                  ))
                ) : (
                  <div className="text-white/50 text-sm">Waiting for cards...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player Hand */}
          <Card className="bg-white/95">
            <CardHeader className="pb-4">
              <CardTitle className="flex justify-between items-center">
                <span>Your Hand</span>
                <div className="flex items-center gap-4 text-base">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Chips: ${player.chips.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    Bet: ${player.bet}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3 justify-center min-h-[120px] items-center">
                {player.hand.length > 0 ? (
                  player.hand.map((card, idx) => (
                    <PlayingCard key={idx} card={card} />
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm">No cards dealt</div>
                )}
              </div>

              {!gameStarted && !showdown && (
                <div className="flex justify-center pt-2">
                  <Button size="lg" onClick={startNewRound} className="min-w-[200px]">
                    Start New Round
                  </Button>
                </div>
              )}

              {gameStarted && !player.folded && (
                <div className="space-y-4">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {[50, 100, 200, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant={betAmount === amount ? "default" : "outline"}
                        onClick={() => setBetAmount(amount)}
                        size="sm"
                        className="min-w-[70px]"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button variant="destructive" onClick={playerFold} className="min-w-[120px]">
                      Fold
                    </Button>
                    <Button variant="secondary" onClick={playerCall} className="min-w-[120px]">
                      Call ${currentBet - player.bet}
                    </Button>
                    <Button onClick={playerRaise} className="min-w-[120px]">
                      Raise ${betAmount}
                    </Button>
                  </div>
                </div>
              )}

              {showdown && winner && (
                <div className="text-center space-y-3 py-4">
                  <div className="text-3xl font-bold text-green-600">
                    {winner.id === "1" ? "🎉 You Win!" : `${winner.name} Wins!`}
                  </div>
                  <div className="text-xl text-muted-foreground">Won ${pot.toLocaleString()}</div>
                  <Button onClick={() => setShowdown(false)} size="lg" className="min-w-[200px]">
                    Continue
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
