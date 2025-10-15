// biome-ignore-all lint/suspicious/noExplicitAny: Event data is generic, use overloads to provide specifics
// biome-ignore-all lint/complexity/noBannedTypes: Event handlers are generic and thus use Function, use overloads to provide specifics

type EventHandler = (...args: any[]) => void;

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

export class TypedEventBus<T extends Record<string, EventHandler>> extends EventBus {
  on(event: keyof(T), handler: T[typeof event]): void;
  on(event: string, handler: EventHandler) {
    super.on(event, handler)
  }

  off(event: keyof(T), handler: T[typeof event]): void;
  off(event: string, handler: EventHandler) {
    super.off(event, handler)
  }

  emit(event: keyof(T), ...args: Parameters<T[typeof event]>): void;
  emit(event: string, ...args: any[]): void {
    super.emit(event, ...args)
  }
}

