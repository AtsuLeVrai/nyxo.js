import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ShardOptions } from "./shard.options.js";

export const EncodingType = z.union([z.literal("json"), z.literal("etf")]);

export type EncodingType = z.infer<typeof EncodingType>;

export const CompressionType = z.union([
  z.literal("zlib-stream"),
  z.literal("zstd-stream"),
]);

export type CompressionType = z.infer<typeof CompressionType>;

export const GatewayOptions = z.object({
  token: z.string(),
  intents: z.union([
    z.array(z.nativeEnum(GatewayIntentsBits)),
    z.number().int(),
  ]),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  presence: UpdatePresenceEntity.optional(),
  largeThreshold: z.number().int().min(50).max(250).default(50),
  encodingType: EncodingType.default("etf"),
  compressionType: CompressionType.optional(),
  ...HeartbeatOptions.shape,
  ...ShardOptions.shape,
});
