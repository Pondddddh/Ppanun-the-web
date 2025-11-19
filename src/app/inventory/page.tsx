import { cookies } from "next/headers"
import { redirect } from 'next/navigation'
import { verifyToken, getTokenFromCookies } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function getRarityColor(rarity: string) {
  switch (rarity) {
    case "common":
      return "bg-gray-500"
    case "rare":
      return "bg-blue-500"
    case "epic":
      return "bg-purple-500"
    case "legendary":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

export default async function InventoryPage() {
  const cookieStore = await cookies()
  const token = getTokenFromCookies(cookieStore.toString())

  if (!token) {
    redirect("/login")
  }

  const user = await verifyToken(token)

  if (!user) {
    redirect("/login")
  }

  const inventoryRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  const inventoryItems = await inventoryRes.json()

  const itemsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/inventory/items`, {
    cache: 'no-store'
  })
  const allItems = await itemsRes.json()

  const badges = inventoryItems.filter((item: any) => item.type === "badge")
  const trophies = inventoryItems.filter((item: any) => item.type === "trophy")
  const cosmetics = inventoryItems.filter((item: any) => item.type === "cosmetic")

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">P'panun</h1>
          </div>
          <UserNav user={user} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Inventory</h2>
          <p className="text-muted-foreground">View all your earned badges, trophies, and items</p>
        </div>

        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges ({badges.length})</CardTitle>
              <CardDescription>Achievement badges earned through gameplay</CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No badges yet. Start playing to earn your first badge!
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {badges.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="text-4xl">{item.imageUrl || "🏅"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline" className={getRarityColor(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trophies ({trophies.length})</CardTitle>
              <CardDescription>Special achievements for major milestones</CardDescription>
            </CardHeader>
            <CardContent>
              {trophies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No trophies yet. Keep playing to unlock special achievements!
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trophies.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="text-4xl">{item.imageUrl || "🏆"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline" className={getRarityColor(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cosmetics ({cosmetics.length})</CardTitle>
              <CardDescription>Customization items and special effects</CardDescription>
            </CardHeader>
            <CardContent>
              {cosmetics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No cosmetic items yet. Check back for special events!
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cosmetics.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="text-4xl">{item.imageUrl || "✨"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline" className={getRarityColor(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Collection Progress</CardTitle>
            <CardDescription>Track your overall inventory completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Total Items Collected</span>
                  <span className="font-semibold">
                    {inventoryItems.length}/{allItems.length}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${allItems.length > 0 ? (inventoryItems.length / allItems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
