import type { SessionsConfig } from "@src/config";
import type { NohubEventBus } from "@src/events";
import type { GameLookup } from "@src/games/game.repository";
import type { LobbyLookup } from "@src/lobbies/lobby.repository";
import type { MetricsHolder } from "@src/metrics/metrics";
import type { Module } from "@src/module";
import type { NohubReactor } from "@src/nohub";
import { requireRequest, requireSingleParam } from "@src/validators";
import type { SessionData } from "./session";
import { SessionApi, sessionOf } from "./session.api";
import { SessionRepository } from "./session.repository";

export class SessionModule implements Module {
  readonly sessionRepository: SessionRepository;
  readonly sessionApi: SessionApi;

  constructor(
    private lobbyLookup: LobbyLookup,
    private gameLookup: GameLookup,
    private eventBus: NohubEventBus,
    private config: SessionsConfig,
    private metrics: MetricsHolder,
  ) {
    this.sessionRepository = new SessionRepository();

    this.sessionApi = new SessionApi(
      this.sessionRepository,
      this.lobbyLookup,
      this.gameLookup,
      this.eventBus,
      this.config,
      this.metrics,
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
      })
      .on("getid", (_cmd, xchg) => {
        xchg.reply({ text: xchg.source.data.id });
      });
  }

  openSocket(socket: Bun.Socket<SessionData>): void {
    this.sessionApi.openSession(socket);
  }

  closeSocket(socket: Bun.Socket<SessionData>): void {
    this.sessionApi.closeSession(socket);
  }
}
