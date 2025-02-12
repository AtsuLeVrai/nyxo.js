import { GatewayOptions } from "@nyxjs/gateway";
import { RestOptions } from "@nyxjs/rest";
import { z } from "zod";

export const CacheOptions = z
  .object({
    maxSize: z.number().int().default(10000),
    ttl: z.number().int().default(0),
    evictionStrategy: z.enum(["fifo", "lru"]).default("lru"),
  })
  .readonly();

export const ClientOptions = z
  .object({
    ...RestOptions.unwrap().shape,
    ...GatewayOptions.unwrap().shape,
    ...CacheOptions.unwrap().shape,
  })
  .readonly();

export type ClientOptions = z.infer<typeof ClientOptions>;
