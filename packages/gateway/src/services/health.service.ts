import WebSocket from "ws";
import type { HealthOptions } from "../options/index.js";
import { ConnectionState, type HealthStatus } from "../types/index.js";

export class HealthService {
  readonly #options: HealthOptions;

  constructor(options: HealthOptions) {
    this.#options = options;
  }

  checkHealth(
    ws: WebSocket | null,
    missedHeartbeats: number,
    latency: number,
  ): HealthStatus {
    const issues: string[] = [];
    let state = ConnectionState.Optimal;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      issues.push("WebSocket connection is not open");
      state = ConnectionState.Disconnected;
    }

    if (missedHeartbeats > 0) {
      issues.push(`Missed ${missedHeartbeats} heartbeat(s)`);
      if (missedHeartbeats >= this.#options.zombieConnectionThreshold) {
        state = ConnectionState.Unhealthy;
      } else {
        state = ConnectionState.Degraded;
      }
    }

    if (latency > this.#options.maxLatency) {
      issues.push(`Latency (${latency}ms) exceeds maximum threshold`);
      state = ConnectionState.Unhealthy;
    } else if (latency > this.#options.degradedLatencyThreshold) {
      issues.push(`High latency: ${latency}ms`);
      state = ConnectionState.Degraded;
    } else if (latency > this.#options.optimalLatencyThreshold) {
      issues.push(`Elevated latency: ${latency}ms`);
      state =
        state === ConnectionState.Optimal ? ConnectionState.Optimal : state;
    }

    return {
      isHealthy: this.isHealthy(ws, missedHeartbeats, latency),
      state,
      details: {
        connectionState: ws?.readyState ?? WebSocket.CLOSED,
        missedHeartbeats,
        latency,
      },
      issues,
    };
  }

  isHealthy(
    ws: WebSocket | null,
    missedHeartbeats: number,
    latency: number,
  ): boolean {
    return Boolean(
      ws?.readyState === WebSocket.OPEN &&
        missedHeartbeats < this.#options.zombieConnectionThreshold &&
        latency < this.#options.maxLatency,
    );
  }

  getHealthDescription(status: HealthStatus): string {
    const stateLabels = {
      [ConnectionState.Optimal]: {
        emoji: "✅",
        label: "Optimal",
        description: "Normal operation",
      },
      [ConnectionState.Degraded]: {
        emoji: "!",
        label: "Degraded",
        description: "Reduced performance",
      },
      [ConnectionState.Unhealthy]: {
        emoji: "❌",
        label: "Unhealthy",
        description: "Critical issues detected",
      },
      [ConnectionState.Disconnected]: {
        emoji: "🔌",
        label: "Disconnected",
        description: "Connection lost",
      },
    };

    const wsStateMap = {
      [WebSocket.CONNECTING]: "CONNECTING",
      [WebSocket.OPEN]: "CONNECTED",
      [WebSocket.CLOSING]: "CLOSING",
      [WebSocket.CLOSED]: "CLOSED",
    };

    const sections = [
      `${stateLabels[status.state].emoji} [${stateLabels[status.state].label}] - ${stateLabels[status.state].description}`,

      "\n=== CONNECTION STATUS ===",
      `• WebSocket State: ${wsStateMap[status.details.connectionState]}`,
      `• Latency: ${status.details.latency}ms`,
      `• Missed Heartbeats: ${status.details.missedHeartbeats}/${this.#options.zombieConnectionThreshold}`,

      ...(status.issues.length > 0
        ? [
            "\n=== DETECTED ISSUES ===",
            ...status.issues.map((issue) => `▸ ${issue}`),
          ]
        : ["\n=== NO ISSUES DETECTED ==="]),
    ];

    return sections.join("\n");
  }

  shouldTakeAction(status: HealthStatus): boolean {
    return (
      status.state === ConnectionState.Unhealthy ||
      status.state === ConnectionState.Disconnected ||
      status.details.missedHeartbeats >= this.#options.zombieConnectionThreshold
    );
  }
}
