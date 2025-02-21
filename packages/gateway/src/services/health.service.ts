import WebSocket from "ws";
import type { HealthOptions } from "../options/index.js";

export interface HealthDetails {
  connectionState: 0 | 1 | 2 | 3;
  missedHeartbeats: number;
  latency: number;
}

export interface HealthStatus {
  isHealthy: boolean;
  state: ConnectionState;
  issues: string[];
  details: HealthDetails;
}

export enum ConnectionState {
  Optimal = "optimal",
  Degraded = "degraded",
  Unhealthy = "unhealthy",
  Disconnected = "disconnected",
}

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

  shouldTakeAction(status: HealthStatus): boolean {
    return (
      status.state === ConnectionState.Unhealthy ||
      status.state === ConnectionState.Disconnected ||
      status.details.missedHeartbeats >= this.#options.zombieConnectionThreshold
    );
  }
}
