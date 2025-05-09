import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxojs/core";
import type { StageUpdateOptions } from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";

/**
 * Represents a Discord Stage Instance, providing methods to interact with and manage Stage channels.
 *
 * The StageInstance class serves as a comprehensive wrapper around Discord's Stage Instance API, offering:
 * - Access to Stage information (topic, privacy level, etc.)
 * - Methods to update or end Stage sessions
 * - Utilities to manage Stage discoveries and metadata
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance}
 */
@Cacheable("stageInstances")
export class StageInstance
  extends BaseClass<StageInstanceEntity>
  implements Enforce<PropsToCamel<StageInstanceEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this Stage instance.
   *
   * This ID is used for API operations and remains constant for the lifetime of the Stage instance.
   *
   * @returns The Stage instance's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the guild ID associated with this Stage instance.
   *
   * This identifies which server the Stage is taking place in.
   *
   * @returns The guild's ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the channel ID associated with this Stage instance.
   *
   * This identifies the specific Stage channel that has been converted to a live Stage.
   *
   * @returns The channel's ID as a Snowflake string
   */
  get channelId(): Snowflake {
    return this.rawData.channel_id;
  }

  /**
   * Gets the topic of this Stage instance.
   *
   * The topic describes what the Stage is about and is displayed prominently in the Discord UI.
   *
   * @returns The Stage topic as a string
   */
  get topic(): string {
    return this.rawData.topic;
  }

  /**
   * Gets the privacy level of this Stage instance.
   *
   * The privacy level determines who can see and access the Stage.
   * Currently, only GUILD_ONLY (2) is supported.
   *
   * @returns The privacy level enum value
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
   */
  get privacyLevel(): StageInstancePrivacyLevel {
    return this.rawData.privacy_level;
  }

  /**
   * Indicates whether Stage Discovery is disabled for this Stage instance.
   *
   * If true, the Stage will not appear in the Stage Discovery section of Discord.
   *
   * @returns True if discovery is disabled, false otherwise
   */
  get discoverableDisabled(): boolean {
    return this.rawData.discoverable_disabled;
  }

  /**
   * Gets the ID of the guild scheduled event associated with this Stage instance.
   *
   * This links a scheduled event to this Stage instance, allowing users to RSVP
   * and be notified when the Stage starts.
   *
   * @returns The scheduled event's ID, or null if there is no associated event
   */
  get guildScheduledEventId(): Snowflake | null {
    return this.rawData.guild_scheduled_event_id;
  }

  /**
   * Updates this Stage instance with new information.
   *
   * This method allows modifying the topic or privacy level of the ongoing Stage.
   *
   * @param options - Options for updating the Stage instance
   * @param reason - Optional audit log reason for the update
   * @returns A promise resolving to the updated StageInstance
   * @throws Error if the Stage instance couldn't be updated
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  async update(
    options: StageUpdateOptions,
    reason?: string,
  ): Promise<StageInstance> {
    const updatedStage = await this.client.rest.stages.updateStage(
      this.channelId,
      options,
      reason,
    );

    this.patch(updatedStage);
    return this;
  }

  /**
   * Ends this Stage instance, reverting the Stage channel back to a normal voice channel.
   *
   * This is equivalent to clicking the "End Stage" button in Discord's UI.
   *
   * @param reason - Optional audit log reason for ending the Stage
   * @returns A promise resolving when the Stage has been ended
   * @throws Error if the Stage instance couldn't be ended
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  async end(reason?: string): Promise<void> {
    await this.client.rest.stages.endStage(this.channelId, reason);
    this.uncache();
  }

  /**
   * Refreshes this Stage instance's data from the API.
   *
   * @returns A promise resolving to the updated StageInstance
   * @throws Error if the Stage instance couldn't be fetched
   */
  async refresh(): Promise<StageInstance> {
    const stageData = await this.client.rest.stages.fetchStage(this.channelId);
    this.patch(stageData);
    return this;
  }

  /**
   * Sets a new topic for this Stage instance.
   *
   * This is a convenience method that updates just the topic.
   *
   * @param topic - The new topic for the Stage (1-120 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated StageInstance
   * @throws Error if the topic couldn't be updated
   */
  setTopic(topic: string, reason?: string): Promise<StageInstance> {
    return this.update({ topic }, reason);
  }

  /**
   * Sets a new privacy level for this Stage instance.
   *
   * This is a convenience method that updates just the privacy level.
   *
   * @param privacyLevel - The new privacy level for the Stage
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated StageInstance
   * @throws Error if the privacy level couldn't be updated
   */
  setPrivacyLevel(
    privacyLevel: StageInstancePrivacyLevel,
    reason?: string,
  ): Promise<StageInstance> {
    return this.update({ privacy_level: privacyLevel }, reason);
  }

  /**
   * Checks if this Stage instance is associated with a scheduled event.
   *
   * @returns True if there is an associated scheduled event, false otherwise
   */
  hasScheduledEvent(): boolean {
    return this.guildScheduledEventId !== null;
  }
}
