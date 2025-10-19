import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { Command, TrimsockReader } from "@foxssake/trimsock-js";
import type { AppConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import { NohubEventBus } from "./events";
import { GameModule } from "./games/game.module";
import { LobbyModule } from "./lobbies/lobby.module";
import type { Module } from "./module";
import type { SessionData } from "./sessions/session";
import { SessionModule } from "./sessions/session.module";
import { UnknownCommandError } from "./errors";

export type NohubReactor = BunSocketReactor<SessionData>;

export class NohubModules {
  readonly eventBus: NohubEventBus;
  readonly gameModule: GameModule;
  readonly lobbyModule: LobbyModule;
  readonly sessionModule: SessionModule;

  readonly all: Module[];

  constructor(readonly config: AppConfig) {
    this.eventBus = new NohubEventBus();
    this.gameModule = new GameModule(this.config.games);
    this.lobbyModule = new LobbyModule(this.config.lobbies);
    this.sessionModule = new SessionModule(
      this.lobbyModule.lobbyRepository,
      this.gameModule.gameRepository,
      this.eventBus,
      config.sessions,
    );

    this.all = [this.gameModule, this.lobbyModule, this.sessionModule];
  }
}

export class Nohub {
  private socket?: Bun.TCPSocketListener<SessionData>;
  private reactor?: BunSocketReactor<SessionData>;

  readonly modules: NohubModules;

  constructor(readonly config: AppConfig) {
    this.modules = new NohubModules(this.config);
  }

  run() {
    rootLogger.info({ config: this.config }, "Starting with config");

    const reader = new TrimsockReader();
    reader.maxSize = this.config.tcp.commandBufferSize;

    this.reactor = new BunSocketReactor<SessionData>(reader)
      .onError(
      (cmd, exchange, error) => {
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
      },
    )
    .onUnknown((cmd, _xchg) => {
      throw new UnknownCommandError(cmd)
    });

    const modules = this.modules.all;
    this.socket = this.reactor.listen({
      hostname: this.config.tcp.host,
      port: this.config.tcp.port,
      socket: {
        open(socket) {
          modules.forEach((it) => {
            it.openSocket?.call(it, socket);
          });
        },

        close(socket) {
          modules.forEach((it) => {
            it.closeSocket?.call(it, socket);
          });
        },
      },
    });

    rootLogger.info("Listening on %s:%s", this.host, this.port);

    rootLogger.info("Attaching %d modules...", modules.length);
    modules.forEach((it) => {
      it.attachTo?.(this);
      this.reactor && it.configure && it.configure(this.reactor);
    });
    rootLogger.info("Attached %d modules", modules.length);

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
