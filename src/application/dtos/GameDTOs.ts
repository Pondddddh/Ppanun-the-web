export interface PlaceBetDTO {
  userId: string;
  gameType: 'blackjack' | 'roulette' | 'poker';
  betAmount: number;
  outcome: 'win' | 'loss' | 'tie';
  payout: number;
  details: Record<string, any>;
}

export interface GameResultDTO {
  id: string;
  userId: string;
  gameType: string;
  betAmount: number;
  payout: number;
  outcome: string;
  details: Record<string, any>;
  playedAt: string;
}

export interface UserStatsDTO {
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  netProfit: number;
}
