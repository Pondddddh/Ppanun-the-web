import { Item } from '@/domain/entities/Item';
import { ItemDTO } from '@/application/dtos/InventoryDTOs';

export class ItemMapper {
  static toDTO(item: Item): ItemDTO {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      icon: item.icon,
    };
  }

  static toDomain(data: any): Item {
    return new Item(
      data.id,
      data.name,
      data.description,
      data.type,
      data.rarity,
      data.icon
    );
  }
}
