export interface IAuthRepository {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(payload: any): string;
  verifyToken(token: string): any;
}
