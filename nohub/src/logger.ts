import pino from "pino";
import { config } from "./config";

export const rootLogger = pino({
  name: "nohub",
  level: config.log.level,
});
