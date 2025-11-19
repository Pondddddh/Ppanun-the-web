import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { GetPlatformStatsUseCase } from '@/application/use-cases/admin/GetPlatformStatsUseCase';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';
import { UnauthorizedError } from '@/domain/errors/DomainError';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const container = getContainer();
    const getPlatformStatsUseCase = container.resolve<GetPlatformStatsUseCase>('GetPlatformStatsUseCase');

    const stats = await getPlatformStatsUseCase.execute();

    return NextResponse.json(stats);
  } catch (error) {
    return handleError(error);
  }
}
