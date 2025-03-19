import { z } from "zod";

/**
 * Configuration options for the queue manager
 */
export const QueueOptions = z
  .object({
    /**
     * Maximum number of concurrent requests allowed
     * @default 5
     */
    concurrency: z.number().int().positive().default(5),

    /**
     * Whether to enable the queue mechanism
     * @default true
     */
    enabled: z.boolean().default(true),

    /**
     * Maximum size of the queue before rejecting new requests
     * @default 1000
     */
    maxQueueSize: z.number().int().positive().default(1000),

    /**
     * Prioritize specific routes or methods (higher number = higher priority)
     * @default {}
     * @example
     * priorities: {
     *       "POST:/interactions": 10, // Highest priority for interactions
     *       "GET:/users": 2,          // Low priority for user fetches
     *     }
     */
    priorities: z
      .record(z.string(), z.number().int().min(0).max(10))
      .default({}),

    /**
     * Timeout for queued requests in milliseconds (0 = no timeout)
     * @default 0
     */
    timeout: z.number().int().min(0).default(0),
  })
  .strict()
  .readonly();

export type QueueOptions = z.infer<typeof QueueOptions>;
