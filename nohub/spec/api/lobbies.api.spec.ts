import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { ApiTest } from "@spec/apitest";
import { Addresses, Games, Lobbies } from "@spec/fixtures";
import { gameRepository } from "@src/games";

let api: ApiTest;

describe("Lobbies API", () => {
  beforeAll(async () => {
    Games.insert()
    api = await ApiTest.create();
    await api.client().setGame(Games.forestBrawl.id);
  });

  afterEach(() => {
    api.reset();
  });

  describe("create", () => {
    test("should create", async () => {
      const reply = await api
        .client()
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
        .client()
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
          .client()
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
      const lobbyId = await api.client().createLobby(
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
          .client()
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
      const lobbyId = await api.client().createLobby(
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
          .client()
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
      const lobbyId = await api.client().createLobby(
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
          .client()
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
      Lobbies.insert();

      expect(async () => {
        await api
          .client()
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
      const lobbyId = await api.client().createLobby(Addresses.eric);
      await api.client().lockLobby(lobbyId);

      // Query lobby
      const reply = await api
        .client()
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
      const lobbyId = await api.client().createLobby(Addresses.eric);
      await api.client().hideLobby(lobbyId);

      // Query lobby
      const reply = await api
        .client()
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
        api.client().createLobby(Addresses.eric, Lobbies.coolLobby.data),
        api.client().createLobby(Addresses.dave, Lobbies.davesLobby.data),
      ]);

      // List lobbies and their names
      const chunks = await Array.fromAsync(
        api
          .client()
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
          .client()
          .send({
            name: "lobby/delete",
            isRequest: true,
            requestId: "",
          })
          .onReply();
      }).toThrow();
    });
    test("should throw on unknown lobby ID", () => {
      expect(async () => await api.client().deleteLobby("unknown")).toThrow();
    });
  });

  describe("join", () => {
    test("should join", async () => {
      Lobbies.insert();

      const reply = await api
        .client()
        .send({
          name: "lobby/join",
          isRequest: true,
          requestId: "",
          params: [Lobbies.davesLobby.id],
        })
        .onReply();

      expect(reply.isSuccessResponse).toBeTrue();
      expect(reply.text).toEqual(Lobbies.davesLobby.address);
    });

    test("should throw on missing lobby ID", async () => {
      expect(async () =>
        api
          .client()
          .send({
            name: "lobby/join",
            isRequest: true,
            requestId: "",
          })
          .onReply(),
      ).toThrow();
    });

    test("should throw on unknown lobby ID", async () => {
      Lobbies.insert();

      expect(async () =>
        api
          .client()
          .send({
            name: "lobby/join",
            isRequest: true,
            requestId: "",
            params: ["unknown"],
          })
          .onReply(),
      ).toThrow();
    });

    test("should throw on lobby in different game", async () => {
      Lobbies.insert();

      // Join as client in Campfire
      await api.setupClient("luna");
      await api.client("luna").setGame(Games.campfire.id);

      // Try to join a Forest Brawl lobby
      expect(
        async () =>
          await api
            .client("luna")
            .send({
              name: "lobby/join",
              isRequest: true,
              requestId: "",
              params: [Lobbies.davesLobby.id],
            })
            .onReply(),
      ).toThrow();
    });
  });

  describe("events", () => {
    test("should delete sessions on owner disconnect", async () => {
      // Start a new session
      await api.setupClient("test");
      await api.client("test").setGame(Games.forestBrawl.id);

      // Create some lobbies
      await api.client("test").createLobby(Addresses.dave);
      await api.client("test").createLobby(Addresses.eric);

      // Both lobbies should exist now
      expect(await api.client().listLobbies()).toBeArrayOfSize(2);

      // Disconnect client
      api.disconnectClient("test");

      // Neither lobby should exist now
      expect(await api.client().listLobbies()).toBeEmpty();
    });
  });
});
