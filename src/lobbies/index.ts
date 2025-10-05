import assert from "node:assert";
import type { Reactor } from "@foxssake/trimsock-js";
import type { SessionData } from "@src/sessions";
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
        const lobby = lobbyService.create(data, exchange.source.data.id);
        exchange.reply({ text: lobby.id });
      })
      .on("lobby/get", (cmd, exchange) => {
        assert(cmd.isRequest, "Command must be a request!");
        assert(cmd.text, "Missing lobby ID!");

        const id = cmd.params?.at(0) ?? cmd.text;
        const properties = cmd.params
          ? new Set(cmd.params.slice(1))
          : undefined;

        const lobby = lobbyRepository.find(id);
        assert(lobby, `Unknown lobby #${id}!`);

        const params = [
          id,
          lobby.isLocked ? "locked" : "",
          !lobby.isVisible ? "hidden" : "",
        ].filter((it) => !!it);

        exchange.stream({ params });
        for (const [key, value] of lobby.data.entries())
          if (properties?.has(key) !== false)
            // TODO(trimsock): Serialize kv-pairs
            exchange.stream({
              kvParams: [[key, value]],
              chunks: [
                { text: key, isQuoted: true },
                { text: "=", isQuoted: false },
                { text: value, isQuoted: true },
              ],
            });
        exchange.finishStream();
      });
  };
