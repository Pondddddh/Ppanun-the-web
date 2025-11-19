import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmailOrUsername(identifier: string): Promise<User | null>;
  findByIdWithPassword(id: string): Promise<{ id: string; passwordHash: string } | null>;
  create(user: User, passwordHash: string): Promise<User>;
  update(user: User): Promise<User>;
  updateCredits(userId: string, credits: number): Promise<void>;
  delete(id: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<User[]>;
  count(): Promise<number>;
}
