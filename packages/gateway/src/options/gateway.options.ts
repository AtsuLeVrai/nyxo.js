import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { CompressionOptions } from "./compression.options.js";
import { EncodingOptions } from "./encoding.options.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ShardOptions } from "./shard.options.js";

export const GatewayOptions = z.object({
  token: z.string(),
  intents: z.union([
    z.array(z.nativeEnum(GatewayIntentsBits)),
    z.number().int(),
  ]),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  presence: UpdatePresenceEntity.optional(),
  largeThreshold: z.number().int().min(50).max(250).default(50),
  maxReconnectAttempts: z.number().int().default(5),
  ...EncodingOptions.shape,
  ...CompressionOptions.shape,
  ...HeartbeatOptions.shape,
  ...ShardOptions.shape,
});
