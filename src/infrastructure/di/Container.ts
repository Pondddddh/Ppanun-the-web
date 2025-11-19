// Simple Dependency Injection Container
type Factory<T> = () => T;
type Singleton<T> = { instance: T };

export class Container {
  private services = new Map<string, Factory<any> | Singleton<any>>();

  register<T>(name: string, factory: Factory<T>, singleton: boolean = true): void {
    if (singleton) {
      this.services.set(name, { instance: factory() });
    } else {
      this.services.set(name, factory);
    }
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in container`);
    }

    if ('instance' in service) {
      return service.instance as T;
    }

    return (service as Factory<T>)() as T;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  clear(): void {
    this.services.clear();
  }
}
