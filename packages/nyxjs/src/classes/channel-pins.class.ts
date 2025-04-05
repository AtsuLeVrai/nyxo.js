import type { Snowflake } from "@nyxjs/core";
import type { ChannelPinsUpdateEntity } from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a channel pins update event.
 * Sent when a message is pinned or unpinned in a text channel.
 */
export class ChannelPins extends BaseClass<ChannelPinsUpdateEntity> {
  /**
   * ID of the guild where the pins were updated
   */
  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  /**
   * ID of the channel where the pins were updated
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * Timestamp when the last pinned message was pinned
   */
  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp;
  }

  /**
   * Whether this pin update happened in a guild
   */
  get inGuild(): boolean {
    return Boolean(this.data.guild_id);
  }
}
