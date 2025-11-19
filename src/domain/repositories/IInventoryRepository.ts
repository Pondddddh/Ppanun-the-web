import { Item } from '@/domain/entities/Item';

export interface IInventoryRepository {
  findItemById(id: string): Promise<Item | null>;
  findAllItems(): Promise<Item[]>;
  getUserInventory(userId: string): Promise<Item[]>;
  addItemToUser(userId: string, itemId: string): Promise<void>;
  removeItemFromUser(userId: string, itemId: string): Promise<void>;
  hasItem(userId: string, itemId: string): Promise<boolean>;
}
