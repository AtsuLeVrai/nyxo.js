import { ApiVersion, BitFieldManager, BotToken } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { CompressionOptions } from "./compression.options.js";
import { HealthOptions } from "./health.options.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ReconnectionOptions } from "./reconnection.options.js";
import { ShardOptions } from "./shard.options.js";

const LARGE_THRESHOLD = 50;
const MIN_LARGE_THRESHOLD = 50;
const MAX_LARGE_THRESHOLD = 250;
const DEFAULT_API_VERSION = ApiVersion.V10;

export const EncodingType = z.enum(["json", "etf"]);
export type EncodingType = z.infer<typeof EncodingType>;

export const GatewayOptions = z.object({
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
    .default(LARGE_THRESHOLD),
  encodingType: EncodingType.default("json"),
  compression: CompressionOptions.default({}),
  health: HealthOptions.default({}),
  heartbeat: HeartbeatOptions.default({}),
  reconnection: ReconnectionOptions.default({}),
  shard: ShardOptions.default({}),
});

export type GatewayOptions = z.infer<typeof GatewayOptions>;
