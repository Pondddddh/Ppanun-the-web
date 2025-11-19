import { NextRequest } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export async function authenticateRequest(request: NextRequest): Promise<any> {
  const authHeader = request.headers.get('authorization');
  let token: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = getTokenFromCookies(request.headers.get('cookie'));
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const container = getContainer();
  const authRepo = container.resolve<IAuthRepository>('AuthRepository');
  
  try {
    return authRepo.verifyToken(token);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
