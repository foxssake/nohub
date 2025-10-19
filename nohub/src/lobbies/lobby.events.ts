import { TypedEventBus } from "@src/events";
import type { Lobby } from "./lobby";

export class LobbyEventBus extends TypedEventBus<{
  "lobby-create": (lobby: Lobby) => void;
  "lobby-change": (from: Lobby, to: Lobby) => void;
  "lobby-delete": (lobby: Lobby) => void;
}> {}
