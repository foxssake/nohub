import { BunSocketReactor } from "@foxssake/trimsock-bun";
import { rootLogger } from "@src/logger";
import { config } from "@src/config";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { sleep } from "bun";

const logger = rootLogger.child({ name: "apit" })

let host: Worker
let client: BunSocketReactor
let socket: Bun.Socket

describe("Lobbies API", () => {
  beforeAll(async () => {
    // Start server on thread
    host = new Worker(import.meta.dir + "/../index.ts")
    logger.info("Started host thread %d", host.threadId)

    logger.info("Waiting a bit for host to start")
    await sleep(250.)

    logger.info("Connecting to host at %s:%d", config.tcp.host, config.tcp.port)
    client = new BunSocketReactor()
    socket = await client.connect({
      hostname: config.tcp.host,
      port: config.tcp.port,
      socket: {}
    })
  })

  describe("create", () => {
    test("should create", async () => {
      const reply = await client.send(socket, { name: "lobby/create", isRequest: true, requestId: "" })
        .onReply()

      expect(reply.isSuccessResponse).toBeTrue()
      expect(reply.text).toBeString()

      logger.info("Created lobby %s", reply.text)
    })

    test("should create with custom data", async () => {
      // TODO(trimsock): Serialize kv params
      const reply = await client.send(socket, { name: "lobby/create", isRequest: true, requestId: "", chunks: [
        { text: "name", isQuoted: false }, { text: "=", isQuoted: false}, {text: "Cool Lobby", isQuoted: true},
        { text: "player-count", isQuoted: false }, { text: "=", isQuoted: false}, {text: "0", isQuoted: true},
        { text: "player-capacity", isQuoted: false }, { text: "=", isQuoted: false}, {text: "16", isQuoted: true},
      ]}).onReply()

      expect(reply.isSuccessResponse).toBeTrue()
      expect(reply.text).toBeString()

      logger.info("Created lobby %s", reply.text)
    })
  })

  afterAll(() => {
    logger.info("Terminating host thread %d", host.threadId)
    host.terminate()
  })
})

