export type ShardStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "resuming"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface ShardSession {
  shardId: number;
  numShards: number;
  status?: ShardStatus;
  guildCount: number;
}
