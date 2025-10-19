import type { Metrics } from "@src/metrics/metrics";
import type { LobbyEventBus } from "./lobby.events";
import { lobbyMetricLabels } from "./lobby";

export class LobbyMetricsReporter {
  constructor(
    eventBus: LobbyEventBus,
    metrics: () => Metrics | undefined
  ) {
    eventBus.on("lobby-create", lobby => {
      metrics()?.lobbies.count.inc(lobbyMetricLabels(lobby))
    })

    eventBus.on('lobby-delete', lobby => {
      metrics()?.lobbies.count.dec(lobbyMetricLabels(lobby))
    })

    eventBus.on('lobby-change', (from, to) => {
      metrics()?.lobbies.count.dec(lobbyMetricLabels(from))
      metrics()?.lobbies.count.inc(lobbyMetricLabels(to))
    })
  }
}
