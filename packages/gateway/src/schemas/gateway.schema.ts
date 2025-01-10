import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { UpdatePresenceEntity } from "../events/index.js";
import { GatewayIntentsBits, GatewayOpcodes } from "../types/index.js";
import { CompressionOptions } from "./compression.schema.js";
import { EncodingOptions } from "./encoding.schema.js";
import { HeartbeatOptions } from "./heartbeat.schema.js";
import { ShardOptions } from "./shard.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export const PayloadEntity = z
  .object({
    op: z.nativeEnum(GatewayOpcodes),
    d: z.union([z.object({}), z.number(), z.null()]),
    s: z.number().nullable(),
    t: z.string().nullable(),
  })
  .strict();

export type PayloadEntity = z.infer<typeof PayloadEntity>;

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

export type GatewayOptions = z.infer<typeof GatewayOptions>;
