import assert from "node:assert";
import type { Reactor } from "@foxssake/trimsock-js";
import { rootLogger } from "@src/logger";
import { type SessionData, sessionOf } from "@src/sessions";
import { lobbyKeywords, lobbyToKvPairs } from "./lobby";
import { LobbyRepository } from "./lobby.repository";
import { LobbyService } from "./lobby.service";

const lobbyRepository = new LobbyRepository();
export const lobbyService = new LobbyService(lobbyRepository);

const logger = rootLogger.child({ name: "Lobbies" });

export const withLobbyCommands =
  () => (reactor: Reactor<Bun.Socket<SessionData>>) => {
    reactor
      .on("lobby/create", (cmd, exchange) => {
        assert(cmd.isRequest, "Command must be a request!");
        logger.info("Creating lobby");

        const address = cmd.kvMap ? cmd.requireParam(0) : cmd.text;
        const data: Map<string, string> = cmd.kvMap ?? new Map();
        assert(address, "Missing lobby address!");

        const lobby = lobbyService.create(
          address,
          data,
          sessionOf(exchange).id,
        );
        exchange.reply({ text: lobby.id });

        logger.info("Created lobby#%s", lobby.id);
      })
      .on("lobby/get", (cmd, exchange) => {
        // Validate request
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "Missing lobby ID!");

        // Lobby ID is either first param, or command data if no params
        const id = cmd.params?.at(0) ?? cmd.text;
        // Queried properties, or undefined
        const properties = cmd.params?.slice(1);

        logger.info("Retrieving lobby #%s", id);

        // Find lobby
        const lobby = lobbyRepository.require(id);

        // Stream first chunk with ID and keywords
        exchange.stream({ params: [id, ...lobbyKeywords(lobby)] });

        // Stream properties
        for (const entry of lobbyToKvPairs(lobby, properties))
          exchange.stream({ kvParams: [entry] });
        exchange.finishStream();

        logger.info("Finished retrieving lobby #%s", id);
      })
      .on("lobby/list", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        logger.info("Listing lobbies");

        // Set of params, or singleton set of text, or empty set if no text
        const properties = cmd.params ?? (cmd.text ? [cmd.text] : undefined);

        // List lobbies
        for (const lobby of lobbyService.listLobbiesFor(sessionOf(xchg).id))
          xchg.stream({
            params: [lobby.id, ...lobbyKeywords(lobby)],
            kvParams: lobbyToKvPairs(lobby, properties),
          });
        xchg.finishStream();

        logger.info("Finished listing lobbies");
      })
      .on("lobby/join", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");

        const lobbyId = cmd.requireText();
        const sessionId = sessionOf(xchg).id;
        logger.info("Session#%s is joining lobby#%s", sessionId, lobbyId);

        const lobby = lobbyRepository.require(lobbyId);
        const address = lobbyService.join(lobby, sessionId);

        xchg.reply({ params: [address] });
        logger.info("Session#%s joined lobby#%s", sessionId, lobbyId);
      })
      .on("lobby/set-data", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobbyId = cmd.params?.at(0) ?? cmd.text;
        const data = cmd.kvMap ?? new Map();
        logger.info(cmd, "Setting data for lobby#%s", lobbyId);

        const lobby = lobbyRepository.require(lobbyId);

        lobbyService.setData(lobby, data, sessionOf(xchg).id);
        xchg.reply({ text: "ok" });

        logger.info("Updated data for lobby#%s", lobbyId);
      })
      .on("lobby/lock", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobbyId = cmd.text;
        logger.info("Locking lobby#%s", lobbyId);

        const lobby = lobbyRepository.require(lobbyId);
        lobbyService.lock(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
        logger.info("Locked lobby#%s", lobbyId);
      })
      .on("lobby/unlock", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobbyId = cmd.text;
        logger.info("Unlocking lobby#%s", lobbyId);

        const lobby = lobbyRepository.require(lobbyId);
        lobbyService.unlock(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
        logger.info("Unlocked lobby#%s", lobbyId);
      })
      .on("lobby/hide", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobbyId = cmd.text;
        logger.info("Hiding lobby#%s", lobbyId);

        const lobby = lobbyRepository.require(lobbyId);
        lobbyService.hide(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
        logger.info("Hidden lobby#%s", lobbyId);
      })
      .on("lobby/publish", (cmd, xchg) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "No lobby ID specified!");

        const lobbyId = cmd.text;
        logger.info("Publishing lobby#%s", lobbyId);

        const lobby = lobbyRepository.require(lobbyId);
        lobbyService.publish(lobby, sessionOf(xchg).id);

        xchg.reply({ text: "ok" });
        logger.info("Published lobby#%s", lobbyId);
      });
  };

export function resetLobbies() {
  lobbyRepository.clear();
}
