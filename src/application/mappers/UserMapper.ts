import { User } from '../../domain/entities/User';
import { UserDTO } from '../dtos/AuthDTOs';

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      isBanned: user.isBanned,
    };
  }

  static toDomain(data: any): User {
    return new User(
      data.id,
      data.username,
      data.email,
      data.credits,
      data.role,
      new Date(data.created_at),
      data.is_banned || false
    );
  }
}
