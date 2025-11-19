import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GameCardProps {
  title: string
  description: string
  icon: string
  href: string
  difficulty: "Easy" | "Medium" | "Hard"
}

export function GameCard({ title, description, icon, href, difficulty }: GameCardProps) {
  const difficultyColors = {
    Easy: "text-green-600 dark:text-green-400",
    Medium: "text-yellow-600 dark:text-yellow-400",
    Hard: "text-red-600 dark:text-red-400",
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="text-6xl mb-4">{icon}</div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${difficultyColors[difficulty]}`}>{difficulty}</span>
          <Button asChild>
            <Link href={href}>Play Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
