import { z } from "zod";

export const HeartbeatMetricsSchema = z
  .object({
    latency: z.number().nonnegative(),
    lastAck: z.number().nonnegative(),
    lastSend: z.number().nonnegative(),
    sequence: z.number().nonnegative(),
    missedHeartbeats: z.number().nonnegative(),
    totalBeats: z.number().nonnegative(),
    uptime: z.number().nonnegative(),
    averageLatency: z.number().nonnegative(),
  })
  .strict();

export type HeartbeatMetrics = z.infer<typeof HeartbeatMetricsSchema>;

export const HeartbeatOptionsSchema = z
  .object({
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
    monitorLatency: z.boolean().default(true),
    trackMetrics: z.boolean().default(true),
    detailedErrors: z.boolean().default(true),
    logMetrics: z.boolean().default(false),
  })
  .strict()
  .refine((data) => data.maxJitter >= data.minJitter, {
    message: "maxJitter must be greater than or equal to minJitter",
    path: ["maxJitter"],
  });

export type HeartbeatOptions = z.infer<typeof HeartbeatOptionsSchema>;
