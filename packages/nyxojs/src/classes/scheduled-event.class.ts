import {
  type GuildScheduledEventEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
} from "@nyxojs/core";
import type { EventUpdateOptions, EventUsersFetchParams } from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, Promisable, PropsToCamel } from "../types/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Guild Scheduled Event, providing methods to interact with and manage server events.
 *
 * The ScheduledEvent class serves as a comprehensive wrapper around Discord's Guild Scheduled Event API, offering:
 * - Access to event information (name, description, time, location, etc.)
 * - Methods to update, cancel, or complete events
 * - User subscription management and status tracking
 * - Support for various event types (voice, stage, external)
 * - Recurrence rule management for repeating events
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event}
 */
@Cacheable("scheduledEvents")
export class ScheduledEvent
  extends BaseClass<GuildScheduledEventEntity>
  implements Enforce<PropsToCamel<GuildScheduledEventEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this scheduled event.
   *
   * This ID is used for API operations and remains constant for the lifetime of the event.
   *
   * @returns The event's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the ID of the guild this scheduled event belongs to.
   *
   * This identifies which server the event is taking place in.
   *
   * @returns The guild's ID as a Snowflake string
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the ID of the channel this scheduled event will be hosted in, if applicable.
   *
   * This is only present for STAGE_INSTANCE (1) and VOICE (2) event types,
   * and will be null for EXTERNAL (3) events.
   *
   * @returns The channel's ID as a Snowflake string, or null for external events
   */
  readonly channelId = this.rawData.channel_id;

  /**
   * Gets the ID of the user that created this scheduled event.
   *
   * @returns The creator's user ID, or null if not available
   */
  readonly creatorId = this.rawData.creator_id;

  /**
   * Gets the name of this scheduled event.
   *
   * This is the title displayed for the event in Discord (1-100 characters).
   *
   * @returns The event name as a string
   */
  readonly name = this.rawData.name;

  /**
   * Gets the description of this scheduled event.
   *
   * This provides additional details about the event (1-1000 characters).
   *
   * @returns The event description, or null if not set
   */
  readonly description = this.rawData.description;

  /**
   * Gets the scheduled start time of this event.
   *
   * @returns The start time as an ISO8601 timestamp string
   */
  readonly scheduledStartTime = this.rawData.scheduled_start_time;

  /**
   * Gets the scheduled end time of this event.
   *
   * This is required for EXTERNAL (3) events and optional for others.
   *
   * @returns The end time as an ISO8601 timestamp string, or null if not set
   */
  readonly scheduledEndTime = this.rawData.scheduled_end_time;

  /**
   * Gets the privacy level of this scheduled event.
   *
   * Currently, only GUILD_ONLY (2) is supported, meaning the event is only
   * visible to members of the guild.
   *
   * @returns The privacy level enum value
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
   */
  readonly privacyLevel = this.rawData.privacy_level;

  /**
   * Gets the current status of this scheduled event.
   *
   * The status indicates whether the event is scheduled, active, completed, or canceled.
   *
   * @returns The status enum value
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
   */
  readonly status = this.rawData.status;

  /**
   * Gets the entity type of this scheduled event.
   *
   * The entity type determines the location and requirements for the event:
   * - STAGE_INSTANCE (1): Event takes place in a stage channel
   * - VOICE (2): Event takes place in a voice channel
   * - EXTERNAL (3): Event takes place at an external location
   *
   * @returns The entity type enum value
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
   */
  readonly entityType = this.rawData.entity_type;

  /**
   * Gets the ID of an entity associated with the event.
   *
   * Currently unused and always null, reserved for future use.
   *
   * @returns The entity ID, or null
   */
  readonly entityId = this.rawData.entity_id;

  /**
   * Gets additional metadata for the scheduled event.
   *
   * For EXTERNAL (3) events, this contains the location field.
   * For STAGE_INSTANCE (1) and VOICE (2) events, this is null.
   *
   * @returns The entity metadata, or null if not applicable
   */
  readonly entityMetadata = this.rawData.entity_metadata;

  /**
   * Gets the user that created this scheduled event.
   *
   * This is the full user object of the event creator.
   *
   * @returns The creator's User object, or undefined if not available
   */
  readonly creator = this.rawData.creator
    ? new User(this.client, this.rawData.creator)
    : undefined;

  /**
   * Gets the number of users subscribed to this scheduled event.
   *
   * This is the count of users who have registered interest in attending.
   *
   * @returns The user count, or undefined if not available
   */
  readonly userCount = this.rawData.user_count;

  /**
   * Gets the cover image hash of this scheduled event.
   *
   * This is the image displayed for the event in Discord.
   *
   * @returns The image hash, or null if not set
   */
  readonly image = this.rawData.image;

  /**
   * Gets the recurrence rule for this scheduled event.
   *
   * If present, this defines the pattern for event recurrence
   * (weekly, monthly, etc.).
   *
   * @returns The recurrence rule, or null if the event doesn't repeat
   */
  readonly recurrenceRule = this.rawData.recurrence_rule;

  /**
   * Gets the Date object representing the scheduled start time.
   *
   * @returns A Date object for the start time
   */
  get startDate(): Date {
    return new Date(this.scheduledStartTime);
  }

  /**
   * Gets the Date object representing the scheduled end time.
   *
   * @returns A Date object for the end time, or null if not set
   */
  get endDate(): Date | null {
    return this.scheduledEndTime ? new Date(this.scheduledEndTime) : null;
  }

  /**
   * Gets the location of this event.
   *
   * For EXTERNAL (3) events, this returns the location string.
   * For STAGE_INSTANCE (1) and VOICE (2) events, this returns a display string
   * indicating the channel name.
   *
   * @returns The location as a string, or null if not available
   */
  get location(): string | null {
    if (this.entityType === GuildScheduledEventType.External) {
      return this.entityMetadata?.location ?? null;
    }

    // For channel-based events, we'd ideally return the channel name,
    // but that would require fetching the channel. For simplicity:
    return this.channelId ? `Channel: ${this.channelId}` : null;
  }

  /**
   * Indicates whether this scheduled event is currently active.
   *
   * @returns True if the event status is ACTIVE, false otherwise
   */
  get isActive(): boolean {
    return this.status === GuildScheduledEventStatus.Active;
  }

  /**
   * Indicates whether this scheduled event is scheduled for the future.
   *
   * @returns True if the event status is SCHEDULED, false otherwise
   */
  get isScheduled(): boolean {
    return this.status === GuildScheduledEventStatus.Scheduled;
  }

  /**
   * Indicates whether this scheduled event has been completed.
   *
   * @returns True if the event status is COMPLETED, false otherwise
   */
  get isCompleted(): boolean {
    return this.status === GuildScheduledEventStatus.Completed;
  }

  /**
   * Indicates whether this scheduled event has been canceled.
   *
   * @returns True if the event status is CANCELED, false otherwise
   */
  get isCanceled(): boolean {
    return this.status === GuildScheduledEventStatus.Canceled;
  }

  /**
   * Indicates whether this scheduled event has a recurrence rule set.
   *
   * @returns True if the event has a recurrence rule, false otherwise
   */
  get isRecurring(): boolean {
    return this.recurrenceRule !== null && this.recurrenceRule !== undefined;
  }

  /**
   * Gets the time remaining until this event starts.
   *
   * @returns The time in milliseconds until the event starts,
   *          or 0 if the event has already started
   */
  get timeUntilStart(): number {
    const now = new Date();
    const start = new Date(this.scheduledStartTime);

    return Math.max(0, start.getTime() - now.getTime());
  }

  /**
   * Gets the time remaining until this event ends.
   *
   * @returns The time in milliseconds until the event ends,
   *          or 0 if the event has already ended or has no end time
   */
  get timeUntilEnd(): number {
    if (!this.scheduledEndTime) {
      return 0;
    }

    const now = new Date();
    const end = new Date(this.scheduledEndTime);

    return Math.max(0, end.getTime() - now.getTime());
  }

  /**
   * Gets the duration of this event in milliseconds.
   *
   * @returns The duration in milliseconds, or 0 if no end time is set
   */
  get duration(): number {
    if (!this.scheduledEndTime) {
      return 0;
    }

    const start = new Date(this.scheduledStartTime);
    const end = new Date(this.scheduledEndTime);

    return end.getTime() - start.getTime();
  }

  /**
   * Updates this scheduled event with new information.
   *
   * This method allows modifying various aspects of the event,
   * such as its name, description, time, location, and status.
   *
   * @param options - Options for updating the scheduled event
   * @param reason - Optional audit log reason for the update
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the event couldn't be updated
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  async update(
    options: EventUpdateOptions,
    reason?: string,
  ): Promise<ScheduledEvent> {
    const updatedEvent = await this.client.rest.scheduledEvents.updateEvent(
      this.guildId,
      this.id,
      options,
      reason,
    );

    this.patch(updatedEvent);
    return this;
  }

  /**
   * Deletes this scheduled event.
   *
   * This permanently removes the event from the guild.
   *
   * @returns A promise resolving when the deletion is complete
   * @throws Error if the event couldn't be deleted
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  async delete(): Promise<void> {
    await this.client.rest.scheduledEvents.deleteEvent(this.guildId, this.id);
    this.uncache();
  }

  /**
   * Starts this scheduled event.
   *
   * This changes the event's status to ACTIVE, indicating that it has begun.
   *
   * @param reason - Optional audit log reason for starting the event
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the event couldn't be started
   */
  start(reason?: string): Promise<ScheduledEvent> {
    if (this.status !== GuildScheduledEventStatus.Scheduled) {
      throw new Error("Event must be in SCHEDULED status to be started");
    }

    return this.update({ status: GuildScheduledEventStatus.Active }, reason);
  }

  /**
   * Completes this scheduled event.
   *
   * This changes the event's status to COMPLETED, indicating that it has ended.
   *
   * @param reason - Optional audit log reason for completing the event
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the event couldn't be completed
   */
  complete(reason?: string): Promisable<ScheduledEvent> {
    if (this.status === GuildScheduledEventStatus.Completed) {
      return this;
    }

    return this.update({ status: GuildScheduledEventStatus.Completed }, reason);
  }

  /**
   * Cancels this scheduled event.
   *
   * This changes the event's status to CANCELED, removing it from the active events list.
   *
   * @param reason - Optional audit log reason for canceling the event
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the event couldn't be canceled
   */
  cancel(reason?: string): Promisable<ScheduledEvent> {
    if (this.status === GuildScheduledEventStatus.Canceled) {
      return this;
    }

    return this.update(
      { status: GuildScheduledEventStatus.Canceled },
      reason || "Event canceled",
    );
  }

  /**
   * Fetches the users who are interested in this scheduled event.
   *
   * @param options - Optional query parameters for pagination and member data
   * @returns A promise resolving to an array of user entities
   * @throws Error if the users couldn't be fetched
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  async fetchUsers(options?: EventUsersFetchParams): Promise<User[]> {
    const users = await this.client.rest.scheduledEvents.fetchEventUsers(
      this.guildId,
      this.id,
      options,
    );

    return users.map((eventUser) => new User(this.client, eventUser.user));
  }

  /**
   * Refreshes this scheduled event's data from the API.
   *
   * @param withUserCount - Whether to include the user count in the response
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the event couldn't be fetched
   */
  async refresh(withUserCount = true): Promise<ScheduledEvent> {
    const eventData = await this.client.rest.scheduledEvents.fetchGuildEvent(
      this.guildId,
      this.id,
      withUserCount,
    );

    this.patch(eventData);
    return this;
  }

  /**
   * Sets a new name for this scheduled event.
   *
   * @param name - The new name for the event (1-100 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the name couldn't be updated
   */
  setName(name: string, reason?: string): Promise<ScheduledEvent> {
    return this.update({ name }, reason);
  }

  /**
   * Sets a new description for this scheduled event.
   *
   * @param description - The new description for the event (1-1000 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the description couldn't be updated
   */
  setDescription(
    description: string,
    reason?: string,
  ): Promise<ScheduledEvent> {
    return this.update({ description }, reason);
  }

  /**
   * Changes the start time of this scheduled event.
   *
   * @param startTime - The new start time as a Date object or ISO8601 string
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the start time couldn't be updated
   */
  setStartTime(
    startTime: Date | string,
    reason?: string,
  ): Promise<ScheduledEvent> {
    const scheduledStartTime =
      typeof startTime === "string" ? startTime : startTime.toISOString();

    return this.update({ scheduled_start_time: scheduledStartTime }, reason);
  }

  /**
   * Changes the end time of this scheduled event.
   *
   * @param endTime - The new end time as a Date object or ISO8601 string
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the end time couldn't be updated
   */
  setEndTime(endTime: Date | string, reason?: string): Promise<ScheduledEvent> {
    const scheduledEndTime =
      typeof endTime === "string" ? endTime : endTime.toISOString();

    return this.update({ scheduled_end_time: scheduledEndTime }, reason);
  }

  /**
   * Changes the location of this scheduled event.
   *
   * This only applies to EXTERNAL (3) events, and will update the
   * entity_metadata.location field.
   *
   * @param location - The new location for the event (1-100 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated ScheduledEvent
   * @throws Error if the location couldn't be updated or the event is not external
   */
  setLocation(location: string, reason?: string): Promise<ScheduledEvent> {
    if (this.entityType !== GuildScheduledEventType.External) {
      throw new Error("Location can only be set for external events");
    }

    return this.update({ entity_metadata: { location } }, reason);
  }

  /**
   * Checks if this event happens in a stage channel.
   *
   * @returns True if the entity type is STAGE_INSTANCE, false otherwise
   */
  isStageEvent(): boolean {
    return this.entityType === GuildScheduledEventType.StageInstance;
  }

  /**
   * Checks if this event happens in a voice channel.
   *
   * @returns True if the entity type is VOICE, false otherwise
   */
  isVoiceEvent(): boolean {
    return this.entityType === GuildScheduledEventType.Voice;
  }

  /**
   * Checks if this event happens at an external location.
   *
   * @returns True if the entity type is EXTERNAL, false otherwise
   */
  isExternalEvent(): boolean {
    return this.entityType === GuildScheduledEventType.External;
  }

  /**
   * Checks if the scheduled start time is in the past.
   *
   * @returns True if the start time is in the past, false otherwise
   */
  hasStarted(): boolean {
    return new Date(this.scheduledStartTime) < new Date();
  }

  /**
   * Checks if the scheduled end time is in the past.
   *
   * @returns True if the end time is in the past, false otherwise,
   *          or false if no end time is set
   */
  hasEnded(): boolean {
    if (!this.scheduledEndTime) {
      return false;
    }
    return new Date(this.scheduledEndTime) < new Date();
  }
}
