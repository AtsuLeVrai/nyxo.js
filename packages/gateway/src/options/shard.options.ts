import { z } from "zod";

export const ShardOptions = z.object({
  totalShards: z.union([z.number().int(), z.literal("auto")]).optional(),
  shardList: z.array(z.number().int()).default([]),
  spawnTimeout: z.number().int().default(30000),
  spawnDelay: z.number().int().default(5000),
  maxGuildsPerShard: z.number().int().default(2500),
  shardCount: z.number().int().default(1),
  maxConcurrency: z.number().int().default(1),
});
