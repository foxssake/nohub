import type { Exchange, Reactor } from "@foxssake/trimsock-js";
import { eventBus } from "@src/events/nohub.event.bus";
import { rootLogger } from "@src/logger";
import type { Socket } from "bun";
import { nanoid } from "nanoid";

const logger = rootLogger.child({ name: "sessions" });

function generateSessionId(): string {
  return nanoid(12);
}

export interface SessionData {
  id: string;
}

export function openSession(socket: Socket<SessionData>) {
  socket.data = {
    id: generateSessionId(),
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
    reactor.on("whereami", (_cmd, xchg) => {
      xchg.replyOrSend({
        name: "youarehere",
        params: [xchg.source.remoteAddress],
      });
    });
  };
