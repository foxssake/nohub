import type { BroadcastModule } from "@src/broadcast/broadcast.module";
import type { BroadcastService } from "@src/broadcast/broadcast.service";
import type { LobbyModule } from "@src/lobbies/lobby.module";
import type { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { Module } from "@src/module";
import type { NohubReactor } from "@src/nohub";
import { sessionOf } from "@src/sessions/session.api";
import { requireSingleParam } from "@src/validators";

// This is an example module to demonstrate how to inject the BroadcastService
// into custom modules and classes

export class SignalingModule implements Module {
  private readonly broadcastService: BroadcastService;
  private readonly lobbyRepository: LobbyRepository;

  constructor(lobbyModule: LobbyModule, broadcastModule: BroadcastModule) {
    this.broadcastService = broadcastModule.broadcastService;
    this.lobbyRepository = lobbyModule.lobbyRepository;
  }

  configure(reactor: NohubReactor) {
    reactor.on("signaling/greet/lobby", (cmd, xchg) => {
      const lobbyId = requireSingleParam(cmd, "Missing lobby id!");

      const session = sessionOf(xchg);
      const lobby = this.lobbyRepository.requireInGame(lobbyId, session.gameId);

      this.broadcastService.broadcast(lobby, {
        name: "signaling/greet",
        text: "Hi!",
      });
    });
  }
}
