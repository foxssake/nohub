import type { CommandSpec } from "@foxssake/trimsock-js";
import { LockedError, UnauthorizedError } from "@src/errors";
import type { SessionData, SessionId } from "@src/sessions/session";

export interface Lobby {
  id: string;
  owner: string;
  gameId?: string;
  address: string;
  isVisible: boolean;
  isLocked: boolean;
  data: Map<string, string>;
  participants: SessionId[];
}

export function requireLobbyModifiableIn(
  lobby: Lobby,
  session: SessionData,
  message?: string,
) {
  if (lobby.owner !== session.id)
    throw new UnauthorizedError(
      message ??
        `Lobby#${lobby.id} can't be modified in session#${session.id}!`,
    );
}

export function requireLobbyJoinable(lobby: Lobby, session: SessionData) {
  if (lobby.isLocked)
    throw new LockedError(`Can't join locked lobby#${lobby.id}!`);
  if (lobby.owner === session.id || lobby.participants.includes(session.id))
    throw new LockedError("Can't join your own lobby - you're already there!");
}

export function isLobbyVisibleTo(lobby: Lobby, session: SessionData): boolean {
  // Lobby is in a different game
  if (lobby.gameId !== session.gameId) return false;
  // Lobby is hidden, and session does not own it
  if (!lobby.isVisible && lobby.owner !== session.id) return false;

  return true;
}

export function lobbyToCommand(lobby: Lobby): Partial<CommandSpec> {
  const params = [lobby.id];
  if (lobby.isLocked) params.push("locked");
  if (!lobby.isVisible) params.push("hidden");

  return { params, kvParams: [...lobby.data.entries()] };
}

export function commandToLobby(command: CommandSpec): Lobby {
  return {
    id: command.params?.at(0) ?? command.text ?? "",
    isLocked: (command.params?.indexOf("locked", 1) ?? -1) >= 0,
    isVisible: (command.params?.indexOf("hidden", 1) ?? -1) < 0,
    data: command.kvMap ?? new Map(),
    gameId: "",
    address: "",
    owner: "",
    participants: [],
  };
}

export function lobbyMetricLabels(lobby: Lobby): Record<string, string> {
  return {
    locked: lobby.isLocked ? "locked" : "open",
    visibility: lobby.isVisible ? "visible" : "hidden",
  };
}
