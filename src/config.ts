import dotenv from "dotenv";
import { enumerated, integer } from "./config.parsers";

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
};

export type AppConfig = typeof config;
