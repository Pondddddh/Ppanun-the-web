export type Suit = "♠" | "♥" | "♦" | "♣"
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

export interface Card {
  suit: Suit
  rank: Rank
}

export function createDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"]
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const deck: Card[] = []

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank })
    }
  }

  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getCardValue(card: Card, currentTotal: number): number {
  if (card.rank === "A") {
    return currentTotal + 11 > 21 ? 1 : 11
  }
  if (["J", "Q", "K"].includes(card.rank)) {
    return 10
  }
  return Number.parseInt(card.rank)
}

export function calculateHandValue(hand: Card[]): number {
  let total = 0
  let aces = 0

  for (const card of hand) {
    if (card.rank === "A") {
      aces++
      total += 11
    } else if (["J", "Q", "K"].includes(card.rank)) {
      total += 10
    } else {
      total += Number.parseInt(card.rank)
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21
}

export function isBust(hand: Card[]): boolean {
  return calculateHandValue(hand) > 21
}
