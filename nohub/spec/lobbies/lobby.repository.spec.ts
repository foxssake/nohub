import { beforeEach, describe, expect, test } from "bun:test";
import { Lobbies, Sessions } from "@spec/fixtures";
import { LobbyRepository } from "@src/lobbies/lobby.repository";

let lobbyRepository: LobbyRepository;

describe("LobbyRepository", () => {
  beforeEach(() => {
    lobbyRepository = new LobbyRepository();
    Lobbies.insert(lobbyRepository);
  });

  describe("listLobbiesFor", () => {
    test("should not list hidden lobbies", () => {
      expect([...lobbyRepository.listLobbiesFor(Sessions.dave)]).toEqual([
        Lobbies.davesLobby,
      ]);
    });

    test("should list owned hidden lobbies", () => {
      expect([...lobbyRepository.listLobbiesFor(Sessions.eric)]).toEqual([
        Lobbies.davesLobby,
        Lobbies.coolLobby,
      ]);
    });

    test("should not list lobbies in different games", () => {
      expect([...lobbyRepository.listLobbiesFor(Sessions.luna)]).not.toContain(
        Lobbies.davesLobby,
      );
    });
  });
});
