import type { Lobby } from "@src/lobbies/lobby";

export const Sessions = {
  dave: "94kwM3zUaNCn",
  eric: "Nd49VE4RWJh0",
  pam: "DCLyAVxClvO_",

  all(): string[] {
    return Object.values(this).filter((it) => typeof it === "string");
  },
};

export const Lobbies = {
  davesLobby: {
    id: "WzXOsEhM",
    owner: Sessions.dave,
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
};
