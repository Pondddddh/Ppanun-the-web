import { NextResponse } from 'next/server';
import { 
  DomainError, 
  UserNotFoundError, 
  InvalidCredentialsError,
  UserAlreadyExistsError,
  InsufficientCreditsError,
  UnauthorizedError 
} from '../../domain/errors/DomainError';

export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof InvalidCredentialsError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof UserNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof UserAlreadyExistsError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof InsufficientCreditsError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json({ error: message }, { status: 500 });
}
