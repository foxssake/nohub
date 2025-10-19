import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub } from "@src/nohub";
import type { GamesConfig } from "../config";
import { type GameLookup, GameRepository } from "./game.repository";

export class GameModule implements Module {
  readonly gameRepository = new GameRepository();
  readonly gameLookup: GameLookup = this.gameRepository;

  private logger = rootLogger.child({ name: "mod:games" });

  constructor(private config: GamesConfig) {}

  attachTo(_app: Nohub): void {
    this.importGames();
  }

  importGames() {
    this.logger.info("Adding %d games from config...", this.config.length);
    this.config.forEach((it) => {
      this.logger.info({ game: it }, "Adding game #%s", it.id);
      this.gameRepository.add(it);
    });
    this.logger.info("Added %d games from config", this.config.length);
  }
}
