import type { Integer, Iso8601Timestamp, Snowflake } from "../markdown/index.js";
import type { GuildMemberStructure } from "./guilds.js";
import type { UserStructure } from "./users.js";

/**
 * Enumeration representing the months for a guild scheduled event recurrence rule.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month|Guild Scheduled Event Recurrence Rule Month}
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
 * Enumeration representing the weekdays for a guild scheduled event recurrence rule.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday|Guild Scheduled Event Recurrence Rule Weekday}
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
 * Type representing the structure of a specific weekday within a specific week for a guild scheduled event recurrence rule.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure|Guild Scheduled Event Recurrence Rule NWeekday Structure}
 */
export type GuildScheduledEventRecurrenceRuleNWeekdayStructure = {
    /**
     * The day within the week to reoccur on.
     */
    day: GuildScheduledEventRecurrenceRuleWeekday;
    /**
     * The week to reoccur on. 1 - 5.
     */
    n: 1 | 2 | 3 | 4 | 5;
};

/**
 * Enumeration representing the frequency of a guild scheduled event recurrence rule.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency|Guild Scheduled Event Recurrence Rule Frequency}
 */
export enum GuildScheduledEventRecurrenceRuleFrequency {
    Yearly = 0,
    Monthly = 1,
    Weekly = 2,
    Daily = 3,
}

/**
 * Type representing the structure of a guild scheduled event recurrence rule.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure|Guild Scheduled Event Recurrence Rule Structure}
 */
export type GuildScheduledEventRecurrenceRuleStructure = {
    /**
     * Set of specific months to recur on.
     */
    by_month: GuildScheduledEventRecurrenceRuleMonth[] | null;
    /**
     * Set of specific dates within a month to recur on.
     */
    by_month_day: Integer[] | null;
    /**
     * List of specific days within a specific week (1-5) to recur on.
     */
    by_n_weekday: GuildScheduledEventRecurrenceRuleNWeekdayStructure[] | null;
    /**
     * Set of specific days within a week for the event to recur on.
     */
    by_weekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;
    /**
     * Set of days within a year to recur on (1-364).
     */
    by_year_day: Integer[] | null;
    /**
     * The total amount of times that the event is allowed to recur before stopping.
     */
    count: Integer | null;
    /**
     * Ending time of the recurrence interval.
     */
    end: Iso8601Timestamp | null;
    /**
     * How often the event occurs.
     */
    frequency: GuildScheduledEventRecurrenceRuleFrequency;
    /**
     * The spacing between the events, defined by frequency. For example, frequency of WEEKLY and an interval of 2 would be "every-other week".
     */
    interval: Integer;
    /**
     * Starting time of the recurrence interval.
     */
    start: Iso8601Timestamp;
};

/**
 * Type representing the structure of a user subscribed to a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure|Guild Scheduled Event User Structure}
 */
export type GuildScheduledEventUserStructure = {
    /**
     * The scheduled event id which the user subscribed to.
     */
    guild_scheduled_event_id: Snowflake;
    /**
     * Guild member data for this user for the guild which this event belongs to, if any.
     */
    member?: GuildMemberStructure;
    /**
     * User which subscribed to an event.
     */
    user: UserStructure;
};

/**
 * Type representing the metadata of a guild scheduled event entity.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata|Guild Scheduled Event Entity Metadata}
 */
export type GuildScheduledEventEntityMetadataStructure = {
    /**
     * Location of the event (1-100 characters).
     */
    location?: string;
};

/**
 * Enumeration representing the status of a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status|Guild Scheduled Event Status}
 */
export enum GuildScheduledEventStatus {
    Scheduled = 1,
    Active = 2,
    Completed = 3,
    Canceled = 4,
}

/**
 * Enumeration representing the types of entities for a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types|Guild Scheduled Event Entity Types}
 */
export enum GuildScheduledEventEntityTypes {
    StageInstance = 1,
    Voice = 2,
    External = 3,
}

/**
 * Enumeration representing the privacy levels of a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level|Guild Scheduled Event Privacy Level}
 */
export enum GuildScheduledEventPrivacyLevel {
    /**
     * The scheduled event is only accessible to guild members.
     */
    GuildOnly = 2,
}

/**
 * Type representing the structure of a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure|Guild Scheduled Event Structure}
 */
export type GuildScheduledEventStructure = {
    /**
     * The channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL.
     */
    channel_id: Snowflake | null;
    /**
     * The user that created the scheduled event.
     */
    creator: UserStructure;
    /**
     * The id of the user that created the scheduled event.
     */
    creator_id?: Snowflake | null;
    /**
     * The description of the scheduled event (1-1000 characters).
     */
    description?: string | null;
    /**
     * The id of an entity associated with a guild scheduled event.
     */
    entity_id: Snowflake | null;
    /**
     * Additional metadata for the guild scheduled event.
     */
    entity_metadata: GuildScheduledEventEntityMetadataStructure | null;
    /**
     * The type of the scheduled event.
     */
    entity_type: GuildScheduledEventEntityTypes;
    /**
     * The guild id which the scheduled event belongs to.
     */
    guild_id: Snowflake;
    /**
     * The id of the scheduled event.
     */
    id: Snowflake;
    /**
     * The cover image hash of the scheduled event.
     */
    image?: string | null;
    /**
     * The name of the scheduled event (1-100 characters).
     */
    name: string;
    /**
     * The privacy level of the scheduled event.
     */
    privacy_level: GuildScheduledEventPrivacyLevel;
    /**
     * The definition for how often this event should recur.
     */
    recurrence_rule: GuildScheduledEventRecurrenceRuleStructure | null;
    /**
     * The time the scheduled event will end, required if entity_type is EXTERNAL.
     */
    scheduled_end_time: Iso8601Timestamp | null;
    /**
     * The time the scheduled event will start.
     */
    scheduled_start_time: Iso8601Timestamp;
    /**
     * The status of the scheduled event.
     */
    status: GuildScheduledEventStatus;
    /**
     * The number of users subscribed to the scheduled event.
     */
    user_count: Integer;
};
