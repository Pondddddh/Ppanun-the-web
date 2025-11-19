import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { InvalidCredentialsError } from '@/domain/errors/DomainError';
import { LoginUserDTO, AuthResponseDTO } from '../../dtos/AuthDTOs';

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authRepository: IAuthRepository
  ) {}

  async execute(dto: LoginUserDTO): Promise<AuthResponseDTO> {
    console.log('[v0] Login attempt for identifier:', dto.identifier);
    console.log('[v0] Password received, length:', dto.password.length);
    console.log('[v0] First 3 chars of password:', dto.password.substring(0, 3));
    
    // Find user by email or username
    const user = await this.userRepository.findByEmailOrUsername(dto.identifier);
    if (!user) {
      console.log('[v0] User not found for identifier:', dto.identifier);
      throw new InvalidCredentialsError();
    }

    console.log('[v0] User found:', { id: user.id, username: user.username, email: user.email });

    const userWithPassword = await this.userRepository.findByIdWithPassword(user.id);
    if (!userWithPassword) {
      console.log('[v0] User password not found for id:', user.id);
      throw new InvalidCredentialsError();
    }

    console.log('[v0] Comparing password, hash length:', userWithPassword.passwordHash.length);
    console.log('[v0] Hash starts with:', userWithPassword.passwordHash.substring(0, 10));
    const isValid = await this.authRepository.comparePassword(dto.password, userWithPassword.passwordHash);
    console.log('[v0] Password valid:', isValid);
    
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // Generate token
    const token = this.authRepository.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      credits: user.credits,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        role: user.role,
      },
    };
  }
}
