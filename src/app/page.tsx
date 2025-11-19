import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-6xl font-bold text-balance">P'panun</h1>
        <p className="text-xl text-muted-foreground text-balance">
          Experience the thrill of poker, blackjack, and roulette in our premium online casino
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-12">
          <div className="space-y-2">
            <div className="text-4xl">♠</div>
            <h3 className="font-semibold">Poker</h3>
            <p className="text-sm text-muted-foreground">Texas Hold'em</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🃏</div>
            <h3 className="font-semibold">Blackjack</h3>
            <p className="text-sm text-muted-foreground">Beat the dealer</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🎰</div>
            <h3 className="font-semibold">Roulette</h3>
            <p className="text-sm text-muted-foreground">Spin to win</p>
          </div>
        </div>
      </div>
    </div>
  )
}
