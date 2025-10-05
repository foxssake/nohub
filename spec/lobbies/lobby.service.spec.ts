import { beforeEach, describe, expect, test } from "bun:test";
import { Lobbies, Sessions } from "@spec/fixtures";
import type { Lobby } from "@src/lobbies/lobby";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import { LobbyService } from "@src/lobbies/lobby.service";

let lobbyRepository: LobbyRepository;
let lobbyService: LobbyService;

describe("LobbyService", () => {
  beforeEach(() => {
    lobbyRepository = new LobbyRepository();
    lobbyService = new LobbyService(lobbyRepository);

    Lobbies.all().forEach((it) => {
      lobbyRepository.add(it);
    });
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
        owner: Sessions.dave,
        isVisible: true,
        isLocked: false,
        data: lobbyData,
      };

      const lobby = lobbyService.create(lobbyData, Sessions.dave);

      expected.id = lobby.id; // Ignore for comparison
      expect(lobby).toEqual(expected); // Lobby data matches
      expect(lobbyRepository.find(expected.id)).toEqual(expected); // Lobby was saved in repo
    });
  });

  describe("setData", () => {
    test("should replace lobby data", () => {
      const newData = Lobbies.coolLobby.data;

      // Update data
      const lobby = lobbyService.setData(
        Lobbies.davesLobby,
        newData,
        Sessions.dave,
      );

      expect(lobby.data).toEqual(newData);
      expect(lobbyRepository.require(lobby.id).data).toEqual(newData);
    });

    test("should throw if unauthorized", () => {
      // Try to update
      expect(() =>
        lobbyService.setData(Lobbies.coolLobby, new Map(), Sessions.dave),
      );
    });
  });

  describe("lock", () => {
    test("should lock lobby", () => {
      const lobby = lobbyService.lock(Lobbies.davesLobby, Sessions.dave);

      expect(lobby.isLocked).toBeTrue();
      expect(lobbyRepository.require(lobby.id).isLocked).toBeTrue();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.lock(Lobbies.davesLobby, Sessions.eric),
      ).toThrow();
    });
  });

  describe("unlock", () => {
    test("should unlock lobby", () => {
      const lobby = lobbyService.unlock(Lobbies.coolLobby, Sessions.eric);

      expect(lobby.isLocked).toBeFalse();
      expect(lobbyRepository.require(lobby.id).isLocked).toBeFalse();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.unlock(Lobbies.davesLobby, Sessions.eric),
      ).toThrow();
    });
  });

  describe("hide", () => {
    test("should hide lobby", () => {
      const lobby = lobbyService.hide(Lobbies.davesLobby, Sessions.dave);

      expect(lobby.isVisible).toBeFalse();
      expect(lobbyRepository.require(lobby.id).isVisible).toBeFalse();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.hide(Lobbies.davesLobby, Sessions.eric),
      ).toThrow();
    });
  });

  describe("publish", () => {
    test("should publish lobby", () => {
      const lobby = lobbyService.publish(Lobbies.coolLobby, Sessions.eric);

      expect(lobby.isVisible).toBeTrue();
      expect(lobbyRepository.require(lobby.id).isVisible).toBeTrue();
    });

    test("should throw if unauthorized", () => {
      expect(() =>
        lobbyService.publish(Lobbies.davesLobby, Sessions.eric),
      ).toThrow();
    });
  });
});
