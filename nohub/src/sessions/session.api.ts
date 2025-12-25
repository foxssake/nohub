import type { Exchange } from "@foxssake/trimsock-js";
import type { SessionsConfig } from "@src/config";
import { LimitError, LockedError } from "@src/errors";
import type { NohubEventBus } from "@src/events";
import type { GameLookup } from "@src/games/game.repository";
import type { LobbyLookup } from "@src/lobbies/lobby.repository";
import { rootLogger } from "@src/logger";
import { emptyMetrics, type MetricsHolder } from "@src/metrics/metrics";
import type { Socket } from "bun";
// import { nanoid } from "nanoid";
import * as crypto from "crypto";
import type { SessionData } from "./session";
import type { SessionRepository } from "./session.repository";

export class SessionApi {
  private logger = rootLogger.child({ name: "session:api" });

  constructor(
    private sessionRepository: SessionRepository,
    private lobbyLookup: LobbyLookup,
    private gameLookup: GameLookup,
    private eventBus: NohubEventBus,
    private config: SessionsConfig,
    private metrics: MetricsHolder = emptyMetrics,
  ) {}

  // generateSessionId(): string {
  //   return nanoid(this.config.idLength);
  // }

  generateSessionId(): string {
    return Math.abs(new Int32Array(crypto.randomBytes(4).buffer)[0]).toString();
  }

  openSession(socket: Socket<SessionData>): void {
    const address = socket.remoteAddress;
    this.logger.info(
      { address },
      "Opening new session for connection from %s",
      address,
    );

    if (
      this.config.maxCount > 0 &&
      this.sessionRepository.count() >= this.config.maxCount
    )
      throw new LimitError(
        `Can't have more than ${this.config.maxCount} active sessions!`,
      );
    if (
      this.config.maxPerAddress > 0 &&
      this.sessionRepository.countByAddress(address) >=
        this.config.maxPerAddress
    )
      throw new LimitError(
        `Can't have more than ${this.config.maxPerAddress} active sessions per address!`,
      );

    const session = {
      id: this.generateSessionId(),
      gameId: this.config.defaultGameId,
      address,
      socket,
    };

    this.sessionRepository.add(session);
    this.metrics()?.sessions.count.inc();
    socket.data = session;

    this.logger.info({ session }, "Created session #%s", session.id);
  }

  closeSession(socket: Socket<SessionData>): void {
    const sessionId = socket.data.id;
    this.logger.info(
      { session: socket.data },
      "Closing session #%s",
      sessionId,
    );

    this.eventBus.emit("session-close", sessionId);
    this.sessionRepository.remove(sessionId);
    this.metrics()?.sessions.count.dec();

    this.logger.info({ session: socket.data }, "Closed session #%s", sessionId);
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

    if (this.lobbyLookup.existsBySession(session.id))
      throw new LockedError("Session already has active lobbies!");

    // Check if game exists
    const game = this.config.arbitraryGameId
      ? this.gameLookup.find(gameId)
      : this.gameLookup.require(gameId);

    session.gameId = gameId;
    this.logger.info({ session, game }, "Game set for session!");
  }
}

export function sessionOf(
  exchange: Exchange<Socket<SessionData>>,
): SessionData {
  return exchange.source.data;
}
