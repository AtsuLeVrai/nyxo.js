import {
  EmojiEntity,
  GuildMemberEntity,
  MessageEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { ReactionTypeFlag } from "@nyxjs/rest";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export const MessageReactionRemoveEmojiEntity = z.object({
  channel_id: Snowflake,
  guild_id: Snowflake.optional(),
  message_id: Snowflake,
  emoji: EmojiEntity.partial(),
});

export type MessageReactionRemoveEmojiEntity = z.infer<
  typeof MessageReactionRemoveEmojiEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export const MessageReactionRemoveAllEntity = z.object({
  channel_id: Snowflake,
  message_id: Snowflake,
  guild_id: Snowflake.optional(),
});

export type MessageReactionRemoveAllEntity = z.infer<
  typeof MessageReactionRemoveAllEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export const MessageReactionRemoveEntity = z.object({
  user_id: Snowflake,
  channel_id: Snowflake,
  message_id: Snowflake,
  guild_id: Snowflake.optional(),
  emoji: z.union([
    EmojiEntity.pick({ id: true, name: true }),
    EmojiEntity.pick({ id: true, name: true, animated: true }),
  ]),
  burst: z.boolean(),
  type: z.nativeEnum(ReactionTypeFlag),
});

export type MessageReactionRemoveEntity = z.infer<
  typeof MessageReactionRemoveEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export const MessageReactionAddEntity = z.object({
  user_id: Snowflake,
  channel_id: Snowflake,
  message_id: Snowflake,
  guild_id: Snowflake.optional(),
  member: GuildMemberEntity.optional(),
  emoji: z.union([
    EmojiEntity.pick({ id: true, name: true }),
    EmojiEntity.pick({ id: true, name: true, animated: true }),
  ]),
  message_author_id: Snowflake.optional(),
  burst: z.boolean(),
  burst_colors: z.array(z.string()).optional(),
  type: z.nativeEnum(ReactionTypeFlag),
});

export type MessageReactionAddEntity = z.infer<typeof MessageReactionAddEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export const MessageDeleteBulkEntity = z.object({
  ids: z.array(Snowflake),
  channel_id: Snowflake,
  guild_id: Snowflake.optional(),
});

export type MessageDeleteBulkEntity = z.infer<typeof MessageDeleteBulkEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-message-delete-event-fields}
 */
export const MessageDeleteEntity = z.object({
  id: Snowflake,
  channel_id: Snowflake,
  guild_id: Snowflake.optional(),
});

export type MessageDeleteEntity = z.infer<typeof MessageDeleteEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create-message-create-extra-fields}
 */
export const MessageCreateEntity = MessageEntity.omit({
  mentions: true,
}).extend({
  guild_id: Snowflake.optional(),
  member: GuildMemberEntity.partial().optional(),
  mentions: z
    .array(z.union([UserEntity, GuildMemberEntity.partial()]))
    .optional(),
});

export type MessageCreateEntity = z.infer<typeof MessageCreateEntity>;
