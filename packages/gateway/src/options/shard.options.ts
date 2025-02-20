import { z } from "zod";

export const ShardOptions = z
  .object({
    totalShards: z
      .union([z.number().int().positive(), z.literal("auto")])
      .optional(),
    shardList: z.array(z.number().int().nonnegative()).optional(),
    spawnDelay: z.number().positive().default(5000),
    largeThreshold: z.number().positive().default(2500),
    veryLargeThreshold: z.number().positive().default(150000),
    minSessionLimit: z.number().positive().default(2000),
    sessionsPerGuilds: z.number().positive().default(5),
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
