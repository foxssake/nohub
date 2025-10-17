import type { Module } from "@src/module";
import type { Nohub } from "@src/nohub";
import { config } from "../config";
import { GameRepository } from "./game.repository";
import { rootLogger } from "@src/logger";

export class GameModule implements Module {
  readonly gameRepository = new GameRepository(); // TODO: Lookup
  private logger = rootLogger.child({ name: "mod:games" })

  attachTo(app: Nohub): void {
    this.importGames()
  }

  importGames() {
    this.logger.info("Adding %d games from config...", config.games.length)
    config.games.forEach(it => {
      this.gameRepository.add(it)
    })
    this.logger.info("Added %d games from config", config.games.length)
  }
}
