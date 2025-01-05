import { z } from "zod";
import { UpdatePresenceSchema } from "./gateway.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-connection-properties}
 */
export const IdentifyConnectionPropertiesSchema = z
  .object({
    os: z.string(),
    browser: z.string(),
    device: z.string(),
  })
  .strict();

export type IdentifyConnectionPropertiesEntity = z.infer<
  typeof IdentifyConnectionPropertiesSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-structure}
 */
export const IdentifySchema = z
  .object({
    token: z.string(),
    properties: IdentifyConnectionPropertiesSchema,
    compress: z.boolean().optional(),
    large_threshold: z.number().optional(),
    shard: z.tuple([z.number(), z.number()]).optional(),
    presence: UpdatePresenceSchema.optional(),
    intents: z.number().int(),
  })
  .strict();

export type IdentifyEntity = z.infer<typeof IdentifySchema>;
