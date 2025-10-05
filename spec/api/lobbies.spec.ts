import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { ApiTest } from "@spec/apitest";

const logger = ApiTest.logger;
let api: ApiTest;

describe("Lobbies API", () => {
  beforeAll(async () => {
    api = await ApiTest.create();
  });

  afterEach(async () => {
    await api.reset();
  });

  describe("create", () => {
    test("should create", async () => {
      const reply = await api
        .send({ name: "lobby/create", isRequest: true, requestId: "" })
        .onReply();

      expect(reply.isSuccessResponse).toBeTrue();
      expect(reply.text).toBeString();
    });

    test("should create with custom data", async () => {
      // TODO(trimsock): Serialize kv params
      const reply = await api
        .send({
          name: "lobby/create",
          isRequest: true,
          requestId: "",
          chunks: [
            { text: "name", isQuoted: false },
            { text: "=", isQuoted: false },
            { text: "Cool Lobby", isQuoted: true },
            { text: "player-count", isQuoted: false },
            { text: "=", isQuoted: false },
            { text: "0", isQuoted: true },
            { text: "player-capacity", isQuoted: false },
            { text: "=", isQuoted: false },
            { text: "16", isQuoted: true },
          ],
        })
        .onReply();

      expect(reply.isSuccessResponse).toBeTrue();
      expect(reply.text).toBeString();

      logger.info("Created lobby %s", reply.text);
    });
  });

  describe("get", () => {
    test("should return custom data", async () => {
      // Create lobby
      const lobbyId = await api.client.createLobby(new Map([
        ["name", "Cool Lobby"],
        ["player-count", "0"],
        ["player-capacity", "16"]
      ]))

      // Get lobby data
      const data = await Array.fromAsync(api.send({ name: "lobby/get", text: lobbyId, isRequest: true, requestId: "" }).chunks())
      const lines = data.map(it => it.text)

      expect(lines).toEqual([
        lobbyId,
        "name=Cool Lobby",
        "player-count=0",
        "player-capacity=16"
      ])
    })

    test("should return only requested fields", async () => {
      // Create lobby
      const lobbyId = await api.client.createLobby(new Map([
        ["name", "Cool Lobby"],
        ["player-count", "0"],
        ["player-capacity", "16"]
      ]))

      // Get lobby data
      const data = await Array.fromAsync(api.send({ name: "lobby/get", params: [lobbyId, "name"], isRequest: true, requestId: "" }).chunks())
      const lines = data.map(it => it.text)

      expect(lines).toEqual([
        lobbyId,
        "name=Cool Lobby"
      ])
    })

    test("should return no fields if none match", async () => {
      // Create lobby
      const lobbyId = await api.client.createLobby(new Map([
        ["name", "Cool Lobby"],
        ["player-count", "0"],
        ["player-capacity", "16"]
      ]))

      // Get lobby data
      const data = await Array.fromAsync(api.send({ name: "lobby/get", params: [lobbyId, "gamemode"], isRequest: true, requestId: "" }).chunks())
      const lines = data.map(it => it.text)

      expect(lines).toEqual([
        lobbyId
      ])
    })

    test("should throw on unknown lobby", async () => {
      expect(async () => {
        await api.send({ name: "lobby/get", text: "unknown", isRequest: true, requestId: "" }).onReply()
      }).toThrow()
    })

    test.todo("should include locked flag", () => {})
    test.todo("should include hidden flag", () => {})
  })
});
