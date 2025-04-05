import type { Snowflake } from "@nyxjs/core";
import type { WebhookUpdateEntity } from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a webhook update event.
 * Sent when a guild channel's webhook is created, updated, or deleted.
 */
export class Webhook extends BaseClass<WebhookUpdateEntity> {
  /**
   * ID of the guild where the webhook was updated
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * ID of the channel the webhook belongs to
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }
}
