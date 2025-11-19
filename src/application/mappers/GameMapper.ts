import { GameResult } from '../../domain/entities/GameResult';
import { UserStats } from '../../domain/entities/UserStats';
import { GameResultDTO, UserStatsDTO } from '../dtos/GameDTOs';

export class GameMapper {
  static gameResultToDTO(result: GameResult): GameResultDTO {
    return {
      id: result.id,
      userId: result.userId,
      gameType: result.gameType,
      betAmount: result.betAmount,
      payout: result.payout,
      outcome: result.outcome,
      details: result.details,
      playedAt: result.playedAt.toISOString(),
    };
  }

  static gameResultToDomain(data: any): GameResult {
    // Use created_at instead of played_at to match database schema
    const playedAt = new Date(data.created_at || data.played_at);
    
    return new GameResult(
      data.id,
      data.user_id,
      data.game_type,
      data.bet_amount,
      data.payout,
      data.outcome,
      data.details,
      playedAt
    );
  }

  static userStatsToDTO(stats: UserStats): UserStatsDTO {
    return {
      userId: stats.userId,
      gamesPlayed: stats.gamesPlayed,
      gamesWon: stats.gamesWon,
      gamesLost: stats.gamesLost,
      totalWagered: stats.totalWagered,
      totalWon: stats.totalWon,
      totalLost: stats.totalLost,
      winRate: stats.getWinRate(),
      netProfit: stats.getNetProfit(),
    };
  }

  static userStatsToDomain(data: any): UserStats {
    return new UserStats(
      data.user_id,
      data.total_games_played || 0,
      data.total_wins || 0,
      data.total_losses || 0,
      data.total_wagered || 0,
      data.total_winnings || 0,
      data.total_winnings - data.total_wagered || 0 // total_lost is calculated from net loss
    );
  }
}
