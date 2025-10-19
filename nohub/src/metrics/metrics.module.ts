import type { MetricsConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub, NohubReactor } from "@src/nohub";
import { collectDefaultMetrics, Registry } from "prom-client";

export class MetricsModule implements Module {
  private readonly logger = rootLogger.child({ name: "mod:metrics" })
  public readonly metricsRegistry: Registry = new Registry();

  constructor (
    private readonly config: MetricsConfig
  ) {
  }

  attachTo(app: Nohub) {
    if (!this.config.enabled) {
      this.logger.info("Metrics disabled, doing nothing.")
      return
    }

    collectDefaultMetrics({ register: this.metricsRegistry });
  }

  configure(reactor: NohubReactor) {
    if (!this.config.enabled)
      return

    this.logger.info("Starting metrics HTTP server on %s:%d", this.config.host, this.config.port)
    this.serve(this.config.host, this.config.port)
    this.logger.info("Started metrics HTTP server on %s:%d", this.config.host, this.config.port)
  }

  private serve(hostname: string, port: number) {
    const registry = this.metricsRegistry

    Bun.serve({
      hostname,
      port,
      async fetch(request) {
        const url = new URL(request.url);

        if (request.method != "GET" || url.pathname != "/metrics")
          return new Response(undefined, { status: 404 })

        return new Response(await registry.metrics())
      },
      
    }).unref();
  }
}
