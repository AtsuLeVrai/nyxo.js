import { z } from "zod";

export const IpDiscoveryOptions = z
  .object({
    maxRetries: z.number().default(3),
    timeout: z.number().default(5000),
    retryDelay: z.number().default(1000),
  })
  .strict()
  .readonly();

export type IpDiscoveryOptions = z.infer<typeof IpDiscoveryOptions>;
