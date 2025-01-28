import { ApiVersion, BitFieldManager, BotToken } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { HealthOptions } from "./health.options.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ShardOptions } from "./shard.options.js";

const DEFAULT_LARGE_THRESHOLD = 50;
const MIN_LARGE_THRESHOLD = 50;
const MAX_LARGE_THRESHOLD = 250;
const DEFAULT_API_VERSION = ApiVersion.V10;

export const EncodingType = z.enum(["json", "etf"]);
export type EncodingType = z.infer<typeof EncodingType>;

export const CompressionType = z.enum(["zlib-stream", "zstd-stream"]);
export type CompressionType = z.infer<typeof CompressionType>;

export const GatewayOptions = z
  .object({
    token: BotToken,
    intents: z.union([
      z.array(z.nativeEnum(GatewayIntentsBits)).transform((value) => {
        return BitFieldManager.combine(value).toNumber();
      }),
      z.number().int().positive(),
    ]),
    version: z.literal(ApiVersion.V10).default(DEFAULT_API_VERSION),
    presence: UpdatePresenceEntity.optional(),
    largeThreshold: z
      .number()
      .int()
      .min(MIN_LARGE_THRESHOLD)
      .max(MAX_LARGE_THRESHOLD)
      .default(DEFAULT_LARGE_THRESHOLD),
    encodingType: EncodingType.default("etf"),
    compressionType: CompressionType.optional(),
    health: HealthOptions.default({}),
    heartbeat: HeartbeatOptions.default({}),
    shard: ShardOptions.default({}),
  })
  .strict();

export type GatewayOptions = z.infer<typeof GatewayOptions>;
