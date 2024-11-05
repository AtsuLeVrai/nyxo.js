import type {
    AvatarDecorationDataStructure,
    ChannelStructure,
    EmojiStructure,
    GuildMemberFlags,
    GuildMemberStructure,
    GuildScheduledEventStructure,
    Integer,
    Iso8601Timestamp,
    RoleStructure,
    Snowflake,
    StageInstanceStructure,
    StickerStructure,
    UserStructure,
    VoiceStateStructure,
} from "@nyxjs/core";
import type { PresenceUpdateEventFields } from "./presences.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-scheduled-event-user-remove-guild-scheduled-event-user-remove-event-fields}
 */
export type GuildScheduledEventUserRemoveEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * ID of the guild scheduled event
     */
    guild_scheduled_event_id: Snowflake;
    /**
     * ID of the user
     */
    user_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-scheduled-event-user-add-guild-scheduled-event-user-add-event-fields}
 */
export type GuildScheduledEventUserAddEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * ID of the guild scheduled event
     */
    guild_scheduled_event_id: Snowflake;
    /**
     * ID of the user
     */
    user_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-role-delete-guild-role-delete-event-fields}
 */
export type GuildRoleDeleteEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * ID of the role
     */
    role_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-role-update-guild-role-update-event-fields}
 */
export type GuildRoleUpdateEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * Role that was updated
     */
    role: RoleStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-role-create-guild-role-create-event-fields}
 */
export type GuildRoleCreateEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * Role that was created
     */
    role: RoleStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-members-chunk-guild-members-chunk-event-fields}
 */
export type GuildMembersChunkEventFields = {
    /**
     * Total number of expected chunks for this response
     */
    chunk_count: Integer;
    /**
     * Chunk index in the expected chunks for this response (0 <= chunk_index < chunk_count)
     */
    chunk_index: Integer;
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * Set of guild members
     */
    members: GuildMemberStructure[];
    /**
     * Nonce used in the Guild Members Request
     */
    nonce?: string;
    /**
     * When passing an invalid ID to REQUEST_GUILD_MEMBERS, it will be returned here
     */
    not_found?: unknown[];
    /**
     * When passing true to REQUEST_GUILD_MEMBERS, presences of the returned members will be here
     */
    presences?: PresenceUpdateEventFields[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-member-update-guild-member-update-event-fields}
 */
export type GuildMemberUpdateEventFields = {
    /**
     * Member's guild avatar hash
     */
    avatar?: string | null;
    /**
     * Data for the member's guild avatar decoration
     */
    avatar_decoration_data?: AvatarDecorationDataStructure | null;
    /**
     * When the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
     */
    communication_disabled_until?: Iso8601Timestamp | null;
    /**
     * Whether the user is deafened in voice channels
     */
    deaf?: boolean;
    /**
     * Guild member flags represented as a bit set, defaults to 0
     */
    flags?: GuildMemberFlags;
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * When the user joined the guild
     */
    joined_at?: Iso8601Timestamp | null;
    /**
     * Whether the user is muted in voice channels
     */
    mute?: boolean;
    /**
     * Nickname of the user in the guild
     */
    nick?: string | null;
    /**
     * Whether the user has not yet passed the guild's Membership Screening requirements
     */
    pending?: boolean;
    /**
     * When the user starting boosting the guild
     */
    premium_since?: Iso8601Timestamp | null;
    /**
     * User role ids
     */
    roles: Snowflake[];
    /**
     * User
     */
    user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-member-remove-guild-member-remove-event-fields}
 */
export type GuildMemberRemoveEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * User who was removed
     */
    user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-member-add-guild-member-add-extra-fields}
 */
export type GuildMemberAddEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-integrations-update-guild-integrations-update-event-fields}
 */
export type GuildIntegrationsUpdateEventFields = {
    /**
     * ID of the guild whose integrations were updated
     */
    guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-stickers-update-guild-stickers-update-event-fields}
 */
export type GuildStickersUpdateEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * Array of stickers
     */
    stickers: StickerStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-emojis-update-guild-emojis-update-event-fields}
 */
export type GuildEmojisUpdateEventFields = {
    /**
     * Array of emojis
     */
    emojis: EmojiStructure[];
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-ban-remove-guild-ban-remove-event-fields}
 */
export type GuildBanRemoveEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * User who was unbanned
     */
    user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-ban-add-guild-ban-add-event-fields}
 */
export type GuildBanAddEventFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * User who was banned
     */
    user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-audit-log-entry-create-guild-audit-log-entry-create-event-extra-fields}
 */
export type GuildAuditLogEntryCreateEventExtraFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-create-guild-create-extra-fields}
 */
export type GuildCreateExtraFields = {
    /**
     * Channels in the guild
     */
    channels: ChannelStructure[];
    /**
     * Scheduled events in the guild
     */
    guild_scheduled_events: GuildScheduledEventStructure[];
    /**
     * When this guild was joined at
     */
    joined_at: Iso8601Timestamp;
    /**
     * true if this is considered a large guild
     */
    large: boolean;
    /**
     * Total number of members in this guild
     */
    member_count: Integer;
    /**
     * Users in the guild
     */
    members: GuildMemberStructure[];
    /**
     * Presences of the members in the guild, will only include non-offline members if the size is greater than large threshold
     */
    presences: Partial<PresenceUpdateEventFields>[];
    /**
     * Stage instances in the guild
     */
    stage_instances: StageInstanceStructure[];
    /**
     * All active threads in the guild that current user has permission to view
     */
    threads: ChannelStructure[];
    /**
     * true if this guild is unavailable due to an outage
     */
    unavailable?: boolean;
    /**
     * States of members currently in voice channels; lacks the guild_id key
     */
    voice_states: Partial<VoiceStateStructure>[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#request-guild-members-request-guild-members-structure}
 */
export type RequestGuildMembersRequestStructure = {
    /**
     * ID of the guild to get members for
     */
    guild_id: Snowflake;
    /**
     * Maximum number of members to send matching the query; a limit of 0 can be used with an empty string query to return all members
     */
    limit: Integer;
    /**
     * Nonce to identify the Guild Members Chunk response
     */
    nonce?: string;
    /**
     * Used to specify if we want the presences of the matched members
     */
    presences?: boolean;
    /**
     * String that username starts with, or an empty string to return all members
     */
    query?: string;
    /**
     * Used to specify which users you wish to fetch
     */
    user_ids?: Snowflake | Snowflake[];
};
