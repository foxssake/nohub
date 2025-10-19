import { readConfig } from "@src/config";
import { Nohub } from "@src/nohub";

new Nohub(readConfig(Bun.env)).run();
