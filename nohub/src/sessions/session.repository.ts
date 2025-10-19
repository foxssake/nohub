import { DataNotFoundError } from "@src/errors";
import { Repository } from "@src/repository";
import type { SessionData } from "./session";

export class SessionRepository extends Repository<SessionData, string> {
  constructor() {
    super((session) => session.id);
  }

  countByAddress(address: string): number {
    let count = 0;
    for (const session of this.list()) if (session.address === address) ++count;
    return count;
  }

  protected notFoundError(id: string): Error {
    return new DataNotFoundError(`Session#${id} not found!`);
  }
}
