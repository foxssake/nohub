import type { SessionsConfig } from "@src/config";
import type { NohubEventBus } from "@src/events";
import type { GameLookup } from "@src/games/game.repository";
import type { LobbyLookup } from "@src/lobbies/lobby.repository";
import type { Module } from "@src/module";
import type { NohubReactor } from "@src/nohub";
import { requireRequest, requireSingleParam } from "@src/validators";
import type { SessionData } from "./session";
import { SessionApi, sessionOf } from "./session.api";

export class SessionModule implements Module {
  readonly sessionApi: SessionApi;

  constructor(
    private lobbyLookup: LobbyLookup,
    private gameLookup: GameLookup,
    private eventBus: NohubEventBus,
    private config: SessionsConfig,
  ) {
    this.sessionApi = new SessionApi(
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
    this.sessionApi.openSession(socket);
  }

  closeSocket(socket: Bun.Socket<SessionData>): void {
    this.sessionApi.closeSession(socket);
  }
}
