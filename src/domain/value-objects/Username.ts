export class Username {
  private constructor(private readonly value: string) {}

  static create(username: string): Username {
    if (!this.isValid(username)) {
      throw new Error('Username must be 3-20 characters and alphanumeric');
    }
    return new Username(username);
  }

  getValue(): string {
    return this.value;
  }

  private static isValid(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
