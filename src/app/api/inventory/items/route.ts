import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { GetAllItemsUseCase } from '@/application/use-cases/inventory/GetAllItemUseCase'; 
import { handleError } from '@/presentation/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    console.log('Items API called');
    const container = getContainer();
    const getAllItemsUseCase = container.resolve<GetAllItemsUseCase>('GetAllItemsUseCase');

    const items = await getAllItemsUseCase.execute();
    console.log('Items fetched:', items.length);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Items API error:', error);
    return handleError(error);
  }
}
