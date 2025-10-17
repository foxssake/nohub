import { LockedError, UnauthorizedError } from "@src/errors";
import type { SessionData } from "@src/sessions/session";

export interface Lobby {
  id: string;
  owner: string;
  gameId?: string;
  address: string;
  isVisible: boolean;
  isLocked: boolean;
  data: Map<string, string>;
}

export function requireLobbyModifiableIn(
  lobby: Lobby,
  sessionId: string,
  message?: string,
) {
  if (lobby.owner !== sessionId)
    throw new UnauthorizedError(
      message ?? `Lobby#${lobby.id} can't be modified in session#${sessionId}!`,
    );
}

export function requireLobbyJoinable(lobby: Lobby, sessionId: string) {
  if (lobby.isLocked)
    throw new LockedError(`Can't join locked lobby#${lobby.id}!`);
  if (lobby.owner === sessionId)
    throw new LockedError("Can't join your own lobby - you're already there!");
}

export function isLobbyVisibleTo(lobby: Lobby, session: SessionData): boolean {
  // Lobby is in a different game
  if (lobby.gameId !== session.gameId) return false;
  // Lobby is hidden, and session does not own it
  if (!lobby.isVisible && lobby.owner !== session.id) return false;

  return true;
}

export function lobbyToKvPairs(
  lobby: Lobby,
  properties?: string[],
): [string, string][] {
  if (properties === undefined) return [...lobby.data.entries()];
  if (properties.length === 0) return [];

  return [...lobby.data.entries()].filter(([key]) => properties.includes(key));
}

export function lobbyKeywords(lobby: Lobby): string[] {
  const result = [];
  if (lobby.isLocked) result.push("locked");
  if (!lobby.isVisible) result.push("hidden");

  return result;
}
