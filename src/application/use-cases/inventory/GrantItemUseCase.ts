import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserNotFoundError, ItemNotFoundError } from '@/domain/errors/DomainError';
import { GrantItemDTO } from '../../dtos/InventoryDTOs';

export class GrantItemUseCase {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(dto: GrantItemDTO): Promise<void> {
    // Verify user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundError(dto.userId);
    }

    // Verify item exists
    const item = await this.inventoryRepository.findItemById(dto.itemId);
    if (!item) {
      throw new ItemNotFoundError(dto.itemId);
    }

    // Check if user already has item
    const hasItem = await this.inventoryRepository.hasItem(dto.userId, dto.itemId);
    if (hasItem) {
      throw new Error('User already has this item');
    }

    // Grant item
    await this.inventoryRepository.addItemToUser(dto.userId, dto.itemId);
  }
}
