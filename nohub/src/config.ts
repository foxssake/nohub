import dotenv from "dotenv";
import { enumerated, games, integer } from "./config.parsers";

dotenv.config();

export const config = {
  tcp: {
    host: process.env.NOHUB_TCP_HOST ?? "localhost",
    port: integer(process.env.NOHUB_TCP_PORT) ?? 9980,
  },

  log: {
    level:
      enumerated(process.env.NOHUB_LOG_LEVEL, [
        "silent",
        "trace",
        "debug",
        "info",
        "warn",
        "error",
        "fatal",
      ]) ?? "info",
  },

  games: games(process.env.NOHUB_GAMES) ?? [],

  lobbies: {
    idLength: integer(process.env.NOHUB_LOBBIES_ID_LENGTH) ?? 8,
    enableGameless:
      (process.env.NOHUB_LOBBIES_WITHOUT_GAME ?? "false") === "true",
  },

  sessions: {
    idLength: integer(process.env.NOHUB_SESSIONS_ID_LENGTH) ?? 12,
    defaultGameId: process.env.NOHUB_LOBBIES_DEFAULT_GAME_ID,
  },
};

export type GamesConfig = typeof config.games;
export type LobbiesConfig = typeof config.lobbies;
export type SessionsConfig = typeof config.sessions;
export type AppConfig = typeof config;
