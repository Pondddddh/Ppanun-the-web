import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { PlaceBetUseCase } from '@/application/use-cases/game/PlaceBetUseCase';
import { GetUserUseCase } from '@/application/use-cases/auth/GetUserUseCase';
import { PlaceBetSchema } from '@/infrastructure/validation/schemas';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    const body = await request.json();
    
    const dto = {
      userId: payload.userId,
      gameType: body.gameType,
      betAmount: body.betAmount,
      outcome: body.outcome,
      payout: body.payout,
      details: body.details || {},
    };

    const validated = PlaceBetSchema.parse(dto);

    const container = getContainer();
    const placeBetUseCase = container.resolve<PlaceBetUseCase>('PlaceBetUseCase');
    const getUserUseCase = container.resolve<GetUserUseCase>('GetUserUseCase');

    const result = await placeBetUseCase.execute(validated);
    
    const user = await getUserUseCase.execute(payload.userId);

    return NextResponse.json({ 
      success: true,
      gameResult: result,
      credits: user.credits
    });
  } catch (error) {
    return handleError(error);
  }
}
