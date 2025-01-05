import { IntegrationSchema, SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-delete-integration-delete-event-fields}
 */
export const IntegrationDeleteSchema = z
  .object({
    id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    application_id: SnowflakeSchema.optional(),
  })
  .strict();

export type IntegrationDeleteEntity = z.infer<typeof IntegrationDeleteSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export const IntegrationUpdateSchema = IntegrationSchema.extend({
  guild_id: SnowflakeSchema,
}).strict();

export type IntegrationUpdateEntity = z.infer<typeof IntegrationUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-create-integration-create-event-additional-fields}
 */
export const IntegrationCreateSchema = IntegrationUpdateSchema;

export type IntegrationCreateEntity = z.infer<typeof IntegrationCreateSchema>;
