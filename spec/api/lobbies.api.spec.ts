import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { ApiTest } from "@spec/apitest";
import { Lobbies } from "@spec/fixtures";

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
      const reply = await api
        .send({
          name: "lobby/create",
          isRequest: true,
          requestId: "",
          kvMap: Lobbies.coolLobby.data,
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
      const lobbyId = await api.client.createLobby(
        new Map([
          ["name", "Cool Lobby"],
          ["player-count", "0"],
          ["player-capacity", "16"],
        ]),
      );

      // Get lobby data
      const data = await Array.fromAsync(
        api
          .send({
            name: "lobby/get",
            text: lobbyId,
            isRequest: true,
            requestId: "",
          })
          .chunks(),
      );
      const lines = data.map((it) => it.text);

      expect(lines).toEqual([
        lobbyId,
        "name=Cool Lobby",
        "player-count=0",
        "player-capacity=16",
      ]);
    });

    test("should return only requested fields", async () => {
      // Create lobby
      const lobbyId = await api.client.createLobby(
        new Map([
          ["name", "Cool Lobby"],
          ["player-count", "0"],
          ["player-capacity", "16"],
        ]),
      );

      // Get lobby data
      const data = await Array.fromAsync(
        api
          .send({
            name: "lobby/get",
            params: [lobbyId, "name"],
            isRequest: true,
            requestId: "",
          })
          .chunks(),
      );
      const lines = data.map((it) => it.text);

      expect(lines).toEqual([lobbyId, "name=Cool Lobby"]);
    });

    test("should return no fields if none match", async () => {
      // Create lobby
      const lobbyId = await api.client.createLobby(
        new Map([
          ["name", "Cool Lobby"],
          ["player-count", "0"],
          ["player-capacity", "16"],
        ]),
      );

      // Get lobby data
      const data = await Array.fromAsync(
        api
          .send({
            name: "lobby/get",
            params: [lobbyId, "gamemode"],
            isRequest: true,
            requestId: "",
          })
          .chunks(),
      );
      const lines = data.map((it) => it.text);

      expect(lines).toEqual([lobbyId]);
    });

    test("should throw on unknown lobby", async () => {
      expect(async () => {
        await api
          .send({
            name: "lobby/get",
            text: "unknown",
            isRequest: true,
            requestId: "",
          })
          .onReply();
      }).toThrow();
    });

    test("should include locked flag", async () => {
      // Create and lock lobby
      const lobbyId = await api.client.createLobby()
      await api.client.lockLobby(lobbyId)

      // Query lobby
      const reply = await api.send({ name: "lobby/get", params: [lobbyId], isRequest: true, requestId: ""}).onStream()
      
      // Lobby should be locked
      expect(reply.params).toContain("locked")
    });

    test("should include hidden flag", async () => {
      // Create and lock lobby
      const lobbyId = await api.client.createLobby()
      await api.client.hideLobby(lobbyId)

      // Query lobby
      const reply = await api.send({ name: "lobby/get", text: lobbyId, isRequest: true, requestId: ""}).onStream()
      
      // Lobby should be hidden
      expect(reply.params).toContain("hidden")
    });
  });

  describe("list", () => {
    test.only("should list with properties", async() => {
      // Create some lobbies
      const lobbyIds = await Promise.all([
        api.client.createLobby(Lobbies.coolLobby.data),
        api.client.createLobby(Lobbies.davesLobby.data)
      ])

      // List lobbies and their names
      const chunks = await Array.fromAsync(api.send({ name: "lobby/list", isRequest: true, requestId: "", params: ["name"]}).chunks())
      const properties = chunks.map(it => it.kvParams)

      // Check names
      expect(properties).toEqual([
        [["name", "Cool Lobby"]],
        [["name", "Dave's Lobby"]]
      ])
    })
  })
});
