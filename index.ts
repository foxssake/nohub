import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { config } from "@src/config";
import { logger } from "@src/logger";

logger.info({ config }, "Starting with config");

new BunSocketReactor()
  .on("echo", (cmd, exchange) => exchange.replyOrSend(cmd))
  .listen({
    hostname: config.tcp.host,
    port: config.tcp.port,
    socket: {},
  });

logger.info("Listening on %s:%d", config.tcp.host, config.tcp.port);
logger.info("Started in %fms", process.uptime() * 1000);
