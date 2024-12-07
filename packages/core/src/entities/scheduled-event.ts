import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

/**
 * Represents the months that can be used in event recurrence rules.
 *
 * @remarks
 * Used to specify months in which an event should recur.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
 */
export enum GuildScheduledEventRecurrenceRuleMonth {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

/**
 * Represents a specific day within a specific week of a month for recurrence rules.
 *
 * @remarks
 * Used to specify events that occur on a particular week and day (e.g., "first Monday").
 *
 * @example
 * ```typescript
 * const nWeekday: GuildScheduledEventRecurrenceRuleNWeekdayEntity = {
 *   n: 1, // First
 *   day: GuildScheduledEventRecurrenceRuleWeekday.Monday
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export interface GuildScheduledEventRecurrenceRuleNWeekdayEntity {
  /** The week to reoccur on (1-5) */
  n: 1 | 2 | 3 | 4 | 5;
  /** The day within the week to reoccur on */
  day: GuildScheduledEventRecurrenceRuleWeekday;
}

/**
 * Represents days of the week that can be used in recurrence rules.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
 */
export enum GuildScheduledEventRecurrenceRuleWeekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

/**
 * Represents how frequently a scheduled event recurs.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
 */
export enum GuildScheduledEventRecurrenceRuleFrequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
}

/**
 * Represents rules for how an event should recur.
 *
 * @remarks
 * Based on a subset of iCalendar RFC behaviors. Has specific limitations on combinations of fields
 * and values that can be used. See Discord documentation for details on these limitations.
 *
 * @example
 * ```typescript
 * // Every weekday
 * const rule: GuildScheduledEventRecurrenceRuleEntity = {
 *   start: "2024-01-01T10:00:00Z",
 *   end: null,
 *   frequency: GuildScheduledEventRecurrenceRuleFrequency.Daily,
 *   interval: 1,
 *   by_weekday: [0, 1, 2, 3, 4],
 *   by_n_weekday: null,
 *   by_month: null,
 *   by_month_day: null,
 *   by_year_day: null,
 *   count: null
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure}
 */
export interface GuildScheduledEventRecurrenceRuleEntity {
  /** Starting time of the recurrence interval */
  start: Iso8601;
  /** Ending time of the recurrence interval */
  end: Iso8601 | null;
  /** How often the event occurs */
  frequency: GuildScheduledEventRecurrenceRuleFrequency;
  /** The spacing between events defined by frequency */
  interval: Integer;
  /** Set of specific days within a week for the event to recur on */
  by_weekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;
  /** List of specific days within a specific week to recur on */
  by_n_weekday: GuildScheduledEventRecurrenceRuleNWeekdayEntity[] | null;
  /** Set of specific months to recur on */
  by_month: GuildScheduledEventRecurrenceRuleMonth[] | null;
  /** Set of specific dates within a month to recur on */
  by_month_day: Integer[] | null;
  /** Set of days within a year to recur on (1-364) */
  by_year_day: Integer[] | null;
  /** Total number of times the event should recur */
  count: Integer | null;
}

/**
 * Represents a user who is subscribed to a guild scheduled event.
 *
 * @example
 * ```typescript
 * const eventUser: GuildScheduledEventUserEntity = {
 *   guild_scheduled_event_id: "123456789",
 *   user: { id: "987654321", username: "Example User" },
 *   member: { nickname: "Example" }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure}
 */
export interface GuildScheduledEventUserEntity {
  /** ID of the scheduled event the user subscribed to */
  guild_scheduled_event_id: Snowflake;
  /** The user who subscribed to the event */
  user: UserEntity;
  /** Guild member data for the user in the event's guild */
  member?: GuildMemberEntity;
}

/**
 * Represents metadata for an external scheduled event.
 *
 * @remarks
 * Required for external events, must be null for non-external events.
 * Location field is required for external events.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
 */
export interface GuildScheduledEventEntityMetadata {
  /** Location of the event (1-100 characters) */
  location?: string;
}

/**
 * Represents the status of a scheduled event.
 *
 * @remarks
 * Once status is set to COMPLETED or CANCELED, it cannot be changed.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
 */
export enum GuildScheduledEventStatus {
  /** Event is scheduled */
  Scheduled = 1,
  /** Event is active */
  Active = 2,
  /** Event has ended */
  Completed = 3,
  /** Event was canceled */
  Canceled = 4,
}

/**
 * Represents the type of scheduled event.
 *
 * @remarks
 * Different types have different requirements for channel_id, entity_metadata,
 * and scheduled_end_time fields.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
 */
export enum GuildScheduledEventType {
  /** Stage instance event */
  StageInstance = 1,
  /** Voice event */
  Voice = 2,
  /** External event */
  External = 3,
}

/**
 * Represents the privacy level of a scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
 */
export enum GuildScheduledEventPrivacyLevel {
  /** Event is only accessible to guild members */
  GuildOnly = 2,
}

/**
 * Represents a scheduled event in a guild.
 *
 * @remarks
 * Guild scheduled events are occurrences that take place within a guild at a scheduled time.
 * They can be stage instances, voice events, or external events. Events have automatic status
 * updates based on certain conditions like user activity.
 *
 * @example
 * ```typescript
 * const event: GuildScheduledEventEntity = {
 *   id: "123456789",
 *   guild_id: "987654321",
 *   name: "Community Meeting",
 *   description: "Monthly community gathering",
 *   scheduled_start_time: "2024-01-01T15:00:00Z",
 *   privacy_level: GuildScheduledEventPrivacyLevel.GuildOnly,
 *   status: GuildScheduledEventStatus.Scheduled,
 *   entity_type: GuildScheduledEventType.StageInstance
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
 */
export interface GuildScheduledEventEntity {
  /** ID of the scheduled event */
  id: Snowflake;
  /** ID of the guild the event belongs to */
  guild_id: Snowflake;
  /** Channel ID where the event will be hosted */
  channel_id?: Snowflake | null;
  /** ID of the user that created the event */
  creator_id?: Snowflake | null;
  /** Name of the event (1-100 characters) */
  name: string;
  /** Description of the event (1-1000 characters) */
  description?: string | null;
  /** Time the event starts */
  scheduled_start_time: Iso8601;
  /** Time the event ends (required for external events) */
  scheduled_end_time?: Iso8601 | null;
  /** Privacy level of the event */
  privacy_level: GuildScheduledEventPrivacyLevel;
  /** Status of the event */
  status: GuildScheduledEventStatus;
  /** Type of the event */
  entity_type: GuildScheduledEventType;
  /** ID of the event entity */
  entity_id: Snowflake | null;
  /** Additional metadata for the event */
  entity_metadata?: GuildScheduledEventEntityMetadata | null;
  /** User that created the event */
  creator?: UserEntity;
  /** Number of users subscribed to the event */
  user_count?: Integer;
  /** Cover image hash of the event */
  image?: string | null;
  /** Rules for how the event recurs */
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity | null;
}
