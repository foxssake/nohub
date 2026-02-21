import type { Socket } from "bun";

export type SessionSocket = Socket<SessionData>;

export type SessionId = string;

export interface SessionData {
  id: SessionId;
  gameId?: string;
  address: string;

  socket?: SessionSocket;
}
