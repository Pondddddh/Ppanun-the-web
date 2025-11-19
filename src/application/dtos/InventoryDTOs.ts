export interface ItemDTO {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  icon: string;
}

export interface UserInventoryDTO {
  userId: string;
  items: ItemDTO[];
}

export interface GrantItemDTO {
  userId: string;
  itemId: string;
}
