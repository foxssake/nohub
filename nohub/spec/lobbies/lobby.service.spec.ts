import { beforeEach, describe, expect, test } from "bun:test";
import { Addresses, Lobbies, Sessions } from "@spec/fixtures";
import { LockedError, UnauthorizedError } from "@src/errors";
import type { Lobby } from "@src/lobbies/lobby";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import { LobbyService } from "@src/lobbies/lobby.service";

let lobbyRepository: LobbyRepository;
let lobbyService: LobbyService;

describe("LobbyService", () => {
  beforeEach(() => {
    lobbyRepository = new LobbyRepository();
    lobbyService = new LobbyService(lobbyRepository);

    Lobbies.insert(lobbyRepository);
  });

  describe("create", () => {
    test("should create lobby with defaults", () => {
      const lobbyData = new Map([
        ["name", "Cool Lobby"],
        ["player-count", "0"],
        ["player-capacity", "16"],
      ]);
      const expected: Lobby = {
        id: "",
        owner: Sessions.dave.id,
        address: Addresses.dave,
        gameId: Sessions.dave.game?.id,
        isVisible: true,
        isLocked: false,
        data: lobbyData,
      };

      const lobby = lobbyService.create(
        Addresses.dave,
        lobbyData,
        Sessions.dave,
      );

      expected.id = lobby.id; // Ignore for comparison
      expect(lobby).toEqual(expected); // Lobby data matches
      expect(lobbyRepository.find(expected.id)).toEqual(expected); // Lobby was saved in repo
    });

    test.todo("should not create without game in session", () => {});
  });

  describe("listLobbiesFor", () => {
    test("should not list hidden lobbies", () => {
      expect([...lobbyService.listLobbiesFor(Sessions.dave)]).toEqual([
        Lobbies.davesLobby,
      ]);
    });

    test("should list owned hidden lobbies", () => {
      expect([...lobbyService.listLobbiesFor(Sessions.eric)]).toEqual([
        Lobbies.davesLobby,
        Lobbies.coolLobby,
      ]);
    });

    test.todo("should not list lobbies in different games", () => {});
  });

  describe("delete", () => {
    test("should delete lobby", () => {
      expect(() =>
        lobbyService.delete(Lobbies.davesLobby, Sessions.dave.id),
      ).not.toThrow();
    });

    test("should throw if not owner", () => {
      expect(() =>
        lobbyService.delete(Lobbies.davesLobby, Sessions.pam.id),
      ).toThrow();
    });
  });

  describe("join", () => {
    test("should respond with address", () => {
      expect(lobbyService.join(Lobbies.davesLobby, Sessions.pam.id)).toEqual(
        Lobbies.davesLobby.address,
      );
    });

    test("should throw on joining own lobby", () => {
      expect(() =>
        lobbyService.join(Lobbies.davesLobby, Sessions.dave.id),
      ).toThrow(LockedError);
    });

    test("should  throw on joining locked lobby", () => {
      expect(() =>
        lobbyService.join(Lobbies.coolLobby, Sessions.eric.id),
      ).toThrow(LockedError);
    });

    test.todo("should not join lobby in different game", () => {});
  });

  describe("setData", () => {
    test("should replace lobby data", () => {
      const newData = Lobbies.coolLobby.data;

      // Update data
      const lobby = lobbyService.setData(
        Lobbies.davesLobby,
        newData,
        Sessions.dave.id,
      );

      expect(lobby.data).toEqual(newData);
      expect(lobbyRepository.require(lobby.id).data).toEqual(newData);
    });

    test("should throw if unauthorized", () => {
      // Try to update
      expect(() =>
        lobbyService.setData(Lobbies.coolLobby, new Map(), Sessions.dave.id),
      );
    });
  });

  describe("lock", () => {
    test("should lock lobby", () => {
      const lobby = lobbyService.lock(Lobbies.davesLobby, Sessions.dave.id);

      expect(lobby.isLocked).toBeTrue();
      expect(lobbyRepository.require(lobby.id).isLocked).toBeTrue();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.lock(Lobbies.davesLobby, Sessions.eric.id),
      ).toThrow(UnauthorizedError);
    });
  });

  describe("unlock", () => {
    test("should unlock lobby", () => {
      const lobby = lobbyService.unlock(Lobbies.coolLobby, Sessions.eric.id);

      expect(lobby.isLocked).toBeFalse();
      expect(lobbyRepository.require(lobby.id).isLocked).toBeFalse();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.unlock(Lobbies.davesLobby, Sessions.eric.id),
      ).toThrow(UnauthorizedError);
    });
  });

  describe("hide", () => {
    test("should hide lobby", () => {
      const lobby = lobbyService.hide(Lobbies.davesLobby, Sessions.dave.id);

      expect(lobby.isVisible).toBeFalse();
      expect(lobbyRepository.require(lobby.id).isVisible).toBeFalse();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.hide(Lobbies.davesLobby, Sessions.eric.id),
      ).toThrow(UnauthorizedError);
    });
  });

  describe("publish", () => {
    test("should publish lobby", () => {
      const lobby = lobbyService.publish(Lobbies.coolLobby, Sessions.eric.id);

      expect(lobby.isVisible).toBeTrue();
      expect(lobbyRepository.require(lobby.id).isVisible).toBeTrue();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.publish(Lobbies.davesLobby, Sessions.eric.id),
      ).toThrow(UnauthorizedError);
    });
  });
});
