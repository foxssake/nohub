import pino from "pino";
import { readConfig } from "./config";

export const rootLogger = pino({
  name: "nohub",
  level: readConfig(Bun.env).log.level,
});
