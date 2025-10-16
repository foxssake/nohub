import { config } from "../config";
import { GameRepository } from "./game.repository";

export const gameRepository = new GameRepository();

export function importGames() {
  config.games.forEach((it) => {
    gameRepository.add(it);
  });
}
