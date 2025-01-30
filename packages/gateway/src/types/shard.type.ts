export interface ShardData {
  shardId: number;
  totalShards: number;
  guildCount: number;
  guilds: Set<string>;
  status: "disconnected" | "connecting" | "ready";
  bucket: number;
  rateLimit: {
    remaining: number;
    reset: number;
  };
}
