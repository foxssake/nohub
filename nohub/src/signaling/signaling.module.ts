import { rootLogger } from "@src/logger";
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
  private logger = rootLogger.child({ name: "SignalingApi" });

  constructor(lobbyModule: LobbyModule, broadcastModule: BroadcastModule) {
    this.broadcastService = broadcastModule.broadcastService;
    this.lobbyRepository = lobbyModule.lobbyRepository;
  }

  configure(reactor: NohubReactor) {
    reactor
      .on("signaling/greet/lobby", (cmd, xchg) => {
        const lobbyId = requireSingleParam(cmd, "Missing lobby id!");

        const session = sessionOf(xchg);
        const lobby = this.lobbyRepository.requireInGame(
          lobbyId,
          session.gameId,
        );

        this.broadcastService.broadcast(lobby, {
          name: "signaling/greet",
          text: "Hi!",
        });
      })

      .on("signal/start/lobby", (cmd, xchg) => {
        const lobbyId = requireSingleParam(cmd, "Missing lobby id!");

        const session = sessionOf(xchg);
        const lobby = this.lobbyRepository.requireInGame(
          lobbyId,
          session.gameId,
        );

        const payload = new Map() as Map<string, string>;
        payload.set("host", lobby.participants[0]);
        payload.set("lobbyId", lobbyId);
        payload.set("players", lobby.participants.join(", "));

        // Sends to all lobby participants, they will begin connections with each id.
        this.broadcastService.broadcast(lobby, {
          name: "signal/start",
          kvParams: [...payload.entries()],
        });

        this.logger.info({ lobbyId }, "Starting lobby #%s", lobbyId);

        // TODO: This confirms back to leader we started, but what about tracking all inprogress xchanges kicked off?
        xchg.reply({ text: lobby.participants.join(",") });
      })
      .on("signal/offer", (cmd, xchg) => {
        const sessionId = requireSingleParam(cmd, "Missing session id!");
        this.broadcastService.unicast(sessionId, {
          name: "signal/get/offer",
          kvMap: cmd.kvMap,
        });

        // TODO: xchang reply to garuntee connections? Currently these just blast off, no await either side.
        // But this process is really a handshake event. Could also throw errors for example: to indicate we need TURN.
        // TODO: Handle fail cases: Somone drops
        // TODO: Start some promises await all some how before sending the reply.

        // xchg.reply??
      })
      .on("signal/answer", (cmd, xchg) => {
        const sessionId = requireSingleParam(cmd, "Missing session id!");
        this.broadcastService.unicast(sessionId, {
          name: "signal/get/answer",
          kvMap: cmd.kvMap,
        });
      })
      .on("signal/candidate", (cmd, xchg) => {
        const sessionId = requireSingleParam(cmd, "Missing session id!");
        this.logger.info(
          { sessionId },
          "Confirming candidate for #%s",
          sessionId,
        );
        this.broadcastService.unicast(sessionId, {
          name: "signal/get/candidate",
          kvMap: cmd.kvMap,
        });
      });
  }
}
