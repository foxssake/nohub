import type { MetricsConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub, NohubReactor } from "@src/nohub";

export class MetricsModule implements Module {
  private readonly logger = rootLogger.child({ name: "mod:metrics" })

  constructor (
    private readonly config: MetricsConfig
  ) {}

  attachTo(app: Nohub) {
    if (!this.config.enabled) {
      this.logger.info("Metrics disabled, doing nothing.")
      return
    }
  }

  configure(reactor: NohubReactor) {
    if (!this.config.enabled)
      return

    this.logger.info("Starting metrics HTTP server on %s:%d", this.config.host, this.config.port)
    this.serve(this.config.host, this.config.port)
    this.logger.info("Started metrics HTTP server on %s:%d", this.config.host, this.config.port)
  }

  private serve(hostname: string, port: number) {
    Bun.serve({
      hostname,
      port,
      fetch(request) {
        const url = new URL(request.url);

        if (request.method != "GET" || url.pathname != "/metrics")
          return new Response(undefined, { status: 404 })

        return new Response(`${request.method} ${url.pathname}`)
      },
      
    }).unref();
  }
}
