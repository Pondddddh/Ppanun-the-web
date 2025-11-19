import { cookies } from "next/headers"
import { redirect } from 'next/navigation'
import { verifyToken, getTokenFromCookies } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUserManager } from "@/components/admin-user-manager"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = getTokenFromCookies(cookieStore.toString())

  if (!token) {
    redirect("/login")
  }

  const user = await verifyToken(token)

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  let users = []
  let platformStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    totalWagered: 0
  }

  try {
    const [usersRes, statsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      })
    ])

    if (usersRes.ok) {
      const usersData = await usersRes.json()
      users = usersData.users || []
    }

    if (statsRes.ok) {
      platformStats = await statsRes.json()
    }
  } catch (error) {
    console.error('Failed to fetch admin data:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">P'panun - Admin Panel</h1>
          </div>
          <UserNav user={user} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.username}!</h2>
          <p className="text-muted-foreground">Manage the casino platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Registered players</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{platformStats.totalUsers || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Players</CardTitle>
              <CardDescription>Players with game history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{platformStats.activeUsers || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Games</CardTitle>
              <CardDescription>All games played</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{platformStats.totalGames || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Wagered</CardTitle>
              <CardDescription>All bets placed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">${(platformStats.totalWagered || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUserManager users={users} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
