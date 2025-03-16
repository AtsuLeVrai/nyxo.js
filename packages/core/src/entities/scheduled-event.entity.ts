import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * Represents the months for recurring scheduled events.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-recurrence-rule---month}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-recurrence-rule---weekday}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-recurrence-rule---frequency}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-status}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-entity-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-privacy-level}
 */
export enum GuildScheduledEventPrivacyLevel {
  /** The scheduled event is only accessible to guild members (2) */
  GuildOnly = 2,
}

/**
 * Represents a specific week day within a specific week for recurrence rules.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-recurrence-rule---n_weekday-structure}
 */
export const GuildScheduledEventRecurrenceRuleNWeekdayEntity = z.object({
  /** The week to reoccur on (1-5) */
  n: z.number().int().min(1).max(5),

  /** The day within the week to reoccur on */
  day: z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday),
});

export type GuildScheduledEventRecurrenceRuleNWeekdayEntity = z.infer<
  typeof GuildScheduledEventRecurrenceRuleNWeekdayEntity
>;

/**
 * Represents the recurrence rule for a guild scheduled event.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-recurrence-rule-object}
 */
export const GuildScheduledEventRecurrenceRuleEntity = z.object({
  /** Starting time of the recurrence interval */
  start: z.string().datetime(),

  /** Ending time of the recurrence interval */
  end: z.string().datetime().nullable(),

  /** How often the event occurs */
  frequency: z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday),

  /** The spacing between events, defined by frequency */
  interval: z
    .number()
    .int()
    .min(1)
    .refine(
      (interval) => {
        // If interval is not 1, it can only be 2 (for "every-other week")
        if (interval !== 1 && interval !== 2) {
          return false;
        }
        return true;
      },
      {
        message:
          "Interval can only be set to 2 when frequency is WEEKLY, otherwise it must be 1",
      },
    ),

  /** Set of specific days within a week for the event to recur on */
  by_weekday: z
    .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday))
    .nullable(),

  /** List of specific days within a specific week (1-5) to recur on */
  by_n_weekday: z
    .array(GuildScheduledEventRecurrenceRuleNWeekdayEntity)
    .nullable()
    .refine(
      (nWeekdays) => {
        if (!nWeekdays) {
          return true;
        }

        // Can only have one item in the array
        return nWeekdays.length === 1;
      },
      {
        message:
          "by_n_weekday must be an array of length 1 and only valid for MONTHLY frequency",
      },
    ),

  /** Set of specific months to recur on */
  by_month: z
    .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleMonth))
    .nullable()
    .refine(
      (months) => {
        if (!months) {
          return true;
        }

        // Can only have one item in the array
        return months.length === 1;
      },
      {
        message:
          "by_month must be an array of length 1, only valid for YEARLY frequency, and used with by_month_day",
      },
    ),

  /** Set of specific dates within a month to recur on */
  by_month_day: z
    .array(z.number().int().min(1).max(31))
    .nullable()
    .refine(
      (monthDays) => {
        if (!monthDays) {
          return true;
        }

        // Can only have one item in the array
        return monthDays.length === 1;
      },
      {
        message:
          "by_month_day must be an array of length 1, only valid for YEARLY frequency, and used with by_month",
      },
    ),

  /** Set of days within a year to recur on (1-364) */
  by_year_day: z.number().int().min(1).max(364).array().nullable(),

  /** The total number of times the event is allowed to recur before stopping */
  count: z.number().int().positive().nullable(),
});

export type GuildScheduledEventRecurrenceRuleEntity = z.infer<
  typeof GuildScheduledEventRecurrenceRuleEntity
>;

/**
 * Represents a user who has subscribed to a guild scheduled event.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-user-object}
 */
export const GuildScheduledEventUserEntity = z.object({
  /** The scheduled event id which the user subscribed to */
  guild_scheduled_event_id: Snowflake,

  /** User which subscribed to an event */
  user: UserEntity,

  /** Guild member data for this user for the guild which this event belongs to, if any */
  member: GuildMemberEntity.optional(),
});

export type GuildScheduledEventUserEntity = z.infer<
  typeof GuildScheduledEventUserEntity
>;

/**
 * Represents additional metadata for a guild scheduled event entity.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-entity-metadata}
 */
export const GuildScheduledEventEntityMetadataEntity = z.object({
  /**
   * Location of the event (1-100 characters)
   * Required for events with entity_type EXTERNAL
   */
  location: z.string().min(1).max(100).optional(),
});

export type GuildScheduledEventEntityMetadataEntity = z.infer<
  typeof GuildScheduledEventEntityMetadataEntity
>;

/**
 * Represents a scheduled event in a guild.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Guild_Scheduled_Event.mdx#guild-scheduled-event-object}
 */
export const GuildScheduledEventEntity = z
  .object({
    /** The id of the scheduled event */
    id: Snowflake,

    /** The guild id which the scheduled event belongs to */
    guild_id: Snowflake,

    /**
     * The channel id in which the scheduled event will be hosted,
     * or null if entity_type is EXTERNAL
     */
    channel_id: Snowflake.nullish(),

    /**
     * The id of the user that created the scheduled event
     * May be null for events created before October 25th, 2021
     */
    creator_id: Snowflake.nullish(),

    /** The name of the scheduled event (1-100 characters) */
    name: z.string().min(1).max(100),

    /** The description of the scheduled event (1-1000 characters) */
    description: z.string().min(1).max(1000).nullish(),

    /** The time the scheduled event will start */
    scheduled_start_time: z.string().datetime(),

    /** The time the scheduled event will end, required if entity_type is EXTERNAL */
    scheduled_end_time: z.string().datetime().nullish(),

    /** The privacy level of the scheduled event */
    privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),

    /** The status of the scheduled event */
    status: z.nativeEnum(GuildScheduledEventStatus),

    /** The type of the scheduled event */
    entity_type: z.nativeEnum(GuildScheduledEventType),

    /** The id of an entity associated with a guild scheduled event */
    entity_id: Snowflake.nullable(),

    /** Additional metadata for the guild scheduled event */
    entity_metadata: GuildScheduledEventEntityMetadataEntity.nullable(),

    /** The user that created the scheduled event */
    creator: UserEntity.optional(),

    /** The number of users subscribed to the scheduled event */
    user_count: z.number().int().nonnegative().optional(),

    /** The cover image hash of the scheduled event */
    image: z.string().nullish(),

    /** The definition for how often this event should recur */
    recurrence_rule: GuildScheduledEventRecurrenceRuleEntity.nullable(),
  })
  .refine(
    (event) => {
      // Field requirements by entity type
      if (
        event.entity_type === GuildScheduledEventType.StageInstance ||
        event.entity_type === GuildScheduledEventType.Voice
      ) {
        // For STAGE_INSTANCE and VOICE, channel_id must be non-null and entity_metadata must be null
        if (event.channel_id === null) {
          return false;
        }
        if (event.entity_metadata !== null) {
          return false;
        }
      } else if (event.entity_type === GuildScheduledEventType.External) {
        // For EXTERNAL, channel_id must be null, entity_metadata must be non-null with location,
        // and scheduled_end_time must be non-null
        if (event.channel_id !== null) {
          return false;
        }
        if (event.entity_metadata === null || !event.entity_metadata.location) {
          return false;
        }
        if (
          event.scheduled_end_time === null ||
          event.scheduled_end_time === undefined
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Entity type has specific field requirements that must be met",
    },
  );

export type GuildScheduledEventEntity = z.infer<
  typeof GuildScheduledEventEntity
>;
