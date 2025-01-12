import { z } from "zod";
import { UpdatePresenceEntity } from "./gateway.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-connection-properties}
 */
export const IdentifyConnectionPropertiesEntity = z.object({
  os: z.string(),
  browser: z.string(),
  device: z.string(),
});

export type IdentifyConnectionPropertiesEntity = z.infer<
  typeof IdentifyConnectionPropertiesEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-structure}
 */
export const IdentifyEntity = z.object({
  token: z.string(),
  properties: IdentifyConnectionPropertiesEntity,
  compress: z.boolean().optional(),
  large_threshold: z.number().optional(),
  shard: z.tuple([z.number(), z.number()]).optional(),
  presence: UpdatePresenceEntity.optional(),
  intents: z.number().int(),
});

export type IdentifyEntity = z.infer<typeof IdentifyEntity>;
