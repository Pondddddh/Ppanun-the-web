import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { GetUserInventoryUseCase } from '@/application/use-cases/inventory/GetUserInventoryUseCase';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    const container = getContainer();
    const getInventoryUseCase = container.resolve<GetUserInventoryUseCase>('GetUserInventoryUseCase');

    const inventory = await getInventoryUseCase.execute(payload.userId);

    return NextResponse.json({ inventory });
  } catch (error) {
    return handleError(error);
  }
}
