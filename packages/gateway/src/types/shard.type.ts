export type ShardStatus = "connecting" | "ready" | "disconnected" | "idle";

export interface ShardInfo {
  shardId: number;
  totalShards: number;
  guildIds: string[];
  status: ShardStatus;
}
