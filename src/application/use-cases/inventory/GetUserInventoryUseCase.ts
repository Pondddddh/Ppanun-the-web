import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { UserInventoryDTO } from '../../dtos/InventoryDTOs';
import { ItemMapper } from '../../mappers/ItemMapper';

export class GetUserInventoryUseCase {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async execute(userId: string): Promise<UserInventoryDTO> {
    const items = await this.inventoryRepository.getUserInventory(userId);
    
    return {
      userId,
      items: items.map(ItemMapper.toDTO),
    };
  }
}
