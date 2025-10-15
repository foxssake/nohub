import { EventBus } from "@src/event.bus";

export class NohubEventBus extends EventBus {
  on(event: "session-close", handler: (sessionId: string) => void): void;
  on(event: string, handler: Function): void {
    super.on(event, handler)
  }

  emit(event: "session-close", sessionId: string): void;
  emit(event: string, ...args: any[]): void {
    super.emit(event, ...args)
  }

  off(event: "session-close", handler: (sessionId: string) => void): void;
  off(event: string, handler: Function): void {
    super.off(event, handler);
  }
}

export const eventBus = new NohubEventBus();

