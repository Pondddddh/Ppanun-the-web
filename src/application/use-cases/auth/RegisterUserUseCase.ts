import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { User } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { Username } from '@/domain/value-objects/Username';
import { UserAlreadyExistsError } from '@/domain/errors/DomainError';
import { RegisterUserDTO, AuthResponseDTO } from '../../dtos/AuthDTOs';
import { UserMapper } from '../../mappers/UserMapper';

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authRepository: IAuthRepository
  ) {}

  async execute(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    // Validate value objects
    const email = Email.create(dto.email);
    const username = Username.create(dto.username);

    // Check if user already exists
    const existingEmail = await this.userRepository.findByEmail(email.getValue());
    if (existingEmail) {
      throw new UserAlreadyExistsError('email');
    }

    const existingUsername = await this.userRepository.findByUsername(username.getValue());
    if (existingUsername) {
      throw new UserAlreadyExistsError('username');
    }

    // Hash password
    const passwordHash = await this.authRepository.hashPassword(dto.password);

    // Create user entity with initial credits
    const user = new User(
      crypto.randomUUID(),
      username.getValue(),
      email.getValue(),
      1000, // Initial credits
      'user',
      new Date(),
      false
    );

    // Save to database
    const savedUser = await this.userRepository.create(user, passwordHash);

    // Generate token
    const token = this.authRepository.generateToken({
      userId: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      role: savedUser.role,
      credits: savedUser.credits,
    });

    return {
      token,
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        credits: savedUser.credits,
        role: savedUser.role,
      },
    };
  }
}
