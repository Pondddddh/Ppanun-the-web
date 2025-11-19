import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { ItemDTO } from '../../dtos/InventoryDTOs';
import { ItemMapper } from '../../mappers/ItemMapper';

export class GetAllItemsUseCase {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async execute(): Promise<ItemDTO[]> {
    const items = await this.inventoryRepository.findAllItems();
    return items.map(ItemMapper.toDTO);
  }
}
