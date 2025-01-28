import { z } from "zod";

const DEFAULT_MAX_MISSED_HEARTBEATS = 3;

export const HeartbeatOptions = z
  .object({
    maxMissedHeartbeats: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_MAX_MISSED_HEARTBEATS),
    autoReconnect: z.boolean().default(true),
  })
  .strict();

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;
