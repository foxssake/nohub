import type { CommandSpec } from "@foxssake/trimsock-js";

export class DataNotFoundError extends Error {
  name: string = "DataNotFoundError";
}

export class UnauthorizedError extends Error {
  name: string = "UnauthorizedError";
}

export class LockedError extends UnauthorizedError {
  name: string = "LockedError";
}

export class LimitError extends UnauthorizedError {
  name: string = "LimitError";
}

export class InvalidCommandError extends Error {
  name: string = "InvalidCommandError";
}

export class UnknownCommandError extends InvalidCommandError {
  name: string = "UnknownCommandError"

  constructor(
    readonly command: CommandSpec,
    message?: string,
    options?: ErrorOptions
  ) {
    super(message ?? "Unknown command: " + command.name, options)
  }
}
