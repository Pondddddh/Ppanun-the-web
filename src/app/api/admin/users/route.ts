import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { GetAllUsersUseCase } from '@/application/use-cases/admin/GetAllUserUseCase';
import { BanUserUseCase } from '@/application/use-cases/admin/BanUserUseCase';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';
import { UnauthorizedError } from '@/domain/errors/DomainError';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const container = getContainer();
    const getAllUsersUseCase = container.resolve<GetAllUsersUseCase>('GetAllUsersUseCase');

    const users = await getAllUsersUseCase.execute();

    return NextResponse.json({ users });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const container = getContainer();

    if (action === 'ban') {
      const banUserUseCase = container.resolve<BanUserUseCase>('BanUserUseCase');
      await banUserUseCase.execute(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const container = getContainer();
    const userRepo = container.resolve<IUserRepository>('UserRepository');
    await userRepo.delete(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
