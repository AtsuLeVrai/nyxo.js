import { IntegrationEntity, Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-delete-integration-delete-event-fields}
 */
export const IntegrationDeleteEntity = z.object({
  id: Snowflake,
  guild_id: Snowflake,
  application_id: Snowflake.optional(),
});

export type IntegrationDeleteEntity = z.infer<typeof IntegrationDeleteEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export const IntegrationUpdateEntity = IntegrationEntity.extend({
  guild_id: Snowflake,
});

export type IntegrationUpdateEntity = z.infer<typeof IntegrationUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-create-integration-create-event-additional-fields}
 */
export const IntegrationCreateEntity = IntegrationUpdateEntity;

export type IntegrationCreateEntity = z.infer<typeof IntegrationCreateEntity>;
