import type { SessionModule } from "@src/sessions/session.module";
import { BroadcastService } from "./broadcast.service";
import type { Module } from "@src/module";
import type { NohubReactor } from "@src/nohub";

export class BroadcastModule implements Module {
  readonly broadcastService: BroadcastService;
  private reactor?: NohubReactor;

  constructor(sessionModule: SessionModule) {
    this.broadcastService = new BroadcastService(() => this.reactor!!, sessionModule.sessionRepository);
  }

  configure(reactor: NohubReactor) {
    this.reactor = reactor;
  }
}
