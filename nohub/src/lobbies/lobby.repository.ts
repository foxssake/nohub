import { DataNotFoundError } from "@src/errors";
import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";

export class LobbyRepository extends Repository<Lobby, string> {
  constructor() {
    super((lobby) => lobby.id);
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Lobby#${id} not found!`);
  }
}
