import { BunSocketReactor } from "@foxssake/trimsock-bun";
import type { CommandSpec, Exchange, Reactor } from "@foxssake/trimsock-js";
import { config } from "@src/config";
import { lobbyRepository } from "@src/lobbies";
import { rootLogger } from "@src/logger";
import { Nohub } from "@src/nohub";
import { sleep } from "bun";
import { nanoid } from "nanoid";

export class ApiTest {
  static readonly logger = rootLogger.child({ name: "ApiTest" });
  private static nohub?: Nohub;

  readonly client: TrimsockClient<Bun.Socket>;

  constructor(
    public readonly clientReactor: BunSocketReactor,
    public readonly clientSocket: Bun.Socket,
  ) {
    this.client = new TrimsockClient(this.clientReactor, this.clientSocket);
  }

  static async create(): Promise<ApiTest> {
    await ApiTest.ensureHost();

    ApiTest.logger.info(
      "Connecting to host at %s:%d",
      config.tcp.host,
      config.tcp.port,
    );
    const clientReactor = new BunSocketReactor();
    let clientSocket: Bun.Socket | undefined;

    // Attempt connection
    for (let i = 0; i < 5; ++i) {
      try {
        clientSocket = await clientReactor.connect({
          hostname: config.tcp.host,
          port: config.tcp.port,
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

    return new ApiTest(clientReactor, clientSocket);
  }

  send(command: CommandSpec): Exchange<Bun.Socket> {
    return this.clientReactor.send(this.clientSocket, command);
  }

  reset(): void {
    lobbyRepository.clear();
  }

  private static async ensureHost(): Promise<Nohub> {
    if (ApiTest.nohub) return ApiTest.nohub;

    ApiTest.logger.info("Starting local nohub for testing");
    ApiTest.nohub = new Nohub();
    ApiTest.nohub.run(config);
    ApiTest.logger.info("Local nohub started");

    // ApiTest.logger.info("Waiting for host to start");
    // await sleep(100.0);

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

  async createLobby(
    address: string,
    data?: Map<string, string>,
  ): Promise<string> {
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

    return reply.text;
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
