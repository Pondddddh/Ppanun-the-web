"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStatsProps {
  initialCredits: number
  initialStats: {
    gamesPlayed: number
    gamesWon: number
  }
}

export function DashboardStats({ initialCredits, initialStats }: DashboardStatsProps) {
  const [credits, setCredits] = useState(initialCredits)
  const [stats, setStats] = useState(initialStats)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) return
      
      setIsLoading(true)
      try {
        // Fetch balance
        const balanceRes = await fetch("/api/user/balance", { cache: 'no-store' })
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json()
          setCredits(balanceData.credits)
        }

        // Fetch stats
        const statsRes = await fetch("/api/user/stats", { cache: 'no-store' })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats({
            gamesPlayed: statsData.gamesPlayed || 0,
            gamesWon: statsData.gamesWon || 0
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch on mount
    fetchData()

    const handleFocus = () => {
      fetchData()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isLoading])

  const winRate = stats.gamesPlayed > 0 
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : '0'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Stats</CardTitle>
        <CardDescription>Track your gaming performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Games Played</p>
            <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold">{winRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Chips</p>
            <p className="text-2xl font-bold">${credits.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
