import {
  AnyThreadChannelEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export const ChannelPinsUpdateEntity = z.object({
  guild_id: Snowflake.optional(),
  channel_id: Snowflake,
  last_pin_timestamp: z.string().nullish(),
});

export type ChannelPinsUpdateEntity = z.infer<typeof ChannelPinsUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export const ThreadMembersUpdateEntity = z
  .object({
    id: Snowflake,
    guild_id: Snowflake,
    member_count: z.number(),
    added_members: z.array(ThreadMemberEntity).optional(),
    removed_member_ids: z.array(Snowflake).optional(),
  })
  .strict();

export type ThreadMembersUpdateEntity = z.infer<
  typeof ThreadMembersUpdateEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export const ThreadMemberUpdateEntity = ThreadMemberEntity.extend({
  guild_id: Snowflake,
}).strict();

export type ThreadMemberUpdateEntity = z.infer<typeof ThreadMemberUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export const ThreadListSyncEntity = z
  .object({
    guild_id: Snowflake,
    channel_ids: z.array(Snowflake).optional(),
    threads: z.array(AnyThreadChannelEntity),
    members: z.array(ThreadMemberEntity),
  })
  .strict();

export type ThreadListSyncEntity = z.infer<typeof ThreadListSyncEntity>;
