import { z } from "zod";

export const ShardOptions = z.object({
  totalShards: z.union([z.number().int(), z.literal("auto")]).optional(),
  shardList: z.array(z.number().int()).default([]),
});
