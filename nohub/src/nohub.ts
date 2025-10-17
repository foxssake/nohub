import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command, Reactor } from "@foxssake/trimsock-js";
import type { AppConfig } from "@src/config";
import { lobbyRepository, withLobbyCommands } from "@src/lobbies";
import { rootLogger } from "@src/logger";
import {
  type SessionData,
} from "@src/sessions";
import { gameRepository, importGames } from "./games";
import { SessionModule } from "./sessions/session.module";
import { eventBus } from "./events/nohub.event.bus";
import type { Module } from "./module";

export type NohubReactor = BunSocketReactor<SessionData>;

export class Nohub {
  private socket?: Bun.TCPSocketListener<SessionData>;
  private reactor?: BunSocketReactor<SessionData>;

  // TODO: Inject from the other modules
  private readonly sessionModule = new SessionModule(lobbyRepository, gameRepository, eventBus);
  private readonly modules: Module[] = [
    this.sessionModule
  ]

  run(config: AppConfig) {
    rootLogger.info({ config: config }, "Starting with config");
  
    this.reactor = new BunSocketReactor<SessionData>()
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

    const modules = this.modules
    this.socket = this.reactor.listen({
        hostname: config.tcp.host,
        port: config.tcp.port,
        socket: {
          open(socket) {
            modules.forEach(it => { it.openSocket?.call(it, socket) })
          },

          close(socket) {
            modules.forEach(it => { it.closeSocket?.call(it, socket) })
          },
        },
      });

    rootLogger.info("Listening on %s:%s", this.host, this.port);

    rootLogger.info("Attaching %d modules...", modules.length)
    modules.forEach(it => {
      it.attachTo(this)
      this.reactor && it.configure && it.configure(this.reactor)
    })
    importGames()
    rootLogger.info("Attached %d modules", modules.length)

    rootLogger.info("Started in %sms", process.uptime() * 1000.0);
  }

  get host(): string | undefined {
    return this.socket?.hostname;
  }

  get port(): number | undefined {
    return this.socket?.port;
  }

  shutdown() {
    if (!this.socket) return;

    rootLogger.info("Shutting down");
    this.socket?.stop(true);
    rootLogger.info("Socket closed");
  }
}
