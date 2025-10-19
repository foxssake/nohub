import { DataNotFoundError } from "@src/errors";
import { type Lookup, Repository } from "@src/repository";
import type { SessionData } from "@src/sessions/session";
import { isLobbyVisibleTo, type Lobby } from "./lobby";

export interface LobbyLookup extends Lookup<Lobby, string> {
  findInGame(lobbyId: string, gameId?: string): Lobby | undefined;
  requireInGame(lobbyId: string, gameId?: string): Lobby;
  existsBySession(sessionId: string): boolean;
  listLobbiesFor(session: SessionData): Generator<Lobby>;
}

export class LobbyRepository
  extends Repository<Lobby, string>
  implements LobbyLookup
{
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

  countBySession(sessionId: string): number {
    let count = 0;
    for (const lobby of this.list()) if (lobby.owner === sessionId) ++count;
    return count;
  }

  *listLobbiesFor(session: SessionData): Generator<Lobby> {
    for (const lobby of this.list())
      if (isLobbyVisibleTo(lobby, session)) yield lobby;
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Lobby#${id} not found!`);
  }
}
