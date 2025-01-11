import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits } from "../types/index.js";
import { CompressionOptions } from "./compression.schema.js";
import { EncodingOptions } from "./encoding.schema.js";
import { HeartbeatOptions } from "./heartbeat.schema.js";
import { ShardOptions } from "./shard.schema.js";

export const GatewayOptions = z
  .object({
    token: z.string(),
    intents: z.union([
      z.array(z.nativeEnum(GatewayIntentsBits)),
      z.number().int(),
    ]),
    version: z.literal(ApiVersion.V10).optional().default(ApiVersion.V10),
    presence: UpdatePresenceEntity.optional(),
    encoding: EncodingOptions.optional(),
    compression: CompressionOptions.optional(),
    heartbeat: HeartbeatOptions.optional(),
    shard: ShardOptions.optional(),
    largeThreshold: z.number().int().min(50).max(250).optional().default(50),
    maxReconnectAttempts: z.number().int().positive().optional().default(5),
  })
  .strict()
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
