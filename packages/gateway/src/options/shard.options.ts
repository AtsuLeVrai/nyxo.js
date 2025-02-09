import { z } from "zod";

const SHARD_DEFAULTS = {
  SPAWN_DELAY: 5000,
  LARGE_THRESHOLD: 2500,
  VERY_LARGE_THRESHOLD: 150000,
  MIN_SESSION_LIMIT: 2000,
  SESSIONS_PER_GUILDS: 5,
} as const;

export const ShardOptions = z
  .object({
    totalShards: z
      .union([z.number().int().positive(), z.literal("auto")])
      .optional(),
    shardList: z.array(z.number().int().nonnegative()).optional(),
    spawnDelay: z.number().positive().default(SHARD_DEFAULTS.SPAWN_DELAY),
    largeThreshold: z
      .number()
      .positive()
      .default(SHARD_DEFAULTS.LARGE_THRESHOLD),
    veryLargeThreshold: z
      .number()
      .positive()
      .default(SHARD_DEFAULTS.VERY_LARGE_THRESHOLD),
    minSessionLimit: z
      .number()
      .positive()
      .default(SHARD_DEFAULTS.MIN_SESSION_LIMIT),
    sessionsPerGuilds: z
      .number()
      .positive()
      .default(SHARD_DEFAULTS.SESSIONS_PER_GUILDS),
  })
  .strict()
  .readonly()
  .refine(
    (data) => {
      if (typeof data.totalShards === "number" && data.shardList) {
        return data.shardList.every(
          (shard) => shard < Number(data.totalShards),
        );
      }
      return true;
    },
    {
      message:
        "Shard list must contain only valid shard IDs for the total shards provided",
      path: ["shardList"],
    },
  );

export type ShardOptions = z.infer<typeof ShardOptions>;
