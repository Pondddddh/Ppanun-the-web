export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}

export class InsufficientCreditsError extends DomainError {
  constructor(required: number, available: number) {
    super(`Insufficient credits: need ${required}, have ${available}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid username or password');
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(field: string) {
    super(`User with this ${field} already exists`);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
  }
}

export class GameError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class ItemNotFoundError extends DomainError {
  constructor(itemId: string) {
    super(`Item not found: ${itemId}`);
  }
}
