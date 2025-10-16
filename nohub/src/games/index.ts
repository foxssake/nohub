import { GameRepository } from "./game.repository";
import { config } from "../config";

export const gameRepository = new GameRepository();

export function importGames() {
  config.games.forEach(it => gameRepository.add(it))
}
