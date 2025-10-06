import { UnauthorizedError } from "@src/errors";

export interface Lobby {
  id: string;
  owner: string;
  isVisible: boolean;
  isLocked: boolean;
  data: Map<string, string>;
}

// TODO: `class Lobby`, `interface LobbySpec`
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

export function isLobbyVisibleTo(lobby: Lobby, sessionId: string): boolean {
  if (lobby.isVisible)
    return true

  return lobby.owner === sessionId
}

export function lobbyToKvPairs(lobby: Lobby, properties?: string[]): [string, string][] {
  if (properties === undefined)
    return [...lobby.data.entries()]
  if (properties.length == 0)
    return []

  return [...lobby.data.entries()]
    .filter(([key]) => properties.includes(key))
}

export function lobbyKeywords(lobby: Lobby): string[] {
  const result = []
  if (lobby.isLocked) result.push("locked")
  if (!lobby.isVisible) result.push("hidden")

  return result
}
