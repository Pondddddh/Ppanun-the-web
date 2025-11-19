export const rouletteNumbers = [
  { number: 0, color: "green" },
  { number: 32, color: "red" },
  { number: 15, color: "black" },
  { number: 19, color: "red" },
  { number: 4, color: "black" },
  { number: 21, color: "red" },
  { number: 2, color: "black" },
  { number: 25, color: "red" },
  { number: 17, color: "black" },
  { number: 34, color: "red" },
  { number: 6, color: "black" },
  { number: 27, color: "red" },
  { number: 13, color: "black" },
  { number: 36, color: "red" },
  { number: 11, color: "black" },
  { number: 30, color: "red" },
  { number: 8, color: "black" },
  { number: 23, color: "red" },
  { number: 10, color: "black" },
  { number: 5, color: "red" },
  { number: 24, color: "black" },
  { number: 16, color: "red" },
  { number: 33, color: "black" },
  { number: 1, color: "red" },
  { number: 20, color: "black" },
  { number: 14, color: "red" },
  { number: 31, color: "black" },
  { number: 9, color: "red" },
  { number: 22, color: "black" },
  { number: 18, color: "red" },
  { number: 29, color: "black" },
  { number: 7, color: "red" },
  { number: 28, color: "black" },
  { number: 12, color: "red" },
  { number: 35, color: "black" },
  { number: 3, color: "red" },
  { number: 26, color: "black" },
]

export type BetType =
  | { type: "straight"; number: number }
  | { type: "color"; color: "red" | "black" }
  | { type: "evenOdd"; choice: "even" | "odd" }
  | { type: "highLow"; choice: "high" | "low" }
  | { type: "dozen"; dozen: 1 | 2 | 3 }
  | { type: "column"; column: 1 | 2 | 3 }

export interface Bet {
  type: BetType
  amount: number
}

export function spinWheel(): number {
  return Math.floor(Math.random() * 37)
}

export function getNumberColor(num: number): "red" | "black" | "green" {
  if (num === 0) return "green"
  const numberData = rouletteNumbers.find((n) => n.number === num)
  return numberData?.color as "red" | "black" | "green"
}

export function calculateWinnings(bet: Bet, result: number): number {
  const { type, amount } = bet

  if (typeof type === "object") {
    if (type.type === "straight") {
      return type.number === result ? amount * 35 : 0
    }
    if (type.type === "color") {
      return getNumberColor(result) === type.color ? amount * 2 : 0
    }
    if (type.type === "evenOdd") {
      if (result === 0) return 0
      const isEven = result % 2 === 0
      return (isEven && type.choice === "even") || (!isEven && type.choice === "odd") ? amount * 2 : 0
    }
    if (type.type === "highLow") {
      if (result === 0) return 0
      return (result >= 19 && type.choice === "high") || (result <= 18 && type.choice === "low") ? amount * 2 : 0
    }
    if (type.type === "dozen") {
      if (result === 0) return 0
      const dozen = Math.ceil(result / 12)
      return dozen === type.dozen ? amount * 3 : 0
    }
    if (type.type === "column") {
      if (result === 0) return 0
      const column = result % 3 === 0 ? 3 : result % 3
      return column === type.column ? amount * 3 : 0
    }
  }

  return 0
}
