import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";

// /** The ID of this Stage instance */
// id: Snowflake;
//
// /** The guild ID of the associated Stage channel */
// guild_id: Snowflake;
//
// /** The ID of the associated Stage channel */
// channel_id: Snowflake;
//
// /**
//  * The topic of the Stage instance (1-120 characters)
//  * @minLength 1
//  * @maxLength 120
//  */
// topic: string;
//
// /** The privacy level of the Stage instance */
// privacy_level: StageInstancePrivacyLevel;
//
// /**
//  * Whether or not Stage Discovery is disabled
//  * @deprecated This field is deprecated by Discord
//  */
// discoverable_disabled: boolean;
//
// /** The ID of the scheduled event for this Stage instance, if any */
// guild_scheduled_event_id: Snowflake | null;

/**
 * Represents a STAGE_INSTANCE_CREATE event dispatched when a Stage instance is created.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#stage-instance-create}
 */
export class StageInstance extends BaseClass<StageInstanceEntity> {
  /**
   * The ID of this Stage instance
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The guild ID of the associated Stage channel
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * The ID of the associated Stage channel
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * The topic of the Stage instance (1-120 characters)
   * @minLength 1
   * @maxLength 120
   */
  get topic(): string {
    return this.data.topic;
  }

  /**
   * The privacy level of the Stage instance
   */
  get privacyLevel(): StageInstancePrivacyLevel {
    return this.data.privacy_level;
  }

  /**
   * Whether or not Stage Discovery is disabled
   * @deprecated This field is deprecated by Discord
   */
  get discoverableDisabled(): boolean {
    return Boolean(this.data.discoverable_disabled);
  }

  /**
   * The ID of the scheduled event for this Stage instance, if any
   */
  get guildScheduledEventId(): Snowflake | null {
    return this.data.guild_scheduled_event_id || null;
  }
}
