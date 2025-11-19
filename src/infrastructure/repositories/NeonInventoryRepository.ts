import { getSqlClient } from "../database/neon.client";
import { Item } from "@/domain/entities/Item";
import { IInventoryRepository } from "@/domain/repositories/IInventoryRepository";
import { ItemMapper } from "@/application/mappers/ItemMapper";

export class NeonInventoryRepository implements IInventoryRepository {
  private sql = getSqlClient();

  async findItemById(id: string): Promise<Item | null> {
    const result = await this.sql`
      SELECT * FROM items WHERE id = ${id}
    ` as any[];
    return result.length > 0 ? ItemMapper.toDomain(result[0]) : null;
  }

  async findAllItems(): Promise<Item[]> {
    const result = await this.sql`
      SELECT * FROM items ORDER BY rarity, name
    ` as any[];
    return result.map(ItemMapper.toDomain);
  }

  async getUserInventory(userId: string): Promise<Item[]> {
    const result = await this.sql`
      SELECT i.* FROM items i
      INNER JOIN user_inventory ui ON i.id = ui.item_id
      WHERE ui.user_id = ${userId}
      ORDER BY i.rarity, i.name
    ` as any[];
    return result.map(ItemMapper.toDomain);
  }

  async addItemToUser(userId: string, itemId: string): Promise<void> {
    await this.sql`
      INSERT INTO user_inventory (user_id, item_id)
      VALUES (${userId}, ${itemId})
    `;
  }

  async removeItemFromUser(userId: string, itemId: string): Promise<void> {
    await this.sql`
      DELETE FROM user_inventory 
      WHERE user_id = ${userId} AND item_id = ${itemId}
    `;
  }

  async hasItem(userId: string, itemId: string): Promise<boolean> {
    const result = await this.sql`
      SELECT EXISTS(
        SELECT 1 FROM user_inventory 
        WHERE user_id = ${userId} AND item_id = ${itemId}
      ) as has_item
    ` as any[];
    return result[0].has_item;
  }
}
