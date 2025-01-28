import WebSocket from "ws";
import { ConnectionState, type HealthStatus } from "../types/index.js";

export const HEALTH_CONSTANTS = {
  zombiedConnectionThreshold: 2,
  maxLatency: 30000,
  degradedLatencyThreshold: 15000,
  optimalLatencyThreshold: 5000,
} as const;

export class HealthService {
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
      if (missedHeartbeats >= HEALTH_CONSTANTS.zombiedConnectionThreshold) {
        state = ConnectionState.Unhealthy;
      } else {
        state = ConnectionState.Degraded;
      }
    }

    if (latency > HEALTH_CONSTANTS.maxLatency) {
      issues.push(`Latency (${latency}ms) exceeds maximum threshold`);
      state = ConnectionState.Unhealthy;
    } else if (latency > HEALTH_CONSTANTS.degradedLatencyThreshold) {
      issues.push(`High latency: ${latency}ms`);
      state = ConnectionState.Degraded;
    } else if (latency > HEALTH_CONSTANTS.optimalLatencyThreshold) {
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
        missedHeartbeats < HEALTH_CONSTANTS.zombiedConnectionThreshold &&
        latency < HEALTH_CONSTANTS.maxLatency,
    );
  }

  getHealthDescription(status: HealthStatus): string {
    const stateEmoji = {
      [ConnectionState.Optimal]: "✅",
      [ConnectionState.Degraded]: "!",
      [ConnectionState.Unhealthy]: "❌",
      [ConnectionState.Disconnected]: "🔌",
    };

    const description = [
      `${stateEmoji[status.state]} Connection Status: ${status.state.toUpperCase()}`,
      `WebSocket State: ${status.details.connectionState}`,
      `Latency: ${status.details.latency}ms`,
      `Missed Heartbeats: ${status.details.missedHeartbeats}`,
    ];

    if (status.issues.length > 0) {
      description.push(
        "\nIssues:",
        ...status.issues.map((issue) => `- ${issue}`),
      );
    }

    return description.join("\n");
  }

  shouldTakeAction(status: HealthStatus): boolean {
    return (
      status.state === ConnectionState.Unhealthy ||
      status.state === ConnectionState.Disconnected ||
      status.details.missedHeartbeats >=
        HEALTH_CONSTANTS.zombiedConnectionThreshold
    );
  }
}
