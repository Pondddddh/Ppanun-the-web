import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';
import { UnauthorizedError } from '@/domain/errors/DomainError';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId, credits } = await request.json();

    if (!userId || credits === undefined) {
      return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 });
    }

    const container = getContainer();
    const userRepo = container.resolve<IUserRepository>('UserRepository');
    
    await userRepo.updateCredits(userId, credits);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
