import { ApiVersion, BitFieldManager } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { CompressionOptions } from "./compression.options.js";
import { HealthOptions } from "./health.options.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ReconnectionOptions } from "./reconnection.options.js";
import { ShardOptions } from "./shard.options.js";

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
    version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
    presence: UpdatePresenceEntity.optional(),
    largeThreshold: z.number().int().min(50).max(250).default(50),
    encodingType: EncodingType.default("json"),
    compression: CompressionOptions.optional(),
    health: HealthOptions.default({}),
    heartbeat: HeartbeatOptions.default({}),
    reconnection: ReconnectionOptions.default({}),
    shard: ShardOptions.default({}),
  })
  .readonly();

export type GatewayOptions = z.infer<typeof GatewayOptions>;
