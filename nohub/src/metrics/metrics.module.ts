import type { MetricsConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub, NohubReactor } from "@src/nohub";
import { collectDefaultMetrics, Registry } from "prom-client";
import { Metrics, type MetricsHolder } from "./metrics";

export class MetricsModule implements Module {
  private readonly logger = rootLogger.child({ name: "mod:metrics" });
  public readonly metricsRegistry: Registry = new Registry();
  public metrics?: Metrics;
  public metricsHolder: MetricsHolder = () => this.metrics;

  constructor(private readonly config: MetricsConfig) {}

  attachTo(_app: Nohub) {
    if (!this.config.enabled) {
      this.logger.info("Metrics disabled, doing nothing.");
      return;
    }

    collectDefaultMetrics({ register: this.metricsRegistry });
  }

  async configure(reactor: NohubReactor) {
    if (!this.config.enabled) return;

    this.logger.info(
      "Starting metrics HTTP server on %s:%d",
      this.config.host,
      this.config.port,
    );
    this.serve(this.config.host, this.config.port);
    this.logger.info(
      "Started metrics HTTP server on %s:%d",
      this.config.host,
      this.config.port,
    );

    this.metrics = new Metrics();
    this.metrics?.register(this.metricsRegistry);

    reactor.use(async (next, cmd) => {
      this.logger.debug({ command: cmd }, "Received command %s", cmd.name);

      const labels = { command: cmd.name };
      this.metrics?.commands.count.inc(labels);
      const timer = this.metrics?.commands.duration.startTimer(labels);
      try {
        await next();
      } catch (err) {
        this.metrics?.commands.failureCount.inc({
          ...labels,
          error: err instanceof Error ? err.name : "?",
        });
        throw err;
      } finally {
        timer?.call(undefined);
      }
    });
  }

  private serve(hostname: string, port: number) {
    const registry = this.metricsRegistry;

    Bun.serve({
      hostname,
      port,
      async fetch(request) {
        const url = new URL(request.url);

        if (request.method !== "GET" || url.pathname !== "/metrics")
          return new Response(undefined, { status: 404 });

        return new Response(await registry.metrics());
      },
    }).unref();
  }
}
