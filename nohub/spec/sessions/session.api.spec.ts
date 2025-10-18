import { beforeEach, describe, expect, test } from "bun:test";
import { Games } from "@spec/fixtures";
import type { SessionsConfig } from "@src/config";
import { DataNotFoundError } from "@src/errors";
import { NohubEventBus } from "@src/events";
import { GameRepository } from "@src/games/game.repository";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { SessionData } from "@src/sessions/session";
import { SessionApi } from "@src/sessions/session.api";

let config: SessionsConfig;
let sessionApi: SessionApi;

let session: SessionData;

describe("SessionApi", () => {
  beforeEach(() => {
    session = {
      id: "msHiIGQf",
      gameId: undefined,
    };
    const gameLookup = new GameRepository();
    Games.insert(gameLookup);

    config = { idLength: 8, arbitraryGameId: false, defaultGameId: undefined };

    sessionApi = new SessionApi(
      new LobbyRepository(),
      gameLookup,
      new NohubEventBus(),
      config,
    );
  });

  describe("setGame", () => {
    test("should throw on unknown game", () => {
      expect(() => sessionApi.setGame(session, "foo")).toThrow(
        DataNotFoundError,
      );
    });

    test("should succeed on unknown game", () => {
      config.arbitraryGameId = true;
      expect(() => sessionApi.setGame(session, "foo")).not.toThrow();
    });
  });
});
