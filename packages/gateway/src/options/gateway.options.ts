import { ApiVersion, BitFieldManager } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { CompressionOptions } from "./compression.options.js";
import { HealthOptions } from "./health.options.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ReconnectionOptions } from "./reconnection.options.js";
import { ShardOptions } from "./shard.options.js";

const GATEWAY_DEFAULTS = {
  LARGE_THRESHOLD: 50,
  MIN_LARGE_THRESHOLD: 50,
  MAX_LARGE_THRESHOLD: 250,
  API_VERSION: ApiVersion.V10,
} as const;

export const EncodingType = z.enum(["json", "etf"]);
export type EncodingType = z.infer<typeof EncodingType>;

export const GatewayOptions = z
  .object({
    token: z.string(),
    intents: z.union([
      z.array(z.nativeEnum(GatewayIntentsBits)).transform((value) => {
        return BitFieldManager.combine(value).toNumber();
      }),
      z.number().int().positive(),
    ]),
    version: z.literal(ApiVersion.V10).default(GATEWAY_DEFAULTS.API_VERSION),
    presence: UpdatePresenceEntity.optional(),
    largeThreshold: z
      .number()
      .int()
      .min(GATEWAY_DEFAULTS.MIN_LARGE_THRESHOLD)
      .max(GATEWAY_DEFAULTS.MAX_LARGE_THRESHOLD)
      .default(GATEWAY_DEFAULTS.LARGE_THRESHOLD),
    encodingType: EncodingType.default("json"),
    compression: CompressionOptions.optional(),
    health: HealthOptions.default({}),
    heartbeat: HeartbeatOptions.default({}),
    reconnection: ReconnectionOptions.default({}),
    shard: ShardOptions.default({}),
  })
  .readonly();

export type GatewayOptions = z.infer<typeof GatewayOptions>;
