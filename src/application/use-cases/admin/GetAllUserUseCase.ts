import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserDTO } from '../../dtos/AuthDTOs';
import { UserMapper } from '../../mappers/UserMapper';

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(limit?: number, offset?: number): Promise<UserDTO[]> {
    const users = await this.userRepository.list(limit, offset);
    return users.map(UserMapper.toDTO);
  }
}
