import assert from "node:assert";
import { rootLogger } from "@src/logger";
import { nanoid } from "nanoid";
import type { Lobby } from "./lobby";
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

  setData(lobby: Lobby, data: Map<string, string>, sessionId: string): Lobby {
    assert(lobby.owner === sessionId, "Trying to lock someone else's lobby!")

    const updated = { ...lobby, data }
    this.repository.update(updated)
    return updated
  }

  lock(lobby: Lobby, sessionId: string): Lobby {
    assert(lobby.owner === sessionId, "Trying to lock someone else's lobby!")

    const result: Lobby = { ...lobby, isLocked: true }
    this.repository.update(result)
    return result
  }

  unlock(lobby: Lobby, sessionId: string): Lobby {
    assert(lobby.owner === sessionId, "Trying to unlock someone else's lobby!")

    const result: Lobby = { ...lobby, isLocked: false }
    this.repository.update(result)
    return result
  }

  hide(lobby: Lobby, sessionId: string): Lobby {
    assert(lobby.owner === sessionId, "Trying to hide someone else's lobby!")

    const result: Lobby = { ...lobby, isVisible: false }
    this.repository.update(result)
    return result
  }

  publish(lobby: Lobby, sessionId: string): Lobby {
    assert(lobby.owner === sessionId, "Trying to publish someone else's lobby!")

    const result: Lobby = { ...lobby, isVisible: true }
    this.repository.update(result)
    return result
  }

  private generateId(): string {
    return nanoid(8);
  }
}
