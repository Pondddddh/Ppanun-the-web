import { type NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di';
import { RegisterUserUseCase } from '@/application/use-cases/auth/RegisterUserUseCase';
import { RegisterSchema } from '@/infrastructure/validation/schemas';
import { handleError } from '@/presentation/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validated = RegisterSchema.parse(body);

    const container = getContainer();
    const registerUseCase = container.resolve<RegisterUserUseCase>('RegisterUserUseCase');

    const result = await registerUseCase.execute(validated);

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
