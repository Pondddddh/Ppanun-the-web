import { cookies } from "next/headers"
import { redirect } from 'next/navigation'
import { verifyToken, getTokenFromCookies } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"
import { GameCard } from "@/components/game-card"
import { DashboardStats } from "@/components/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = getTokenFromCookies(cookieStore.toString())

  if (!token) {
    redirect("/login")
  }

  const user = await verifyToken(token)

  if (!user) {
    redirect("/login")
  }

  let stats = { gamesPlayed: 0, gamesWon: 0 }
  
  try {
    const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    
    if (statsRes.ok) {
      const contentType = statsRes.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        stats = await statsRes.json()
      }
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">P'panun</h1>
          </div>
          <UserNav user={user} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h2>
          <p className="text-muted-foreground">Choose your game and start playing</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <GameCard
            title="Blackjack"
            description="Classic card game. Beat the dealer by getting as close to 21 as possible without going over."
            icon="🃏"
            href="/games/blackjack"
            difficulty="Easy"
          />
          <GameCard
            title="Roulette"
            description="Place your bets on the wheel. Will luck be on your side tonight?"
            icon="🎰"
            href="/games/roulette"
            difficulty="Medium"
          />
          <GameCard
            title="Poker"
            description="Texas Hold'em poker. Make the best hand and outsmart your opponents."
            icon="♠"
            href="/games/poker"
            difficulty="Hard"
          />
        </div>

        <DashboardStats 
          initialCredits={user.credits || 0} 
          initialStats={stats}
        />
      </main>
    </div>
  )
}
