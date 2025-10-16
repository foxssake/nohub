import { DataNotFoundError } from "@src/errors";
import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";

export class LobbyRepository extends Repository<Lobby, string> {
  constructor() {
    super((lobby) => lobby.id);
  }

  removeLobbiesOf(sessionId: string): void {
    for (const lobby of this.list())
      if (lobby.owner === sessionId) this.removeItem(lobby);
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Lobby#${id} not found!`);
  }
}
