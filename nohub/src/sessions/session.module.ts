import type { SessionsConfig } from "@src/config";
import type { NohubEventBus } from "@src/events";
import type { GameLookup } from "@src/games/game.repository";
import type { LobbyLookup } from "@src/lobbies/lobby.repository";
import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { NohubReactor } from "@src/nohub";
import { requireRequest, requireSingleParam } from "@src/validators";
import type { SessionData } from "./session";
import { SessionApi, sessionOf } from "./session.api";
import { SessionRepository } from "./session.repository";

export class SessionModule implements Module {
  private readonly logger = rootLogger.child({ name: "mod:session" });
  readonly sessionRepository: SessionRepository;
  readonly sessionApi: SessionApi;

  constructor(
    private lobbyLookup: LobbyLookup,
    private gameLookup: GameLookup,
    private eventBus: NohubEventBus,
    private config: SessionsConfig,
  ) {
    this.sessionRepository = new SessionRepository();

    this.sessionApi = new SessionApi(
      this.sessionRepository,
      this.lobbyLookup,
      this.gameLookup,
      this.eventBus,
      this.config,
    );
  }

  configure(reactor: NohubReactor): void {
    reactor
      .on("session/set-game", (cmd, xchg) => {
        requireRequest(cmd);
        const gameId = requireSingleParam(cmd, "Missing Game ID!");
        const session = sessionOf(xchg);

        this.sessionApi.setGame(session, gameId);

        xchg.reply({ text: "ok" });
      })
      .on("whereami", (_cmd, xchg) => {
        xchg.replyOrSend({
          name: "youarehere",
          params: [xchg.source.remoteAddress],
        });
      });
  }

  openSocket(socket: Bun.Socket<SessionData>): void {
    try {
      this.sessionApi.openSession(socket);
    } catch (err) {
      this.logger.error(
        { err, address: socket.remoteAddress },
        "Failed to init session, disconnecting socket!",
      );
      socket.end();
    }
  }

  closeSocket(socket: Bun.Socket<SessionData>): void {
    this.sessionApi.closeSession(socket);
  }
}
