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
      .default("auto"),
    shardList: z.array(z.number().nonnegative()).default([]),
    spawnTimeout: z.number().positive().default(30000),
    spawnDelay: z.number().nonnegative().default(5000),
    maxGuildsPerShard: z.number().positive().default(2500),
    shardCount: z.number().positive().default(1),
    maxConcurrency: z.number().positive().default(1),
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

export type ShardOptions = z.infer<typeof ShardOptions>;
