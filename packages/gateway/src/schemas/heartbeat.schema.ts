import { z } from "zod";

export const HeartbeatOptions = z
  .object({
    initialInterval: z.number().nonnegative().optional().default(0),
    useJitter: z.boolean().optional().default(true),
    minJitter: z.number().min(0).max(1).optional().default(0),
    maxJitter: z.number().min(0).max(1).optional().default(1),
    maxMissedHeartbeats: z.number().positive().optional().default(2),
    maxLatency: z.number().positive().optional().default(10000),
    minSequence: z.number().nonnegative().optional().default(0),
    maxSequence: z
      .number()
      .positive()
      .optional()
      .default(Number.MAX_SAFE_INTEGER),
    autoReconnect: z.boolean().optional().default(true),
    retryOnFail: z.boolean().optional().default(true),
    resetOnZombie: z.boolean().optional().default(true),
  })
  .strict()
  .refine((data) => data.maxJitter >= data.minJitter, {
    message: "maxJitter must be greater than or equal to minJitter",
    path: ["maxJitter"],
  });
