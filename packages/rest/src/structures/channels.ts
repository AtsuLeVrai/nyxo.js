import type { Integer, ISO8601, Snowflake } from "@nyxjs/core";
import type { DiscordHeaders } from "../globals/api";
import type { ApplicationIntegrationTypes, ApplicationStructure } from "./applications";
import type { EmojiStructure } from "./emojis";
import type { GuildMemberStructure } from "./guilds";
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
 * @see {@link https://discord.com/developers/docs/resources/channel#role-subscription-data-object-role-subscription-data-object-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types}
 */
export enum AllowedMentionTypes {
	Everyone = "everyone",
	Roles = "roles",
	Users = "users",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-mention-object-channel-mention-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
	/**
	 * This attachment has been edited using the remix feature on mobile
	 */
	IsRemix = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object-attachment-structure}
 */
export type AttachmentStructure = {
	/**
	 * The attachment's media type
	 */
	content_type?: DiscordHeaders["Content-Type"];
	/**
	 * Description for the file
	 */
	description?: string;
	/**
	 * The duration of the audio file (currently for voice messages)
	 */
	duration_secs?: number;
	/**
	 * Whether this attachment is ephemeral
	 */
	ephemeral?: boolean;
	/**
	 * Name of file attached
	 */
	filename: string;
	/**
	 * Attachment flags combined as a bitfield
	 */
	flags?: AttachmentFlags;
	/**
	 * Height of file (if image)
	 */
	height?: Integer | null;
	/**
	 * Attachment id
	 */
	id: Snowflake;
	/**
	 * A proxied url of file
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
	 * Source url of file
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
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure}
 */
export type EmbedFieldStructure = {
	/**
	 * Whether or not this field should display inline
	 */
	inline?: boolean;
	/**
	 * Name of the field
	 */
	name: string;
	/**
	 * Value of the field
	 */
	value: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure}
 */
export type EmbedFooterStructure = {
	/**
	 * Footer icon URL
	 */
	icon_url?: string;
	/**
	 * A proxied URL of the footer icon
	 */
	proxy_icon_url?: string;
	/**
	 * Footer text
	 */
	text: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure}
 */
export type EmbedAuthorStructure = {
	/**
	 * Author icon URL
	 */
	icon_url?: string;
	/**
	 * Author name
	 */
	name: string;
	/**
	 * A proxied URL of the author icon
	 */
	proxy_icon_url?: string;
	/**
	 * Author URL
	 */
	url?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-types}
 */
export enum EmbedTypes {
	Article = "article",
	Gifv = "gifv",
	Image = "image",
	Link = "link",
	Rich = "rich",
	Video = "video",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-structure}
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
	 * Fields information
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
	timestamp?: ISO8601;
	/**
	 * Title of the embed
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
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
 */
export type ForumTagStructure = {
	/**
	 * The id of a guild's custom emoji *
	 */
	emoji_id?: Snowflake | null;
	/**
	 * The unicode character of the emoji *
	 */
	emoji_name?: string | null;
	/**
	 * The id of the tag
	 */
	id: Snowflake;
	/**
	 * Whether this tag can only be added to or removed from threads by a member with the MANAGE_THREADS permission
	 */
	moderated: boolean;
	/**
	 * The name of the tag (0-20 characters)
	 */
	name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object-default-reaction-structure}
 */
export type DefaultReactionStructure = {
	/**
	 * The id of a guild's custom emoji
	 */
	emoji_id?: Snowflake | null;
	/**
	 * The unicode character of the emoji
	 */
	emoji_name?: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object-thread-member-structure}
 */
export type ThreadMemberStructure = {
	/**
	 * Any user-thread settings, currently only used for notifications
	 */
	flags: Integer;
	/**
	 * ID of the thread
	 */
	id?: Snowflake;
	/**
	 * Time the user last joined the thread
	 */
	join_timestamp: ISO8601;
	/**
	 * Additional information about the user
	 */
	member?: GuildMemberStructure;
	/**
	 * ID of the user
	 */
	user_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure}
 */
export type ThreadMetadataStructure = {
	/**
	 * Timestamp when the thread's archive status was last changed, used for calculating recent activity
	 */
	archive_timestamp: ISO8601;
	/**
	 * Whether the thread is archived
	 */
	archived: boolean;
	/**
	 * The thread will stop showing in the channel list after auto_archive_duration minutes of inactivity
	 */
	auto_archive_duration: Integer;
	/**
	 * Timestamp when the thread was created; only populated for threads created after 2022-01-09
	 */
	create_timestamp?: ISO8601 | null;
	/**
	 * Whether non-moderators can add other non-moderators to a thread; only available on private threads
	 */
	invitable?: boolean;
	/**
	 * Whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it
	 */
	locked: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export type OverwriteStructure = {
	/**
	 * Permission bit set
	 */
	allow: string;
	/**
	 * Permission bit set
	 */
	deny: string;
	/**
	 * Role or user id
	 */
	id: Snowflake;
	/**
	 * Either 0 (role) or 1 (member)
	 */
	type: 0 | 1;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#reaction-count-details-object-reaction-count-details-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#reaction-object-reaction-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object-followed-channel-structure}
 */
export type FollowedChannelStructure = {
	/**
	 * The source channel id
	 */
	channel_id: Snowflake;
	/**
	 * The created target webhook id
	 */
	webhook_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#message-snapshot-structure}
 */
export type MessageSnapshotStructure = {
	/**
	 * Minimal subset of fields in the forwarded message
	 */
	message: Pick<MessageStructure, "attachments" | "content" | "edited_timestamp" | "embeds" | "flags" | "mention_roles" | "mentions" | "timestamp" | "type">;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#message-reference-types}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#message-reference-structure}
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
	 * Type of reference
	 */
	type?: MessageReferenceTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#message-call-object-message-call-object-structure}
 */
export type MessageCallStructure = {
	/**
	 * Time when call ended
	 */
	ended_timestamp?: ISO8601 | null;
	/**
	 * Array of user object ids that participated in the call
	 */
	participants: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#message-interaction-metadata-object-message-interaction-metadata-structure}
 */
export type MessageInteractionMetadataStructure = {
	/**
	 * IDs for installation context(s) related to an interaction
	 */
	authorizing_integration_owners: Record<Snowflake, ApplicationIntegrationTypes>;
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
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object-message-flags}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object-message-activity-types}
 */
export enum MessageActivityTypes {
	Join = 1,
	Spectate = 2,
	Listen = 3,
	JoinRequest = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object-message-types}
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
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object-message-structure}
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
	 * If the message is an Interaction or application-owned webhook, this is the id of the application
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
	edited_timestamp: ISO8601 | null;
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
	 * @deprecated
	 */
	interaction?: MessageInteractionStructure;
	/**
	 * In preview. Sent if the message is sent as a result of an interaction
	 */
	interaction_metadata?: MessageInteractionMetadataStructure;
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
	resolved?: Pick<ResolvedDataStructure, "channels" | "members" | "roles" | "users">;
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
	 * @deprecated
	 */
	stickers?: StickerStructure[];
	/**
	 * The thread that was started from this message, includes thread member object
	 */
	thread?: ChannelStructure;
	/**
	 * When this message was sent
	 */
	timestamp: ISO8601;
	/**
	 * Whether this was a TTS message
	 */
	tts: boolean;
	/**
	 * Type of message
	 */
	type: MessageTypes;
	/**
	 * If the message is generated by a webhook, this is the webhook's id
	 */
	webhook_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types}
 */
export enum ForumLayoutTypes {
	/**
	 * No default has been set for forum channel
	 */
	NotSet = 0,
	/**
	 * Display posts as a list
	 */
	ListView = 1,
	/**
	 * Display posts as a collection of tiles
	 */
	GalleryView = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types}
 */
export enum SortOrderTypes {
	/**
	 * Sort forum posts by activity
	 */
	LatestActivity = 0,
	/**
	 * Sort forum posts by creation time (from most recent to oldest)
	 */
	CreationDate = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
 */
export enum ChannelFlags {
	/**
	 * This thread is pinned to the top of its parent GUILD_FORUM or GUILD_MEDIA channel
	 */
	Pinned = 2,
	/**
	 * Whether a tag is required to be specified when creating a thread in a GUILD_FORUM or a GUILD_MEDIA channel. Tags are specified in the applied_tags field.
	 */
	RequireTag = 16,
	/**
	 * When set hides the embedded media download options. Available only for media channels
	 */
	HideMediaDownloadOptions = 32_768,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes}
 */
export enum VideoQualityModes {
	Auto = 1,
	Full = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export enum ChannelTypes {
	/**
	 * A text channel within a server
	 */
	GuildText = 0,
	/**
	 * A direct message between users
	 */
	DM = 1,
	/**
	 * A voice channel within a server
	 */
	GuildVoice = 2,
	/**
	 * A direct message between multiple users
	 */
	GroupDM = 3,
	/**
	 * An organizational category that contains up to 50 channels
	 */
	GuildCategory = 4,
	/**
	 * A channel that users can follow and crosspost into their own server (formerly news channels)
	 */
	GuildAnnouncement = 5,
	/**
	 * A temporary sub-channel within a GUILD_ANNOUNCEMENT channel
	 */
	AnnouncementThread = 10,
	/**
	 * A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel
	 */
	PublicThread = 11,
	/**
	 * A temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
	 */
	PrivateThread = 12,
	/**
	 * A voice channel for hosting events with an audience
	 */
	GuildStageVoice = 13,
	/**
	 * The channel in a hub containing the listed servers
	 */
	GuildDirectory = 14,
	/**
	 * Channel that can only contain threads
	 */
	GuildForum = 15,
	/**
	 * Channel that can only contain threads, similar to GUILD_FORUM channels
	 */
	GuildMedia = 16,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export type ChannelStructure = {
	/**
	 * Application id of the group DM creator if it is bot-created
	 */
	application_id?: Snowflake;
	/**
	 * The IDs of the set of tags that have been applied to a thread in a GUILD_FORUM or a GUILD_MEDIA channel
	 */
	applied_tags?: Snowflake[];
	/**
	 * The set of tags that can be used in a GUILD_FORUM or a GUILD_MEDIA channel
	 */
	available_tags?: ForumTagStructure[];
	/**
	 * The bitrate (in bits) of the voice channel
	 */
	bitrate?: Integer;
	/**
	 * Default duration, copied onto newly created threads, in minutes, threads will stop showing in the channel list after the specified period of inactivity, can be set to: 60, 1440, 4320, 10080
	 */
	default_auto_archive_duration?: Integer;
	/**
	 * The default forum layout view used to display posts in GUILD_FORUM channels. Defaults to 0, which indicates a layout view has not been set by a channel admin
	 */
	default_forum_layout?: ForumLayoutTypes;
	/**
	 * The emoji to show in the add reaction button on a thread in a GUILD_FORUM or a GUILD_MEDIA channel
	 */
	default_reaction_emoji?: DefaultReactionStructure | null;
	/**
	 * The default sort order type used to order posts in GUILD_FORUM and GUILD_MEDIA channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin
	 */
	default_sort_order?: SortOrderTypes | null;
	/**
	 * The initial rate_limit_per_user to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update.
	 */
	default_thread_rate_limit_per_user?: Integer;
	/**
	 * Channel flags combined as a bitfield
	 */
	flags?: ChannelFlags;
	/**
	 * The id of the guild (may be missing for some channel objects received over gateway guild dispatches)
	 */
	guild_id?: Snowflake;
	/**
	 * Icon hash of the group DM
	 */
	icon?: string | null;
	/**
	 * The id of this channel
	 */
	id: Snowflake;
	/**
	 * The id of the last message sent in this channel (or thread for GUILD_FORUM or GUILD_MEDIA channels) (may not point to an existing or valid message or thread)
	 */
	last_message_id?: Snowflake | null;
	/**
	 * When the last pinned message was pinned. This may be null in events such as GUILD_CREATE when a message is not pinned.
	 */
	last_pin_timestamp?: ISO8601 | null;
	/**
	 * For group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope
	 */
	managed?: boolean;
	/**
	 * Thread member object for the current user, if they have joined the thread, only included on certain API endpoints
	 */
	member?: ThreadMemberStructure;
	/**
	 * An approximate count of users in a thread, stops counting at 50
	 */
	member_count?: Integer;
	/**
	 * Number of messages (not including the initial message or deleted messages) in a thread.
	 */
	message_count?: Integer;
	/**
	 * The name of the channel (1-100 characters)
	 */
	name?: string | null;
	/**
	 * Whether the channel is nsfw
	 */
	nsfw?: boolean;
	/**
	 * ID of the creator of the group DM or thread
	 */
	owner_id?: Snowflake;
	/**
	 * For guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created
	 */
	parent_id?: Snowflake | null;
	/**
	 * Explicit permission overwrites for members and roles
	 */
	permission_overwrites?: OverwriteStructure[];
	/**
	 * Computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction. This does not include implicit permissions, which may need to be checked separately
	 */
	permissions?: string;
	/**
	 * Sorting position of the channel (channels with the same position are sorted by id)
	 */
	position?: Integer;
	/**
	 * Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected
	 */
	rate_limit_per_user?: Integer;
	/**
	 * The recipients of the DM
	 */
	recipients?: UserStructure[];
	/**
	 * Voice region id for the voice channel, automatic when set to null
	 */
	rtc_region?: string | null;
	/**
	 * Thread-specific fields not needed by other channels
	 */
	thread_metadata?: ThreadMetadataStructure;
	/**
	 * The channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others)
	 */
	topic?: string | null;
	/**
	 * Number of messages ever sent in a thread, it's similar to message_count on message creation, but will not decrement the number when a message is deleted
	 */
	total_message_sent?: Integer;
	/**
	 * The type of channel
	 */
	type: ChannelTypes;
	/**
	 * The user limit of the voice channel
	 */
	user_limit?: Integer;
	/**
	 * The camera video quality mode of the voice channel, 1 when not present
	 */
	video_quality_mode?: VideoQualityModes;
};
