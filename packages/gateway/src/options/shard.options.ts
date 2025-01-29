import { z } from "zod";

const SPAWN_DELAY = 5000;
const LARGE_THRESHOLD = 2500;
const VERY_LARGE_THRESHOLD = 150000;
const MIN_SESSION_LIMIT = 2000;
const SESSIONS_PER_GUILDS = 5;

export const ShardOptions = z
  .object({
    totalShards: z
      .union([z.number().int().positive(), z.literal("auto")])
      .optional(),
    shardList: z.array(z.number().int().nonnegative()).optional(),
    spawnDelay: z.number().positive().default(SPAWN_DELAY),
    largeThreshold: z.number().positive().default(LARGE_THRESHOLD),
    veryLargeThreshold: z.number().positive().default(VERY_LARGE_THRESHOLD),
    minSessionLimit: z.number().positive().default(MIN_SESSION_LIMIT),
    sessionsPerGuilds: z.number().positive().default(SESSIONS_PER_GUILDS),
  })
  .strict()
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
