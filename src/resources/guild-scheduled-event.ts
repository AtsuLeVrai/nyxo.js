import type { FileInput } from "../core/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserObject } from "./user.js";

export enum RecurrenceRuleMonths {
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

export enum RecurrenceRuleWeekdays {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

export enum RecurrenceRuleFrequencies {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
}

export enum GuildScheduledEventStatuses {
  Scheduled = 1,
  Active = 2,
  Completed = 3,
  Canceled = 4,
}

export enum GuildScheduledEventEntityTypes {
  StageInstance = 1,
  Voice = 2,
  External = 3,
}

export enum GuildScheduledEventPrivacyLevels {
  GuildOnly = 2,
}

export interface NWeekdayObject {
  day: number;
  week: number;
}

export interface GuildScheduledEventRecurrenceRuleObject {
  start: string;
  end?: string | null;
  frequency: RecurrenceRuleFrequencies;
  interval: number;
  by_weekday?: RecurrenceRuleWeekdays[] | null;
  by_n_weekday?: NWeekdayObject[] | null;
  by_month?: RecurrenceRuleMonths[] | null;
  by_month_day?: number[] | null;
  by_year_day?: number[] | null;
  count?: number | null;
}

export interface GuildScheduledEventUserObject {
  guild_scheduled_event_id: string;
  user: UserObject;
  member?: GuildMemberEntity;
}

export interface GuildScheduledEventEntityMetadataObject {
  location?: string;
}

export interface GuildScheduledEventObject {
  id: string;
  guild_id: string;
  channel_id: string | null;
  creator_id?: string | null;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  scheduled_end_time: string | null;
  privacy_level: GuildScheduledEventPrivacyLevels;
  status: GuildScheduledEventStatuses;
  entity_type: GuildScheduledEventEntityTypes;
  entity_id: string | null;
  entity_metadata: GuildScheduledEventEntityMetadataObject | null;
  creator?: UserObject;
  user_count?: number;
  image?: string | null;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;
}

export interface GuildScheduledEventUserAddRemoveObject {
  guild_scheduled_event_id: string;
  user_id: string;
  guild_id: string;
}

export interface CreateGuildScheduledEventJSONParams {
  name: string;
  privacy_level: GuildScheduledEventPrivacyLevels;
  scheduled_start_time: string;
  entity_type: GuildScheduledEventEntityTypes;
  channel_id?: string;
  entity_metadata?: GuildScheduledEventEntityMetadataObject;
  scheduled_end_time?: string;
  description?: string;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleObject;
  image?: FileInput;
}

export interface ModifyGuildScheduledEventJSONParams {
  name?: string;
  privacy_level?: GuildScheduledEventPrivacyLevels;
  scheduled_start_time?: string;
  entity_type?: GuildScheduledEventEntityTypes;
  channel_id?: string | null;
  entity_metadata?: GuildScheduledEventEntityMetadataObject;
  scheduled_end_time?: string;
  description?: string | null;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;
  status?: GuildScheduledEventStatuses;
  image?: FileInput;
}

export interface GetGuildScheduledEventUsersQueryStringParams {
  limit?: number;
  with_member?: boolean;
  before?: string;
  after?: string;
}

export interface ListScheduledEventsGuildQueryStringParams {
  with_user_count?: boolean;
}

export interface GetGuildScheduledEventQueryStringParams {
  with_user_count?: boolean;
}

/**
 * Checks if a scheduled event is currently active
 * @param event The event to check
 * @returns true if the event is active
 */
export function isEventActive(event: GuildScheduledEventObject): boolean {
  return event.status === GuildScheduledEventStatuses.Active;
}

/**
 * Checks if a scheduled event is scheduled (not started yet)
 * @param event The event to check
 * @returns true if the event is scheduled
 */
export function isEventScheduled(event: GuildScheduledEventObject): boolean {
  return event.status === GuildScheduledEventStatuses.Scheduled;
}

/**
 * Checks if a scheduled event has been completed
 * @param event The event to check
 * @returns true if the event is completed
 */
export function isEventCompleted(event: GuildScheduledEventObject): boolean {
  return event.status === GuildScheduledEventStatuses.Completed;
}

/**
 * Checks if a scheduled event was canceled
 * @param event The event to check
 * @returns true if the event was canceled
 */
export function isEventCanceled(event: GuildScheduledEventObject): boolean {
  return event.status === GuildScheduledEventStatuses.Canceled;
}

/**
 * Checks if a scheduled event is an external event
 * @param event The event to check
 * @returns true if it's an external event
 */
export function isExternalEvent(event: GuildScheduledEventObject): boolean {
  return event.entity_type === GuildScheduledEventEntityTypes.External;
}

/**
 * Checks if a scheduled event is a voice event
 * @param event The event to check
 * @returns true if it's a voice event
 */
export function isVoiceEvent(event: GuildScheduledEventObject): boolean {
  return event.entity_type === GuildScheduledEventEntityTypes.Voice;
}

/**
 * Checks if a scheduled event is a stage event
 * @param event The event to check
 * @returns true if it's a stage event
 */
export function isStageEvent(event: GuildScheduledEventObject): boolean {
  return event.entity_type === GuildScheduledEventEntityTypes.StageInstance;
}

/**
 * Checks if a scheduled event has started
 * @param event The event to check
 * @returns true if the current time is past the start time
 */
export function hasEventStarted(event: GuildScheduledEventObject): boolean {
  return new Date() >= new Date(event.scheduled_start_time);
}

/**
 * Checks if a scheduled event has ended
 * @param event The event to check
 * @returns true if the event has a scheduled end time and it has passed
 */
export function hasEventEnded(event: GuildScheduledEventObject): boolean {
  if (!event.scheduled_end_time) return false;
  return new Date() >= new Date(event.scheduled_end_time);
}

/**
 * Checks if a scheduled event has a recurrence rule
 * @param event The event to check
 * @returns true if the event is recurring
 */
export function isRecurringEvent(event: GuildScheduledEventObject): boolean {
  return event.recurrence_rule !== null && event.recurrence_rule !== undefined;
}

/**
 * Gets the remaining time until an event starts
 * @param event The event to check
 * @returns milliseconds until start, or 0 if already started
 */
export function getTimeUntilEventStart(event: GuildScheduledEventObject): number {
  const now = new Date();
  const start = new Date(event.scheduled_start_time);
  return Math.max(0, start.getTime() - now.getTime());
}

/**
 * Gets the remaining time until an event ends
 * @param event The event to check
 * @returns milliseconds until end, or null if no end time
 */
export function getTimeUntilEventEnd(event: GuildScheduledEventObject): number | null {
  if (!event.scheduled_end_time) return null;

  const now = new Date();
  const end = new Date(event.scheduled_end_time);
  return Math.max(0, end.getTime() - now.getTime());
}

/**
 * Gets the duration of an event in milliseconds
 * @param event The event to check
 * @returns event duration, or null if no end time
 */
export function getEventDuration(event: GuildScheduledEventObject): number | null {
  if (!event.scheduled_end_time) return null;

  const start = new Date(event.scheduled_start_time);
  const end = new Date(event.scheduled_end_time);
  return end.getTime() - start.getTime();
}
