import type { Snowflake } from "@lunajs/core";
import type { EmojiStructure, GuildMemberStructure, UserStructure } from "@lunajs/rest";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export type MessageReactionRemoveEmojiEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * Emoji that was removed
	 */
	emoji: Partial<EmojiStructure>;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * ID of the message
	 */
	message_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export type MessageReactionRemoveAllEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * ID of the message
	 */
	message_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export type MessageReactionRemoveEventFields = {
	/**
	 * true if this was a super-reaction
	 */
	burst: boolean;
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * Emoji that was removed
	 */
	emoji: Partial<EmojiStructure>;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * ID of the message
	 */
	message_id: Snowflake;
	/**
	 * The type of reaction
	 */
	type: 0 | 1;
	/**
	 * ID of the user
	 */
	user_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export type MessageReactionAddEventFields = {
	/**
	 * true if this is a super-reaction
	 */
	burst: boolean;
	/**
	 * Colors used for super-reaction animation in "#rrggbb" format
	 */
	burst_colors?: string[];
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * Emoji used to react
	 */
	emoji: Partial<EmojiStructure>;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * Member who reacted if this happened in a guild
	 */
	member?: GuildMemberStructure;
	/**
	 * ID of the user who authored the message which was reacted to
	 */
	message_author_id?: Snowflake;
	/**
	 * ID of the message
	 */
	message_id: Snowflake;
	/**
	 * The type of reaction
	 */
	type: 0 | 1;
	/**
	 * ID of the user
	 */
	user_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export type MessageDeleteBulkEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * IDs of the messages
	 */
	ids: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-delete-message-delete-event-fields}
 */
export type MessageDeleteEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * ID of the message
	 */
	id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-create-message-create-extra-fields}
 */
export type MessageCreateExtraFields = {
	/**
	 * ID of the guild the message was sent in - unless it is an ephemeral message
	 */
	guild_id?: Snowflake;
	/**
	 * Member properties for this message's author. Missing for ephemeral messages and messages from webhooks
	 */
	member?: GuildMemberStructure;
	/**
	 * Users specifically mentioned in the message
	 */
	mentions: (Partial<GuildMemberStructure> & UserStructure)[];
};
