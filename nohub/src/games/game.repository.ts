import { Repository } from "@src/repository";
import type { Game } from "./game";
import { DataNotFoundError } from "@src/errors";

export class GameRepository extends Repository<Game, string> {
  constructor() {
    super((game) => game.id)
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Game#${id} not found!`);
  }
}
