import type { Module } from "@src/module";
import type { Nohub, NohubReactor } from "@src/nohub";
import { SessionApi, sessionOf } from "./session.api";
import type { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { GameRepository } from "@src/games/game.repository";
import type { SessionData } from "./session";
import { requireRequest, requireSingleParam } from "@src/validators";
import type { NohubEventBus } from "@src/events";

export class SessionModule implements Module {
  readonly sessionApi: SessionApi

  constructor(
    private lobbyRepository: LobbyRepository, // TODO: Lookup
    private gameRepository: GameRepository, // TODO: Lookup
    private eventBus: NohubEventBus
  ) {
    this.sessionApi = new SessionApi(this.lobbyRepository, this.gameRepository, this.eventBus)
  }

  attachTo(app: Nohub): void {

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
