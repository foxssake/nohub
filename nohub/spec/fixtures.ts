import type { Game } from "@src/games/game";
import { lobbyRepository } from "@src/lobbies";
import type { Lobby } from "@src/lobbies/lobby";
import type { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { SessionData } from "@src/sessions";

// These methods ensure type safety when used in fixture object literals
function fixture<T>(data: T): T { return data }
const gameFixture = fixture<Game>;
const sessionFixture = fixture<SessionData>;
const lobbyFixture = fixture<Lobby>;

function fixturesOf<T>(fixtures: Record<string, T | Function>): T[] {
  return Object.values(fixtures).filter(it => typeof it !== "function") as T[]; 
}

export const Games = {
  forestBrawl: gameFixture({
    id: "q5jM",
    name: "Forest Brawl"
  }),

  campfire: gameFixture({
    id: "Yf8c",
    name: "Campfire: Surviving Orom"
  }),

  all: () => fixturesOf<Game>(Games)
}

export const Sessions = {
  dave: sessionFixture({ id: "94kwM3zUaNCn", game: Games.forestBrawl }),
  eric: sessionFixture({ id: "Nd49VE4RWJh0", game: Games.forestBrawl }),
  pam: sessionFixture({ id: "DCLyAVxClvO_"}),
};

export const Addresses = {
  dave: "enet://224.103.6.176:49582",
  eric: "enet://118.154.159.94:51488",
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

  all(): Lobby[] {
    return fixturesOf<Lobby>(Lobbies)
  },

  insert(repository: LobbyRepository = lobbyRepository): void {
    for (const lobby of this.all()) repository.add(lobby);
  },
};
