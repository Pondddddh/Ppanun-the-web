import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserNotFoundError } from '@/domain/errors/DomainError';

export class BanUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Create new user instance with banned status
    const bannedUser = new (user.constructor as any)(
      user.id,
      user.username,
      user.email,
      user.credits,
      user.role,
      user.createdAt,
      true // Set banned to true
    );

    await this.userRepository.update(bannedUser);
  }
}
