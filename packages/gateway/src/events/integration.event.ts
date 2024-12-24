import type { IntegrationEntity, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-delete-integration-delete-event-fields}
 */
export interface IntegrationDeleteEntity {
  id: Snowflake;
  guild_id: Snowflake;
  application_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export interface IntegrationUpdateEntity extends IntegrationEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-create-integration-create-event-additional-fields}
 */
export type IntegrationCreateEntity = IntegrationUpdateEntity;
