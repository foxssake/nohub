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

  private generateId(): string {
    return nanoid(8);
  }
}
