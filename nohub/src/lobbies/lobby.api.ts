import type { SessionData } from "@src/sessions/session";
import type { LobbyRepository } from "./lobby.repository";
import type { LobbyService } from "./lobby.service";
import { rootLogger } from "@src/logger";
import type { Lobby } from "./lobby";

export class LobbyApi {
  private logger = rootLogger.child({ name: "LobbyApi" })

  constructor(
    private lobbyRepository: LobbyRepository,
    private lobbyService: LobbyService
  ) {}

  create(address: string, session: SessionData, data?: Map<string, string>): string {
    this.logger.info({ session }, "Creating lobby")
    const lobby = this.lobbyService.create(address, data ?? new Map(), session.id);
    this.logger.info({ session, lobby }, "Created lobby #%s", lobby.id)

    return lobby.id;
  }

  get(id: string, session: SessionData, properties?: string[]): Lobby {
    this.logger.info({ session, id }, "Retrieving lobby #%s", id)

    const lobby = this.lobbyRepository.requireInGame(id, session.gameId)
    const result = { ...lobby, data: this.filterProperties(lobby.data, properties) }

    this.logger.info({ session, id }, "Retrieved lobby #%s", id)
    return result
  }

  *list(properties: string[] | undefined, session: SessionData): Generator<Lobby> {
    this.logger.info({ session }, "Listing lobbies for session #%s", session.id)

    let count = 0
    for (const lobby of this.lobbyService.listLobbiesFor(session)) {
      yield { ...lobby, data: this.filterProperties(lobby.data, properties) }
      ++count
    }

    this.logger.info({ session, count }, "Found %d lobbies for session #%s", count, session.id)
  }

  delete(id: string, session: SessionData): void {
    this.logger.info({ lobbyId: id, session }, "Deleting lobby #%s", id)
    const lobby = this.lobbyRepository.find(id);
    if (lobby === undefined) {
      this.logger.info({ lobbyId: id, session }, "Lobby doesn't exist, doing nothing")
      return
    }

    this.lobbyService.delete(lobby, session.id)
    this.logger.info({ lobbyId: id, session }, "Deleted lobby #%s", id)
  }

  join(id: string, session: SessionData): string {
    this.logger.info({ session, lobbyId: id }, "Joining lobby")

    const lobby = this.lobbyRepository.requireInGame(id, session.gameId)
    const address = this.lobbyService.join(lobby, session.id)

    this.logger.info({ session, lobby }, "Successfully joined lobby")
    return address
  }

  setData(id: string, data: Map<string, string>, session: SessionData): void {
    this.logger.info({ lobbyId: id, session, data }, "Updating session data")

    const lobby = this.lobbyRepository.require(id)
    this.lobbyService.setData(lobby, data, session.id)

    this.logger.info({ lobbyId: id, session }, "Updated session data")
  }

  lock(id: string, session: SessionData): void {
    this.logger.info({ lobbyId: id, session }, "Attempting to lock lobby")

    const lobby = this.lobbyRepository.require(id)
    this.lobbyService.lock(lobby, session.id)

    this.logger.info({ lobbyId: id, session }, "Successfully locked lobby")
  }

  unlock(id: string, session: SessionData): void {
    this.logger.info({ lobbyId: id, session }, "Attempting to unlock lobby")

    const lobby = this.lobbyRepository.require(id)
    this.lobbyService.unlock(lobby, session.id)

    this.logger.info({ lobbyId: id, session }, "Successfully unlocked lobby")
  }

  hide(id: string, session: SessionData): void {
    this.logger.info({ lobbyId: id, session }, "Attempting to hide lobby")

    const lobby = this.lobbyRepository.require(id)
    this.lobbyService.hide(lobby, session.id)

    this.logger.info({ lobbyId: id, session }, "Successfully hidden lobby")
  }

  publish(id: string, session: SessionData): void {
    this.logger.info({ lobbyId: id, session }, "Attempting to publish lobby")

    const lobby = this.lobbyRepository.require(id)
    this.lobbyService.publish(lobby, session.id)

    this.logger.info({ lobbyId: id, session }, "Successfully published lobby")
  }

  onSessionClose(sessionId: string): void {
    this.logger.info("Cleaning up lobbies belonging to #%s", sessionId);
    this.lobbyRepository.removeLobbiesOf(sessionId);
    this.logger.info("Removed all lobbies belonging to #%s", sessionId);
  }

  private filterProperties(data: Map<string, string>, properties: string[] | undefined): Map<string, string> {
    if (properties === undefined)
      return data
    if (properties.length == 0)
      return new Map()

    const result = new Map<string, string>();

    for (const property of properties) {
      const value = data.get(property)
      if (value !== undefined)
        result.set(property, value)
    }

    return result
  }
}
