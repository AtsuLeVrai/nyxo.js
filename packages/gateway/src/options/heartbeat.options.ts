import { z } from "zod";

export const HeartbeatOptions = z
  .object({
    maxMissedHeartbeats: z.number().int().positive().default(3),
    autoReconnect: z.boolean().default(true),
    maxHistorySize: z.number().positive().default(100),
    reconnectDelay: z.number().positive().default(1000),
    minInterval: z.number().positive().default(1),
  })
  .strict()
  .readonly();

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;
