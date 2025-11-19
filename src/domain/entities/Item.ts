export type ItemType = 'badge' | 'trophy' | 'cosmetic';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export class Item {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly type: ItemType,
    public readonly rarity: ItemRarity,
    public readonly icon: string
  ) {}

  isRareThanOrEqual(rarity: ItemRarity): boolean {
    const rarityOrder: ItemRarity[] = ['common', 'rare', 'epic', 'legendary'];
    return rarityOrder.indexOf(this.rarity) >= rarityOrder.indexOf(rarity);
  }
}
