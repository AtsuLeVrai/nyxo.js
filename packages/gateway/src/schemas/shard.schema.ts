import { z } from "zod";

export const ShardStatus = z.enum([
  "idle",
  "connecting",
  "connected",
  "resuming",
  "disconnected",
  "reconnecting",
  "error",
]);

export type ShardStatus = z.infer<typeof ShardStatus>;

export const ShardSession = z
  .object({
    shardId: z.number().nonnegative(),
    numShards: z.number().positive(),
    status: ShardStatus.optional(),
    guildCount: z.number().nonnegative(),
  })
  .strict();

export type ShardSession = z.infer<typeof ShardSession>;

export const ShardOptions = z
  .object({
    totalShards: z
      .union([z.number().positive(), z.literal("auto")])
      .optional()
      .default("auto"),
    shardList: z.array(z.number().nonnegative()).optional().default([]),
    spawnTimeout: z.number().positive().optional().default(30000),
    spawnDelay: z.number().nonnegative().optional().default(5000),
    maxGuildsPerShard: z.number().positive().optional().default(2500),
    shardCount: z.number().positive().optional().default(1),
    maxConcurrency: z.number().positive().optional().default(1),
  })
  .strict()
  .refine(
    (data) => {
      if (data.maxConcurrency > 16) {
        return false;
      }
      return true;
    },
    {
      message: "maxConcurrency cannot exceed 16",
      path: ["maxConcurrency"],
    },
  );
