import { z } from "zod";

export const ShardOptions = z.object({
  totalShards: z.union([z.number().int(), z.literal("auto")]).optional(),
  shardList: z.array(z.number().nonnegative()).default([]),
  spawnTimeout: z.number().positive().default(30000),
  spawnDelay: z.number().nonnegative().default(5000),
  maxGuildsPerShard: z.number().positive().default(2500),
  shardCount: z.number().positive().default(1),
  maxConcurrency: z.number().positive().default(1),
});
