import { DataNotFoundError } from "@src/errors";
import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";

export class LobbyRepository extends Repository<Lobby, string> {
  constructor() {
    super((lobby) => lobby.id);
  }

  findInGame(lobbyId: string, gameId?: string): Lobby | undefined {
    const lobby = this.find(lobbyId);
    if (lobby?.gameId !== gameId) return undefined;
    return lobby;
  }

  requireInGame(lobbyId: string, gameId?: string): Lobby {
    const lobby = this.findInGame(lobbyId, gameId);
    if (!lobby) throw this.notFoundError(lobbyId);
    return lobby;
  }

  removeLobbiesOf(sessionId: string): void {
    for (const lobby of this.list())
      if (lobby.owner === sessionId) this.removeItem(lobby);
  }

  existsBySession(sessionId: string): boolean {
    for (const lobby of this.list()) if (lobby.owner === sessionId) return true;
    return false;
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Lobby#${id} not found!`);
  }
}
