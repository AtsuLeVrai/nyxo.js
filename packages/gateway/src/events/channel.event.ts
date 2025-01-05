import {
  AnyThreadChannelSchema,
  SnowflakeSchema,
  ThreadMemberSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export const ChannelPinsUpdateSchema = z.object({
  guild_id: SnowflakeSchema.optional(),
  channel_id: SnowflakeSchema,
  last_pin_timestamp: z.string().nullish(),
});

export type ChannelPinsUpdateEntity = z.infer<typeof ChannelPinsUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export const ThreadMembersUpdateSchema = z
  .object({
    id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    member_count: z.number(),
    added_members: z.array(ThreadMemberSchema).optional(),
    removed_member_ids: z.array(SnowflakeSchema).optional(),
  })
  .strict();

export type ThreadMembersUpdateEntity = z.infer<
  typeof ThreadMembersUpdateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export const ThreadMemberUpdateSchema = ThreadMemberSchema.extend({
  guild_id: SnowflakeSchema,
}).strict();

export type ThreadMemberUpdateEntity = z.infer<typeof ThreadMemberUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export const ThreadListSyncSchema = z
  .object({
    guild_id: SnowflakeSchema,
    channel_ids: z.array(SnowflakeSchema).optional(),
    threads: z.array(AnyThreadChannelSchema),
    members: z.array(ThreadMemberSchema),
  })
  .strict();

export type ThreadListSyncEntity = z.infer<typeof ThreadListSyncSchema>;
