import { GameResult } from '../entities/GameResult';
import { UserStats } from '../entities/UserStats';

export interface IGameRepository {
  saveGameResult(result: GameResult): Promise<GameResult>;
  findGameHistory(userId: string, limit?: number): Promise<GameResult[]>;
  getUserStats(userId: string): Promise<UserStats | null>;
  getRecentGames(limit?: number): Promise<GameResult[]>;
}
