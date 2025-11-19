export type GameType = 'blackjack' | 'roulette' | 'poker';
export type GameOutcome = 'win' | 'loss' | 'tie';

export class GameResult {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly gameType: GameType,
    public readonly betAmount: number,
    public readonly payout: number,
    public readonly outcome: GameOutcome,
    public readonly details: Record<string, any>,
    public readonly playedAt: Date
  ) {
    this.validate();
  }

  getProfit(): number {
    return this.payout - this.betAmount;
  }

  isWin(): boolean {
    return this.outcome === 'win';
  }

  isLoss(): boolean {
    return this.outcome === 'loss';
  }

  private validate(): void {
    if (this.betAmount <= 0) {
      throw new Error('Bet amount must be positive');
    }
    if (this.payout < 0) {
      throw new Error('Payout cannot be negative');
    }
  }
}
