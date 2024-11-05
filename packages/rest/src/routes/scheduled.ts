import type { GuildScheduledEventStructure, GuildScheduledEventUserStructure, Snowflake } from "@nyxjs/core";
import { type QueryStringParams, RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params|Get Guild Scheduled Event Users Query String Params}
 */
export type GetGuildScheduledEventUsersQueryStringParams = Pick<QueryStringParams, "before" | "after" | "limit"> & {
    /**
     * Include guild member data if it exists
     */
    with_member?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params|Modify Guild Scheduled Event JSON Params}
 */
export type ModifyGuildScheduledEventJsonParams = Partial<
    Pick<
        GuildScheduledEventStructure,
        | "channel_id"
        | "entity_metadata"
        | "name"
        | "privacy_level"
        | "scheduled_start_time"
        | "scheduled_end_time"
        | "description"
        | "entity_type"
        | "status"
        | "image"
        | "recurrence_rule"
    >
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-query-string-params|Get Guild Scheduled Event Query String Params}
 */
export type GetGuildScheduledEventQueryStringParams = {
    /**
     * Include number of users subscribed to this event
     */
    with_user_count?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild-query-string-params|List Scheduled Events For Guild Query String Params}
 */
export type ListScheduledEventsForGuildQueryStringParams = GetGuildScheduledEventQueryStringParams;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params|Create Guild Scheduled Event JSON Params}
 */
export type CreateGuildScheduledEventJsonParams = Pick<
    GuildScheduledEventStructure,
    | "channel_id"
    | "entity_metadata"
    | "name"
    | "privacy_level"
    | "scheduled_start_time"
    | "scheduled_end_time"
    | "description"
    | "entity_type"
    | "image"
    | "recurrence_rule"
>;

export const ScheduledRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users|Get Guild Scheduled Event Users}
     */
    getGuildScheduledEventUsers(
        guildId: Snowflake,
        scheduledEventId: Snowflake,
        params?: GetGuildScheduledEventUsersQueryStringParams,
    ): RouteStructure<GuildScheduledEventUserStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/scheduled-events/${scheduledEventId}/users`,
            query: params,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event|Delete Guild Scheduled Event}
     */
    deleteGuildScheduledEvent(guildId: Snowflake, scheduledEventId: Snowflake): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/guilds/${guildId}/scheduled-events/${scheduledEventId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event|Modify Guild Scheduled Event}
     */
    modifyGuildScheduledEvent(
        guildId: Snowflake,
        scheduledEventId: Snowflake,
        params: ModifyGuildScheduledEventJsonParams,
        reason?: string,
    ): RouteStructure<GuildScheduledEventStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/scheduled-events/${scheduledEventId}`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event|Get Guild Scheduled Event}
     */
    getGuildScheduledEvent(
        guildId: Snowflake,
        scheduledEventId: Snowflake,
        params?: GetGuildScheduledEventQueryStringParams,
    ): RouteStructure<GuildScheduledEventStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/scheduled-events/${scheduledEventId}`,
            query: params,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event|Create Guild Scheduled Event}
     */
    createGuildScheduledEvent(
        guildId: Snowflake,
        params: CreateGuildScheduledEventJsonParams,
    ): RouteStructure<GuildScheduledEventStructure> {
        return {
            method: RestMethods.Post,
            path: `/guilds/${guildId}/scheduled-events`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild|List Scheduled Events For Guild}
     */
    listScheduledEventsForGuild(
        guildId: Snowflake,
        params?: ListScheduledEventsForGuildQueryStringParams,
    ): RouteStructure<GuildScheduledEventStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/scheduled-events`,
            query: params,
        };
    },
} as const;
