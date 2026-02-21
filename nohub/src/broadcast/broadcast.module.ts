import type { Module } from "@src/module";
import type { NohubReactor } from "@src/nohub";
import type { SessionModule } from "@src/sessions/session.module";
import { BroadcastService } from "./broadcast.service";

export class BroadcastModule implements Module {
  readonly broadcastService: BroadcastService;
  private reactor?: NohubReactor;

  constructor(sessionModule: SessionModule) {
    this.broadcastService = new BroadcastService(
      () => this.provideReactor(),
      sessionModule.sessionRepository,
    );
  }

  configure(reactor: NohubReactor) {
    this.reactor = reactor;
  }

  private provideReactor(): NohubReactor {
    if (!this.reactor) throw new Error("Missing Reactor instance!");
    return this.reactor;
  }
}
