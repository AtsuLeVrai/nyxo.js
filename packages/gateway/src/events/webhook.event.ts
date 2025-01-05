import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export const WebhookUpdateSchema = z
  .object({
    guild_id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
  })
  .strict();

export type WebhookUpdateEntity = z.infer<typeof WebhookUpdateSchema>;
