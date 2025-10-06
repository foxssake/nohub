import { rootLogger } from "@src/logger";
import { nanoid } from "nanoid";
import {
  isLobbyVisibleTo,
  type Lobby,
  requireLobbyModifiableIn,
} from "./lobby";
import type { LobbyRepository } from "./lobby.repository";

export class LobbyService {
  constructor(
    private repository: LobbyRepository,
    private logger = rootLogger.child({ name: "LobbyService" }),
  ) {}

  create(data: Map<string, string>, sessionId: string): Lobby {
    this.logger.info(
      { data: Object.fromEntries(data.entries()) },
      "Creating lobby with custom data",
    );
    const lobby: Lobby = {
      id: this.generateId(),
      owner: sessionId,
      isVisible: true,
      isLocked: false,
      data,
    };

    this.repository.add(lobby);

    this.logger.info(
      "Lobby#%s created, bound to session#%s",
      lobby.id,
      sessionId,
    );
    return lobby;
  }

  *listLobbiesFor(sessionId: string): Generator<Lobby> {
    for (const lobby of this.repository.list())
      if (isLobbyVisibleTo(lobby, sessionId)) yield lobby;
  }

  setData(lobby: Lobby, data: Map<string, string>, sessionId: string): Lobby {
    requireLobbyModifiableIn(lobby, sessionId);

    const updated = { ...lobby, data };
    this.repository.update(updated);
    return updated;
  }

  lock(lobby: Lobby, sessionId: string): Lobby {
    requireLobbyModifiableIn(lobby, sessionId);

    const result: Lobby = { ...lobby, isLocked: true };
    this.repository.update(result);
    return result;
  }

  unlock(lobby: Lobby, sessionId: string): Lobby {
    requireLobbyModifiableIn(lobby, sessionId);

    const result: Lobby = { ...lobby, isLocked: false };
    this.repository.update(result);
    return result;
  }

  hide(lobby: Lobby, sessionId: string): Lobby {
    requireLobbyModifiableIn(lobby, sessionId);

    const result: Lobby = { ...lobby, isVisible: false };
    this.repository.update(result);
    return result;
  }

  publish(lobby: Lobby, sessionId: string): Lobby {
    requireLobbyModifiableIn(lobby, sessionId);

    const result: Lobby = { ...lobby, isVisible: true };
    this.repository.update(result);
    return result;
  }

  private generateId(): string {
    return nanoid(8);
  }
}
