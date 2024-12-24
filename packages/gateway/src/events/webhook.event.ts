import type { Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export interface WebhookUpdateEntity {
  guild_id: Snowflake;
  channel_id: Snowflake;
}
