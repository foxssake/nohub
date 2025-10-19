import { Counter, exponentialBuckets, Gauge, Histogram, Registry } from "prom-client";

const durationBuckets = [0.001, 0.005, 0.010, 0.025, 0.050, 0.100, 0.250, 0.500, 1.000, 2.500, 5.000, 10.000];

export class Metrics {
  constructor(
    readonly commands = {
      count: new Counter({ name: "nohub_exchanges_total", help: "Total number of exchanges processed", labelNames: ["command"] }),
      failureCount: new Counter({ name: "nohub_exchanges_failed", help: "Number of failed exchanges", labelNames: ["command", "error"] }),
      duration: new Histogram({ name: "nohub_exchange_duration_seconds", help: "Time it took to process exchanges", labelNames: ["command"], buckets: durationBuckets})
    },

    readonly sessions = {
      count: new Gauge({ name: "nohub_sessions_total", help: "Total number of active sessions" })
    },

    readonly lobbies = {
      count: new Gauge({ name: "nohub_lobbies_total", help: "Total number of active lobbies", labelNames: ["locked", "visibility"] })
    }
  ) {}

  register(to: Registry) {
    [this.commands, this.sessions, this.lobbies]
      .flatMap(it => Object.values(it))
      .forEach(it => to.registerMetric(it))
  }
}

export type MetricsHolder = () => Metrics | undefined
export const emptyMetrics = () => undefined;
