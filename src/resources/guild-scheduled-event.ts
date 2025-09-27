import type { FileInput } from "../utils/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserObject } from "./user.js";

/**
 * Privacy levels for guild scheduled events determining visibility and access.
 * Currently Discord only supports guild-only events with no public access.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level} for privacy level specification
 */
export enum GuildScheduledEventPrivacyLevels {
  /** Event is only accessible to guild members */
  GuildOnly = 2,
}

/**
 * Entity types for guild scheduled events defining where and how events are hosted.
 * Determines required fields and behavior for different event contexts.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types} for entity types specification
 */
export enum GuildScheduledEventEntityTypes {
  /** Event hosted in a stage channel */
  StageInstance = 1,
  /** Event hosted in a voice channel */
  Voice = 2,
  /** Event hosted externally outside Discord */
  External = 3,
}

/**
 * Status values for guild scheduled events representing their lifecycle state.
 * Status transitions are restricted to maintain event integrity.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status} for status specification
 */
export enum GuildScheduledEventStatuses {
  /** Event is scheduled but not yet active */
  Scheduled = 1,
  /** Event is currently active and ongoing */
  Active = 2,
  /** Event has finished (cannot be changed) */
  Completed = 3,
  /** Event was cancelled (cannot be changed) */
  Canceled = 4,
}

/**
 * Recurrence frequency types for repeating guild scheduled events.
 * Follows iCalendar RFC specifications with Discord-specific limitations.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency} for frequency specification
 */
export enum RecurrenceRuleFrequencies {
  /** Event recurs yearly */
  Yearly = 0,
  /** Event recurs monthly */
  Monthly = 1,
  /** Event recurs weekly */
  Weekly = 2,
  /** Event recurs daily */
  Daily = 3,
}

/**
 * Weekday values for recurrence rules following Monday=0 convention.
 * Used to specify which days of the week events should recur.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday} for weekday specification
 */
export enum RecurrenceRuleWeekdays {
  /** Monday */
  Monday = 0,
  /** Tuesday */
  Tuesday = 1,
  /** Wednesday */
  Wednesday = 2,
  /** Thursday */
  Thursday = 3,
  /** Friday */
  Friday = 4,
  /** Saturday */
  Saturday = 5,
  /** Sunday */
  Sunday = 6,
}

/**
 * Month values for recurrence rules using standard 1-12 numbering.
 * Used to specify which months yearly events should recur.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month} for month specification
 */
export enum RecurrenceRuleMonths {
  /** January */
  January = 1,
  /** February */
  February = 2,
  /** March */
  March = 3,
  /** April */
  April = 4,
  /** May */
  May = 5,
  /** June */
  June = 6,
  /** July */
  July = 7,
  /** August */
  August = 8,
  /** September */
  September = 9,
  /** October */
  October = 10,
  /** November */
  November = 11,
  /** December */
  December = 12,
}

/**
 * N-weekday structure for monthly recurrence specifying week and day combinations.
 * Allows events like "fourth Wednesday of every month" with week and day specification.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure} for n-weekday specification
 */
export interface NWeekdayObject {
  /** Week number within the month (1-5) */
  readonly day: number;
  /** Weekday to recur on */
  readonly week: number;
}

/**
 * Entity metadata for guild scheduled events providing additional context.
 * Required for external events to specify location information.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata} for entity metadata specification
 */
export interface GuildScheduledEventEntityMetadataObject {
  /** Location of external events (1-100 characters, required for external events) */
  readonly location?: string;
}

/**
 * Recurrence rule configuration for repeating guild scheduled events.
 * Implements subset of iCalendar RFC with Discord-specific limitations and restrictions.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object} for recurrence rule specification
 * @see {@link https://datatracker.ietf.org/doc/html/rfc5545} for iCalendar RFC reference
 */
export interface GuildScheduledEventRecurrenceRuleObject {
  /** ISO8601 timestamp when recurrence interval starts */
  readonly start: string;
  /** ISO8601 timestamp when recurrence interval ends (cannot be set externally) */
  readonly end?: string | null;
  /** How often the event occurs */
  readonly frequency: RecurrenceRuleFrequencies;
  /** Spacing between events (2 allowed only for weekly frequency) */
  readonly interval: number;
  /** Specific weekdays for recurrence (mutually exclusive with other by_ fields) */
  readonly by_weekday?: RecurrenceRuleWeekdays[] | null;
  /** Specific week+day combinations for monthly events (mutually exclusive) */
  readonly by_n_weekday?: NWeekdayObject[] | null;
  /** Specific months for yearly events (must be used with by_month_day) */
  readonly by_month?: RecurrenceRuleMonths[] | null;
  /** Specific month days for yearly events (1-31, must be used with by_month) */
  readonly by_month_day?: number[] | null;
  /** Specific year days for recurrence (1-364, cannot be set externally) */
  readonly by_year_day?: number[] | null;
  /** Maximum recurrence count before stopping (cannot be set externally) */
  readonly count?: number | null;
}

/**
 * User subscription information for guild scheduled events.
 * Represents a user's interest in attending an event with optional member data.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object} for event user specification
 */
export interface GuildScheduledEventUserObject {
  /** ID of the scheduled event the user subscribed to */
  readonly guild_scheduled_event_id: string;
  /** User who subscribed to the event */
  readonly user: UserObject;
  /** Guild member data for this user (if available and requested) */
  readonly member?: GuildMemberEntity;
}

/**
 * Discord guild scheduled event representing planned activities within guilds.
 * Supports voice channels, stage channels, and external events with recurrence patterns.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object} for guild scheduled event specification
 */
export interface GuildScheduledEventObject {
  /** Unique identifier for the scheduled event */
  readonly id: string;
  /** Guild this scheduled event belongs to */
  readonly guild_id: string;
  /** Channel where event is hosted (null for external events) */
  readonly channel_id: string | null;
  /** User who created the event (null for events created before October 2021) */
  readonly creator_id?: string | null;
  /** Name of the scheduled event (1-100 characters) */
  readonly name: string;
  /** Description of the scheduled event (1-1000 characters) */
  readonly description?: string | null;
  /** ISO8601 timestamp when event will start */
  readonly scheduled_start_time: string;
  /** ISO8601 timestamp when event will end (required for external events) */
  readonly scheduled_end_time: string | null;
  /** Privacy level of the scheduled event */
  readonly privacy_level: GuildScheduledEventPrivacyLevels;
  /** Current status of the scheduled event */
  readonly status: GuildScheduledEventStatuses;
  /** Type of entity hosting the event */
  readonly entity_type: GuildScheduledEventEntityTypes;
  /** ID of entity associated with the event */
  readonly entity_id: string | null;
  /** Additional metadata for the event (required for external events) */
  readonly entity_metadata: GuildScheduledEventEntityMetadataObject | null;
  /** User who created the scheduled event */
  readonly creator?: UserObject;
  /** Number of users subscribed to the event (if requested) */
  readonly user_count?: number;
  /** Cover image hash for the scheduled event */
  readonly image?: string | null;
  /** Recurrence rule for repeating events */
  readonly recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;
}

/**
 * Gateway event data for guild scheduled event user additions and removals.
 * Sent when users subscribe or unsubscribe from events.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add} for user add event
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove} for user remove event
 */
export interface GuildScheduledEventUserAddRemoveObject {
  /** ID of the scheduled event */
  readonly guild_scheduled_event_id: string;
  /** ID of the user who subscribed/unsubscribed */
  readonly user_id: string;
  /** ID of the guild containing the event */
  readonly guild_id: string;
}

/**
 * Query parameters for listing guild scheduled events with optional enhancements.
 * Controls inclusion of user count information in event responses.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild} for list events endpoint
 */
export interface ListScheduledEventsForGuildQueryStringParams {
  /** Whether to include user subscription counts for each event */
  readonly with_user_count?: boolean;
}

/**
 * Query parameters for retrieving individual guild scheduled events.
 * Controls inclusion of user count information in the response.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event} for get event endpoint
 */
export interface GetGuildScheduledEventQueryStringParams {
  /** Whether to include user subscription count */
  readonly with_user_count?: boolean;
}

/**
 * Query parameters for retrieving users subscribed to guild scheduled events.
 * Supports pagination and optional member data inclusion.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users} for get event users endpoint
 */
export interface GetGuildScheduledEventUsersQueryStringParams {
  /** Maximum number of users to return (up to 100, default 100) */
  readonly limit?: number;
  /** Whether to include guild member data for each user */
  readonly with_member?: boolean;
  /** Get users before this user ID (for pagination) */
  readonly before?: string;
  /** Get users after this user ID (for pagination) */
  readonly after?: string;
}

/**
 * Request parameters for creating new guild scheduled events.
 * Field requirements vary based on entity type (voice, stage, external).
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event} for create event endpoint
 */
export interface CreateGuildScheduledEventJSONParams {
  /** Name of the scheduled event (1-100 characters) */
  readonly name: string;
  /** Privacy level of the event */
  readonly privacy_level: GuildScheduledEventPrivacyLevels;
  /** ISO8601 timestamp when event should start */
  readonly scheduled_start_time: string;
  /** Type of entity hosting the event */
  readonly entity_type: GuildScheduledEventEntityTypes;
  /** Channel ID for voice/stage events (omit for external events) */
  readonly channel_id?: string;
  /** Entity metadata (required for external events with location) */
  readonly entity_metadata?: GuildScheduledEventEntityMetadataObject;
  /** ISO8601 timestamp when event should end (required for external events) */
  readonly scheduled_end_time?: string;
  /** Description of the event (1-1000 characters) */
  readonly description?: string;
  /** Recurrence rule for repeating events */
  readonly recurrence_rule?: GuildScheduledEventRecurrenceRuleObject;
  /** Cover image for the event */
  readonly image?: FileInput;
}

/**
 * Request parameters for modifying existing guild scheduled events.
 * All parameters are optional, allowing partial updates to event properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event} for modify event endpoint
 */
export interface ModifyGuildScheduledEventJSONParams {
  /** Name of the scheduled event (1-100 characters) */
  readonly name?: string;
  /** Privacy level of the event */
  readonly privacy_level?: GuildScheduledEventPrivacyLevels;
  /** ISO8601 timestamp when event should start */
  readonly scheduled_start_time?: string;
  /** Type of entity hosting the event */
  readonly entity_type?: GuildScheduledEventEntityTypes;
  /** Channel ID for voice/stage events (set to null for external events) */
  readonly channel_id?: string | null;
  /** Entity metadata for external events */
  readonly entity_metadata?: GuildScheduledEventEntityMetadataObject;
  /** ISO8601 timestamp when event should end */
  readonly scheduled_end_time?: string;
  /** Description of the event (1-1000 characters) */
  readonly description?: string | null;
  /** Recurrence rule for repeating events */
  readonly recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;
  /** Status of the event (use to start/end events) */
  readonly status?: GuildScheduledEventStatuses;
  /** Cover image for the event */
  readonly image?: FileInput;
}
