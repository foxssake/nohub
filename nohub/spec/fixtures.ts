import type { Game } from "@src/games/game";
import type { GameRepository } from "@src/games/game.repository";
import type { Lobby } from "@src/lobbies/lobby";
import type { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { SessionData } from "@src/sessions/session";
import { ApiTest } from "./apitest";

// These methods ensure type safety when used in fixture object literals
function fixture<T>(data: T): T {
  return data;
}
const gameFixture = fixture<Game>;
const sessionFixture = fixture<SessionData>;
const lobbyFixture = fixture<Lobby>;

// biome-ignore lint/complexity/noBannedTypes: We indeed don't care about the shape here
function fixturesOf<T>(fixtures: Record<string, T | Function>): T[] {
  return Object.values(fixtures).filter(
    (it) => typeof it !== "function",
  ) as T[];
}

export const Games = {
  forestBrawl: gameFixture({
    id: "q5jM",
    name: "Forest Brawl",
  }),

  campfire: gameFixture({
    id: "Yf8c",
    name: "Campfire: Surviving Orom",
  }),

  all: () => fixturesOf<Game>(Games),

  insert(
    repository: GameRepository | undefined = ApiTest.nohub?.modules?.gameModule
      .gameRepository,
  ) {
    Games.all().forEach((it) => {
      repository?.add(it);
    });
  },
};

export const Sessions = {
  dave: sessionFixture({ id: "94kwM3zUaNCn", gameId: Games.forestBrawl.id }),
  eric: sessionFixture({ id: "Nd49VE4RWJh0", gameId: Games.forestBrawl.id }),
  pam: sessionFixture({ id: "DCLyAVxClvO_" }),
  luna: sessionFixture({ id: "IOx6fARLyowY", gameId: Games.campfire.id }),
};

export const Addresses = {
  dave: "enet://224.103.6.176:49582",
  eric: "enet://118.154.159.94:51488",
  pam: "enet://81.53.112.234:57228",
  luna: "noray://noray-eu.foxssake.studio/r4L1iEkarSm8",
};

export const Lobbies = {
  davesLobby: lobbyFixture({
    id: "WzXOsEhM",
    owner: Sessions.dave.id,
    address: Addresses.dave,
    gameId: Games.forestBrawl.id,
    isVisible: true,
    isLocked: false,
    data: new Map([
      ["name", "Dave's Lobby"],
      ["player-count", "8"],
      ["player-capacity", "12"],
    ]),
  }),

  coolLobby: lobbyFixture({
    id: "5fl8Rbc7",
    owner: Sessions.eric.id,
    address: Addresses.eric,
    gameId: Games.forestBrawl.id,
    isVisible: false,
    isLocked: true,
    data: new Map([
      ["name", "Cool Lobby"],
      ["player-count", "9"],
      ["player-capacity", "16"],
    ]),
  }),

  mithrilParty: lobbyFixture({
    id: "mLG-7Wbx",
    owner: Sessions.luna.id,
    address: Addresses.luna,
    gameId: Games.campfire.id,
    isVisible: true,
    isLocked: false,
    data: new Map([
      ["name", "Mithril Party"],
      ["player-count", "4"],
      ["player-capacity", "6"],
    ]),
  }),

  all(): Lobby[] {
    return fixturesOf<Lobby>(Lobbies);
  },

  insert(
    repository: LobbyRepository | undefined = ApiTest.nohub?.modules?.lobbyModule
      .lobbyRepository,
  ): void {
    for (const lobby of this.all()) repository?.add(lobby);
  },
};
