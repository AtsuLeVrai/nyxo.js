import {
  type GuildScheduledEventEntity,
  type GuildScheduledEventEntityMetadataEntity,
  type GuildScheduledEventPrivacyLevel,
  type GuildScheduledEventRecurrenceRuleEntity,
  type GuildScheduledEventRecurrenceRuleMonth,
  type GuildScheduledEventRecurrenceRuleNWeekdayEntity,
  GuildScheduledEventRecurrenceRuleWeekday,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  type GuildScheduledEventUserEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { GuildMemberAddEntity } from "@nyxjs/gateway";
import { Cdn } from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import { GuildMember } from "./guild.class.js";
import { User } from "./user.class.js";

/**
 * Represents a specific week day within a specific week for recurrence rules.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-n-weekday-structure}
 */
export class GuildScheduledEventRecurrenceRuleNWeekday extends BaseClass<GuildScheduledEventRecurrenceRuleNWeekdayEntity> {
  /**
   * The week to reoccur on (1-5)
   */
  get n(): number {
    return this.data.n;
  }

  /**
   * The day within the week to reoccur on
   */
  get day(): GuildScheduledEventRecurrenceRuleWeekday {
    return this.data.day;
  }

  /**
   * Gets the name of the weekday
   */
  get dayName(): string {
    return GuildScheduledEventRecurrenceRuleWeekday[this.day];
  }

  /**
   * Gets a human-readable string representation of this rule
   */
  get readableValue(): string {
    const weeks = ["first", "second", "third", "fourth", "fifth"];
    return `${weeks[this.n - 1]} ${this.dayName}`;
  }
}

/**
 * Represents the recurrence rule for a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object}
 */
export class GuildScheduledEventRecurrenceRule extends BaseClass<GuildScheduledEventRecurrenceRuleEntity> {
  /**
   * Starting time of the recurrence interval
   */
  get start(): string {
    return this.data.start;
  }

  /**
   * Ending time of the recurrence interval
   */
  get end(): string | null {
    return this.data.end;
  }

  /**
   * How often the event occurs
   */
  get frequency(): GuildScheduledEventRecurrenceRuleWeekday {
    return this.data.frequency;
  }

  /**
   * The spacing between events, defined by frequency
   */
  get interval(): number {
    return this.data.interval;
  }

  /**
   * Set of specific days within a week for the event to recur on
   */
  get byWeekday(): GuildScheduledEventRecurrenceRuleWeekday[] | null {
    return this.data.by_weekday;
  }

  /**
   * List of specific days within a specific week (1-5) to recur on
   */
  get byNWeekday(): GuildScheduledEventRecurrenceRuleNWeekday[] | null {
    if (!this.data.by_n_weekday) {
      return null;
    }

    return this.data.by_n_weekday.map(
      (nwd) => new GuildScheduledEventRecurrenceRuleNWeekday(this.client, nwd),
    );
  }

  /**
   * Set of specific months to recur on
   */
  get byMonth(): GuildScheduledEventRecurrenceRuleMonth[] | null {
    return this.data.by_month;
  }

  /**
   * Set of specific dates within a month to recur on
   */
  get byMonthDay(): number[] | null {
    return this.data.by_month_day;
  }

  /**
   * Set of days within a year to recur on (1-364)
   */
  get byYearDay(): number[] | null {
    return this.data.by_year_day;
  }

  /**
   * The total number of times the event is allowed to recur before stopping
   */
  get count(): number | null {
    return this.data.count;
  }

  /**
   * Start date as a Date object
   */
  get startDate(): Date {
    return new Date(this.start);
  }

  /**
   * End date as a Date object, or null if no end date
   */
  get endDate(): Date | null {
    return this.end ? new Date(this.end) : null;
  }

  /**
   * Whether the recurrence rule has an end date
   */
  get hasEndDate(): boolean {
    return this.end !== null;
  }

  /**
   * Whether the recurrence rule has a count limit
   */
  get hasCountLimit(): boolean {
    return this.count !== null;
  }
}

/**
 * Represents additional metadata for a guild scheduled event entity.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-entity-metadata}
 */
export class GuildScheduledEventEntityMetadata extends BaseClass<GuildScheduledEventEntityMetadataEntity> {
  /**
   * Location of the event (1-100 characters)
   * Required for events with entity_type EXTERNAL
   */
  get location(): string | undefined {
    return this.data.location;
  }

  /**
   * Whether the location is specified
   */
  get hasLocation(): boolean {
    return Boolean(this.location);
  }
}

/**
 * Represents a user who has subscribed to a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object}
 */
export class GuildScheduledEventUser extends BaseClass<GuildScheduledEventUserEntity> {
  /**
   * The scheduled event id which the user subscribed to
   */
  get guildScheduledEventId(): Snowflake {
    return this.data.guild_scheduled_event_id;
  }

  /**
   * User which subscribed to an event
   */
  get user(): User {
    return new User(this.client, this.data.user);
  }

  /**
   * Guild member data for this user for the guild which this event belongs to, if any
   */
  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return new GuildMember(
      this.client,
      this.data.member as GuildMemberAddEntity,
    );
  }

  /**
   * Whether the subscriber has guild member data available
   */
  get hasMemberData(): boolean {
    return Boolean(this.data.member);
  }
}

/**
 * Represents a scheduled event in a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event}
 */
export class GuildScheduledEvent extends BaseClass<GuildScheduledEventEntity> {
  /**
   * The id of the scheduled event
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The guild id which the scheduled event belongs to
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * The channel id in which the scheduled event will be hosted,
   * or null if entity_type is EXTERNAL
   */
  get channelId(): Snowflake | null | undefined {
    return this.data.channel_id;
  }

  /**
   * The id of the user that created the scheduled event
   */
  get creatorId(): Snowflake | null | undefined {
    return this.data.creator_id;
  }

  /**
   * The name of the scheduled event (1-100 characters)
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The description of the scheduled event (1-1000 characters)
   */
  get description(): string | null | undefined {
    return this.data.description;
  }

  /**
   * The time the scheduled event will start
   */
  get scheduledStartTime(): string {
    return this.data.scheduled_start_time;
  }

  /**
   * The time the scheduled event will end, required if entity_type is EXTERNAL
   */
  get scheduledEndTime(): string | null | undefined {
    return this.data.scheduled_end_time;
  }

  /**
   * The privacy level of the scheduled event
   */
  get privacyLevel(): GuildScheduledEventPrivacyLevel {
    return this.data.privacy_level;
  }

  /**
   * The status of the scheduled event
   */
  get status(): GuildScheduledEventStatus {
    return this.data.status;
  }

  /**
   * The type of the scheduled event
   */
  get entityType(): GuildScheduledEventType {
    return this.data.entity_type;
  }

  /**
   * The id of an entity associated with a guild scheduled event
   */
  get entityId(): Snowflake | null {
    return this.data.entity_id;
  }

  /**
   * Additional metadata for the guild scheduled event
   */
  get entityMetadata(): GuildScheduledEventEntityMetadata | null {
    if (!this.data.entity_metadata) {
      return null;
    }

    return new GuildScheduledEventEntityMetadata(
      this.client,
      this.data.entity_metadata,
    );
  }

  /**
   * The user that created the scheduled event
   */
  get creator(): User | undefined {
    if (!this.data.creator) {
      return undefined;
    }

    return new User(this.client, this.data.creator);
  }

  /**
   * The number of users subscribed to the scheduled event
   */
  get userCount(): number {
    return this.data.user_count ?? 0;
  }

  /**
   * The cover image hash of the scheduled event
   */
  get image(): string | null | undefined {
    return this.data.image;
  }

  /**
   * The definition for how often this event should recur
   */
  get recurrenceRule(): GuildScheduledEventRecurrenceRule | null {
    if (!this.data.recurrence_rule) {
      return null;
    }

    return new GuildScheduledEventRecurrenceRule(
      this.client,
      this.data.recurrence_rule,
    );
  }

  /**
   * Whether the event is currently scheduled (not started yet)
   */
  get isScheduled(): boolean {
    return this.status === GuildScheduledEventStatus.Scheduled;
  }

  /**
   * Whether the event is currently active
   */
  get isActive(): boolean {
    return this.status === GuildScheduledEventStatus.Active;
  }

  /**
   * Whether the event has completed
   */
  get isCompleted(): boolean {
    return this.status === GuildScheduledEventStatus.Completed;
  }

  /**
   * Whether the event was canceled
   */
  get isCanceled(): boolean {
    return this.status === GuildScheduledEventStatus.Canceled;
  }

  /**
   * Whether the event is a stage instance event
   */
  get isStageEvent(): boolean {
    return this.entityType === GuildScheduledEventType.StageInstance;
  }

  /**
   * Whether the event is a voice event
   */
  get isVoiceEvent(): boolean {
    return this.entityType === GuildScheduledEventType.Voice;
  }

  /**
   * Whether the event is an external event
   */
  get isExternalEvent(): boolean {
    return this.entityType === GuildScheduledEventType.External;
  }

  /**
   * Whether the event has channel data
   */
  get hasChannel(): boolean {
    return Boolean(this.channelId);
  }

  /**
   * Whether the event has a description
   */
  get hasDescription(): boolean {
    return Boolean(this.description);
  }

  /**
   * Whether the event has a cover image
   */
  get hasImage(): boolean {
    return Boolean(this.image);
  }

  /**
   * Whether the event is recurring
   */
  get isRecurring(): boolean {
    return Boolean(this.recurrenceRule);
  }

  /**
   * Start time as a Date object
   */
  get startDate(): Date {
    return new Date(this.scheduledStartTime);
  }

  /**
   * End time as a Date object, or null if no end time
   */
  get endDate(): Date | null {
    return this.scheduledEndTime ? new Date(this.scheduledEndTime) : null;
  }

  /**
   * The duration of the event in milliseconds, or null if no end time
   */
  get duration(): number | null {
    if (!this.scheduledEndTime) {
      return null;
    }

    return (
      new Date(this.scheduledEndTime).getTime() -
      new Date(this.scheduledStartTime).getTime()
    );
  }

  /**
   * Gets the URL for this event's cover image
   */
  get coverImageUrl(): string | null {
    if (!this.image) {
      return null;
    }

    return Cdn.guildScheduledEventCover(this.id, this.image);
  }

  /**
   * Whether the event has already started (based on current time)
   */
  get hasStarted(): boolean {
    return new Date() >= new Date(this.scheduledStartTime);
  }

  /**
   * Whether the event has already ended (based on current time)
   */
  get hasEnded(): boolean {
    if (!this.scheduledEndTime) {
      return false;
    }

    return new Date() >= new Date(this.scheduledEndTime);
  }

  /**
   * The location of the event if it's an external event, or null otherwise
   */
  get location(): string | null {
    if (!(this.isExternalEvent && this.entityMetadata)) {
      return null;
    }

    return this.entityMetadata.location || null;
  }
}
