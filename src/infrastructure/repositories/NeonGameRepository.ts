import { IGameRepository } from '@/domain/repositories/IGameRepository';
import { GameResult } from '@/domain/entities/GameResult';
import { UserStats } from '@/domain/entities/UserStats';
import { GameMapper } from '@/application/mappers/GameMapper';
import { getSqlClient } from '@/infrastructure/database/neon.client';

export class NeonGameRepository implements IGameRepository {
  private sql = getSqlClient();

  async saveGameResult(result: GameResult): Promise<GameResult> {
    const saved = await this.sql`
      SELECT record_game_result(
        ${result.userId}::uuid,
        ${result.gameType},
        ${result.betAmount},
        ${result.outcome},
        ${result.payout}
      ) as id
    ` as any[];
    
    // Return the original result with the generated ID from the procedure
    return new GameResult(
      saved[0].id,
      result.userId,
      result.gameType,
      result.betAmount,
      result.payout,
      result.outcome,
      result.details,
      new Date()
    );
  }

  async findGameHistory(userId: string, limit: number = 10): Promise<GameResult[]> {
    const result = await this.sql`
      SELECT * FROM game_history 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as any[];
    return result.map(GameMapper.gameResultToDomain);
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const result = await this.sql`
      SELECT * FROM user_stats WHERE user_id = ${userId}
    ` as any[];
    return result.length > 0 ? GameMapper.userStatsToDomain(result[0]) : null;
  }

  async getRecentGames(limit: number = 20): Promise<GameResult[]> {
    const result = await this.sql`
      SELECT * FROM game_history 
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as any[];
    return result.map(GameMapper.gameResultToDomain);
  }
}
