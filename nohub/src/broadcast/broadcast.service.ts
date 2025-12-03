import type { CommandSpec, Exchange } from "@foxssake/trimsock-js";
import { DataNotFoundError } from "@src/errors";
import type { Lobby } from "@src/lobbies/lobby";
import type { NohubReactor } from "@src/nohub";
import type {
  SessionData,
  SessionId,
  SessionSocket,
} from "@src/sessions/session";
import type { SessionRepository } from "@src/sessions/session.repository";

export class BroadcastService {
  constructor(
    private reactor: () => NohubReactor,
    private sessionRepository: SessionRepository,
  ) {}

  unicast(session: SessionData, command: CommandSpec): Exchange<SessionSocket> {
    if (!session.socket)
      throw new DataNotFoundError(`No connection to session#${session.id}!`); // TODO: Probably a more specific exception

    return this.reactor().send(session.socket, command);
  }

  broadcast(
    lobby: Lobby,
    command: CommandSpec,
  ): Map<SessionId, Exchange<SessionSocket>> {
    const result = new Map();

    for (const sessionId of lobby.participants) {
      const session = this.sessionRepository.find(sessionId);
      if (!session) continue; // Shouldn't happen, unless lobby participants are not cleared up on client disconnect

      result.set(sessionId, this.unicast(session, command));
    }

    return result;
  }
}
