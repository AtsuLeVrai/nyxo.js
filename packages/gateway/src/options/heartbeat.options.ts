import { z } from "zod";

export const HeartbeatOptions = z.object({
  maxMissedHeartbeats: z.number().int().default(3),
  autoReconnect: z.boolean().default(true),
});
