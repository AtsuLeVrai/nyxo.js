import type { Snowflake } from "../markdown/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the months for recurring scheduled events.
 * Each month is assigned a numeric value (1-12) corresponding to its calendar position.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
 */
export enum GuildScheduledEventRecurrenceRuleMonth {
  /** January (1) - First month of the year */
  January = 1,

  /** February (2) - Second month of the year */
  February = 2,

  /** March (3) - Third month of the year */
  March = 3,

  /** April (4) - Fourth month of the year */
  April = 4,

  /** May (5) - Fifth month of the year */
  May = 5,

  /** June (6) - Sixth month of the year */
  June = 6,

  /** July (7) - Seventh month of the year */
  July = 7,

  /** August (8) - Eighth month of the year */
  August = 8,

  /** September (9) - Ninth month of the year */
  September = 9,

  /** October (10) - Tenth month of the year */
  October = 10,

  /** November (11) - Eleventh month of the year */
  November = 11,

  /** December (12) - Twelfth month of the year */
  December = 12,
}

/**
 * Represents the days of the week for recurring scheduled events.
 * Each day is assigned a numeric value (0-6) with Monday as 0 and Sunday as 6.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
 */
export enum GuildScheduledEventRecurrenceRuleWeekday {
  /** Monday (0) - First day of the week */
  Monday = 0,

  /** Tuesday (1) - Second day of the week */
  Tuesday = 1,

  /** Wednesday (2) - Third day of the week */
  Wednesday = 2,

  /** Thursday (3) - Fourth day of the week */
  Thursday = 3,

  /** Friday (4) - Fifth day of the week */
  Friday = 4,

  /** Saturday (5) - Sixth day of the week */
  Saturday = 5,

  /** Sunday (6) - Seventh day of the week */
  Sunday = 6,
}

/**
 * Represents how often a scheduled event recurs.
 * Frequencies range from yearly to daily, with increasing frequency values.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
 */
export enum GuildScheduledEventRecurrenceRuleFrequency {
  /** Yearly recurrence (0) - Event occurs once per year */
  Yearly = 0,

  /** Monthly recurrence (1) - Event occurs once per month */
  Monthly = 1,

  /** Weekly recurrence (2) - Event occurs once per week */
  Weekly = 2,

  /** Daily recurrence (3) - Event occurs once per day */
  Daily = 3,
}

/**
 * Represents the possible statuses of a guild scheduled event.
 * The status indicates the current state of the event (scheduled, active, completed, or canceled).
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
 */
export enum GuildScheduledEventStatus {
  /** Event is scheduled (1) */
  Scheduled = 1,

  /** Event is active (2) */
  Active = 2,

  /** Event has been completed (3) */
  Completed = 3,

  /** Event has been canceled (4) */
  Canceled = 4,
}

/**
 * Represents the different types of entities that can be associated with a guild scheduled event.
 * The entity type determines the location and requirements for the event.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
 */
export enum GuildScheduledEventType {
  /** Event takes place in a stage channel (1) - Requires a channel_id pointing to a stage channel */
  StageInstance = 1,

  /** Event takes place in a voice channel (2) - Requires a channel_id pointing to a voice channel */
  Voice = 2,

  /** Event takes place at an external location (3) - Requires entity_metadata with location and scheduled_end_time */
  External = 3,
}

/**
 * Represents the privacy level of a guild scheduled event.
 * Currently, only guild-only privacy is supported.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
 */
export enum GuildScheduledEventPrivacyLevel {
  /** The scheduled event is only accessible to guild members (2) */
  GuildOnly = 2,
}

/**
 * Represents a specific week day within a specific week for recurrence rules.
 * Used for rules like "the third Wednesday of the month".
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export interface NWeekday {
  /**
   * The week day.
   * 0-6 representing day of week (Sunday = 0, Monday = 1, ..., Saturday = 6)
   */
  day: number;

  /**
   * The position of the week day in the month.
   * 1-5, where 1 represents the first occurrence, and 5 represents the last occurrence.
   * -1 represents the last occurrence regardless of month length.
   */
  week: number;
}

/**
 * Represents the recurrence rule for a guild scheduled event.
 * Defines how often an event repeats and when the repetition starts and ends.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object}
 */
export interface GuildScheduledEventRecurrenceRuleEntity {
  /**
   * The frequency with which the scheduled event repeats.
   * Current only "WEEKLY" or "MONTHLY" are supported.
   */
  frequency: "WEEKLY" | "MONTHLY";

  /**
   * Number of times the scheduled event repeats.
   * If null, the scheduled event will repeat indefinitely.
   * Maximum of 100.
   */
  count?: number | null;

  /**
   * Unix timestamp after which the scheduled event will no longer repeat.
   * Mutually exclusive with count.
   */
  until?: number | null;

  /**
   * Specifies the number of units of time between each recurrence.
   * For example, if frequency is "WEEKLY", an interval of 2 means "every 2 weeks".
   * Must be at least 1 and at most 26.
   */
  interval: number;

  /**
   * Array of days of the week the scheduled event occurs on.
   * Only applicable when frequency is "WEEKLY".
   * Days of the week are represented as integers: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
   * The array cannot be empty, and must not contain duplicate values.
   * Maximum of 7 values.
   */
  week_days?: number[];

  /**
   * Array of days of the month the scheduled event occurs on.
   * Only applicable when frequency is "MONTHLY" and month_week_days is empty.
   * Days of the month are represented as integers, with 1 being the first day of the month,
   * and up to 31 being the last day of the month.
   * -1 represents the last day of the month.
   */
  month_days?: number[];

  /**
   * Array of NWeekday objects representing specific week days in specific weeks of the month.
   * Only applicable when frequency is "MONTHLY" and month_days is empty.
   */
  month_week_days?: NWeekday[];
}

/**
 * Represents a user who has subscribed to a guild scheduled event.
 * Contains information about both the user and their membership in the guild.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object}
 */
export interface GuildScheduledEventUserEntity {
  /**
   * The scheduled event id which the user subscribed to
   * Unique identifier of the event the user is subscribed to
   */
  guild_scheduled_event_id: Snowflake;

  /**
   * User which subscribed to an event
   * Contains user information for the subscriber
   */
  user: UserEntity;

  /**
   * Guild member data for this user for the guild which this event belongs to, if any
   * Optional information about the user's membership in the guild
   */
  member?: GuildMemberEntity;
}

/**
 * Represents additional metadata for a guild scheduled event entity.
 * Currently only contains location information for external events.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
 */
export interface GuildScheduledEventEntityMetadata {
  /**
   * Location of the event (1-100 characters).
   * Required for events of type EXTERNAL.
   */
  location?: string;
}

/**
 * Represents a scheduled event in a guild.
 * Contains all information about an event including its name, time, location, and status.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object}
 */
export interface GuildScheduledEventEntity {
  /**
   * The ID of the scheduled event.
   * Unique identifier for this event.
   */
  id: Snowflake;

  /**
   * The guild ID which the scheduled event belongs to.
   * The server where the event will take place.
   */
  guild_id: Snowflake;

  /**
   * The channel ID in which the scheduled event will be hosted.
   * null if entity_type is EXTERNAL.
   */
  channel_id: Snowflake | null;

  /**
   * The ID of the user that created the scheduled event.
   * User who scheduled this event.
   */
  creator_id?: Snowflake | null;

  /**
   * The name of the scheduled event (1-100 characters).
   * Title or name of the event.
   */
  name: string;

  /**
   * The description of the scheduled event (1-1000 characters).
   * Details about the event.
   */
  description?: string | null;

  /**
   * The time the scheduled event will start.
   * ISO8601 timestamp for when the event begins.
   */
  scheduled_start_time: string;

  /**
   * The time the scheduled event will end, required if entity_type is EXTERNAL.
   * ISO8601 timestamp for when the event ends.
   */
  scheduled_end_time: string | null;

  /**
   * The privacy level of the scheduled event.
   * Determines who can see and access the event.
   */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /**
   * The status of the scheduled event.
   * Current state in the event lifecycle.
   */
  status: GuildScheduledEventStatus;

  /**
   * The type of the scheduled event.
   * Determines the location and requirements for the event.
   */
  entity_type: GuildScheduledEventType;

  /**
   * The ID of an entity associated with the event.
   * Currently unused, reserved for future use.
   */
  entity_id: Snowflake | null;

  /**
   * Additional metadata for the scheduled event.
   * Extra information for external events.
   */
  entity_metadata: GuildScheduledEventEntityMetadata | null;

  /**
   * The user that created the scheduled event.
   * Full user object of the event creator.
   */
  creator?: UserEntity;

  /**
   * The number of users subscribed to the scheduled event.
   * Count of users who have registered interest in attending.
   */
  user_count?: number;

  /**
   * The cover image hash of the scheduled event.
   * Image displayed for this event.
   */
  image?: string | null;

  /**
   * The recurrence rule for the scheduled event.
   * If present, defines the pattern for event recurrence.
   */
  recurrence_rule?: GuildScheduledEventRecurrenceRuleEntity | null;
}
