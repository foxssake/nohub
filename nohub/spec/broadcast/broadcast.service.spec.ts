import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Games, Lobbies, Sessions } from "@spec/fixtures";
import { mockSocket } from "@spec/sessions/session.api.spec";
import { BroadcastService } from "@src/broadcast/broadcast.service";
import { readDefaultConfig } from "@src/config";
import { DataNotFoundError } from "@src/errors";
import { NohubEventBus } from "@src/events";
import { GameRepository } from "@src/games/game.repository";
import { LobbyApi } from "@src/lobbies/lobby.api";
import { LobbyEventBus } from "@src/lobbies/lobby.events";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import { LobbyService } from "@src/lobbies/lobby.service";
import type { NohubReactor } from "@src/nohub";
import type { SessionData } from "@src/sessions/session";
import { SessionApi } from "@src/sessions/session.api";
import { SessionRepository } from "@src/sessions/session.repository";
import type { Socket } from "bun";

let reactor: NohubReactor;

let sessionRepository: SessionRepository;
let sessionApi: SessionApi;
let lobbyRepository: LobbyRepository;
let lobbyService: LobbyService;
let lobbyApi: LobbyApi;

let broadcastService: BroadcastService;

let daveSocket: Socket<SessionData>;
let ericSocket: Socket<SessionData>;

describe("BroadcastService", () => {
  beforeEach(() => {
    reactor = {
      send: mock(() => ({})),
    } as unknown as NohubReactor;

    sessionRepository = new SessionRepository();
    const gameLookup = new GameRepository();
    Games.insert(gameLookup);
    Sessions.insert(sessionRepository);

    sessionApi = new SessionApi(
      sessionRepository,
      new LobbyRepository(),
      gameLookup,
      new NohubEventBus(),
      readDefaultConfig().sessions,
    );

    lobbyRepository = new LobbyRepository();
    lobbyService = new LobbyService(
      lobbyRepository,
      readDefaultConfig().lobbies,
      new LobbyEventBus(),
    );

    lobbyApi = new LobbyApi(lobbyRepository, lobbyService, () => undefined);

    Lobbies.insert(lobbyRepository);

    // create sessions using API
    daveSocket = mockSocket(Sessions.dave.address);
    ericSocket = mockSocket(Sessions.eric.address);

    sessionApi.openSession(daveSocket);
    sessionApi.openSession(ericSocket);

    broadcastService = new BroadcastService(() => reactor, sessionRepository);
  });

  describe("unicast", () => {
    test("should send command to session", () => {
      const sessionId = daveSocket.data.id;
      broadcastService.unicast(sessionId, { name: "command" });

      expect(reactor.send).toHaveBeenCalled();
      // Verify it was called with the correct socket
      expect(reactor.send).toHaveBeenCalledWith(daveSocket, {
        name: "command",
      });
    });

    test("should throw if session not found", () => {
      expect(() =>
        broadcastService.unicast("unknown", { name: "command" }),
      ).toThrow(DataNotFoundError);
    });
  });

  describe("broadcast", () => {
    test("should send to all participants", () => {
      const lobby = lobbyApi.create(Sessions.dave.address, daveSocket.data);
      lobbyApi.join(lobby.id, ericSocket.data);

      broadcastService.broadcast(lobby, { name: "command" });

      // Should broadcast to both
      expect(reactor.send).toHaveBeenCalledTimes(2);
      expect(reactor.send).toHaveBeenCalledWith(daveSocket, {
        name: "command",
      });
      expect(reactor.send).toHaveBeenCalledWith(ericSocket, {
        name: "command",
      });
    });

    test("should skip missing sessions", () => {
      const lobby = lobbyApi.create(Sessions.dave.address, daveSocket.data);

      // Join
      lobbyApi.join(lobby.id, ericSocket.data);
      // Close (leave)
      sessionApi.closeSession(ericSocket);

      broadcastService.broadcast(lobby, { name: "command" });

      // Should broadcast to just 1 particpant
      expect(reactor.send).toHaveBeenCalledTimes(1);
      expect(reactor.send).toHaveBeenCalledWith(daveSocket, {
        name: "command",
      });
    });
  });
});
