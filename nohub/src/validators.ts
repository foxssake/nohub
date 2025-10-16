import type { CommandSpec } from "@foxssake/trimsock-js";
import { InvalidCommandError } from "./errors";

export function requireRequest(
  command: CommandSpec,
  message: string = "Command must be a request!",
) {
  if (!command.isRequest) throw new InvalidCommandError(message);
}

export function requireSingleParam(
  command: CommandSpec,
  message: string = "Command must have at least one parameter!",
): string {
  const param = command.params?.at(0) ?? command.text;
  if (!param) throw new InvalidCommandError(message);

  return param;
}
