import { IGameRepository } from '@/domain/repositories/IGameRepository';
import { UserStatsDTO } from '../../dtos/GameDTOs';
import { GameMapper } from '../../mappers/GameMapper';

export class GetUserStatsUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(userId: string): Promise<UserStatsDTO> {
    const stats = await this.gameRepository.getUserStats(userId);
    
    if (!stats) {
      // Return empty stats if none exist
      return {
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        winRate: 0,
        netProfit: 0,
      };
    }

    return GameMapper.userStatsToDTO(stats);
  }
}
