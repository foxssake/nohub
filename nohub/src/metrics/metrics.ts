import { Counter, Gauge, Histogram, Registry } from "prom-client";

export class Metrics {
  constructor(
    readonly commands = {
      count: new Counter({ name: "nohub_exchanges_total", help: "Total number of exchanges processed", labelNames: ["command"] }),
      failureCount: new Counter({ name: "nohub_exchanges_failed", help: "Number of failed exchanges", labelNames: ["command"] }),
      duration: new Histogram({ name: "nohub_exchange_duration_seconds", help: "Time it took to process exchanges", labelNames: ["command"] })
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
