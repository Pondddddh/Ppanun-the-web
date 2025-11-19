import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { GrantItemUseCase } from '@/application/use-cases/inventory/GrantItemUseCase';
import { GetUserInventoryUseCase } from '@/application/use-cases/inventory/GetUserInventoryUseCase';
import { GrantItemSchema } from '@/infrastructure/validation/schemas';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';
import { UnauthorizedError } from '@/domain/errors/DomainError';
import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const body = await request.json();
    const { action, userId, itemId } = body;

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'Missing userId or itemId' }, { status: 400 });
    }

    const container = getContainer();

    if (action === 'add') {
      const validated = GrantItemSchema.parse({ userId, itemId });
      const grantItemUseCase = container.resolve<GrantItemUseCase>('GrantItemUseCase');
      await grantItemUseCase.execute(validated);
      
      return NextResponse.json({ success: true, message: 'Item added successfully' });
    } else if (action === 'remove') {
      const inventoryRepo = container.resolve<IInventoryRepository>('InventoryRepository');
      await inventoryRepo.removeItemFromUser(userId, itemId);
      
      return NextResponse.json({ success: true, message: 'Item removed successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    
    if (payload.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const container = getContainer();
    const getInventoryUseCase = container.resolve<GetUserInventoryUseCase>('GetUserInventoryUseCase');
    const inventory = await getInventoryUseCase.execute(userId);

    return NextResponse.json({ inventory });
  } catch (error) {
    return handleError(error);
  }
}
