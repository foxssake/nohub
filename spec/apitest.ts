import { BunSocketReactor } from "@foxssake/trimsock-bun";
import type { CommandSpec, Exchange } from "@foxssake/trimsock-js";
import { config } from "@src/config";
import { rootLogger } from "@src/logger";
import { sleep } from "bun";

export class ApiTest {
  static readonly logger = rootLogger.child({ name: "ApiTest" });

  private static sharedWorker?: Worker;

  constructor(
    public readonly clientReactor: BunSocketReactor,
    public readonly clientSocket: Bun.Socket,
  ) {}

  static async create(): Promise<ApiTest> {
    await ApiTest.ensureWorker();

    ApiTest.logger.info(
      "Connecting to host at %s:%d",
      config.tcp.host,
      config.tcp.port,
    );
    const clientReactor = new BunSocketReactor();
    const clientSocket = await clientReactor.connect({
      hostname: config.tcp.host,
      port: config.tcp.port,
      socket: {},
    });
    ApiTest.logger.info("Connected to host");

    return new ApiTest(clientReactor, clientSocket);
  }

  send(command: CommandSpec): Exchange<Bun.Socket> {
    return this.clientReactor.send(this.clientSocket, command);
  }

  async reset(): Promise<void> {
    await Promise.race([
      this.send({ name: "reset", requestId: "reset" }).onReply(),
      sleep(50),
    ]);
  }

  private static async ensureWorker(): Promise<Worker> {
    if (ApiTest.sharedWorker) return ApiTest.sharedWorker;

    ApiTest.logger.info("Starting worker thread for host");
    const worker = new Worker(`${import.meta.dir}/apitest.worker.ts`);
    ApiTest.logger.info("Started host thread %d", worker.threadId);

    ApiTest.logger.info("Waiting for host to start");
    await sleep(100.0);

    ApiTest.sharedWorker = worker;

    process.on("beforeExit", () => {
      if (ApiTest.sharedWorker) {
        ApiTest.logger.info(
          "Shutting down worker thread %d",
          ApiTest.sharedWorker.threadId,
        );
        ApiTest.sharedWorker.terminate();
        ApiTest.logger.info("Shutdown complete");
      }
    });

    return ApiTest.sharedWorker;
  }
}
