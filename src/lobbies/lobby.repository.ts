import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";

export class LobbyRepository extends Repository<Lobby, string> {
  constructor() {
    super((lobby) => lobby.id);
  }

  protected notFoundError(id: string): Error {
      return new Error(`Lobby#${id} not found!`)
  }
}
