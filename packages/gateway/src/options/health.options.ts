import { z } from "zod";

const HEALTH_DEFAULTS = {
  CHECK_INTERVAL: 41250,
  ZOMBIE_CONNECTION_THRESHOLD: 2,
  MAX_LATENCY: 30000,
  DEGRADED_LATENCY_THRESHOLD: 15000,
  OPTIMAL_LATENCY_THRESHOLD: 5000,
} as const;

export const HealthOptions = z
  .object({
    healthCheckInterval: z
      .number()
      .int()
      .positive()
      .default(HEALTH_DEFAULTS.CHECK_INTERVAL),
    zombieConnectionThreshold: z
      .number()
      .int()
      .positive()
      .default(HEALTH_DEFAULTS.ZOMBIE_CONNECTION_THRESHOLD),
    maxLatency: z
      .number()
      .int()
      .positive()
      .default(HEALTH_DEFAULTS.MAX_LATENCY),
    degradedLatencyThreshold: z
      .number()
      .int()
      .positive()
      .default(HEALTH_DEFAULTS.DEGRADED_LATENCY_THRESHOLD),
    optimalLatencyThreshold: z
      .number()
      .int()
      .positive()
      .default(HEALTH_DEFAULTS.OPTIMAL_LATENCY_THRESHOLD),
  })
  .strict()
  .readonly();

export type HealthOptions = z.infer<typeof HealthOptions>;
