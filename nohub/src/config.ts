import { bool, byteSize, enumerated, games, integer } from "./config.parsers";

type ConfigEnv = { [key: string]: string | undefined };

export function readConfig(env: ConfigEnv) {
  return {
    tcp: {
      host: env.NOHUB_TCP_HOST ?? "localhost",
      port: integer(env.NOHUB_TCP_PORT) ?? 9980,
      commandBufferSize: byteSize(env.NOHUB_TCP_COMMAND_BUFFER_SIZE) ?? 8192
    },

    log: {
      level:
        enumerated(env.NOHUB_LOG_LEVEL, [
          "silent",
          "trace",
          "debug",
          "info",
          "warn",
          "error",
          "fatal",
        ]) ?? "info",
    },

    games: games(env.NOHUB_GAMES) ?? [],

    lobbies: {
      idLength: integer(env.NOHUB_LOBBIES_ID_LENGTH) ?? 8,
      enableGameless: bool(env.NOHUB_LOBBIES_WITHOUT_GAME) ?? false,
      maxCount: integer(env.NOHUB_LOBBIES_MAX_COUNT) ?? 32768,
      maxPerSession: integer(env.NOHUB_LOBBIES_MAX_PER_SESSION) ?? 4,
      maxDataEntries: integer(env.NOHUB_LOBBIES_MAX_DATA_ENTRIES) ?? 128
    },

    sessions: {
      idLength: integer(env.NOHUB_SESSIONS_ID_LENGTH) ?? 12,
      arbitraryGameId:
        bool(env.NOHUB_SESSIONS_ARBITRARY_GAME_ID) ?? false,
      defaultGameId: env.NOHUB_LOBBIES_DEFAULT_GAME_ID,
      maxPerAddress: integer(env.NOHUB_SESSIONS_MAX_PER_ADDRESS) ?? 64
    },
  }
}

export function readDefaultConfig() {
  return readConfig({});
}

export type AppConfig = ReturnType<typeof readConfig>;
export type TcpConfig = AppConfig["tcp"];
export type GamesConfig = AppConfig["games"];
export type LobbiesConfig = AppConfig["lobbies"];
export type SessionsConfig = AppConfig["sessions"];
