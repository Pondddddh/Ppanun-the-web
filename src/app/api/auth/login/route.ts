import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { LoginUserUseCase } from '@/application/use-cases/auth/LoginUserUseCase';
import { LoginSchema } from '@/infrastructure/validation/schemas';
import { handleError } from '@/presentation/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validated = LoginSchema.parse(body);

    const container = getContainer();
    const loginUseCase = container.resolve<LoginUserUseCase>('LoginUserUseCase');

    const result = await loginUseCase.execute(validated);

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
