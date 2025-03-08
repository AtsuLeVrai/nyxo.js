import type { Snowflake } from "../managers/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the months for recurring scheduled events.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
 */
export enum GuildScheduledEventRecurrenceRuleMonth {
  /** January (1) */
  January = 1,

  /** February (2) */
  February = 2,

  /** March (3) */
  March = 3,

  /** April (4) */
  April = 4,

  /** May (5) */
  May = 5,

  /** June (6) */
  June = 6,

  /** July (7) */
  July = 7,

  /** August (8) */
  August = 8,

  /** September (9) */
  September = 9,

  /** October (10) */
  October = 10,

  /** November (11) */
  November = 11,

  /** December (12) */
  December = 12,
}

/**
 * Represents the days of the week for recurring scheduled events.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
 */
export enum GuildScheduledEventRecurrenceRuleWeekday {
  /** Monday (0) */
  Monday = 0,

  /** Tuesday (1) */
  Tuesday = 1,

  /** Wednesday (2) */
  Wednesday = 2,

  /** Thursday (3) */
  Thursday = 3,

  /** Friday (4) */
  Friday = 4,

  /** Saturday (5) */
  Saturday = 5,

  /** Sunday (6) */
  Sunday = 6,
}

/**
 * Represents how often a scheduled event occurs.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
 */
export enum GuildScheduledEventRecurrenceRuleFrequency {
  /** Yearly recurrence (0) */
  Yearly = 0,

  /** Monthly recurrence (1) */
  Monthly = 1,

  /** Weekly recurrence (2) */
  Weekly = 2,

  /** Daily recurrence (3) */
  Daily = 3,
}

/**
 * Represents the possible statuses of a guild scheduled event.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
 */
export enum GuildScheduledEventStatus {
  /** Event is scheduled for the future (1) */
  Scheduled = 1,

  /** Event is currently ongoing (2) */
  Active = 2,

  /** Event has ended (3) */
  Completed = 3,

  /** Event was canceled (4) */
  Canceled = 4,
}

/**
 * Represents the different types of entities that can be associated with a guild scheduled event.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
 */
export enum GuildScheduledEventType {
  /** Event takes place in a stage channel (1) */
  StageInstance = 1,

  /** Event takes place in a voice channel (2) */
  Voice = 2,

  /** Event takes place at an external location (3) */
  External = 3,
}

/**
 * Represents the privacy level of a guild scheduled event.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
 */
export enum GuildScheduledEventPrivacyLevel {
  /** The scheduled event is only accessible to guild members (2) */
  GuildOnly = 2,
}

/**
 * Represents a specific week day within a specific week for recurrence rules.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export interface GuildScheduledEventRecurrenceRuleWeekdayEntity {
  /** The week to reoccur on (1-5) */
  n: number;

  /** The day within the week to reoccur on */
  day: GuildScheduledEventRecurrenceRuleWeekday;
}

/**
 * Represents the recurrence rule for a guild scheduled event.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure}
 */
export interface GuildScheduledEventRecurrenceRuleEntity {
  /** Starting time of the recurrence interval */
  start: string;

  /** Ending time of the recurrence interval */
  end: string | null;

  /** How often the event occurs */
  frequency: GuildScheduledEventRecurrenceRuleFrequency;

  /** The spacing between events, defined by frequency */
  interval: number;

  /** Set of specific days within a week for the event to recur on */
  by_weekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;

  /** List of specific days within a specific week (1-5) to recur on */
  by_n_weekday: GuildScheduledEventRecurrenceRuleWeekdayEntity[] | null;

  /** Set of specific months to recur on */
  by_month: GuildScheduledEventRecurrenceRuleMonth[] | null;

  /** Set of specific dates within a month to recur on */
  by_month_day: number[] | null;

  /** Set of days within a year to recur on (1-364) */
  by_year_day: number[] | null;

  /** The total number of times the event is allowed to recur before stopping */
  count: number | null;
}

/**
 * Represents a user who has subscribed to a guild scheduled event.
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure}
 */
export interface GuildScheduledEventUserEntity {
  /** The scheduled event id which the user subscribed to */
  guild_scheduled_event_id: Snowflake;

  /** User which subscribed to an event */
  user: UserEntity;

  /** Guild member data for this user for the guild which this event belongs to, if any */
  member?: GuildMemberEntity;
}

/**
 * Represents additional metadata for a guild scheduled event entity.
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
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
 */
export interface GuildScheduledEventEntity {
  /** The id of the scheduled event */
  id: Snowflake;

  /** The guild id which the scheduled event belongs to */
  guild_id: Snowflake;

  /**
   * The channel id in which the scheduled event will be hosted,
   * or null if entity_type is EXTERNAL
   */
  channel_id?: Snowflake | null;

  /**
   * The id of the user that created the scheduled event
   * May be null for events created before October 25th, 2021
   */
  creator_id?: Snowflake | null;

  /** The name of the scheduled event (1-100 characters) */
  name: string;

  /** The description of the scheduled event (1-1000 characters) */
  description?: string | null;

  /** The time the scheduled event will start */
  scheduled_start_time: string;

  /** The time the scheduled event will end, required if entity_type is EXTERNAL */
  scheduled_end_time?: string | null;

  /** The privacy level of the scheduled event */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /** The status of the scheduled event */
  status: GuildScheduledEventStatus;

  /** The type of the scheduled event */
  entity_type: GuildScheduledEventType;

  /** The id of an entity associated with a guild scheduled event */
  entity_id: Snowflake | null;

  /** Additional metadata for the guild scheduled event */
  entity_metadata: GuildScheduledEventEntityMetadataEntity | null;

  /** The user that created the scheduled event */
  creator?: UserEntity;

  /** The number of users subscribed to the scheduled event */
  user_count?: number;

  /** The cover image hash of the scheduled event */
  image?: string | null;

  /** The definition for how often this event should recur */
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity | null;
}
