import type { Integer } from "@nyxjs/core";

export interface ShardInfo {
  shardId: number;
  totalShards: number;
  guildIds: string[];
  status: "connecting" | "ready" | "disconnected" | "idle";
}

export interface ShardOptions {
  shardCount?: number;
  maxConcurrency?: number;
  shard?: [shardId: Integer, numShards: Integer] | "auto";
}
