import type { Exchange, Reactor } from "@foxssake/trimsock-js";
import { config } from "@src/config";
import { LockedError } from "@src/errors";
import { eventBus } from "@src/events/nohub.event.bus";
import { gameRepository } from "@src/games";
import type { Game } from "@src/games/game";
import { lobbyRepository } from "@src/lobbies";
import { rootLogger } from "@src/logger";
import { requireRequest, requireSingleParam } from "@src/validators";
import type { Socket } from "bun";
import { nanoid } from "nanoid";

const logger = rootLogger.child({ name: "sessions" });

function generateSessionId(): string {
  return nanoid(12);
}

export interface SessionData {
  id: string;
  game?: Game;
}

export function openSession(socket: Socket<SessionData>) {
  socket.data = {
    id: generateSessionId(),
    game:
      config.lobbies.defaultGameId !== undefined
        ? gameRepository.require(config.lobbies.defaultGameId)
        : undefined,
  };

  logger.info("Created new session: %s", socket.data.id);
}

export function closeSession(socket: Socket<SessionData>) {
  const sessionId = socket.data.id;
  logger.info("Closed session: %s", sessionId);
  eventBus.emit("session-close", sessionId);
}

export function sessionOf(
  exchange: Exchange<Socket<SessionData>>,
): SessionData {
  return exchange.source.data;
}

export const withSessionCommands =
  () => (reactor: Reactor<Bun.Socket<SessionData>>) => {
    reactor
      .on("session/set-game", (cmd, xchg) => {
        requireRequest(cmd);
        const gameId = requireSingleParam(cmd, "Missing Game ID!");
        const session = sessionOf(xchg);

        logger.info("Switching game for session #%s", session.id);
        const game = gameRepository.require(gameId);

        if (session.game !== undefined)
          throw new LockedError("Session already has a game set!");

        if (lobbyRepository.existsBySession(session.id))
          throw new LockedError("Session already has active lobbies!");

        session.game = game;
        xchg.reply({ text: "ok" });
        logger.info({ game, sessionId: session.id }, "Game set for session!");
      })
      .on("whereami", (_cmd, xchg) => {
        xchg.replyOrSend({
          name: "youarehere",
          params: [xchg.source.remoteAddress],
        });
      });
  };
