import pino from "pino";
import { config } from "./config";

export const logger = pino({
  name: "nohub",
  level: config.log.level,
});
