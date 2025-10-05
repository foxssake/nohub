import { BunSocketReactor } from "@foxssake/trimsock-bun"
import { rootLogger } from "@src/logger"
import { config } from "@src/config";
import { sleep } from "bun";
import type { CommandSpec, Exchange } from "@foxssake/trimsock-js";

export class ApiTest {
  static readonly logger = rootLogger.child({ name: "ApiTest" })

  private static sharedWorker?: Worker

  constructor(
    public readonly clientReactor: BunSocketReactor,
    public readonly clientSocket: Bun.Socket
  ) {}

  static async create(): Promise<ApiTest> {
    await this.ensureWorker()

    this.logger.info("Connecting to host at %s:%d", config.tcp.host, config.tcp.port)
    const clientReactor = new BunSocketReactor()
    const clientSocket = await clientReactor.connect({
      hostname: config.tcp.host,
      port: config.tcp.port,
      socket: {}
    })
    this.logger.info("Connected to host")

    return new ApiTest(clientReactor, clientSocket)
  }

  send(command: CommandSpec): Exchange<Bun.Socket> {
    return this.clientReactor.send(this.clientSocket, command)
  }

  async reset(): Promise<void> {
    await Promise.race([
      this.send({ name: "reset", requestId: "reset" }).onReply(),
      sleep(50)
    ])
  }

  private static async ensureWorker(): Promise<Worker> {
    if (this.sharedWorker)
      return this.sharedWorker

    this.logger.info("Starting worker thread for host")
    const worker = new Worker(import.meta.dir + "/apitest.worker.ts")
    this.logger.info("Started host thread %d", worker.threadId)

    this.logger.info("Waiting for host to start")
    await sleep(100.0)

    this.sharedWorker = worker

    process.on("beforeExit", () => {
      if (this.sharedWorker) {
        this.logger.info("Shutting down worker thread %d", this.sharedWorker.threadId)
        this.sharedWorker.terminate()
        this.logger.info("Shutdown complete")
      }
    })

    return this.sharedWorker
  }
}
