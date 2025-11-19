import { type NextRequest, NextResponse } from "next/server"
import { getContainer } from '@/infrastructure/di';
import { GetUserUseCase } from '@/application/use-cases/auth/GetUserUseCase';
import { authenticateRequest } from '@/presentation/middleware/auth.middleware';
import { handleError } from '@/presentation/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    const container = getContainer();
    const getUserUseCase = container.resolve<GetUserUseCase>('GetUserUseCase');

    const user = await getUserUseCase.execute(payload.userId);

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    return handleError(error);
  }
}
