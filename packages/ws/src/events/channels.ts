import type { ChannelStructure, ThreadMemberStructure } from "@nyxjs/api-types";
import type { Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export type ChannelPinsUpdateEventFields = {
    /**
     * ID of the channel
     */
    channel_id: Snowflake;
    /**
     * ID of the guild
     */
    guild_id?: Snowflake;
    /**
     * Time at which the most recent pinned message was pinned
     */
    last_pin_timestamp?: IsoO8601Timestamp | null;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export type ThreadMembersUpdateEventFields = {
    /**
     * Users who were added to the thread
     */
    added_members?: ThreadMemberStructure[];
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * ID of the thread
     */
    id: Snowflake;
    /**
     * Approximate number of members in the thread, capped at 50
     */
    member_count: Integer;
    /**
     * ID of the users who were removed from the thread
     */
    removed_member_ids?: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export type ThreadMemberUpdateEventExtraFields = {
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export type ThreadListSyncEventFields = {
    /**
     * Parent channel IDs whose threads are being synced. If omitted, then threads were synced for the entire guild. This array may contain channel_ids that have no active threads as well, so you know to clear that data.
     */
    channel_ids?: Snowflake[];
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * All thread member objects from the synced threads for the current user, indicating which threads the current user has been added to
     */
    members: ThreadMemberStructure[];
    /**
     * All active threads in the given channels that the current user can access
     */
    threads: ChannelStructure[];
};
