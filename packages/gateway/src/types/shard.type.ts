export interface ShardInfo {
  shardId: number;
  totalShards: number;
  guildIds: string[];
  status: "connecting" | "ready" | "disconnected" | "idle";
}

export interface ShardOptions {
  shardCount?: number;
  maxConcurrency?: number;
  shard?: boolean;
}
