export class UserStats {
  constructor(
    public readonly userId: string,
    private _gamesPlayed: number,
    private _gamesWon: number,
    private _gamesLost: number,
    private _totalWagered: number,
    private _totalWon: number,
    private _totalLost: number
  ) {}

  get gamesPlayed(): number {
    return this._gamesPlayed;
  }

  get gamesWon(): number {
    return this._gamesWon;
  }

  get gamesLost(): number {
    return this._gamesLost;
  }

  get totalWagered(): number {
    return this._totalWagered;
  }

  get totalWon(): number {
    return this._totalWon;
  }

  get totalLost(): number {
    return this._totalLost;
  }

  getWinRate(): number {
    if (this._gamesPlayed === 0) return 0;
    return (this._gamesWon / this._gamesPlayed) * 100;
  }

  getNetProfit(): number {
    return this._totalWon - this._totalLost;
  }

  recordGame(won: boolean, wagered: number, payout: number): void {
    this._gamesPlayed++;
    this._totalWagered += wagered;

    if (won) {
      this._gamesWon++;
      this._totalWon += payout;
    } else {
      this._gamesLost++;
      this._totalLost += wagered;
    }
  }
}
