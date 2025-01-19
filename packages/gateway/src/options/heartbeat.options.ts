import { z } from "zod";

export const HeartbeatOptions = z.object({
  initialInterval: z.number().int().default(0),
  useJitter: z.boolean().default(true),
  minJitter: z.number().min(0).max(1).default(0),
  maxJitter: z.number().min(0).max(1).default(1),
  maxMissedHeartbeats: z.number().int().default(3),
  maxLatency: z.number().int().default(10000),
  minSequence: z.number().int().default(0),
  maxSequence: z.number().int().default(Number.MAX_SAFE_INTEGER),
  autoReconnect: z.boolean().default(true),
  retryOnFail: z.boolean().default(true),
  resetOnZombie: z.boolean().default(true),
});
