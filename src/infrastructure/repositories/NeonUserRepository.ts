import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserMapper } from '@/application/mappers/UserMapper';
import { getSqlClient } from '@/infrastructure/database/neon.client';

export class NeonUserRepository implements IUserRepository {
  private sql = getSqlClient();

  async findById(id: string): Promise<User | null> {
    const result = await this.sql`
      SELECT * FROM users WHERE id = ${id}
    ` as any[];
    return result.length > 0 ? UserMapper.toDomain(result[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.sql`
      SELECT * FROM users WHERE email = ${email}
    ` as any[];
    return result.length > 0 ? UserMapper.toDomain(result[0]) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.sql`
      SELECT * FROM users WHERE username = ${username}
    ` as any[];
    return result.length > 0 ? UserMapper.toDomain(result[0]) : null;
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const result = await this.sql`
      SELECT * FROM users 
      WHERE email = ${identifier} OR username = ${identifier}
      LIMIT 1
    ` as any[];
    return result.length > 0 ? UserMapper.toDomain(result[0]) : null;
  }

  async create(user: User, passwordHash: string): Promise<User> {
    const result = await this.sql`
      SELECT * FROM create_user(
        ${user.id},
        ${user.username},
        ${user.email},
        ${passwordHash},
        ${user.role},
        ${user.credits}
      )
    ` as any[];
    return UserMapper.toDomain(result[0]);
  }

  async update(user: User): Promise<User> {
    await this.sql`
      UPDATE users 
      SET credits = ${user.credits},
          is_banned = ${user.isBanned}
      WHERE id = ${user.id}
    `;
    return user;
  }

  async updateCredits(userId: string, credits: number): Promise<void> {
    await this.sql`
      UPDATE users 
      SET credits = ${credits},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
  }

  async delete(id: string): Promise<void> {
    await this.sql`
      DELETE FROM users WHERE id = ${id}
    `;
  }

  async list(limit: number = 100, offset: number = 0): Promise<User[]> {
    const result = await this.sql`
      SELECT * FROM users 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as any[];
    return result.map(UserMapper.toDomain);
  }

  async count(): Promise<number> {
    const result = await this.sql`
      SELECT COUNT(*)::int as count FROM users
    ` as any[];
    return result[0].count;
  }

  async findByIdWithPassword(id: string): Promise<{ id: string; passwordHash: string } | null> {
    const result = await this.sql`
      SELECT id, password_hash FROM users WHERE id = ${id}
    ` as any[];
    return result.length > 0 ? { id: result[0].id, passwordHash: result[0].password_hash } : null;
  }
}
