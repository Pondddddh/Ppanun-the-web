export interface InventoryItem {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  category: "badge" | "trophy" | "cosmetic"
  earnedAt?: Date
}

export const AVAILABLE_ITEMS: InventoryItem[] = [
  // Badges
  {
    id: "first-win",
    name: "First Victory",
    description: "Win your first game",
    icon: "🏆",
    rarity: "common",
    category: "badge",
  },
  {
    id: "blackjack-master",
    name: "Blackjack Master",
    description: "Win 10 blackjack games",
    icon: "🃏",
    rarity: "rare",
    category: "badge",
  },
  {
    id: "roulette-lucky",
    name: "Lucky Spinner",
    description: "Win 5 consecutive roulette spins",
    icon: "🎰",
    rarity: "epic",
    category: "badge",
  },
  {
    id: "poker-pro",
    name: "Poker Professional",
    description: "Win a poker game with a Royal Flush",
    icon: "♠️",
    rarity: "legendary",
    category: "badge",
  },
  {
    id: "high-roller",
    name: "High Roller",
    description: "Bet over $1,000 in a single game",
    icon: "💎",
    rarity: "epic",
    category: "badge",
  },
  {
    id: "big-winner",
    name: "Big Winner",
    description: "Win over $10,000 total",
    icon: "💰",
    rarity: "rare",
    category: "trophy",
  },
  {
    id: "veteran-player",
    name: "Casino Veteran",
    description: "Play 100 total games",
    icon: "🎖️",
    rarity: "legendary",
    category: "trophy",
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "One of the first 100 players",
    icon: "⭐",
    rarity: "rare",
    category: "badge",
  },
]

// Mock storage - replace with database
const userInventories: Record<string, string[]> = {
  demo: ["first-win", "early-adopter"],
  admin: ["first-win", "early-adopter", "veteran-player"],
}

export function getUserInventory(userId: string): InventoryItem[] {
  const itemIds = userInventories[userId] || []
  return itemIds
    .map((id) => {
      const item = AVAILABLE_ITEMS.find((i) => i.id === id)
      return item ? { ...item, earnedAt: new Date() } : null
    })
    .filter((item): item is InventoryItem => item !== null)
}

export function addItemToUser(userId: string, itemId: string): boolean {
  if (!AVAILABLE_ITEMS.find((i) => i.id === itemId)) {
    return false
  }

  if (!userInventories[userId]) {
    userInventories[userId] = []
  }

  if (userInventories[userId].includes(itemId)) {
    return false // Already has item
  }

  userInventories[userId].push(itemId)
  return true
}

export function removeItemFromUser(userId: string, itemId: string): boolean {
  if (!userInventories[userId]) {
    return false
  }

  const index = userInventories[userId].indexOf(itemId)
  if (index === -1) {
    return false
  }

  userInventories[userId].splice(index, 1)
  return true
}

export function getRarityColor(rarity: InventoryItem["rarity"]): string {
  switch (rarity) {
    case "common":
      return "text-gray-500"
    case "rare":
      return "text-blue-500"
    case "epic":
      return "text-purple-500"
    case "legendary":
      return "text-amber-500"
  }
}
