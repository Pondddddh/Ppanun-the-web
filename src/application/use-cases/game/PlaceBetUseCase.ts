import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IGameRepository } from '@/domain/repositories/IGameRepository';
import { GameResult } from '@/domain/entities/GameResult';
import { UserNotFoundError, InsufficientCreditsError } from '@/domain/errors/DomainError';
import { PlaceBetDTO, GameResultDTO } from '../../dtos/GameDTOs';
import { GameMapper } from '../../mappers/GameMapper';

export class PlaceBetUseCase {
  constructor(
    private userRepository: IUserRepository,
    private gameRepository: IGameRepository
  ) {}

  async execute(dto: PlaceBetDTO): Promise<GameResultDTO> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundError(dto.userId);
    }

    // Check if user can place bet
    if (!user.canPlaceBet(dto.betAmount)) {
      throw new InsufficientCreditsError(dto.betAmount, user.credits);
    }

    // Create game result
    const gameResult = new GameResult(
      crypto.randomUUID(),
      dto.userId,
      dto.gameType,
      dto.betAmount,
      dto.payout,
      dto.outcome,
      dto.details,
      new Date()
    );

    const savedResult = await this.gameRepository.saveGameResult(gameResult);

    return GameMapper.gameResultToDTO(savedResult);
  }
}
