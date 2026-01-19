import { describe, expect, test, beforeEach, mock } from "bun:test";
import { BroadcastService } from "@src/broadcast/broadcast.service";
import { SessionRepository } from "@src/sessions/session.repository";
import { SessionApi } from "@src/sessions/session.api";
import { DataNotFoundError } from "@src/errors";
import { Sessions, Lobbies, Games } from "@spec/fixtures";
import type { NohubReactor } from "@src/nohub";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import { GameRepository } from "@src/games/game.repository";
import { NohubEventBus } from "@src/events";
import { readDefaultConfig } from "@src/config";
import type { Socket } from "bun";
import type { SessionData } from "@src/sessions/session";
import { mockSocket } from "@spec/sessions/session.api.spec";

describe("BroadcastService", () => {
    let service: BroadcastService;
    let reactor: NohubReactor;
    let sessionRepository: SessionRepository;
    let sessionApi: SessionApi;

    let daveSocket: Socket<SessionData>;
    let ericSocket: Socket<SessionData>;

    beforeEach(() => {
        reactor = {
            send: mock(() => ({}) as any),
        } as unknown as NohubReactor;

        sessionRepository = new SessionRepository();
        const lobbyRepository = new LobbyRepository();
        const gameRepository = new GameRepository();
        Games.insert(gameRepository);

        const config = readDefaultConfig().sessions;
        config.arbitraryGameId = true; // simplifying for this test

        sessionApi = new SessionApi(
            sessionRepository,
            lobbyRepository,
            gameRepository,
            new NohubEventBus(),
            config
        );

        // create sessions using API
        daveSocket = mockSocket(Sessions.dave.address);
        ericSocket = mockSocket(Sessions.eric.address);

        sessionApi.openSession(daveSocket);
        sessionApi.openSession(ericSocket);

        service = new BroadcastService(() => reactor, sessionRepository);
    });

    describe("unicast", () => {
        test("should send command to session", () => {
            const sessionId = daveSocket.data.id;
            service.unicast(sessionId, { name: "command" });

            expect(reactor.send).toHaveBeenCalled();
            // Verify it was called with the correct socket
            expect(reactor.send).toHaveBeenCalledWith(daveSocket, { name: "command" });
        });

        test("should throw if session not found", () => {
            expect(() => service.unicast("unknown", { name: "command" })).toThrow(DataNotFoundError);
        });
    });

    describe("broadcast", () => {
        test("should send to all participants", () => {
            const daveId = daveSocket.data.id;
            const ericId = ericSocket.data.id;

            // Create a lobby with participants using the generated IDs
            const lobby = { ...Lobbies.davesLobby, participants: [daveId, ericId] };

            service.broadcast(lobby, { name: "command" });

            // Should broadcast to both
            expect(reactor.send).toHaveBeenCalledTimes(2);
            expect(reactor.send).toHaveBeenCalledWith(daveSocket, { name: "command" });
            expect(reactor.send).toHaveBeenCalledWith(ericSocket, { name: "command" });
        });

        test("should skip missing sessions", () => {
            const daveId = daveSocket.data.id;

            // One participant
            const lobby = { ...Lobbies.davesLobby, participants: [daveId] };

            service.broadcast(lobby, { name: "command" });

            // Should broadcast to just 1 particpant
            expect(reactor.send).toHaveBeenCalledTimes(1);
            expect(reactor.send).toHaveBeenCalledWith(daveSocket, { name: "command" });

        });
    });
});
