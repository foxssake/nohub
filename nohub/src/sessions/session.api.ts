import type { Exchange } from "@foxssake/trimsock-js";
import { type SessionsConfig } from "@src/config";
import { LockedError } from "@src/errors";
import type { NohubEventBus } from "@src/events/nohub.event.bus";
import type { GameRepository } from "@src/games/game.repository";
import type { LobbyRepository } from "@src/lobbies/lobby.repository";
import { rootLogger } from "@src/logger";
import type { Socket } from "bun";
import { nanoid } from "nanoid";
import type { SessionData } from "./session";

export class SessionApi {
  private logger = rootLogger.child({ name: "session:api" });

  constructor(
    private lobbyRepository: LobbyRepository, // TODO: Lookup
    private gameRepository: GameRepository, // TODO: Lookup
    private eventBus: NohubEventBus,
    private config: SessionsConfig
  ) {}

  generateSessionId(): string {
    return nanoid(12); // TODO: Configurable session ID length
  }

  openSession(socket: Socket<SessionData>): void {
    socket.data = {
      id: this.generateSessionId(),
      gameId: this.config.defaultGameId, 
    };
  }

  closeSession(socket: Socket<SessionData>): void {
    const sessionId = socket.data.id;
    this.logger.info("Closing session #%s", sessionId);
    this.eventBus.emit("session-close", sessionId);
    this.logger.info("Closed session #%s", sessionId);
  }

  setGame(session: SessionData, gameId: string) {
    this.logger.info(
      { session, gameId },
      "Switching game for session #%s",
      session.id,
    );

    // Check if operation is possible
    if (session.gameId !== undefined)
      throw new LockedError("Session already has a game set!");

    if (this.lobbyRepository.existsBySession(session.id))
      throw new LockedError("Session already has active lobbies!");

    // Check if game exists
    // TODO: Config to enable arbitrary game ID's
    const game = this.gameRepository.require(gameId);

    session.gameId = game.id;
    this.logger.info({ session, game }, "Game set for session!");
  }
}

export function sessionOf(
  exchange: Exchange<Socket<SessionData>>,
): SessionData {
  return exchange.source.data;
}
