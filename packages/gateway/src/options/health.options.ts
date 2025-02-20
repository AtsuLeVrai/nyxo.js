import { z } from "zod";

export const HealthOptions = z
  .object({
    healthCheckInterval: z.number().int().positive().default(41250),
    zombieConnectionThreshold: z.number().int().positive().default(2),
    maxLatency: z.number().int().positive().default(30000),
    degradedLatencyThreshold: z.number().int().positive().default(15000),
    optimalLatencyThreshold: z.number().int().positive().default(5000),
  })
  .strict()
  .readonly();

export type HealthOptions = z.infer<typeof HealthOptions>;
