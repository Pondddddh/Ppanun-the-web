import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserNotFoundError } from '@/domain/errors/DomainError';
import { UserDTO } from '../../dtos/AuthDTOs';
import { UserMapper } from '../../mappers/UserMapper';

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return UserMapper.toDTO(user);
  }
}
