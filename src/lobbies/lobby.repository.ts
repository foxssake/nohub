import { Repository } from "@src/repository";
import type { Lobby } from "./lobby";

export class LobbyRepository extends Repository<Lobby, string> {
  constructor() {
    super((lobby) => lobby.id);
  }
}
