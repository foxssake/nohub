// biome-ignore-all lint/suspicious/noExplicitAny: Event data is generic, use overloads to provide specifics
// biome-ignore-all lint/complexity/noBannedTypes: Event handlers are generic and thus use Function, use overloads to provide specifics

export class EventBus {
  private subscribers: Map<string, Function[]> = new Map();

  on(event: string, handler: Function): void {
    const handlers = this.getHandlersFor(event);
    handlers.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.getHandlersFor(event);
    const idx = handlers.indexOf(handler);

    if (idx < 0) return;

    handlers.splice(idx, 1);
  }

  emit(event: string, ...args: any[]): void {
    for (const handler of this.getHandlersFor(event)) handler(...args);
  }

  private getHandlersFor(event: string): Function[] {
    if (!this.subscribers.has(event)) this.subscribers.set(event, []);
    return this.subscribers.get(event) ?? [];
  }
}

export class TypedEventBus<T extends Record<string, Function>> extends EventBus {
  on(event: keyof(T), handler: T[typeof event]): void;
  on(event: string, handler: Function) {
    super.on(event, handler)
  }

  off(event: keyof(T), handler: T[typeof event]): void;
  off(event: string, handler: Function) {
    super.off(event, handler)
  }

  emit(event: string, ...args: any[]): void {
    super.emit(event, ...args)
  }
}

export class CoolEventBus extends TypedEventBus<{
  "session-close": (sessionId: string) => void
}> {}

const ceb = new CoolEventBus()
