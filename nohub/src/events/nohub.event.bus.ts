import { TypedEventBus } from "@src/event.bus";

export class NohubEventBus extends TypedEventBus<{
  "session-close": (sessionId: string) => void;
}> {}

export const eventBus = new NohubEventBus();
