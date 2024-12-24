import type {
  EmojiEntity,
  GuildMemberEntity,
  MessageEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { ReactionTypeFlag } from "@nyxjs/rest";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export interface MessageReactionRemoveEmojiEntity {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  message_id: Snowflake;
  emoji: Partial<EmojiEntity>;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export interface MessageReactionRemoveAllEntity {
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export interface MessageReactionRemoveEntity {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  emoji:
    | Pick<EmojiEntity, "id" | "name">
    | Pick<EmojiEntity, "id" | "name" | "animated">;
  burst: boolean;
  type: ReactionTypeFlag;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export interface MessageReactionAddEntity {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  member?: GuildMemberEntity;
  emoji:
    | Pick<EmojiEntity, "id" | "name">
    | Pick<EmojiEntity, "id" | "name" | "animated">;
  message_author_id?: Snowflake;
  burst: boolean;
  burst_colors?: string[];
  type: ReactionTypeFlag;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export interface MessageDeleteBulkEntity {
  ids: Snowflake[];
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-message-delete-event-fields}
 */
export interface MessageDeleteEntity {
  id: Snowflake;
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create-message-create-extra-fields}
 */
export interface MessageCreateEntity extends Omit<MessageEntity, "mentions"> {
  guild_id?: Snowflake;
  member?: Partial<GuildMemberEntity>;
  mentions?: (UserEntity | Partial<GuildMemberEntity>)[];
}
