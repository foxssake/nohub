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
  describe("removeLobbiesOf", () => {
    test("should remove lobbies owned by session", () => {
      const results = [...lobbyRepository.removeLobbiesOf(Sessions.dave.id)];
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(Lobbies.davesLobby);
      expect(lobbyRepository.has(Lobbies.davesLobby.id)).toBeFalse();
    });

    test("should remove session from participants if not owner", () => {
      expect([...lobbyRepository.listLobbiesFor(Sessions.pam)]).toEqual([
        Lobbies.pamParticipantsLobby,
      ]);
      // Remove a participant who does not own a lobby.
      // It does not remove the lobby, just the participant.
      const results = [...lobbyRepository.removeLobbiesOf(Sessions.ingrid.id)];
      expect(results).toHaveLength(0);
      expect(
        lobbyRepository.require(Lobbies.pamParticipantsLobby.id).participants,
      ).toContain(Sessions.pam.id);
      expect(
        lobbyRepository.require(Lobbies.pamParticipantsLobby.id).participants,
      ).not.toContain(Sessions.ingrid.id);
    });
  });
});
