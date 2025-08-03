import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";

export const lobbyRepository = new Repository<Lobby>(
  lobby => lobby.id
)
