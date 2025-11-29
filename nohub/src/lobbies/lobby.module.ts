import type { MetricsHolder } from "@src/metrics/metrics";
import type { Module } from "@src/module";
import type { Nohub, NohubReactor } from "@src/nohub";
import { sessionOf } from "@src/sessions/session.api";
import { requireRequest, requireSingleParam } from "@src/validators";
import type { LobbiesConfig } from "../config";
import { lobbyToCommand } from "./lobby";
import { LobbyApi } from "./lobby.api";
import { LobbyEventBus } from "./lobby.events";
import { LobbyMetricsReporter } from "./lobby.metrics.reporter";
import { type LobbyLookup, LobbyRepository } from "./lobby.repository";
import { LobbyService } from "./lobby.service";

export class LobbyModule implements Module {
  private readonly eventBus: LobbyEventBus;
  readonly lobbyRepository: LobbyRepository;
  readonly lobbyLookup: LobbyLookup;
  readonly lobbyService: LobbyService;
  readonly lobbyApi: LobbyApi;

  constructor(
    private config: LobbiesConfig,
    metrics: MetricsHolder,
  ) {
    this.eventBus = new LobbyEventBus();
    new LobbyMetricsReporter(this.eventBus, metrics);
    this.lobbyRepository = new LobbyRepository();
    this.lobbyLookup = this.lobbyRepository;
    this.lobbyService = new LobbyService(
      this.lobbyRepository,
      this.config,
      this.eventBus,
    );
    this.lobbyApi = new LobbyApi(
      this.lobbyRepository,
      this.lobbyService,
      metrics,
    );
  }

  attachTo(app: Nohub): void {
    app.modules.eventBus.on("session-close", (sessionId) => {
      this.lobbyApi.onSessionClose(sessionId);
    });
  }

  configure(reactor: NohubReactor): void {
    reactor
      .on("lobby/create", (cmd, xchg) => {
        requireRequest(cmd);
        const address = requireSingleParam(cmd, "Missing lobby address!");
        const data: Map<string, string> = cmd.kvMap ?? new Map();
        const session = sessionOf(xchg);

        const lobby = this.lobbyApi.create(address, session, data);
        xchg.reply(lobbyToCommand(lobby));
      })
      .on("lobby/get", (cmd, xchg) => {
        requireRequest(cmd);
        const id = requireSingleParam(cmd, "Missing lobby ID!");
        const properties = (cmd.params?.length ?? 0) > 1 ? cmd.params?.slice(1) : undefined;
        const session = sessionOf(xchg);

        const lobby = this.lobbyApi.get(id, session, properties);
        xchg.reply(lobbyToCommand(lobby));
      })
      .on("lobby/delete", (cmd, xchg) => {
        requireRequest(cmd);
        const id = requireSingleParam(cmd, "Missing lobby ID!");
        const session = sessionOf(xchg);

        this.lobbyApi.delete(id, session);
        xchg.reply({ text: "ok" });
      })
      .on("lobby/list", (cmd, xchg) => {
        requireRequest(cmd);
        // Set of params, or singleton set of text, or empty set if no text
        const properties = cmd.params ?? (cmd.text ? [cmd.text] : undefined);
        const session = sessionOf(xchg);

        // List lobbies
        for (const lobby of this.lobbyApi.list(properties, session))
          xchg.stream(lobbyToCommand(lobby));
        xchg.finishStream();
      })
      .on("lobby/join", (cmd, xchg) => {
        requireRequest(cmd);
        const lobbyId = cmd.requireText();
        const session = sessionOf(xchg);

        const address = this.lobbyApi.join(lobbyId, session);
        xchg.reply({ params: [address] });
      })
      .on("lobby/set-data", (cmd, xchg) => {
        requireRequest(cmd);
        const lobbyId = requireSingleParam(cmd, "Missing lobby ID!");
        const data = cmd.kvMap ?? new Map();
        const session = sessionOf(xchg);

        this.lobbyApi.setData(lobbyId, data, session);
        xchg.reply({ text: "ok" });
      })
      .on("lobby/lock", (cmd, xchg) => {
        requireRequest(cmd);
        const lobbyId = requireSingleParam(cmd, "Missing lobby ID!");
        const session = sessionOf(xchg);

        this.lobbyApi.lock(lobbyId, session);
        xchg.reply({ text: "ok" });
      })
      .on("lobby/unlock", (cmd, xchg) => {
        const lobbyId = requireSingleParam(cmd, "Missing lobby ID!");
        const session = sessionOf(xchg);

        this.lobbyApi.unlock(lobbyId, session);
        xchg.reply({ text: "ok" });
      })
      .on("lobby/hide", (cmd, xchg) => {
        const lobbyId = requireSingleParam(cmd, "Missing lobby ID!");
        const session = sessionOf(xchg);

        this.lobbyApi.hide(lobbyId, session);
        xchg.reply({ text: "ok" });
      })
      .on("lobby/publish", (cmd, xchg) => {
        const lobbyId = requireSingleParam(cmd, "Missing lobby ID!");
        const session = sessionOf(xchg);

        this.lobbyApi.publish(lobbyId, session);
        xchg.reply({ text: "ok" });
      });
  }
}
