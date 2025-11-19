import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

export class JWTAuthRepository implements IAuthRepository {
  private readonly JWT_SECRET: string;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: any): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
