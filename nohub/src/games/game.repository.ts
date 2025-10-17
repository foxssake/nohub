import { DataNotFoundError } from "@src/errors";
import { type Lookup, Repository } from "@src/repository";
import type { Game } from "./game";

export interface GameLookup extends Lookup<Game, string> {}

export class GameRepository
  extends Repository<Game, string>
  implements GameLookup
{
  constructor() {
    super((game) => game.id);
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Game#${id} not found!`);
  }
}
