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
      .on("webrtc/lobby/start", (cmd, xchg) => {
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

        // Sends to all lobby participants, they will begin WebRTC connections with each peer by sessionId.
        this.broadcastService.broadcast(lobby, {
          name: "webrtc/start",
          kvParams: [...payload.entries()],
        });

        this.logger.info({ lobbyId }, "Starting lobby #%s", lobbyId);

        // Reply back to lobby host that we started.
        // TODO: Are we able to listen for the results each one of the broadcasts?
        xchg.reply({ text: lobby.participants.join(",") });
      })
      .on("webrtc/offer", (cmd, xchg) => {
        const sessionId = requireSingleParam(cmd, "Missing session id!");

        this.broadcastService.unicast(sessionId, {
          name: "webrtc/get/offer",
          kvMap: cmd.kvMap,
        });

        // TODO: Sending an offer and getting one back could be something we could use the xchg for?
        // TODO: Reply? Answer, Offer, Candidate are each "handshake" steps.
        // TODO: Handle errors, for example: if STUN is not enough, indicate we need TURN.
        // xchg.reply
      })
      .on("webrtc/answer", (cmd, xchg) => {
        const sessionId = requireSingleParam(cmd, "Missing session id!");
        this.broadcastService.unicast(sessionId, {
          name: "webrtc/get/answer",
          kvMap: cmd.kvMap,
        });
      })
      .on("webrtc/candidate", (cmd, xchg) => {
        const sessionId = requireSingleParam(cmd, "Missing session id!");
        this.logger.info(
          { sessionId },
          "Confirming candidate for #%s",
          sessionId,
        );
        this.broadcastService.unicast(sessionId, {
          name: "webrtc/get/candidate",
          kvMap: cmd.kvMap,
        });
      });
  }
}
