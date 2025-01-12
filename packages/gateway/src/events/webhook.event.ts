import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export const WebhookUpdateEntity = z.object({
  guild_id: Snowflake,
  channel_id: Snowflake,
});

export type WebhookUpdateEntity = z.infer<typeof WebhookUpdateEntity>;
