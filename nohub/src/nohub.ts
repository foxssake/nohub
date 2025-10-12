import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command } from "@foxssake/trimsock-js";
import { type AppConfig, config } from "@src/config";
import { resetLobbies, withLobbyCommands } from "@src/lobbies";
import { rootLogger } from "@src/logger";
import { closeSession, openSession, type SessionData } from "@src/sessions";

export function nohub(
  appConfig: AppConfig = config,
  isTesting: boolean = false,
) {
  rootLogger.info({ config: appConfig }, "Starting with config");

  new BunSocketReactor<SessionData>()
    .configure(withLobbyCommands())
    .configure((reactor) => {
      if (isTesting) {
        rootLogger.info("Running in test mode!");
        reactor.on("reset", (_, xchg) => {
          rootLogger.info("Resetting instance!");
          resetLobbies();

          xchg.replyOrSend({ name: "reset", text: "ok" });
          rootLogger.info("Reset finished");
        });
      }
    })
    .onError((cmd, exchange, error) => {
      if (error instanceof Error)
        exchange.failOrSend({
          name: "error",
          params: [error.name, error.message],
        });
      else exchange.failOrSend({ name: "error", text: `${error}` });

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
  rootLogger.info("Started in %fms", process.uptime() * 1000);
}
