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
  /** Event is scheduled for the future (1) */
  Scheduled = 1,

  /** Event is currently ongoing (2) */
  Active = 2,

  /** Event has ended (3) - Once set to Completed, the status can no longer be updated */
  Completed = 3,

  /** Event was canceled (4) - Once set to Canceled, the status can no longer be updated */
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
export interface GuildScheduledEventRecurrenceRuleNWeekdayEntity {
  /**
   * The week to reoccur on (1-5)
   */
  n: number;

  /**
   * The day within the week to reoccur on
   * Represents which day of the week the event should occur on
   */
  day: GuildScheduledEventRecurrenceRuleWeekday;
}

/**
 * Represents the recurrence rule for a guild scheduled event.
 * Defines how often an event repeats and when the repetition starts and ends.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object}
 */
export interface GuildScheduledEventRecurrenceRuleEntity {
  /**
   * Starting time of the recurrence interval
   */
  start: string;

  /**
   * Ending time of the recurrence interval
   */
  end: string | null;

  /**
   * How often the event occurs
   * Determines the base unit of time between occurrences (daily, weekly, monthly, or yearly)
   */
  frequency: GuildScheduledEventRecurrenceRuleFrequency;

  /**
   * The spacing between events, defined by frequency
   * For example, frequency of WEEKLY and interval of 2 would be "every-other week"
   */
  interval: number;

  /**
   * Set of specific days within a week for the event to recur on
   * Only valid for daily and weekly events with specific restrictions
   * For daily events: Must be a "known set" like Monday-Friday, Tuesday-Saturday, etc.
   * For weekly events: Can only contain a single day
   */
  by_weekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;

  /**
   * List of specific days within a specific week (1-5) to recur on
   * For example, "the third Wednesday of each month"
   */
  by_n_weekday: GuildScheduledEventRecurrenceRuleNWeekdayEntity[] | null;

  /**
   * Set of specific months to recur on
   * Only valid for yearly events and must be used with by_month_day
   */
  by_month: GuildScheduledEventRecurrenceRuleMonth[] | null;

  /**
   * Set of specific dates within a month to recur on
   * Only valid for yearly events and must be used with by_month
   */
  by_month_day: number[] | null;

  /**
   * Set of days within a year to recur on (1-364)
   * Cannot currently be set externally
   */
  by_year_day: number[] | null;

  /**
   * The total number of times the event is allowed to recur before stopping
   * Cannot currently be set externally
   */
  count: number | null;
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
export interface GuildScheduledEventEntityMetadataEntity {
  /**
   * Location of the event (1-100 characters)
   * Required for events with entity_type EXTERNAL
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
   * The id of the scheduled event
   * Unique identifier for this scheduled event
   */
  id: Snowflake;

  /**
   * The guild id which the scheduled event belongs to
   * Identifies which guild this event is associated with
   */
  guild_id: Snowflake;

  /**
   * The channel id in which the scheduled event will be hosted,
   * or null if entity_type is EXTERNAL
   * Required and must be non-null for STAGE_INSTANCE and VOICE events
   * Required to be null for EXTERNAL events
   */
  channel_id?: Snowflake | null;

  /**
   * The id of the user that created the scheduled event
   * May be null for events created before October 25th, 2021
   */
  creator_id?: Snowflake | null;

  /**
   * The name of the scheduled event (1-100 characters)
   */
  name: string;

  /**
   * The description of the scheduled event (1-1000 characters)
   */
  description?: string | null;

  /**
   * The time the scheduled event will start
   */
  scheduled_start_time: string;

  /**
   * The time the scheduled event will end, required if entity_type is EXTERNAL
   */
  scheduled_end_time?: string | null;

  /**
   * The privacy level of the scheduled event
   * Currently only supports GuildOnly (2)
   */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /**
   * The status of the scheduled event
   * Indicates whether the event is scheduled, active, completed, or canceled
   */
  status: GuildScheduledEventStatus;

  /**
   * The type of the scheduled event
   * Determines whether the event is in a stage channel, voice channel, or external location
   */
  entity_type: GuildScheduledEventType;

  /**
   * The id of an entity associated with a guild scheduled event
   * Use depends on the entity_type
   */
  entity_id: Snowflake | null;

  /**
   * Additional metadata for the guild scheduled event
   * Required for EXTERNAL events, must be null for other event types
   */
  entity_metadata: GuildScheduledEventEntityMetadataEntity | null;

  /**
   * The user that created the scheduled event
   * Full user object containing creator information
   */
  creator?: UserEntity;

  /**
   * The number of users subscribed to the scheduled event
   * Count of users who have registered interest in the event
   */
  user_count?: number;

  /**
   * The cover image hash of the scheduled event
   * Used to display a cover image for the event
   */
  image?: string | null;

  /**
   * The definition for how often this event should recur
   * Contains rules for recurring events (null for one-time events)
   */
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity | null;
}
