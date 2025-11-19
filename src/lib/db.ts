import { neon } from "@neondatabase/serverless"

// Initialize Neon client with connection pooling
export const sql = neon(process.env.NEON_DATABASE_URL!)

// Helper types
export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  role: "user" | "admin"
  credits: number
  created_at: Date
  updated_at: Date
}

export interface Item {
  id: string
  name: string
  description: string
  type: "badge" | "trophy" | "cosmetic" | "avatar" | "title"
  rarity: "common" | "rare" | "epic" | "legendary"
  icon: string
  created_at: Date
}

export interface UserInventoryItem extends Item {
  acquired_at: Date
}

export interface GameHistory {
  id: number
  user_id: string
  game_type: "blackjack" | "roulette" | "poker"
  bet_amount: number
  result: "win" | "loss" | "push"
  payout: number
  played_at: Date
}

export interface UserStats {
  user_id: string
  total_games_played: number
  total_wins: number
  total_losses: number
  total_wagered: number
  total_won: number
  blackjack_played: number
  blackjack_wins: number
  roulette_played: number
  roulette_wins: number
  poker_played: number
  poker_wins: number
  updated_at: Date
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `
  return (result[0] as User) || null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `
  return (result[0] as User) || null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `
  return (result[0] as User) || null
}

export async function createUser(user: {
  id: string
  username: string
  email: string
  password_hash: string
  role?: "user" | "admin"
}): Promise<User> {
  const result = await sql`
    SELECT * FROM create_user(
      ${user.id}, 
      ${user.username}, 
      ${user.email}, 
      ${user.password_hash}, 
      ${user.role || "user"}
    )
  `
  return result[0] as User
}

export async function updateUserCredits(userId: string, amount: number): Promise<number> {
  const result = await sql`
    SELECT update_user_credits(${userId}, ${amount}) as credits
  `
  return result[0].credits as number
}

export async function getAllUsers(): Promise<User[]> {
  const result = await sql`
    SELECT * FROM users ORDER BY created_at DESC
  `
  return result as User[]
}

export async function canAffordBet(userId: string, betAmount: number): Promise<boolean> {
  const result = await sql`
    SELECT can_afford_bet(${userId}, ${betAmount}) as can_afford
  `
  return result[0].can_afford as boolean
}

export async function getUserWinRate(userId: string): Promise<number> {
  const result = await sql`
    SELECT get_user_win_rate(${userId}) as win_rate
  `
  return result[0].win_rate as number
}

// Inventory queries

export async function addItemToInventory(userId: string, itemId: string): Promise<boolean> {
  const result = await sql`
    SELECT grant_item_to_user(${userId}, ${itemId}) as success
  `
  return result[0].success as boolean
}

export async function removeItemFromInventory(userId: string, itemId: string): Promise<boolean> {
  const result = await sql`
    SELECT remove_item_from_user(${userId}, ${itemId}) as success
  `
  return result[0].success as boolean
}

export async function getUserInventory(userId: string): Promise<UserInventoryItem[]> {
  const result = await sql`
    SELECT i.*, ui.acquired_at
    FROM user_inventory ui
    JOIN items i ON ui.item_id = i.id
    WHERE ui.user_id = ${userId}
    ORDER BY ui.acquired_at DESC
  `
  return result as UserInventoryItem[]
}

export async function getAllItems(): Promise<Item[]> {
  const result = await sql`
    SELECT * FROM items ORDER BY rarity, name
  `
  return result as Item[]
}

// Game history queries

export async function addGameHistory(history: {
  user_id: string
  game_type: "blackjack" | "roulette" | "poker"
  bet_amount: number
  result: "win" | "loss" | "push"
  payout: number
}): Promise<number> {
  const result = await sql`
    SELECT record_game_result(
      ${history.user_id}, 
      ${history.game_type}, 
      ${history.bet_amount}, 
      ${history.result}, 
      ${history.payout}
    ) as game_id
  `
  return result[0].game_id as number
}

export async function getUserGameHistory(userId: string, limit = 50): Promise<GameHistory[]> {
  const result = await sql`
    SELECT * FROM game_history
    WHERE user_id = ${userId}
    ORDER BY played_at DESC
    LIMIT ${limit}
  `
  return result as GameHistory[]
}

// Stats queries
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const result = await sql`
    SELECT * FROM user_stats WHERE user_id = ${userId} LIMIT 1
  `
  return (result[0] as UserStats) || null
}

export async function getAllUserStats(): Promise<UserStats[]> {
  const result = await sql`
    SELECT * FROM user_stats ORDER BY total_games_played DESC
  `
  return result as UserStats[]
}
