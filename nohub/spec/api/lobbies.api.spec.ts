import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { ApiTest } from "@spec/apitest";
import { Addresses, Lobbies } from "@spec/fixtures";

let api: ApiTest;

describe("Lobbies API", () => {
  beforeAll(async () => {
    api = await ApiTest.create();
  });

  afterEach(() => {
    api.reset();
  });

  describe("create", () => {
    test("should create", async () => {
      const reply = await api
        .send({
          name: "lobby/create",
          params: [Addresses.eric],
          isRequest: true,
          requestId: "",
        })
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
          params: [Addresses.dave],
          kvMap: Lobbies.coolLobby.data,
        })
        .onReply();

      expect(reply.isSuccessResponse).toBeTrue();
      expect(reply.text).toBeString();
    });

    test("should throw on missing address", async () => {
      expect(async () =>
        api
          .send({
            name: "lobby/create",
            isRequest: true,
            requestId: "",
          })
          .onReply(),
      ).toThrow();
    });
  });

  describe("get", () => {
    test("should return custom data", async () => {
      // Create lobby
      const lobbyId = await api.client.createLobby(
        Addresses.dave,
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
        Addresses.dave,
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
        Addresses.dave,
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
      Lobbies.insert()

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
      const lobbyId = await api.client.createLobby(Addresses.eric);
      await api.client.lockLobby(lobbyId);

      // Query lobby
      const reply = await api
        .send({
          name: "lobby/get",
          params: [lobbyId],
          isRequest: true,
          requestId: "",
        })
        .onStream();

      // Lobby should be locked
      expect(reply.params).toContain("locked");
    });

    test("should include hidden flag", async () => {
      // Create and lock lobby
      const lobbyId = await api.client.createLobby(Addresses.eric);
      await api.client.hideLobby(lobbyId);

      // Query lobby
      const reply = await api
        .send({
          name: "lobby/get",
          text: lobbyId,
          isRequest: true,
          requestId: "",
        })
        .onStream();

      // Lobby should be hidden
      expect(reply.params).toContain("hidden");
    });
  });

  describe("list", () => {
    test("should list with properties", async () => {
      // Create some lobbies
      await Promise.all([
        api.client.createLobby(Addresses.eric, Lobbies.coolLobby.data),
        api.client.createLobby(Addresses.dave, Lobbies.davesLobby.data),
      ]);

      // List lobbies and their names
      const chunks = await Array.fromAsync(
        api
          .send({
            name: "lobby/list",
            isRequest: true,
            requestId: "",
            params: ["name"],
          })
          .chunks(),
      );
      const properties = chunks.map((it) => it.kvParams);

      // Check names
      expect(properties).toEqual([
        [["name", "Cool Lobby"]],
        [["name", "Dave's Lobby"]],
      ]);
    });
  });

  describe("delete", () => {
    test("should throw on missing lobby ID", () => {
      expect(async () => {
        await api
          .send({
            name: "lobby/delete",
            isRequest: true,
            requestId: "",
          })
          .onReply();
      }).toThrow();
    });
    test("should throw on unknown lobby ID", () => {
      expect(async () => await api.client.deleteLobby("unknown")).toThrow();
    });
  });

  describe("join", () => {
    test.todo("should join", () => {
      // TODO: Insert fixtures in testing
      // TODO: Support multiple sessions per test
      // Join a pre-defined lobby, expect OK response
    });

    test("should throw on missing lobby ID", async () => {
      expect(async () =>
        api
          .send({
            name: "lobby/join",
            isRequest: true,
            requestId: "",
          })
          .onReply(),
      ).toThrow();
    });

    test("should throw on unknown lobby ID", async () => {
      expect(async () =>
        api
          .send({
            name: "lobby/join",
            isRequest: true,
            requestId: "",
            params: ["uknown"],
          })
          .onReply(),
      ).toThrow();
    });
  });

  describe("events", () => {
    test.todo("should delete sessions on owner disconnect", async () => {
      // TODO: Insert fixtures in testing
      // TODO: Support multiple sessions per test
    });
  });
});
