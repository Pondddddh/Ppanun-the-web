import type { Card as CardType } from "@/lib/blackjack"

interface PlayingCardProps {
  card: CardType
  hidden?: boolean
}

export function PlayingCard({ card, hidden }: PlayingCardProps) {
  if (hidden) {
    return (
      <div className="w-30 h-40 bg-linear-to-br from-blue-700 via-blue-600 to-blue-800 rounded-lg border-2 border-blue-900 flex items-center justify-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px]"></div>
        <div className="text-white text-3xl z-10">🂠</div>
      </div>
    )
  }

  const isRed = card.suit === "♥" || card.suit === "♦"

  return (
    <div className="w-30 h-40 bg-white rounded-lg border-2 border-gray-300 p-2 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow">
      <div className={`text-left ${isRed ? "text-red-600" : "text-gray-900"}`}>
        <div className="text-lg font-bold leading-none">{card.rank}</div>
        <div className="text-2xl leading-none">{card.suit}</div>
      </div>
      <div className={`text-center text-4xl ${isRed ? "text-red-600" : "text-gray-900"}`}>{card.suit}</div>
      <div className={`text-right rotate-180 ${isRed ? "text-red-600" : "text-gray-900"}`}>
        <div className="text-lg font-bold leading-none">{card.rank}</div>
        <div className="text-2xl leading-none">{card.suit}</div>
      </div>
    </div>
  )
}
