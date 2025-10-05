import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { ApiTest } from "./apitest";

const logger = ApiTest.logger
let api: ApiTest

describe("Lobbies API", () => {
  beforeAll(async () => {
    api = await ApiTest.create()
  })

  afterEach(async () => {
    await api.reset()
  })

  describe("create", () => {
    test("should create", async () => {
      const reply = await api.send({ name: "lobby/create", isRequest: true, requestId: "" })
        .onReply()

      expect(reply.isSuccessResponse).toBeTrue()
      expect(reply.text).toBeString()

      logger.info("Created lobby %s", reply.text)
    })

    test("should create with custom data", async () => {
      // TODO(trimsock): Serialize kv params
      const reply = await api.send({ name: "lobby/create", isRequest: true, requestId: "", chunks: [
        { text: "name", isQuoted: false }, { text: "=", isQuoted: false}, {text: "Cool Lobby", isQuoted: true},
        { text: "player-count", isQuoted: false }, { text: "=", isQuoted: false}, {text: "0", isQuoted: true},
        { text: "player-capacity", isQuoted: false }, { text: "=", isQuoted: false}, {text: "16", isQuoted: true},
      ]}).onReply()

      expect(reply.isSuccessResponse).toBeTrue()
      expect(reply.text).toBeString()

      logger.info("Created lobby %s", reply.text)
    })
  })
})

