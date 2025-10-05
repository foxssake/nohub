import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";
import { DataNotFoundError } from "@src/errors";

export class LobbyRepository extends Repository<Lobby, string> {
  constructor() {
    super((lobby) => lobby.id);
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Lobby#${id} not found!`);
  }
}
