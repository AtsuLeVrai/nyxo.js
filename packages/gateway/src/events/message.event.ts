import {
  EmojiSchema,
  GuildMemberSchema,
  MessageSchema,
  SnowflakeSchema,
  UserSchema,
} from "@nyxjs/core";
import { ReactionTypeFlag } from "@nyxjs/rest";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export const MessageReactionRemoveEmojiSchema = z
  .object({
    channel_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    message_id: SnowflakeSchema,
    emoji: EmojiSchema.partial(),
  })
  .strict();

export type MessageReactionRemoveEmojiEntity = z.infer<
  typeof MessageReactionRemoveEmojiSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export const MessageReactionRemoveAllSchema = z
  .object({
    channel_id: SnowflakeSchema,
    message_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
  })
  .strict();

export type MessageReactionRemoveAllEntity = z.infer<
  typeof MessageReactionRemoveAllSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export const MessageReactionRemoveSchema = z
  .object({
    user_id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
    message_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    emoji: z.union([
      EmojiSchema.pick({ id: true, name: true }),
      EmojiSchema.pick({ id: true, name: true, animated: true }),
    ]),
    burst: z.boolean(),
    type: z.nativeEnum(ReactionTypeFlag),
  })
  .strict();

export type MessageReactionRemoveEntity = z.infer<
  typeof MessageReactionRemoveSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export const MessageReactionAddSchema = z
  .object({
    user_id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
    message_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    member: GuildMemberSchema.optional(),
    emoji: z.union([
      EmojiSchema.pick({ id: true, name: true }),
      EmojiSchema.pick({ id: true, name: true, animated: true }),
    ]),
    message_author_id: SnowflakeSchema.optional(),
    burst: z.boolean(),
    burst_colors: z.array(z.string()).optional(),
    type: z.nativeEnum(ReactionTypeFlag),
  })
  .strict();

export type MessageReactionAddEntity = z.infer<typeof MessageReactionAddSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export const MessageDeleteBulkSchema = z
  .object({
    ids: z.array(SnowflakeSchema),
    channel_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
  })
  .strict();

export type MessageDeleteBulkEntity = z.infer<typeof MessageDeleteBulkSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-message-delete-event-fields}
 */
export const MessageDeleteSchema = z
  .object({
    id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
  })
  .strict();

export type MessageDeleteEntity = z.infer<typeof MessageDeleteSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create-message-create-extra-fields}
 */
export const MessageCreateSchema = MessageSchema.omit({
  mentions: true,
})
  .extend({
    guild_id: SnowflakeSchema.optional(),
    member: GuildMemberSchema.partial().optional(),
    mentions: z
      .array(z.union([UserSchema, GuildMemberSchema.partial()]))
      .optional(),
  })
  .strict();

export type MessageCreateEntity = z.infer<typeof MessageCreateSchema>;
