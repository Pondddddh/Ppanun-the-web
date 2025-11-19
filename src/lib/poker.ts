import type { Card } from "./blackjack"

export type PokerCard = Card

export type HandRank =
  | "high-card"
  | "pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "full-house"
  | "four-of-a-kind"
  | "straight-flush"
  | "royal-flush"

export interface HandResult {
  rank: HandRank
  value: number
  cards: PokerCard[]
  description: string
}

export interface Player {
  id: string
  name: string
  chips: number
  hand: PokerCard[]
  bet: number
  folded: boolean
  isDealer: boolean
  isAI: boolean
}

export type GamePhase = "pre-flop" | "flop" | "turn" | "river" | "showdown" | "betting"

export function getRankValue(rank: string): number {
  const ranks: Record<string, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  }
  return ranks[rank] || 0
}

export function evaluateHand(playerCards: PokerCard[], communityCards: PokerCard[]): HandResult {
  const allCards = [...playerCards, ...communityCards]
  const combinations = getAllCombinations(allCards, 5)

  let bestHand: HandResult = {
    rank: "high-card",
    value: 0,
    cards: [],
    description: "High Card",
  }

  for (const combo of combinations) {
    const result = evaluateFiveCards(combo)
    if (compareHands(result, bestHand) > 0) {
      bestHand = result
    }
  }

  return bestHand
}

function getAllCombinations(arr: PokerCard[], size: number): PokerCard[][] {
  if (size > arr.length) return []
  if (size === arr.length) return [arr]
  if (size === 1) return arr.map((card) => [card])

  const combos: PokerCard[][] = []
  for (let i = 0; i <= arr.length - size; i++) {
    const head = arr[i]
    const tailCombos = getAllCombinations(arr.slice(i + 1), size - 1)
    for (const combo of tailCombos) {
      combos.push([head, ...combo])
    }
  }
  return combos
}

function evaluateFiveCards(cards: PokerCard[]): HandResult {
  const sortedCards = [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))
  const ranks = sortedCards.map((c) => c.rank)
  const suits = sortedCards.map((c) => c.suit)

  const rankCounts: Record<string, number> = {}
  ranks.forEach((rank) => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1
  })

  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  const isFlush = suits.every((suit) => suit === suits[0])
  const rankValues = sortedCards.map((c) => getRankValue(c.rank))
  const isStraight = rankValues.every((val, i) => i === 0 || val === rankValues[i - 1] - 1)

  // Royal Flush
  if (isFlush && isStraight && rankValues[0] === 14) {
    return {
      rank: "royal-flush",
      value: 10000000,
      cards: sortedCards,
      description: "Royal Flush",
    }
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return {
      rank: "straight-flush",
      value: 9000000 + rankValues[0],
      cards: sortedCards,
      description: "Straight Flush",
    }
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return {
      rank: "four-of-a-kind",
      value: 8000000 + rankValues[0] * 100,
      cards: sortedCards,
      description: "Four of a Kind",
    }
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: "full-house",
      value: 7000000 + rankValues[0] * 100,
      cards: sortedCards,
      description: "Full House",
    }
  }

  // Flush
  if (isFlush) {
    return {
      rank: "flush",
      value: 6000000 + rankValues.reduce((sum, val) => sum + val, 0),
      cards: sortedCards,
      description: "Flush",
    }
  }

  // Straight
  if (isStraight) {
    return {
      rank: "straight",
      value: 5000000 + rankValues[0],
      cards: sortedCards,
      description: "Straight",
    }
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return {
      rank: "three-of-a-kind",
      value: 4000000 + rankValues[0] * 100,
      cards: sortedCards,
      description: "Three of a Kind",
    }
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: "two-pair",
      value: 3000000 + rankValues[0] * 100 + rankValues[2],
      cards: sortedCards,
      description: "Two Pair",
    }
  }

  // Pair
  if (counts[0] === 2) {
    return {
      rank: "pair",
      value: 2000000 + rankValues[0] * 100,
      cards: sortedCards,
      description: "Pair",
    }
  }

  // High Card
  return {
    rank: "high-card",
    value: 1000000 + rankValues.reduce((sum, val) => sum + val, 0),
    cards: sortedCards,
    description: `High Card ${ranks[0]}`,
  }
}

export function compareHands(hand1: HandResult, hand2: HandResult): number {
  return hand1.value - hand2.value
}

export function getAIAction(
  player: Player,
  pot: number,
  currentBet: number,
  communityCards: PokerCard[],
): "fold" | "call" | "raise" {
  const handStrength = evaluateHand(player.hand, communityCards).value
  const potOdds = currentBet / (pot + currentBet)

  // Simple AI logic
  if (handStrength > 4000000) {
    // Three of a kind or better
    return Math.random() > 0.3 ? "raise" : "call"
  } else if (handStrength > 2000000) {
    // Pair or better
    return Math.random() > 0.5 ? "call" : "fold"
  } else {
    return Math.random() > 0.7 ? "call" : "fold"
  }
}
