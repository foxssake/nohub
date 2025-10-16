import { rootLogger } from "@src/logger";
import { nanoid } from "nanoid";
import {
  isLobbyVisibleTo,
  type Lobby,
  requireLobbyJoinable,
  requireLobbyModifiableIn,
} from "./lobby";
import type { LobbyRepository } from "./lobby.repository";
import type { SessionData } from "@src/sessions";
import { InvalidCommandError } from "@src/errors";

export class LobbyService {
  constructor(
    private repository: LobbyRepository,
    private enableGameless = false,
    private logger = rootLogger.child({ name: "LobbyService" }),
  ) {}

  create(address: string, data: Map<string, string>, session: SessionData): Lobby {
    this.logger.info(
      { data: Object.fromEntries(data.entries()), address },
      "Creating lobby with custom data",
    );

    if (session.game === undefined && !this.enableGameless)
      throw new InvalidCommandError("Can't create lobbies without a game!")

    const lobby: Lobby = {
      id: this.generateId(),
      address,
      gameId: session.game?.id,
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

  *listLobbiesFor(session: SessionData): Generator<Lobby> {
    for (const lobby of this.repository.list())
      if (isLobbyVisibleTo(lobby, session)) yield lobby;
  }

  delete(lobby: Lobby, sessionId: string) {
    requireLobbyModifiableIn(lobby, sessionId);
    this.repository.remove(lobby.id);
  }

  join(lobby: Lobby, sessionId: string): string {
    requireLobbyJoinable(lobby, sessionId);
    return lobby.address;
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
