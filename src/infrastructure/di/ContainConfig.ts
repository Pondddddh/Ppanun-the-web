import { Container } from './Container';

// Repositories
import { NeonUserRepository } from '@/infrastructure/repositories/NeonUserRepository';
import { NeonGameRepository } from '@/infrastructure/repositories/NeonGameRepository';
import { NeonInventoryRepository } from '@/infrastructure/repositories/NeonInventoryRepository';
import { JWTAuthRepository } from '@/infrastructure/auth/JWTAuthRepository';

// Use Cases - Auth
import { RegisterUserUseCase } from '@/application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '@/application/use-cases/auth/LoginUserUseCase';
import { GetUserUseCase } from '@/application/use-cases/auth/GetUserUseCase';

// Use Cases - Game
import { PlaceBetUseCase } from '@/application/use-cases/game/PlaceBetUseCase';
import { GetUserStatsUseCase } from '@/application/use-cases/game/GetUserStatsUseCase';
import { GetGameHistoryUseCase } from '@/application/use-cases/game/GetGameHistoryUseCase.ts';

// Use Cases - Inventory
import { GetUserInventoryUseCase } from '@/application/use-cases/inventory/GetUserInventoryUseCase';
import { GrantItemUseCase } from '@/application/use-cases/inventory/GrantItemUseCase';
import { GetAllItemsUseCase } from '@/application/use-cases/inventory/GetAllItemUseCase';

// Use Cases - Admin
import { GetAllUsersUseCase } from '@/application/use-cases/admin/GetAllUserUseCase';
import { BanUserUseCase } from '@/application/use-cases/admin/BanUserUseCase';
import { GetPlatformStatsUseCase } from '@/application/use-cases/admin/GetPlatformStatsUseCase';

export function configureContainer(): Container {
  const container = new Container();

  try {
    console.log('[v0] Configuring DI container...');

    // Register repositories
    container.register('UserRepository', () => new NeonUserRepository());
    container.register('GameRepository', () => new NeonGameRepository());
    container.register('InventoryRepository', () => new NeonInventoryRepository());
    container.register('AuthRepository', () => new JWTAuthRepository());

    // Register Auth use cases
    container.register('RegisterUserUseCase', () => 
      new RegisterUserUseCase(
        container.resolve('UserRepository'),
        container.resolve('AuthRepository')
      )
    );

    container.register('LoginUserUseCase', () => 
      new LoginUserUseCase(
        container.resolve('UserRepository'),
        container.resolve('AuthRepository')
      )
    );

    container.register('GetUserUseCase', () => 
      new GetUserUseCase(container.resolve('UserRepository'))
    );

    // Register Game use cases
    container.register('PlaceBetUseCase', () => 
      new PlaceBetUseCase(
        container.resolve('UserRepository'),
        container.resolve('GameRepository')
      )
    );

    container.register('GetUserStatsUseCase', () => 
      new GetUserStatsUseCase(container.resolve('GameRepository'))
    );

    container.register('GetGameHistoryUseCase', () => 
      new GetGameHistoryUseCase(container.resolve('GameRepository'))
    );

    // Register Inventory use cases
    container.register('GetUserInventoryUseCase', () => 
      new GetUserInventoryUseCase(container.resolve('InventoryRepository'))
    );

    container.register('GrantItemUseCase', () => 
      new GrantItemUseCase(
        container.resolve('InventoryRepository'),
        container.resolve('UserRepository')
      )
    );

    container.register('GetAllItemsUseCase', () => 
      new GetAllItemsUseCase(container.resolve('InventoryRepository'))
    );

    // Register Admin use cases
    container.register('GetAllUsersUseCase', () => 
      new GetAllUsersUseCase(container.resolve('UserRepository'))
    );

    container.register('BanUserUseCase', () => 
      new BanUserUseCase(container.resolve('UserRepository'))
    );

    container.register('GetPlatformStatsUseCase', () => 
      new GetPlatformStatsUseCase(
        container.resolve('UserRepository'),
        container.resolve('GameRepository')
      )
    );

    console.log('[v0] DI container configured successfully');
    return container;
  } catch (error) {
    console.error('[v0] Error configuring DI container:', error);
    throw error;
  }
}

// Global container instance
let globalContainer: Container | null = null;

export function getContainer(): Container {
  if (!globalContainer) {
    globalContainer = configureContainer();
  }
  return globalContainer;
}
