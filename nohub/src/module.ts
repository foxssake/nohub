import type { Socket } from "bun";
import { Nohub, type NohubReactor } from "./nohub";
import type { SessionData } from "./sessions/session";

export interface Module {
  attachTo(app: Nohub): void;
  configure?: (reactor: NohubReactor) => void;

  openSocket?: (socket: Socket<SessionData>) => void;
  closeSocket?: (socket: Socket<SessionData>) => void;
}
