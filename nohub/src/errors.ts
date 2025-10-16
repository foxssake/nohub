export class DataNotFoundError extends Error {
  name: string = "DataNotFoundError";
}

export class UnauthorizedError extends Error {
  name: string = "UnauthorizedError";
}

export class LockedError extends UnauthorizedError {
  name: string = "LockedError";
}

export class InvalidCommandError extends Error {
  name: string = "InvalidCommandError";
}
