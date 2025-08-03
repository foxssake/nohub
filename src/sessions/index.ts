import { rootLogger } from "@src/logger"
import type { Socket } from "bun"
import { nanoid } from "nanoid"

const logger = rootLogger.child({ name: "sessions" })

function generateSessionId(): string {
  return nanoid(12)
}

export interface SessionData {
  id: string
}

export function openSession(socket: Socket<SessionData>) {
  socket.data = {
    id: generateSessionId()
  }

  logger.info("Created new session: %s", socket.data.id)
}

export function closeSession(socket: Socket<SessionData>) {
  logger.info("Closed session: %s", socket.data.id)
}

