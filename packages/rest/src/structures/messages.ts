import type { Float, Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import type { DiscordHeaders } from "../types/globals";
import type { ApplicationStructure } from "./applications";
import type { ChannelStructure, ChannelTypes } from "./channels";
import type { EmojiStructure } from "./emojis";
import type {
	ActionRowStructure,
	InteractionTypes,
	MessageInteractionStructure,
	ResolvedDataStructure,
} from "./interactions";
import type { PollStructure } from "./polls";
import type { StickerItemStructure, StickerStructure } from "./stickers";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export type RoleSubscriptionDataStructure = {
	/**
	 * Whether this notification is for a renewal rather than a new purchase
	 */
	is_renewal: boolean;
	/**
	 * The id of the sku and listing that the user is subscribed to
	 */
	role_subscription_listing_id: Snowflake;
	/**
	 * The name of the tier that the user is subscribed to
	 */
	tier_name: string;
	/**
	 * The cumulative number of months that the user has been subscribed for
	 */
	total_months_subscribed: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export type AllowedMentionTypes = "everyone" | "roles" | "users";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export type AllowedMentionsStructure = {
	/**
	 * An array of allowed mention types to parse from the content.
	 */
	parse: AllowedMentionTypes[];
	/**
	 * For replies, whether to mention the author of the message being replied to (default false)
	 */
	replied_user: boolean;
	/**
	 * Array of role_ids to mention (Max size of 100)
	 */
	roles: Snowflake[];
	/**
	 * Array of user_ids to mention (Max size of 100)
	 */
	users: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-channel-mention-structure}
 */
export type ChannelMentionStructure = {
	/**
	 * ID of the guild containing the channel
	 */
	guild_id: Snowflake;
	/**
	 * ID of the channel
	 */
	id: Snowflake;
	/**
	 * The name of the channel
	 */
	name: string;
	/**
	 * The type of channel
	 */
	type: ChannelTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
	/**
	 * This attachment has been edited using the remix feature on mobile
	 */
	IsRemix = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export type AttachmentStructure = {
	/**
	 * The attachment's media type
	 */
	content_type?: DiscordHeaders["Content-Type"];
	/**
	 * Description for the file (max 1024 characters)
	 */
	description?: string;
	/**
	 * The duration of the audio file (currently for voice messages)
	 */
	duration_secs?: Float;
	/**
	 * Whether this attachment is ephemeral
	 */
	ephemeral?: boolean;
	/**
	 * The name of the file attached
	 */
	filename: string;
	/**
	 * Attachment flags combined as a bitfield
	 */
	flags?: Integer;
	/**
	 * Height of file (if image)
	 */
	height?: Integer | null;
	/**
	 * The ID of the attachment
	 */
	id: Snowflake;
	/**
	 * A proxied URL of file
	 */
	proxy_url: string;
	/**
	 * Size of file in bytes
	 */
	size: Integer;
	/**
	 * The title of the file
	 */
	title?: string;
	/**
	 * Source URL of file
	 */
	url: string;
	/**
	 * Base64 encoded bytearray representing a sampled waveform (currently for voice messages)
	 */
	waveform?: string;
	/**
	 * Width of file (if image)
	 */
	width?: Integer | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export type EmbedFieldStructure = {
	/**
	 * Whether or not this field should display inline
	 */
	inline?: boolean;
	/**
	 * The name of the field
	 */
	name: string;
	/**
	 * The value of the field
	 */
	value: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export type EmbedFooterStructure = {
	/**
	 * URL of footer icon (only supports http(s) and attachments)
	 */
	icon_url?: string;
	/**
	 * A proxied URL of footer icon
	 */
	proxy_icon_url?: string;
	/**
	 * Footer text
	 */
	text: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export type EmbedAuthorStructure = {
	/**
	 * URL of author icon (only supports http(s) and attachments)
	 */
	icon_url?: string;
	/**
	 * Name of author
	 */
	name: string;
	/**
	 * A proxied URL of author icon
	 */
	proxy_icon_url?: string;
	/**
	 * URL of author (only supports http(s))
	 */
	url?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export type EmbedProviderStructure = {
	/**
	 * Name of provider
	 */
	name?: string;
	/**
	 * URL of provider
	 */
	url?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export type EmbedImageStructure = {
	/**
	 * Height of image
	 */
	height?: Integer;
	/**
	 * A proxied URL of the image
	 */
	proxy_url?: string;
	/**
	 * Source URL of image
	 */
	url: string;
	/**
	 * Width of image
	 */
	width?: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export type EmbedVideoStructure = {
	/**
	 * Height of video
	 */
	height?: Integer;
	/**
	 * A proxied URL of the video
	 */
	proxy_url?: string;
	/**
	 * Source URL of video
	 */
	url?: string;
	/**
	 * Width of video
	 */
	width?: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export type EmbedThumbnailStructure = {
	/**
	 * Height of thumbnail
	 */
	height?: Integer;
	/**
	 * A proxied URL of the thumbnail
	 */
	proxy_url?: string;
	/**
	 * Source URL of thumbnail
	 */
	url: string;
	/**
	 * Width of thumbnail
	 */
	width?: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export type EmbedTypes =
	| "article"
	| "gifv"
	| "image"
	| "link"
	| "rich"
	| "video";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export type EmbedStructure = {
	/**
	 * Author information
	 */
	author?: EmbedAuthorStructure;
	/**
	 * Color code of the embed
	 */
	color?: Integer;
	/**
	 * Description of embed
	 */
	description?: string;
	/**
	 * Fields information, max of 25
	 */
	fields?: EmbedFieldStructure[];
	/**
	 * Footer information
	 */
	footer?: EmbedFooterStructure;
	/**
	 * Image information
	 */
	image?: EmbedImageStructure;
	/**
	 * Provider information
	 */
	provider?: EmbedProviderStructure;
	/**
	 * Thumbnail information
	 */
	thumbnail?: EmbedThumbnailStructure;
	/**
	 * Timestamp of embed content
	 */
	timestamp?: IsoO8601Timestamp;
	/**
	 * Title of embed
	 */
	title?: string;
	/**
	 * Type of embed (always "rich" for webhook embeds)
	 */
	type?: EmbedTypes;
	/**
	 * URL of embed
	 */
	url?: string;
	/**
	 * Video information
	 */
	video?: EmbedVideoStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export type ReactionCountDetailsStructure = {
	/**
	 * Count of super reactions
	 */
	burst: Integer;
	/**
	 * Count of normal reactions
	 */
	normal: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export type ReactionStructure = {
	/**
	 * HEX colors used for super reaction
	 */
	burst_colors: string[];
	/**
	 * Total number of times this emoji has been used to react (including super reacts)
	 */
	count: Integer;
	/**
	 * Reaction count details object
	 */
	count_details: ReactionCountDetailsStructure;
	/**
	 * emoji information
	 */
	emoji: Pick<EmojiStructure, "animated" | "id" | "name">;
	/**
	 * Whether the current user reacted using this emoji
	 */
	me: boolean;
	/**
	 * Whether the current user super-reacted using this emoji
	 */
	me_burst: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-structure}
 */
export type MessageSnapshotStructure = {
	/**
	 * Minimum subset of fields in the forwarded message
	 */
	message: Pick<
		MessageStructure,
		| "attachments"
		| "content"
		| "edited_timestamp"
		| "embeds"
		| "flags"
		| "mention_roles"
		| "mentions"
		| "timestamp"
		| "type"
	>;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceTypes {
	/**
	 * A standard reference used by replies.
	 */
	Default = 0,
	/**
	 * Reference used to point to a message at a point in time.
	 */
	Forward = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export type MessageReferenceStructure = {
	/**
	 * ID of the originating message's channel
	 */
	channel_id?: Snowflake;
	/**
	 * When sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true
	 */
	fail_if_not_exists?: boolean;
	/**
	 * ID of the originating message's guild
	 */
	guild_id?: Snowflake;
	/**
	 * ID of the originating message
	 */
	message_id?: Snowflake;
	/**
	 * Type of reference.
	 */
	type?: MessageReferenceTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export type MessageCallStructure = {
	/**
	 * Time when call ended
	 */
	ended_timestamp?: IsoO8601Timestamp | null;
	/**
	 * Array of user object ids that participated in the call
	 */
	participants: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-interaction-metadata-structure}
 */
export type MessageInteractionMetadataStructure = {
	/**
	 * IDs for installation context(s) related to an interaction
	 */
	authorizing_integration_owners: Record<string, Snowflake>;
	/**
	 * ID of the interaction
	 */
	id: Snowflake;
	/**
	 * ID of the message that contained interactive component, present only on messages created from component interactions
	 */
	interacted_message_id?: Snowflake;
	/**
	 * ID of the original response message, present only on follow-up messages
	 */
	original_response_message_id?: Snowflake;
	/**
	 * Metadata for the interaction that was used to open the modal, present only on modal submit interactions
	 */
	triggering_interaction_metadata?: MessageInteractionMetadataStructure;
	/**
	 * Type of interaction
	 */
	type: InteractionTypes;
	/**
	 * User who triggered the interaction
	 */
	user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
 */
export enum MessageFlags {
	/**
	 * This message has been published to subscribed channels (via Channel Following)
	 */
	Crossposted = 1,
	/**
	 * This message originated from a message in another channel (via Channel Following)
	 */
	IsCrosspost = 2,
	/**
	 * Do not include any embeds when serializing this message
	 */
	SuppressEmbeds = 4,
	/**
	 * The source message for this crosspost has been deleted (via Channel Following)
	 */
	SourceMessageDeleted = 8,
	/**
	 * This message came from the urgent message system
	 */
	Urgent = 16,
	/**
	 * This message has an associated thread, with the same id as the message
	 */
	HasThread = 32,
	/**
	 * This message is only visible to the user who invoked the Interaction
	 */
	Ephemeral = 64,
	/**
	 * This message is an Interaction Response and the bot is "thinking"
	 */
	Loading = 128,
	/**
	 * This message failed to mention some roles and add their members to the thread
	 */
	FailedToMentionSomeRolesInThread = 256,
	/**
	 * This message will not trigger push and desktop notifications
	 */
	SuppressNotifications = 4_096,
	/**
	 * This message is a voice message
	 */
	IsVoiceMessage = 8_192,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export enum MessageActivityTypes {
	Join = 1,
	Spectate = 2,
	Listen = 3,
	JoinRequest = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export type MessageActivityStructure = {
	/**
	 * party_id from a Rich Presence event
	 */
	party_id?: string;
	/**
	 * type of message activity
	 */
	type: MessageActivityTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export enum MessageTypes {
	Default = 0,
	RecipientAdd = 1,
	RecipientRemove = 2,
	Call = 3,
	ChannelNameChange = 4,
	ChannelIconChange = 5,
	ChannelPinnedMessage = 6,
	UserJoin = 7,
	GuildBoost = 8,
	GuildBoostTier1 = 9,
	GuildBoostTier2 = 10,
	GuildBoostTier3 = 11,
	ChannelFollowAdd = 12,
	GuildDiscoveryDisqualified = 14,
	GuildDiscoveryRequalified = 15,
	GuildDiscoveryGracePeriodInitialWarning = 16,
	GuildDiscoveryGracePeriodFinalWarning = 17,
	ThreadCreated = 18,
	Reply = 19,
	ChatInputCommand = 20,
	ThreadStarterMessage = 21,
	GuildInviteReminder = 22,
	ContextMenuCommand = 23,
	AutoModerationAction = 24,
	RoleSubscriptionPurchase = 25,
	InteractionPremiumUpsell = 26,
	StageStart = 27,
	StageEnd = 28,
	StageSpeaker = 29,
	StageTopic = 31,
	GuildApplicationPremiumSubscription = 32,
	GuildIncidentAlertModeEnabled = 36,
	GuildIncidentAlertModeDisabled = 37,
	GuildIncidentReportRaid = 38,
	GuildIncidentReportFalseAlarm = 39,
	PurchaseNotification = 44,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-structure}
 */
export type MessageStructure = {
	/**
	 * Sent with Rich Presence-related chat embeds
	 */
	activity?: MessageActivityStructure;
	/**
	 * Sent with Rich Presence-related chat embeds
	 */
	application?: Partial<ApplicationStructure>;
	/**
	 * If the message is an Interaction or application-owned webhook, this is the ID of the application
	 */
	application_id?: Snowflake;
	/**
	 * Any attached files
	 */
	attachments: AttachmentStructure[];
	/**
	 * Author of this message
	 */
	author: UserStructure;
	/**
	 * The call associated with the message
	 */
	call?: MessageCallStructure;
	/**
	 * ID of the channel the message was sent in
	 */
	channel_id: Snowflake;
	/**
	 * Sent if the message contains components like buttons, action rows, or other interactive components
	 */
	components?: ActionRowStructure[];
	/**
	 * Contents of the message
	 */
	content: string;
	/**
	 * When this message was edited (or null if never)
	 */
	edited_timestamp: IsoO8601Timestamp | null;
	/**
	 * Any embedded content
	 */
	embeds: EmbedStructure[];
	/**
	 * Message flags combined as a bitfield
	 */
	flags?: MessageFlags;
	/**
	 * ID of the message
	 */
	id: Snowflake;
	/**
	 * Deprecated in favor of interaction_metadata; sent if the message is a response to an interaction
	 *
	 * @deprecated Use `interaction_metadata` instead
	 */
	interaction?: MessageInteractionMetadataStructure;
	/**
	 * In preview. Sent if the message is sent as a result of an interaction
	 */
	interaction_metadata?: MessageInteractionStructure;
	/**
	 * Channels specifically mentioned in this message
	 */
	mention_channels?: ChannelMentionStructure[];
	/**
	 * Whether this message mentions everyone
	 */
	mention_everyone: boolean;
	/**
	 * Roles specifically mentioned in this message
	 */
	mention_roles: Snowflake[];
	/**
	 * Users specifically mentioned in the message
	 */
	mentions: UserStructure[];
	/**
	 * Data showing the source of a crosspost, channel follow add, pin, or reply message
	 */
	message_reference?: MessageReferenceStructure;
	/**
	 * The message associated with the message_reference. This is a minimal subset of fields in a message (e.g. author is excluded.)
	 */
	message_snapshots?: MessageSnapshotStructure[];
	/**
	 * Used for validating a message was sent
	 */
	nonce?: Integer | string;
	/**
	 * Whether this message is pinned
	 */
	pinned: boolean;
	/**
	 * A poll!
	 */
	poll?: PollStructure;
	/**
	 * A generally increasing integer (there may be gaps or duplicates) that represents the approximate position of the message in a thread, it can be used to estimate the relative position of the message in a thread in company with total_message_sent on parent thread
	 */
	position?: Integer;
	/**
	 * Reactions to the message
	 */
	reactions?: ReactionStructure[];
	/**
	 * The message associated with the message_reference
	 */
	referenced_message?: MessageStructure | null;
	/**
	 * Data for users, members, channels, and roles in the message's auto-populated select menus
	 */
	resolved?: ResolvedDataStructure;
	/**
	 * Data of the role subscription purchase or renewal that prompted this ROLE_SUBSCRIPTION_PURCHASE message
	 */
	role_subscription_data?: RoleSubscriptionDataStructure;
	/**
	 * Sent if the message contains stickers
	 */
	sticker_items?: StickerItemStructure[];
	/**
	 * Deprecated the stickers sent with the message
	 *
	 * @deprecated Use `sticker_items` instead
	 */
	stickers?: StickerStructure[];
	/**
	 * The thread that was started from this message, includes thread member object
	 */
	thread?: ChannelStructure;
	/**
	 * When this message was sent
	 */
	timestamp: IsoO8601Timestamp;
	/**
	 * Whether this was a TTS message
	 */
	tts: boolean;
	/**
	 * Type of message
	 */
	type: MessageTypes;
	/**
	 * If the message is generated by a webhook, this is the webhook's ID
	 */
	webhook_id?: Snowflake;
};
