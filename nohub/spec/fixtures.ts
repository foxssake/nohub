import { lobbyRepository } from "@src/lobbies";
import type { Lobby } from "@src/lobbies/lobby";
import type { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { LobbyService } from "@src/lobbies/lobby.service";

export const Sessions = {
  dave: "94kwM3zUaNCn",
  eric: "Nd49VE4RWJh0",
  pam: "DCLyAVxClvO_",

  all(): string[] {
    return Object.values(this).filter((it) => typeof it === "string");
  },
};

export const Addresses = {
  dave: "enet://224.103.6.176:49582",
  eric: "enet://118.154.159.94:51488",
};

export const Lobbies = {
  davesLobby: {
    id: "WzXOsEhM",
    owner: Sessions.dave,
    address: Addresses.dave,
    isVisible: true,
    isLocked: false,
    data: new Map([
      ["name", "Dave's Lobby"],
      ["player-count", "8"],
      ["player-capacity", "12"],
    ]),
  },

  coolLobby: {
    id: "5fl8Rbc7",
    owner: Sessions.eric,
    address: Addresses.eric,
    isVisible: false,
    isLocked: true,
    data: new Map([
      ["name", "Cool Lobby"],
      ["player-count", "9"],
      ["player-capacity", "16"],
    ]),
  },

  all(): Lobby[] {
    return Object.values(this).filter(
      (it) => typeof it === "object",
    ) as Lobby[];
  },

  insert(repository: LobbyRepository = lobbyRepository): void {
    for (const lobby of this.all())
      repository.add(lobby)
  }
};
