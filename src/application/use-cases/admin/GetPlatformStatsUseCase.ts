import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IGameRepository } from '@/domain/repositories/IGameRepository';

export interface PlatformStatsDTO {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalWagered: number;
  recentGames: any[];
}

export class GetPlatformStatsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private gameRepository: IGameRepository
  ) {}

  async execute(): Promise<PlatformStatsDTO> {
    const totalUsers = await this.userRepository.count();
    const recentGames = await this.gameRepository.getRecentGames(100);
    
    const totalGames = recentGames.length;
    const totalWagered = recentGames.reduce((sum, game) => sum + game.betAmount, 0);
    
    // Count unique users who have played games
    const uniqueUserIds = new Set(recentGames.map(game => game.userId));
    const activeUsers = uniqueUserIds.size;

    return {
      totalUsers,
      activeUsers,
      totalGames,
      totalWagered,
      recentGames: recentGames.slice(0, 20).map(game => ({
        id: game.id,
        userId: game.userId,
        gameType: game.gameType,
        betAmount: game.betAmount,
        payout: game.payout,
        outcome: game.outcome,
        playedAt: game.playedAt instanceof Date && !isNaN(game.playedAt.getTime()) 
          ? game.playedAt.toISOString() 
          : new Date().toISOString(),
      })),
    };
  }
}
