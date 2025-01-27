import { z } from "zod";

export const DEFAULT_QUEUE_OPTIONS = {
  concurrency: 5,
  intervalCap: 10,
  interval: 1000,
  timeout: 15000,
} as const;

export const QueueOptions = z
  .object({
    concurrency: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_QUEUE_OPTIONS.concurrency),
    intervalCap: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_QUEUE_OPTIONS.intervalCap),
    interval: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_QUEUE_OPTIONS.interval),
    timeout: z.number().int().positive().default(DEFAULT_QUEUE_OPTIONS.timeout),
    autoStart: z.boolean().default(true),
    throwOnTimeout: z.boolean().default(false),
    carryoverConcurrencyCount: z.boolean().default(false),
  })
  .strict();

export type QueueOptions = z.infer<typeof QueueOptions>;
