import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command, Reactor } from "@foxssake/trimsock-js";
import type { AppConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import { SessionModule } from "./sessions/session.module";
import type { Module } from "./module";
import { GameModule } from "./games/game.module";
import type { SessionData } from "./sessions/session";
import { NohubEventBus } from "./events";
import { LobbyModule } from "./lobbies/lobby.module";

export type NohubReactor = BunSocketReactor<SessionData>;

export class Nohub {
  private socket?: Bun.TCPSocketListener<SessionData>;
  private reactor?: BunSocketReactor<SessionData>;

  // TODO: Inject from the other modules
  readonly eventBus = new NohubEventBus();
  private readonly gameModule = new GameModule()
  private readonly lobbyModule = new LobbyModule()
  private readonly sessionModule = new SessionModule(this.lobbyModule.lobbyRepository, this.gameModule.gameRepository, this.eventBus);
  private readonly modules: Module[] = [
    this.gameModule,
    this.lobbyModule,
    this.sessionModule
  ]

  run(config: AppConfig) {
    rootLogger.info({ config: config }, "Starting with config");
  
    this.reactor = new BunSocketReactor<SessionData>()
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
      it.attachTo && it.attachTo(this)
      this.reactor && it.configure && it.configure(this.reactor)
    })
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
