import type { Integer, Iso8601 } from "../formatting/index.js";
import type { BitFieldResolvable, Snowflake } from "../utils/index.js";
import type {
  ApplicationEntity,
  ApplicationIntegrationType,
} from "./application.js";
import type { ChannelEntity, ChannelType } from "./channel.js";
import type { EmojiEntity } from "./emoji.js";
import type {
  InteractionResolvedData,
  InteractionType,
  MessageInteractionEntity,
} from "./interaction.js";
import type { ActionRowEntity } from "./message-components.js";
import type { PollEntity } from "./poll.js";
import type { StickerEntity, StickerItemEntity } from "./sticker.js";
import type { UserEntity } from "./user.js";

/**
 * Represents data about a role subscription.
 *
 * @remarks
 * Contains information about a role subscription purchase or renewal, including
 * subscription duration and tier information.
 *
 * @example
 * ```typescript
 * const roleData: RoleSubscriptionDataEntity = {
 *   role_subscription_listing_id: "123456789",
 *   tier_name: "Premium",
 *   total_months_subscribed: 6,
 *   is_renewal: true,
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export interface RoleSubscriptionDataEntity {
  /** The ID of the SKU and listing that the user is subscribed to */
  role_subscription_listing_id: Snowflake;
  /** The name of the tier that the user is subscribed to */
  tier_name: string;
  /** The cumulative number of months that the user has been subscribed for */
  total_months_subscribed: number;
  /** Whether this notification is for a renewal rather than a new purchase */
  is_renewal: boolean;
}

/**
 * Represents configuration for allowed mentions in a message.
 *
 * @remarks
 * This interface allows for more granular control over what mentions are processed
 * in a message, helping prevent unwanted pings.
 *
 * @example
 * ```typescript
 * const allowedMentions: AllowedMentionsEntity = {
 *   parse: ["users", "roles"],
 *   users: ["123456789"],
 *   roles: ["987654321"],
 *   replied_user: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export interface AllowedMentionsEntity {
  /** An array of allowed mention types to parse from the content */
  parse: AllowedMentionType[];
  /** Array of role_ids to mention (Max size of 100) */
  roles?: Snowflake[];
  /** Array of user_ids to mention (Max size of 100) */
  users?: Snowflake[];
  /** For replies, whether to mention the author of the message being replied to */
  replied_user?: boolean;
}

/**
 * Represents the allowed types of mentions that can be processed.
 *
 * @remarks
 * Used to control which types of mentions are allowed in a message.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export type AllowedMentionType = "roles" | "users" | "everyone";

/**
 * Represents a mentioned channel in a message.
 *
 * @remarks
 * Contains information about a channel that was mentioned in a message.
 * Only channels that are visible to everyone in a lurkable guild will be included.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-channel-mention-structure}
 */
export interface ChannelMentionEntity {
  /** ID of the channel */
  id: Snowflake;
  /** ID of the guild containing the channel */
  guild_id: Snowflake;
  /** The type of channel */
  type: ChannelType;
  /** The name of the channel */
  name: string;
}

/**
 * Represents flags that can be applied to message attachments.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
  /** This attachment has been edited using the remix feature on mobile */
  IsRemix = 1 << 2,
}

/**
 * Represents a file attached to a message.
 *
 * @remarks
 * Contains metadata about files attached to a message, including dimensions for images
 * and special fields for voice messages.
 *
 * @example
 * ```typescript
 * const attachment: AttachmentEntity = {
 *   id: "123456789",
 *   filename: "example.png",
 *   size: 12345,
 *   url: "https://cdn.discord.com/attachments/...",
 *   proxy_url: "https://media.discord.com/attachments/..."
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export interface AttachmentEntity {
  /** Attachment ID */
  id: Snowflake;
  /** Name of file attached */
  filename: string;
  /** Title of the file */
  title?: string;
  /** Description for the file (max 1024 characters) */
  description?: string;
  /** The attachment's media type */
  content_type?: string;
  /** Size of file in bytes */
  size: Integer;
  /** Source URL of file */
  url: string;
  /** A proxied URL of file */
  proxy_url: string;
  /** Height of file if image */
  height?: Integer | null;
  /** Width of file if image */
  width?: Integer | null;
  /** Whether this attachment is ephemeral */
  ephemeral?: boolean;
  /** Duration of audio file in seconds (for voice messages) */
  duration_secs?: number;
  /** Base64 encoded bytearray representing a sampled waveform (for voice messages) */
  waveform?: string;
  /** Attachment flags combined as a bitfield */
  flags?: BitFieldResolvable<AttachmentFlags>;
}

/**
 * Represents a field in a message embed.
 *
 * @remarks
 * A field has a name, value, and optional inline property that determines
 * its layout in the embed.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export interface EmbedFieldEntity {
  /** Name of the field */
  name: string;
  /** Value of the field */
  value: string;
  /** Whether or not this field should display inline */
  inline?: boolean;
}

/**
 * Represents the footer section of a message embed.
 *
 * @remarks
 * Contains text and optional icon for the embed footer.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export interface EmbedFooterEntity {
  /** Footer text */
  text: string;
  /** URL of footer icon (only supports http(s) and attachments) */
  icon_url?: string;
  /** A proxied URL of footer icon */
  proxy_icon_url?: string;
}

/**
 * Represents the author section of a message embed.
 *
 * @remarks
 * Contains information about the author, including name and optional icon/URL.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export interface EmbedAuthorEntity {
  /** Name of author */
  name: string;
  /** URL of author (only supports http(s)) */
  url?: string;
  /** URL of author icon (only supports http(s) and attachments) */
  icon_url?: string;
  /** A proxied URL of author icon */
  proxy_icon_url?: string;
}

/**
 * Represents the provider of a message embed.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export interface EmbedProviderEntity {
  /** Name of provider */
  name?: string;
  /** URL of provider */
  url?: string;
}

/**
 * Represents an image in a message embed.
 *
 * @remarks
 * Contains information about an embedded image, including dimensions and URLs.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export interface EmbedImageEntity {
  /** Source URL of image (only supports http(s) and attachments) */
  url: string;
  /** A proxied URL of the image */
  proxy_url?: string;
  /** Height of image */
  height?: Integer;
  /** Width of image */
  width?: Integer;
}

/**
 * Represents a video in a message embed.
 *
 * @remarks
 * Contains information about an embedded video, including dimensions and URLs.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export interface EmbedVideoEntity {
  /** Source URL of video */
  url?: string;
  /** A proxied URL of the video */
  proxy_url?: string;
  /** Height of video */
  height?: Integer;
  /** Width of video */
  width?: Integer;
}

/**
 * Represents a thumbnail in a message embed.
 *
 * @remarks
 * Contains information about an embed's thumbnail image.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export interface EmbedThumbnailEntity {
  /** Source URL of thumbnail (only supports http(s) and attachments) */
  url: string;
  /** A proxied URL of the thumbnail */
  proxy_url?: string;
  /** Height of thumbnail */
  height?: Integer;
  /** Width of thumbnail */
  width?: Integer;
}

/**
 * Represents the different types of embeds that can be used in a message.
 *
 * @remarks
 * Different types of embeds have different layouts and purposes.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export enum EmbedType {
  /** Generic embed rendered from embed attributes */
  Rich = "rich",
  /** Image embed */
  Image = "image",
  /** Video embed */
  Video = "video",
  /** Animated gif image embed rendered as a video embed */
  Gifv = "gifv",
  /** Article embed */
  Article = "article",
  /** Link embed */
  Link = "link",
  /** Poll result embed */
  PollResult = "poll_result",
}

/**
 * Represents an embed attached to a message.
 *
 * @remarks
 * Rich embeds can be used to display structured data with titles, descriptions,
 * fields, and various media elements.
 *
 * @example
 * ```typescript
 * const embed: EmbedEntity = {
 *   title: "Example Embed",
 *   description: "This is a sample embed",
 *   color: 0x00ff00,
 *   fields: [
 *     { name: "Field 1", value: "Value 1", inline: true },
 *     { name: "Field 2", value: "Value 2", inline: true }
 *   ]
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export interface EmbedEntity {
  /** Title of embed */
  title?: string;
  /** Type of embed */
  type?: EmbedType;
  /** Description of embed */
  description?: string;
  /** URL of embed */
  url?: string;
  /** Timestamp of embed content */
  timestamp?: Iso8601;
  /** Color code of the embed */
  color?: Integer;
  /** Footer information */
  footer?: EmbedFooterEntity;
  /** Image information */
  image?: EmbedImageEntity;
  /** Thumbnail information */
  thumbnail?: EmbedThumbnailEntity;
  /** Video information */
  video?: EmbedVideoEntity;
  /** Provider information */
  provider?: EmbedProviderEntity;
  /** Author information */
  author?: EmbedAuthorEntity;
  /** Fields information (max of 25) */
  fields?: EmbedFieldEntity[];
}

/**
 * Represents detailed information about reaction counts.
 *
 * @remarks
 * Provides a breakdown of normal and "super" reaction counts.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export interface ReactionCountDetailsEntity {
  /** Count of super reactions */
  burst: Integer;
  /** Count of normal reactions */
  normal: Integer;
}

/**
 * Represents a reaction to a message.
 *
 * @remarks
 * Contains information about an emoji reaction including counts and burst colors.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export interface ReactionEntity {
  /** Total number of times this emoji has been used to react */
  count: Integer;
  /** Detailed breakdown of reaction counts */
  count_details: ReactionCountDetailsEntity;
  /** Whether the current user reacted using this emoji */
  me: boolean;
  /** Whether the current user super-reacted using this emoji */
  me_burst: boolean;
  /** Emoji information */
  emoji: Partial<EmojiEntity>;
  /** HEX colors used for super reaction */
  burst_colors: unknown[];
}

/**
 * Represents a snapshot of a message's content at a specific point in time.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-structure}
 */
export interface MessageSnapshotEntity {
  /** Subset of message fields at the time of snapshot */
  message: Pick<
    MessageEntity,
    | "type"
    | "content"
    | "embeds"
    | "attachments"
    | "timestamp"
    | "edited_timestamp"
    | "flags"
    | "mentions"
    | "mention_roles"
    | "stickers"
    | "sticker_items"
    | "components"
  >;
}

/**
 * Represents the types of message references.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceType {
  /** A standard reference used by replies */
  Default = 0,
  /** Reference used to point to a message at a point in time */
  Forward = 1,
}

/**
 * Represents a reference to another message.
 *
 * @remarks
 * Used for replies, forwards, and other types of message references.
 * When referencing a message as a reply, only message_id is required.
 *
 * @example
 * ```typescript
 * const reference: MessageReferenceEntity = {
 *   message_id: "123456789",
 *   channel_id: "987654321",
 *   guild_id: "111222333",
 *   fail_if_not_exists: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export interface MessageReferenceEntity {
  /** Type of reference */
  type?: MessageReferenceType;
  /** ID of the originating message */
  message_id?: Snowflake;
  /** ID of the originating message's channel */
  channel_id?: Snowflake;
  /** ID of the originating message's guild */
  guild_id?: Snowflake;
  /** When sending, whether to error if the referenced message doesn't exist */
  fail_if_not_exists?: boolean;
}

/**
 * Represents a voice or video call associated with a message.
 *
 * @remarks
 * Contains information about participants and end time of a call in a private channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export interface MessageCallEntity {
  /** Array of user IDs that participated in the call */
  participants: Snowflake[];
  /** Time when the call ended */
  ended_timestamp?: Iso8601 | null;
}

/**
 * Represents metadata for a modal submit interaction.
 *
 * @remarks
 * Contains information about the interaction chain that led to the modal submission.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-modal-submit-interaction-metadata-structure}
 */
export interface ModalSubmitInteractionMetadataEntity {
  /** ID of the interaction */
  id: Snowflake;
  /** Type of interaction */
  type: InteractionType;
  /** User who triggered the interaction */
  user: UserEntity;
  /** IDs for installation contexts related to an interaction */
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  /** ID of the original response message */
  original_response_message_id?: Snowflake;
  /** Metadata for the triggering interaction */
  triggering_interaction_metadata:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity;
}

/**
 * Represents metadata for a message component interaction.
 *
 * @remarks
 * Contains information about button clicks and other component interactions.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-component-interaction-metadata-structure}
 */
export interface MessageComponentInteractionMetadataEntity {
  /** ID of the interaction */
  id: Snowflake;
  /** Type of interaction */
  type: InteractionType;
  /** User who triggered the interaction */
  user: UserEntity;
  /** IDs for installation contexts related to an interaction */
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  /** ID of the original response message */
  original_response_message_id?: Snowflake;
  /** ID of the message that was interacted with */
  interacted_message_id: Snowflake;
}

/**
 * Represents metadata for an application command interaction.
 *
 * @remarks
 * Contains information about slash commands and context menu commands.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-application-command-interaction-metadata-structure}
 */
export interface ApplicationCommandInteractionMetadataEntity {
  /** ID of the interaction */
  id: Snowflake;
  /** Type of interaction */
  type: InteractionType;
  /** User who triggered the interaction */
  user: UserEntity;
  /** IDs for installation contexts related to an interaction */
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  /** ID of the original response message */
  original_response_message_id?: Snowflake;
  /** Target user for context menu commands */
  target_user?: UserEntity;
  /** ID of the target message for context menu commands */
  target_message_id?: Snowflake;
}

/**
 * Represents the message flags that can be applied to a message.
 *
 * @remarks
 * Flags determine various properties and behaviors of messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
 */
export enum MessageFlags {
  /** Message has been published to subscribed channels */
  Crossposted = 1 << 0,
  /** Message originated from a message in another channel */
  IsCrosspost = 1 << 1,
  /** Do not include any embeds when serializing this message */
  SuppressEmbeds = 1 << 2,
  /** Source message for this crosspost has been deleted */
  SourceMessageDeleted = 1 << 3,
  /** Message came from the urgent message system */
  Urgent = 1 << 4,
  /** Message has an associated thread */
  HasThread = 1 << 5,
  /** Message is only visible to the user who invoked the Interaction */
  Ephemeral = 1 << 6,
  /** Message is an Interaction Response and the bot is "thinking" */
  Loading = 1 << 7,
  /** Message failed to mention some roles and add their members to the thread */
  FailedToMentionSomeRolesInThread = 1 << 8,
  /** Message will not trigger push and desktop notifications */
  SuppressNotifications = 1 << 12,
  /** Message is a voice message */
  IsVoiceMessage = 1 << 13,
}

/**
 * Represents the types of message activities.
 *
 * @remarks
 * Used for Rich Presence-related chat embeds.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export enum MessageActivityType {
  /** User joined activity */
  Join = 1,
  /** User spectated activity */
  Spectate = 2,
  /** User is listening */
  Listen = 3,
  /** User requested to join activity */
  JoinRequest = 5,
}

/**
 * Represents a message activity.
 *
 * @remarks
 * Contains information about Rich Presence-related chat embeds.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export interface MessageActivityEntity {
  /** Type of message activity */
  type: MessageActivityType;
  /** Party ID from Rich Presence event */
  party_id?: string;
}

/**
 * Represents the different types of messages.
 *
 * @remarks
 * Determines how the message is displayed and what information it contains.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export enum MessageType {
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
  PollResult = 46,
}

/**
 * Represents a message in Discord.
 *
 * @remarks
 * The core message object containing all message data, including content,
 * embeds, attachments, and metadata.
 *
 * @example
 * ```typescript
 * const message: MessageEntity = {
 *   id: "123456789",
 *   channel_id: "987654321",
 *   author: {
 *     id: "111222333",
 *     username: "Example User",
 *     discriminator: "1234"
 *   },
 *   content: "Hello, World!",
 *   timestamp: "2023-01-01T00:00:00.000Z",
 *   edited_timestamp: null,
 *   tts: false,
 *   mention_everyone: false,
 *   mentions: [],
 *   mention_roles: [],
 *   attachments: [],
 *   embeds: [],
 *   pinned: false,
 *   type: MessageType.Default
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-structure}
 */
export interface MessageEntity {
  /** ID of the message */
  id: Snowflake;
  /** ID of the channel the message was sent in */
  channel_id: Snowflake;
  /** Author of this message (only guaranteed to be a valid user for normal messages) */
  author: UserEntity;
  /** Contents of the message */
  content: string;
  /** When this message was sent */
  timestamp: Iso8601;
  /** When this message was edited (null if never) */
  edited_timestamp: Iso8601 | null;
  /** Whether this was a TTS message */
  tts: boolean;
  /** Whether this message mentions everyone */
  mention_everyone: boolean;
  /** Users specifically mentioned in the message */
  mentions: UserEntity[];
  /** Roles specifically mentioned in this message */
  mention_roles: Snowflake[];
  /** Channels specifically mentioned in this message */
  mention_channels?: ChannelMentionEntity[];
  /** Any attached files */
  attachments: AttachmentEntity[];
  /** Any embedded content */
  embeds: EmbedEntity[];
  /** Reactions to the message */
  reactions?: ReactionEntity[];
  /** Used for validating a message was sent */
  nonce?: Integer | string;
  /** Whether this message is pinned */
  pinned: boolean;
  /** If the message is generated by a webhook, this is the webhook's id */
  webhook_id?: Snowflake;
  /** Type of message */
  type: MessageType;
  /** Rich presence metadata */
  activity?: MessageActivityEntity;
  /** Application metadata */
  application?: Partial<ApplicationEntity>;
  /** If the message is an Interaction response, this is the id of the interaction's application */
  application_id?: Snowflake;
  /** Message flags combined as a bitfield */
  flags?: BitFieldResolvable<MessageFlags>;
  /** Reference data sent with crossposted messages, replies, pins, etc. */
  message_reference?: MessageReferenceEntity;
  /** Snapshots of message data at different points in time */
  message_snapshots?: MessageSnapshotEntity[];
  /** For replies, the original message that was replied to */
  referenced_message?: MessageEntity | null;
  /** Metadata about the interaction that generated this message */
  interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity;
  /** @deprecated Deprecated in favor of interaction_metadata */
  interaction?: MessageInteractionEntity;
  /** Thread that was started from this message */
  thread?: ChannelEntity;
  /** Message components (buttons, select menus, etc.) */
  components?: ActionRowEntity[];
  /** The sticker items sent with the message */
  sticker_items?: StickerItemEntity[];
  /** @deprecated Deprecated the stickers sent with the message */
  stickers?: StickerEntity[];
  /** Approximate position in a thread */
  position?: Integer;
  /** Data about role subscription purchase/renewal */
  role_subscription_data?: RoleSubscriptionDataEntity;
  /** Resolved data for interaction responses */
  resolved?: InteractionResolvedData;
  /** Poll attached to the message */
  poll?: PollEntity;
  /** Voice/video call data */
  call?: MessageCallEntity;
}
