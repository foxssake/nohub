import type { Lobby } from "@src/lobbies/lobby";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import { LobbyService } from "@src/lobbies/lobby.service";
import { beforeEach, describe, expect, test } from "bun:test";

let lobbyRepository: LobbyRepository
let lobbyService: LobbyService

const sessionId = "94kwM3zUaNCn"
const otherSessionId = "Nd49VE4RWJh0"
const pamSession = "DCLyAVxClvO_"

const someLobby: Lobby = {
  id: "WzXOsEhM",
  owner: sessionId,
  isVisible: true,
  isLocked: false,
  data: new Map([
    ["name", "Dave's Lobby"],
    ["player-count", "8"],
    ["player-capacity", "12"]
  ])
}

const coolLobby: Lobby = {
  id: "5fl8Rbc7",
  owner: otherSessionId,
  isVisible: false,
  isLocked: true,
  data: new Map([
    ["name", "Cool Lobby"],
    ["player-count", "9"],
    ["player-capacity", "16"]
  ])
}

describe("LobbyService", () => {
  beforeEach(() => {
    lobbyRepository = new LobbyRepository()
    lobbyService = new LobbyService(lobbyRepository)

    lobbyRepository.add(someLobby)
    lobbyRepository.add(coolLobby)
  })

  describe("create", () => {
    test("should create lobby with defaults", () => {
      const lobbyData = new Map([["name", "Cool Lobby"], ["player-count", "0"], ["player-capacity", "16"]])
      const expected: Lobby = {
        id: "",
        owner: sessionId,
        isVisible: true,
        isLocked: false,
        data: lobbyData
      }

      const lobby = lobbyService.create(lobbyData, sessionId)

      expected.id = lobby.id // Ignore for comparison
      expect(lobby).toEqual(expected) // Lobby data matches
      expect(lobbyRepository.find(expected.id)).toEqual(expected) // Lobby was saved in repo
    })
  })

  describe("setData", () => {
    test("should replace lobby data", () => {
      const newData = coolLobby.data

      // Update data
      const lobby = lobbyService.setData(someLobby, newData, sessionId)

      expect(lobby.data).toEqual(newData)
      expect(lobbyRepository.require(lobby.id).data).toEqual(newData)
    })

    test("should throw if unauthorized", () => {
      // Try to update
      expect(() => lobbyService.setData(coolLobby, new Map(), sessionId))
    })
  })

  describe("lock", () => {
    test("should lock lobby", () => {
      const lobby = lobbyService.lock(someLobby, sessionId)

      expect(lobby.isLocked).toBeTrue()
      expect(lobbyRepository.require(lobby.id).isLocked).toBeTrue()
    })

    test("should throw if unauthorized", () => {
      expect(() => lobbyService.lock(someLobby, otherSessionId)).toThrow()
    })
  })

  describe("unlock", () => {
    test("should unlock lobby", () => {
      const lobby = lobbyService.unlock(coolLobby, otherSessionId)

      expect(lobby.isLocked).toBeFalse()
      expect(lobbyRepository.require(lobby.id).isLocked).toBeFalse()
    })

    test("should throw if unauthorized", () => {
      expect(() => lobbyService.unlock(someLobby, otherSessionId)).toThrow()
    })
  })

  describe("hide", () => {
    test("should hide lobby", () => {
      const lobby = lobbyService.hide(someLobby, sessionId)

      expect(lobby.isVisible).toBeFalse()
      expect(lobbyRepository.require(lobby.id).isVisible).toBeFalse()
    })

    test("should throw if unauthorized", () => {
      expect(() => lobbyService.hide(someLobby, otherSessionId)).toThrow()
    })
  })

  describe("publish", () => {
    test("should publish lobby", () => {
      const lobby = lobbyService.publish(coolLobby, otherSessionId)

      expect(lobby.isVisible).toBeTrue()
      expect(lobbyRepository.require(lobby.id).isVisible).toBeTrue()
    })

    test("should throw if unauthorized", () => {
      expect(() => lobbyService.publish(someLobby, otherSessionId)).toThrow()
    })
  })
})
