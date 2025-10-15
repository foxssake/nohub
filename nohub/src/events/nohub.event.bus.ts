import { EventBus, TypedEventBus } from "@src/event.bus";

export class NohubEventBus extends TypedEventBus<{
  "session-close": (sessionId: string) => void,
  "lobby-transfer": (from: string, to: string) => void, // Test event
}> {
}

export const eventBus = new NohubEventBus();

eventBus.emit("session-close", "foo")
eventBus.emit("lobby-transfer", "foo") // TODO: Should require 2 params
