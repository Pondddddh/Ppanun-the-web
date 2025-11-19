import { type NextRequest, NextResponse } from "next/server"
import { NeonGameRepository } from '@/infrastructure/repositories/NeonGameRepository';
import { GetUserStatsUseCase } from '@/application/use-cases/game/GetUserStatsUseCase';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    const gameRepository = new NeonGameRepository();
    const getUserStatsUseCase = new GetUserStatsUseCase(gameRepository);

    const stats = await getUserStatsUseCase.execute(payload.userId);

    return NextResponse.json(stats);
  } catch (error) {
    return handleError(error);
  }
}
