import type { MetricsConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub, NohubReactor } from "@src/nohub";
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";
import { Metrics, type MetricsHolder } from "./metrics";

export class MetricsModule implements Module {
  private readonly logger = rootLogger.child({ name: "mod:metrics" })
  public readonly metricsRegistry: Registry = new Registry();
  public metrics?: Metrics
  public metricsHolder: MetricsHolder = () => this.metrics

  constructor (
    private readonly config: MetricsConfig
  ) {
  }

  attachTo(app: Nohub) {
    if (!this.config.enabled) {
      this.logger.info("Metrics disabled, doing nothing.")
      return
    }

    this.metrics = new Metrics() // TODO: Command labels
    collectDefaultMetrics({ register: this.metricsRegistry });
    this.metrics?.register(this.metricsRegistry);
  }

  configure(reactor: NohubReactor) {
    if (!this.config.enabled)
      return

    this.logger.info("Starting metrics HTTP server on %s:%d", this.config.host, this.config.port)
    this.serve(this.config.host, this.config.port)
    this.logger.info("Started metrics HTTP server on %s:%d", this.config.host, this.config.port)

    reactor.use(async (next, cmd) => {
      this.metrics?.commands.count.inc();
      const timer = this.metrics?.commands.duration.startTimer();
      try {
      await next();
      } catch (err) {
        this.metrics?.commands.failureCount.inc()
        throw err;
      } finally {
        timer?.call(undefined)
      }
    })
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
