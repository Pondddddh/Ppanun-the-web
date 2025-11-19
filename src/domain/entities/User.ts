export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    private _credits: number,
    public readonly role: 'user' | 'admin',
    public readonly createdAt: Date,
    public readonly isBanned: boolean = false
  ) {
    this.validateCredits(_credits);
  }

  get credits(): number {
    return this._credits;
  }

  addCredits(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this._credits += amount;
  }

  deductCredits(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (this._credits < amount) {
      throw new Error('Insufficient credits');
    }
    this._credits -= amount;
  }

  canPlaceBet(amount: number): boolean {
    return this._credits >= amount && amount > 0 && !this.isBanned;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  private validateCredits(credits: number): void {
    if (credits < 0) {
      throw new Error('Credits cannot be negative');
    }
  }
}
