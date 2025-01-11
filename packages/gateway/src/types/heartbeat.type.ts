export interface HeartbeatStats {
  latency: number;
  latencyHistory: number[];
  missedHeartbeats: number;
  totalBeats: number;
  sequence: number;
  lastAck: number;
  lastSend: number;
}

export interface HeartbeatState {
  intervalMs: number;
  isAcked: boolean;
  isReconnecting: boolean;
  retryAttempts: number;
}
