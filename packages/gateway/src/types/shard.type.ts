export interface ShardSession {
  shardId: number;
  numShards: number;
  sessionIndex?: number;
  largeThreshold?: number;
}

export interface ShardingConfig {
  totalShards?: number | "auto";
  sessions?: ShardSession[];
  shardList?: number[];
  spawnTimeout?: number;
  handoffStrategy?: "immediate" | "graceful";
}
