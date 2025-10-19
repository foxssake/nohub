import assert from "node:assert";
import { BunSocketReactor } from "@foxssake/trimsock-bun";
import type { CommandSpec, Exchange, Reactor } from "@foxssake/trimsock-js";
import { readDefaultConfig } from "@src/config";
import { commandToLobby, type Lobby } from "@src/lobbies/lobby";
import { rootLogger } from "@src/logger";
import { Nohub } from "@src/nohub";
import { sleep } from "bun";
import { nanoid } from "nanoid";
import { Games } from "./fixtures";

export class ApiTest {
  static readonly logger = rootLogger.child({ name: "ApiTest" });
  static nohub?: Nohub;

  private clients: Map<string, TrimsockClient<Bun.Socket>> = new Map();

  static async create(): Promise<ApiTest> {
    await ApiTest.ensureHost();
    const api = new ApiTest();
    await api.setupClient();

    return api;
  }

  async setupClient(name: string = ""): Promise<void> {
    if (this.clients.has(name)) return;

    const host = ApiTest.nohub?.host;
    const port = ApiTest.nohub?.port;
    assert(host && port);

    ApiTest.logger.info("Connecting to host at %s:%d", host, port);
    const clientReactor = new BunSocketReactor();
    let clientSocket: Bun.Socket | undefined;

    // Attempt connection
    for (let i = 0; i < 5; ++i) {
      try {
        clientSocket = await clientReactor.connect({
          hostname: host,
          port: port,
          socket: {},
        });
        ApiTest.logger.info("Connected to host");
        break;
      } catch (err) {
        ApiTest.logger.warn(err, "Failed to connect, waiting");
        await sleep(50);
      }
    }

    if (!clientSocket) throw new Error("Failed to connect to host!");

    const client = new TrimsockClient(clientReactor, clientSocket);
    this.clients.set(name, client);
  }

  disconnectClient(name: string = "") {
    const client = this.clients.get(name);
    if (!client) return;

    const socket = client.connection();
    socket.end();
    this.clients.delete(name);
  }

  client(name: string = ""): TrimsockClient<Bun.Socket> {
    const client = this.clients.get(name);
    assert(client, `Client ${name} not set up!`);
    return client;
  }

  reset(): void {
    ApiTest.nohub?.modules?.lobbyModule.lobbyRepository.clear();
  }

  private static async ensureHost(): Promise<Nohub> {
    if (ApiTest.nohub) return ApiTest.nohub;

    ApiTest.logger.info("Starting local nohub for testing");
    ApiTest.nohub = new Nohub({
      ...readDefaultConfig(),
      tcp: {
        host: "localhost",
        port: 0,
        commandBufferSize: 8192,
      },
      games: Games.all(),
    });
    // Run listening on a random port
    ApiTest.nohub.run();
    ApiTest.logger.info("Local nohub started");

    process.on("beforeExit", () => {
      if (ApiTest.nohub) {
        ApiTest.logger.info("Shutting down local nohub");
        ApiTest.nohub.shutdown();
        ApiTest.logger.info("Local nohub shut down");
      }
    });

    return ApiTest.nohub;
  }
}

export class TrimsockClient<T> {
  constructor(
    private reactor: Reactor<T>,
    private serverTarget: T,
  ) {}

  send(command: CommandSpec): Exchange<T> {
    return this.reactor.send(this.serverTarget, command);
  }

  connection(): T {
    return this.serverTarget;
  }

  async setGame(id: string): Promise<void> {
    const xchg = this.reactor.send(this.serverTarget, {
      name: "session/set-game",
      isRequest: true,
      requestId: this.exchangeId(),
      params: [id],
    });

    const reply = await xchg.onReply();
    if (!reply.isSuccessResponse) throw new Error("Failed to set game ID!");
  }

  async createLobby(
    address: string,
    data?: Map<string, string>,
  ): Promise<Lobby> {
    const xchg = this.reactor.send(this.serverTarget, {
      name: "lobby/create",
      isRequest: true,
      requestId: this.exchangeId(),
      params: [address],
      kvParams: [...(data?.entries() ?? [])],
    });

    const reply = await xchg.onReply();

    if (!reply.isSuccessResponse || !reply.text)
      throw new Error("Failed to create lobby!");

    return commandToLobby(reply);
  }

  async listLobbies(): Promise<Lobby[]> {
    const result: Lobby[] = [];

    const xchg = this.reactor.send(this.serverTarget, {
      name: "lobby/list",
      isRequest: true,
      requestId: this.exchangeId(),
    });

    for await (const chunk of xchg.chunks()) {
      result.push({
        id: chunk.params?.at(0) ?? chunk.text ?? "",
        isLocked: chunk.params?.includes("locked") === true,
        isVisible: chunk.params?.includes("hidden") !== true,

        data: new Map(),
        address: "",
        owner: "",
      });
    }

    return result;
  }

  async deleteLobby(lobbyId: string): Promise<void> {
    const xchg = this.reactor.send(this.serverTarget, {
      name: "lobby/delete",
      isRequest: true,
      requestId: this.exchangeId(),
      params: [lobbyId],
    });

    await xchg.onReply();
  }

  async lockLobby(lobbyId: string): Promise<void> {
    await this.reactor
      .send(this.serverTarget, {
        name: "lobby/lock",
        params: [lobbyId],
        isRequest: true,
        requestId: this.exchangeId(),
      })
      .onReply();
  }

  async hideLobby(lobbyId: string): Promise<void> {
    await this.reactor
      .send(this.serverTarget, {
        name: "lobby/hide",
        params: [lobbyId],
        isRequest: true,
        requestId: this.exchangeId(),
      })
      .onReply();
  }

  private exchangeId(): string {
    return nanoid();
  }
}
