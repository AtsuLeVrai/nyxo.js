import { z } from "zod";

export const ShardOptions = z
  .object({
    totalShards: z
      .union([z.number().int().positive(), z.literal("auto")])
      .optional(),
    shardList: z.array(z.number().int().nonnegative()).default([]),
  })
  .strict()
  .refine(
    (data) => {
      if (typeof data.totalShards === "number" && data.shardList.length > 0) {
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
