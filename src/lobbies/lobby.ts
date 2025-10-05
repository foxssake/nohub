import { UnauthorizedError } from "@src/errors";

export interface Lobby {
  id: string;
  owner: string;
  isVisible: boolean;
  isLocked: boolean;
  data: Map<string, string>;
}

// TODO: `class Lobby`, `interface LobbySpec`
export function requireLobbyModifiableIn(lobby: Lobby, sessionId: string, message?: string) {
  if (lobby.owner !== sessionId)
    throw new UnauthorizedError(message ?? `Lobby#${lobby.id} can't be modified in session#${sessionId}!`)
}
