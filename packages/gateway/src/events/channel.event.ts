import type { ChannelEntity, Snowflake, ThreadMemberEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export interface ChannelPinsUpdateEntity {
  guild_id?: Snowflake;
  channel_id: Snowflake;
  last_pin_timestamp?: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export interface ThreadMembersUpdateEntity {
  id: Snowflake;
  guild_id: Snowflake;
  member_count: number;
  added_members?: ThreadMemberEntity[];
  removed_member_ids?: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export interface ThreadMemberUpdateEntity extends ThreadMemberEntity {
  guild_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export interface ThreadListSyncEntity {
  guild_id: Snowflake;
  channel_ids?: Snowflake[];
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
}
