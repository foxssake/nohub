import type { LobbiesConfig } from "@src/config";
import { InvalidCommandError, LimitError } from "@src/errors";
import { rootLogger } from "@src/logger";
import type { SessionData } from "@src/sessions/session";
import { nanoid } from "nanoid";
import {
  type Lobby,
  requireLobbyJoinable,
  requireLobbyModifiableIn,
} from "./lobby";
import type { LobbyRepository } from "./lobby.repository";

export class LobbyService {
  constructor(
    private repository: LobbyRepository,
    private config: LobbiesConfig,
    private logger = rootLogger.child({ name: "LobbyService" }),
  ) {}

  create(
    address: string,
    data: Map<string, string>,
    session: SessionData,
  ): Lobby {
    this.logger.info(
      { data: Object.fromEntries(data.entries()), address },
      "Creating lobby with custom data",
    );

    if (session.gameId === undefined && !this.config.enableGameless)
      throw new InvalidCommandError("Can't create lobbies without a game!");

    if (this.config.maxCount > 0 && this.repository.count() >= this.config.maxCount)
      throw new LimitError(`Can't host more than ${this.config.maxCount} active lobbies on this instance!`);

    if (this.config.maxPerSession > 0 && this.repository.countBySession(session.id) >= this.config.maxPerSession)
      throw new LimitError(`Session can't have more than ${this.config.maxPerSession} active lobbies!`);

    const lobby: Lobby = {
      id: this.generateId(),
      address,
      gameId: session.gameId,
      owner: session.id,
      isVisible: true,
      isLocked: false,
      data,
    };

    this.repository.add(lobby);

    this.logger.info(
      { session, lobby },
      "Lobby#%s created, bound to session#%s",
      lobby.id,
      session.id,
    );
    return lobby;
  }

  delete(lobby: Lobby, session: SessionData) {
    requireLobbyModifiableIn(lobby, session);
    this.repository.remove(lobby.id);
  }

  join(lobby: Lobby, session: SessionData): string {
    requireLobbyJoinable(lobby, session);
    return lobby.address;
  }

  setData(
    lobby: Lobby,
    data: Map<string, string>,
    session: SessionData,
  ): Lobby {
    requireLobbyModifiableIn(lobby, session);

    const updated = { ...lobby, data };
    this.repository.update(updated);
    return updated;
  }

  lock(lobby: Lobby, session: SessionData): Lobby {
    requireLobbyModifiableIn(lobby, session);

    const result: Lobby = { ...lobby, isLocked: true };
    this.repository.update(result);
    return result;
  }

  unlock(lobby: Lobby, session: SessionData): Lobby {
    requireLobbyModifiableIn(lobby, session);

    const result: Lobby = { ...lobby, isLocked: false };
    this.repository.update(result);
    return result;
  }

  hide(lobby: Lobby, session: SessionData): Lobby {
    requireLobbyModifiableIn(lobby, session);

    const result: Lobby = { ...lobby, isVisible: false };
    this.repository.update(result);
    return result;
  }

  publish(lobby: Lobby, session: SessionData): Lobby {
    requireLobbyModifiableIn(lobby, session);

    const result: Lobby = { ...lobby, isVisible: true };
    this.repository.update(result);
    return result;
  }

  private generateId(): string {
    return nanoid(this.config.idLength);
  }
}
