import type { Reactor } from "@foxssake/trimsock-js";
import { LobbyRepository } from "./lobby.repository";
import { LobbyService } from "./lobby.service";
import assert from 'node:assert'
import type { SessionData } from "@src/sessions";

const lobbyRepository = new LobbyRepository();
export const lobbyService = new LobbyService(lobbyRepository);

export const withLobbyCommands = () => 
  function(reactor: Reactor<Bun.Socket<SessionData>>) {
    reactor.on('lobby/create', (cmd, exchange) => {
      assert(cmd.isRequest, 'Command must be a request!')

      const data: Map<string, string> = new Map();
      (cmd.params ?? (cmd.data ? [cmd.data] : undefined))
        ?.map(p => parseKeyValueParam(p))
        ?.forEach(([key, value]) => data.set(key, value))

      const lobby = lobbyService.create(data, exchange.source.data.id)
      exchange.reply({ data: lobby.id })
    })
  }

function parseKeyValueParam(param: string): [string, string] {
  const spPos = param.indexOf("=")
  assert(spPos >= 0, "Malformed key-value parameter: " + param)

  return [param.slice(0, spPos), param.slice(spPos + 1)]
}
