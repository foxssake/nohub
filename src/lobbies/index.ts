import assert from "node:assert";
import type { Reactor } from "@foxssake/trimsock-js";
import { rootLogger } from "@src/logger";
import { type SessionData, sessionOf } from "@src/sessions";
import { LobbyRepository } from "./lobby.repository";
import { LobbyService } from "./lobby.service";

const lobbyRepository = new LobbyRepository();
export const lobbyService = new LobbyService(lobbyRepository);

export const withLobbyCommands =
  () => (reactor: Reactor<Bun.Socket<SessionData>>) => {
    reactor
      .on("lobby/create", (cmd, exchange) => {
        assert(cmd.isRequest, "Command must be a request!");

        const data: Map<string, string> = cmd.kvMap ?? new Map();
        const lobby = lobbyService.create(data, sessionOf(exchange).id);
        exchange.reply({ text: lobby.id });
      })
      .on("lobby/get", (cmd, exchange) => {
        // Validate request
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "Missing lobby ID!");

        // Lobby ID is either first param, or command data if no params
        const id = cmd.params?.at(0) ?? cmd.text;

        // Queried properties, or undefined
        const properties = cmd.params
          ? new Set(cmd.params.slice(1))
          : undefined;

        // Find lobby
        const lobby = lobbyRepository.require(id);

        // Serialize keywords for first message
        const params = [
          id,
          lobby.isLocked ? "locked" : "",
          !lobby.isVisible ? "hidden" : "",
        ].filter((it) => !!it);

        // Stream properties
        exchange.stream({ params });
        for (const [key, value] of lobby.data.entries())
          if (properties?.has(key) !== false)
            exchange.stream({
              kvParams: [[key, value]],
            });
        exchange.finishStream();
      })
      .on("lobby/set-data", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        rootLogger.info(cmd, "Set data request");

        const lobbyId = cmd.params?.at(0) ?? cmd.text;
        const data = cmd.kvMap ?? new Map();
        const lobby = lobbyRepository.require(lobbyId);

        lobbyService.setData(lobby, data, sessionOf(xchg).id);
        xchg.reply({ text: "ok" });
      })
      .on("lobby/lock", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobby = lobbyRepository.require(cmd.text);
        lobbyService.lock(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
      })
      .on("lobby/unlock", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobby = lobbyRepository.require(cmd.text);
        lobbyService.unlock(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
      })
      .on("lobby/hide", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobby = lobbyRepository.require(cmd.text);
        lobbyService.hide(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
      })
      .on("lobby/publish", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobby = lobbyRepository.require(cmd.text);
        lobbyService.publish(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
      });
  };

export function resetLobbies() {
  lobbyRepository.clear();
}
