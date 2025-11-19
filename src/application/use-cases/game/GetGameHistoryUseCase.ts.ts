import { IGameRepository } from '@/domain/repositories/IGameRepository';
import { GameResultDTO } from '../../dtos/GameDTOs';
import { GameMapper } from '../../mappers/GameMapper';

export class GetGameHistoryUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(userId: string, limit: number = 10): Promise<GameResultDTO[]> {
    const history = await this.gameRepository.findGameHistory(userId, limit);
    return history.map(GameMapper.gameResultToDTO);
  }
}
