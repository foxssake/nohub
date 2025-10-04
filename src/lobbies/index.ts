import assert from "node:assert";
import type { Reactor } from "@foxssake/trimsock-js";
import type { SessionData } from "@src/sessions";
import { LobbyRepository } from "./lobby.repository";
import { LobbyService } from "./lobby.service";

const lobbyRepository = new LobbyRepository();
export const lobbyService = new LobbyService(lobbyRepository);

export const withLobbyCommands =
  () => (reactor: Reactor<Bun.Socket<SessionData>>) => {
    reactor.on("lobby/create", (cmd, exchange) => {
      assert(cmd.isRequest, "Command must be a request!");

      const data: Map<string, string> = cmd.kvMap ?? new Map();
      const lobby = lobbyService.create(data, exchange.source.data.id);
      exchange.reply({ text: lobby.id });
    });
  };
