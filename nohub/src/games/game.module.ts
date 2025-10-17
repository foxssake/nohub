import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub } from "@src/nohub";
import { config, type GamesConfig } from "../config";
import { GameRepository } from "./game.repository";

export class GameModule implements Module {
  readonly gameRepository = new GameRepository(); // TODO: Lookup
  private logger = rootLogger.child({ name: "mod:games" });

  constructor(
    private config: GamesConfig
  ) {}

  attachTo(_app: Nohub): void {
    this.importGames();
  }

  importGames() {
    this.logger.info("Adding %d games from config...", config.games.length);
    this.config.forEach((it) => {
      this.logger.info({ game: it }, "Adding game #%s", it.id);
      this.gameRepository.add(it);
    });
    this.logger.info("Added %d games from config", config.games.length);
  }
}
