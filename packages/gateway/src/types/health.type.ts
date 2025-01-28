export interface HealthStatus {
  isHealthy: boolean;
  state: ConnectionState;
  details: {
    connectionState: 0 | 1 | 2 | 3;
    missedHeartbeats: number;
    latency: number;
  };
  issues: string[];
}

export enum ConnectionState {
  Optimal = "optimal",
  Degraded = "degraded",
  Unhealthy = "unhealthy",
  Disconnected = "disconnected",
}
