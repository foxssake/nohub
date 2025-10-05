import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command } from "@foxssake/trimsock-js";
import { type AppConfig, config } from "@src/config";
import { withLobbyCommands } from "@src/lobbies";
import { rootLogger } from "@src/logger";
import { closeSession, openSession, type SessionData } from "@src/sessions";

export function nohub(appConfig: AppConfig = config) {
  rootLogger.info({ config: appConfig }, "Starting with config");

  new BunSocketReactor<SessionData>()
    .configure(withLobbyCommands())
    .onError((cmd, exchange, error) => {
      exchange.failOrSend({ name: "error", text: `${error}` });
      rootLogger.error(
        error,
        "Failed processing command: %s",
        Command.serialize(cmd),
      );
    })
    .listen({
      hostname: appConfig.tcp.host,
      port: appConfig.tcp.port,
      socket: {
        open(socket) {
          openSession(socket);
        },

        close(socket) {
          closeSession(socket);
        },
      },
    });

  rootLogger.info("Listening on %s:%d", appConfig.tcp.host, appConfig.tcp.port);
  rootLogger.info("Started in %fms", process.uptime() * 1000.);
}

