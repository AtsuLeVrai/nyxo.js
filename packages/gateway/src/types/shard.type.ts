export type ShardStatus =
  | "disconnected"
  | "connecting"
  | "ready"
  | "resuming"
  | "reconnecting";

export interface ShardData {
  shardId: number;
  totalShards: number;
  guildCount: number;
  guilds: Set<string>;
  status: ShardStatus;
  bucket: number;
  rateLimit: {
    remaining: number;
    reset: number;
  };
}

interface ShardBase {
  shardId: number;
  totalShards: number;
}

export interface ShardStats extends ShardBase {
  guildCount: number;
}

export interface ShardReady extends ShardBase {
  sessionId: string;
  latency: number;
  guildCount: number;
}

export interface ShardDisconnect extends ShardBase {
  code: number;
  reason: string;
  wasClean: boolean;
}

export interface ShardReconnect extends ShardBase {
  attempts: number;
  delay: number;
}

export interface ShardResume extends ShardBase {
  sessionId: string;
  replayedEvents: number;
  latency: number;
}

export interface ShardRateLimit extends ShardBase {
  bucket: number;
  timeout: number;
  remaining: number;
  reset: number;
}
