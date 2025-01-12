import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { CompressionOptions } from "./compression.options.js";
import { EncodingOptions } from "./encoding.options.js";
import { HeartbeatOptions } from "./heartbeat.options.js";
import { ShardOptions } from "./shard.options.js";

export const GatewayOptions = z
  .object({
    token: z.string(),
    intents: z.union([
      z.array(z.nativeEnum(GatewayIntentsBits)),
      z.number().int(),
    ]),
    version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
    presence: UpdatePresenceEntity.optional(),
    encoding: EncodingOptions.optional(),
    compression: CompressionOptions.optional(),
    heartbeat: HeartbeatOptions.optional(),
    shard: ShardOptions.optional(),
    largeThreshold: z.number().int().min(50).max(250).default(50),
    maxReconnectAttempts: z.number().int().positive().default(5),
  })
  .refine(
    (data) => {
      if (Array.isArray(data.intents)) {
        return data.intents.every((intent) =>
          Object.values(GatewayIntentsBits).includes(intent),
        );
      }
      return true;
    },
    {
      message: "Invalid intents provided",
      path: ["intents"],
    },
  );
