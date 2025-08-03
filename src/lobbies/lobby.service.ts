import { nanoid } from "nanoid";
import type { Lobby } from "./lobby";
import type { LobbyRepository } from "./lobby.repository";
import { rootLogger } from "@src/logger";

export class LobbyService {
  constructor(
    private repository: LobbyRepository,
    private logger = rootLogger.child({ name: 'LobbyService' })
  ) {}

  create(data: Map<string, string>): Lobby {
    this.logger.info({ data, size: data.size }, 'Creating lobby with custom data')
    const lobby: Lobby = {
      id: this.generateId(),
      isVisible: true,
      isLocked: false,
      data
    }

    this.repository.add(lobby)

    this.logger.info('Lobby#%s created!', lobby.id)
    return lobby
  }

  private generateId(): string {
    return nanoid(8)
  }
}
