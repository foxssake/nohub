import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command } from "@foxssake/trimsock-js";
import { type AppConfig } from "@src/config";
import { withLobbyCommands } from "@src/lobbies";
import { rootLogger } from "@src/logger";
import { closeSession, openSession, type SessionData } from "@src/sessions";

export class Nohub {
  private socket?: Bun.TCPSocketListener<SessionData>

  run(config: AppConfig) {
    rootLogger.info({ config: config }, "Starting with config");

    this.socket = new BunSocketReactor<SessionData>()
      .configure(withLobbyCommands())
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
        hostname: config.tcp.host,
        port: config.tcp.port,
        socket: {
          open(socket) {
            openSession(socket);
          },

          close(socket) {
            closeSession(socket);
          },
        },
      });

    rootLogger.info("Listening on %s:%d", config.tcp.host, config.tcp.port);
    rootLogger.info("Started in %sms", process.uptime() * 1000.0);
  }

  shutdown() {
    if (!this.socket) return

    rootLogger.info("Shutting down")
    this.socket?.stop(true)
    rootLogger.info("Socket closed")
  }
}

