import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command } from "@foxssake/trimsock-js";
import { config } from "@src/config";
import { withLobbyCommands } from "@src/lobbies";
import { rootLogger } from "@src/logger";

rootLogger.info({ config }, "Starting with config");

new BunSocketReactor()
  .configure(withLobbyCommands())
  .onError((cmd, exchange, error) => {
    exchange.failOrSend({ name: 'error', data: '' + error })
    rootLogger.error(error, 'Failed processing command: %s', Command.serialize(cmd))
  })
  .listen({
    hostname: config.tcp.host,
    port: config.tcp.port,
    socket: {},
  });

rootLogger.info("Listening on %s:%d", config.tcp.host, config.tcp.port);
rootLogger.info("Started in %fms", process.uptime() * 1000);
