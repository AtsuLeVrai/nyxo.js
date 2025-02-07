import { z } from "zod";

const HEALTH_CHECK_INTERVAL = 41250;
const ZOMBIE_CONNECTION_THRESHOLD = 2;
const MAX_LATENCY = 30000;
const DEGRADED_LATENCY_THRESHOLD = 15000;
const OPTIMAL_LATENCY_THRESHOLD = 5000;

export const HealthOptions = z
  .object({
    healthCheckInterval: z
      .number()
      .int()
      .positive()
      .default(HEALTH_CHECK_INTERVAL),
    zombieConnectionThreshold: z
      .number()
      .int()
      .positive()
      .default(ZOMBIE_CONNECTION_THRESHOLD),
    maxLatency: z.number().int().positive().default(MAX_LATENCY),
    degradedLatencyThreshold: z
      .number()
      .int()
      .positive()
      .default(DEGRADED_LATENCY_THRESHOLD),
    optimalLatencyThreshold: z
      .number()
      .int()
      .positive()
      .default(OPTIMAL_LATENCY_THRESHOLD),
  })
  .strict();

export type HealthOptions = z.infer<typeof HealthOptions>;
