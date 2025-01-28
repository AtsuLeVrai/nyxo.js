import { z } from "zod";

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_INTERVAL_CAP = 10;
const DEFAULT_INTERVAL = 1000;
const DEFAULT_TIMEOUT = 15000;

export const QueueOptions = z
  .object({
    concurrency: z.number().int().positive().default(DEFAULT_CONCURRENCY),
    intervalCap: z.number().int().positive().default(DEFAULT_INTERVAL_CAP),
    interval: z.number().int().positive().default(DEFAULT_INTERVAL),
    timeout: z.number().int().positive().default(DEFAULT_TIMEOUT),
    autoStart: z.boolean().default(true),
    throwOnTimeout: z.boolean().default(false),
    carryoverConcurrencyCount: z.boolean().default(false),
  })
  .strict();

export type QueueOptions = z.infer<typeof QueueOptions>;
