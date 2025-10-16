// biome-ignore-all lint/suspicious/noExplicitAny: Event data is generic, use overloads to provide specifics
// biome-ignore-all lint/complexity/noBannedTypes: Event handlers are generic and thus use Function, use overloads to provide specifics

type EventHandler = (...args: any[]) => void;
type EventMap = { [key: string]: EventHandler };

export class EventBus {
  private subscribers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    const handlers = this.getHandlersFor(event);
    handlers.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.getHandlersFor(event);
    const idx = handlers.indexOf(handler);

    if (idx < 0) return;

    handlers.splice(idx, 1);
  }

  emit(event: string, ...args: any[]): void {
    for (const handler of this.getHandlersFor(event)) handler(...args);
  }

  private getHandlersFor(event: string): EventHandler[] {
    if (!this.subscribers.has(event)) this.subscribers.set(event, []);
    return this.subscribers.get(event) ?? [];
  }
}

// Type magic based on: https://github.com/andywer/typed-emitter
// Thanks, @andywer!
export class TypedEventBus<T extends EventMap> extends EventBus {
  on<E extends keyof T>(event: E, handler: T[E]): void;
  on(event: string, handler: EventHandler) {
    super.on(event, handler);
  }

  off<E extends keyof T>(event: E, handler: T[E]): void;
  off(event: string, handler: EventHandler) {
    super.off(event, handler);
  }

  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): void;
  emit(event: string, ...args: any[]): void {
    super.emit(event, ...args);
  }
}
