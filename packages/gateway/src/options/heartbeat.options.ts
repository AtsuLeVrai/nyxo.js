import { z } from "zod";

export const HeartbeatOptions = z.object({
  initialInterval: z.number().nonnegative().default(0),
  useJitter: z.boolean().default(true),
  minJitter: z.number().min(0).max(1).default(0),
  maxJitter: z.number().min(0).max(1).default(1),
  maxMissedHeartbeats: z.number().positive().default(2),
  maxLatency: z.number().positive().default(10000),
  minSequence: z.number().nonnegative().default(0),
  maxSequence: z.number().positive().default(Number.MAX_SAFE_INTEGER),
  autoReconnect: z.boolean().default(true),
  retryOnFail: z.boolean().default(true),
  resetOnZombie: z.boolean().default(true),
});
