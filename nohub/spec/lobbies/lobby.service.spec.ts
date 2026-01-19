import { beforeEach, describe, expect, test } from "bun:test";
import { Addresses, Lobbies, Sessions } from "@spec/fixtures";
import { type LobbiesConfig, readDefaultConfig } from "@src/config";
import {
  InvalidCommandError,
  LimitError,
  LockedError,
  UnauthorizedError,
} from "@src/errors";
import type { Lobby } from "@src/lobbies/lobby";
import { LobbyEventBus } from "@src/lobbies/lobby.events";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import { LobbyService } from "@src/lobbies/lobby.service";

let config: LobbiesConfig;
let lobbyRepository: LobbyRepository;
let lobbyService: LobbyService;

describe("LobbyService", () => {
  beforeEach(() => {
    config = readDefaultConfig().lobbies;
    config.enableGameless = false;

    lobbyRepository = new LobbyRepository();
    lobbyService = new LobbyService(
      lobbyRepository,
      config,
      new LobbyEventBus(),
    );

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
        gameId: Sessions.dave.gameId,
        isVisible: true,
        isLocked: false,
        data: lobbyData,
        participants: [Sessions.dave.id],
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

    test("should not create without game in session", () => {
      expect(() =>
        lobbyService.create(Addresses.pam, new Map(), Sessions.pam),
      ).toThrow(InvalidCommandError);
    });

    test("should not exceed per session limit", () => {
      // Limit to 2 lobbies per session
      config.maxPerSession = 2;

      // First two should succeed
      expect(() =>
        lobbyService.create(Addresses.ingrid, new Map(), Sessions.ingrid),
      ).not.toThrow();
      expect(() =>
        lobbyService.create(Addresses.ingrid, new Map(), Sessions.ingrid),
      ).not.toThrow();

      // Third should fail
      expect(() =>
        lobbyService.create(Addresses.ingrid, new Map(), Sessions.ingrid),
      ).toThrow(LimitError);

      // Different session should be able to create nonetheless
      expect(() =>
        lobbyService.create(Addresses.dave, new Map(), Sessions.dave),
      ).not.toThrow();
    });

    test("should ignore per session limit", () => {
      // Remove limit
      config.maxPerSession = 0;

      // Create lots of lobbies
      for (let i = 0; i < 128; ++i)
        expect(() =>
          lobbyService.create(Addresses.ingrid, new Map(), Sessions.ingrid),
        ).not.toThrow();
    });

    test("should not exceed global limit", () => {
      // Limit lobbies globally
      config.maxCount = 4;

      // Don't need fixtures in this case
      lobbyRepository.clear();

      // First few lobbies should be fine
      expect(() =>
        lobbyService.create(Addresses.eric, new Map(), Sessions.eric),
      ).not.toThrow();
      expect(() =>
        lobbyService.create(Addresses.dave, new Map(), Sessions.dave),
      ).not.toThrow();
      expect(() =>
        lobbyService.create(Addresses.luna, new Map(), Sessions.luna),
      ).not.toThrow();
      expect(() =>
        lobbyService.create(Addresses.ingrid, new Map(), Sessions.ingrid),
      ).not.toThrow();

      // Should hit limit
      expect(() =>
        lobbyService.create(Addresses.eric, new Map(), Sessions.eric),
      ).toThrow(LimitError);
    });

    test("should ignore global limit", () => {
      // Remove limits
      config.maxCount = 0;
      config.maxPerSession = 0;

      // Create lots of lobbies
      for (let i = 0; i < 128; ++i)
        expect(() =>
          lobbyService.create(Addresses.ingrid, new Map(), Sessions.ingrid),
        ).not.toThrow();
    });

    test("should not exceed data size limit", () => {
      config.maxDataEntries = 2;
      expect(() =>
        lobbyService.create(
          Addresses.ingrid,
          new Map([
            ["name", "Emerald Gang"],
            ["player-capacity", "8"],
          ]),
          Sessions.ingrid,
        ),
      ).not.toThrow();
      expect(() =>
        lobbyService.create(
          Addresses.ingrid,
          new Map([
            ["name", "Emerald Gang"],
            ["player-capacity", "8"],
            ["player-count", "6"],
          ]),
          Sessions.ingrid,
        ),
      ).toThrow(LimitError);
    });

    test("should ignore data size limit", () => {
      // Remove limit
      config.maxDataEntries = 0;

      // Add lots of entries
      const data = new Map();
      for (let i = 0; i < 128; ++i) data.set(`key${i}`, `value${i}`);

      // Should be fine
      expect(() =>
        lobbyService.create(Addresses.ingrid, new Map(data), Sessions.ingrid),
      ).not.toThrow();
    });
  });

  describe("delete", () => {
    test("should delete lobby", () => {
      expect(() =>
        lobbyService.delete(Lobbies.davesLobby, Sessions.dave),
      ).not.toThrow();
    });

    test("should throw if not owner", () => {
      expect(() =>
        lobbyService.delete(Lobbies.davesLobby, Sessions.eric),
      ).toThrow();
    });
  });

  describe("join", () => {
    test("should respond with address", () => {
      expect(lobbyService.join(Lobbies.davesLobby, Sessions.pam)).toEqual(
        Lobbies.davesLobby.address,
      );
    });

    test("should throw on joining own lobby", () => {
      expect(() =>
        lobbyService.join(Lobbies.davesLobby, Sessions.dave),
      ).toThrow(LockedError);
    });

    test("should  throw on joining locked lobby", () => {
      expect(() => lobbyService.join(Lobbies.coolLobby, Sessions.eric)).toThrow(
        LockedError,
      );
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
      ).toThrow(UnauthorizedError);
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
      ).toThrow(UnauthorizedError);
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
      ).toThrow(UnauthorizedError);
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
      ).toThrow(UnauthorizedError);
    });
  });
});
