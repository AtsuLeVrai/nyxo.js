import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import type { ApplicationEntity } from "./application.entity.js";
import type { AnyThreadChannelEntity, ChannelType } from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";
import type {
  InteractionResolvedDataEntity,
  InteractionType,
} from "./interaction.entity.js";
import type { ActionRowEntity } from "./message-components.entity.js";
import type { PollEntity } from "./poll.entity.js";
import type { StickerEntity, StickerItemEntity } from "./sticker.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Defines the types of mentions that can be allowed in messages.
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export enum AllowedMentionType {
  /** Controls role mentions */
  RoleMentions = "roles",

  /** Controls user mentions */
  UserMentions = "users",

  /** Controls @everyone and @here mentions */
  EveryoneMentions = "everyone",
}

/**
 * Defines the flags that can be applied to message attachments.
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
  /** This attachment has been edited using the remix feature on mobile */
  IsRemix = 1 << 2,
}

/**
 * Defines the types of embeds that can be included in a message.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export enum EmbedType {
  /** Generic rich embed (default) */
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
 * Defines the types of message references.
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceType {
  /** Standard reference used by replies */
  Default = 0,

  /** Reference used to point to a message at a point in time */
  Forward = 1,
}

/**
 * Defines the flags that can be applied to messages.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
 */
export enum MessageFlags {
  /** Message has been published to subscribed channels (via Channel Following) */
  Crossposted = 1 << 0,

  /** Message originated from a message in another channel (via Channel Following) */
  IsCrosspost = 1 << 1,

  /** Do not include any embeds when serializing this message */
  SuppressEmbeds = 1 << 2,

  /** Source message for this crosspost has been deleted (via Channel Following) */
  SourceMessageDeleted = 1 << 3,

  /** Message came from the urgent message system */
  Urgent = 1 << 4,

  /** Message has an associated thread, with the same id as the message */
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

  /** Message has a snapshot (via Message Forwarding) */
  HasSnapshot = 1 << 14,
}

/**
 * Defines the types of activities that can be associated with a message.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export enum MessageActivityType {
  /** User joined */
  Join = 1,

  /** User is spectating */
  Spectate = 2,

  /** User is listening */
  Listen = 3,

  /** User requested to join */
  JoinRequest = 5,
}

/**
 * Defines the different types of messages that can be sent in Discord.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export enum MessageType {
  /** Default message */
  Default = 0,

  /** Recipient added to group DM */
  RecipientAdd = 1,

  /** Recipient removed from group DM */
  RecipientRemove = 2,

  /** Call message */
  Call = 3,

  /** Channel name change */
  ChannelNameChange = 4,

  /** Channel icon change */
  ChannelIconChange = 5,

  /** Channel pinned message */
  ChannelPinnedMessage = 6,

  /** User joined guild */
  UserJoin = 7,

  /** Guild boost */
  GuildBoost = 8,

  /** Guild reached boost tier 1 */
  GuildBoostTier1 = 9,

  /** Guild reached boost tier 2 */
  GuildBoostTier2 = 10,

  /** Guild reached boost tier 3 */
  GuildBoostTier3 = 11,

  /** Channel follow add */
  ChannelFollowAdd = 12,

  /** Guild discovery disqualified */
  GuildDiscoveryDisqualified = 14,

  /** Guild discovery requalified */
  GuildDiscoveryRequalified = 15,

  /** Guild discovery grace period initial warning */
  GuildDiscoveryGracePeriodInitialWarning = 16,

  /** Guild discovery grace period final warning */
  GuildDiscoveryGracePeriodFinalWarning = 17,

  /** Thread created */
  ThreadCreated = 18,

  /** Reply to a message */
  Reply = 19,

  /** Application command */
  ChatInputCommand = 20,

  /** Thread starter message */
  ThreadStarterMessage = 21,

  /** Guild invite reminder */
  GuildInviteReminder = 22,

  /** Context menu command */
  ContextMenuCommand = 23,

  /** Auto-moderation action */
  AutoModerationAction = 24,

  /** Role subscription purchase */
  RoleSubscriptionPurchase = 25,

  /** Interaction premium upsell */
  InteractionPremiumUpsell = 26,

  /** Stage start */
  StageStart = 27,

  /** Stage end */
  StageEnd = 28,

  /** Stage speaker */
  StageSpeaker = 29,

  /** Stage topic */
  StageTopic = 31,

  /** Guild application premium subscription */
  GuildApplicationPremiumSubscription = 32,

  /** Guild incident alert mode enabled */
  GuildIncidentAlertModeEnabled = 36,

  /** Guild incident alert mode disabled */
  GuildIncidentAlertModeDisabled = 37,

  /** Guild incident report raid */
  GuildIncidentReportRaid = 38,

  /** Guild incident report false alarm */
  GuildIncidentReportFalseAlarm = 39,

  /** Purchase notification */
  PurchaseNotification = 44,

  /** Poll result */
  PollResult = 46,
}

/**
 * Represents data for role subscription purchase events.
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export interface RoleSubscriptionDataEntity {
  /** ID of the SKU and listing that the user subscribed to */
  role_subscription_listing_id: Snowflake;

  /** Name of the tier that the user is subscribed to */
  tier_name: string;

  /** The cumulative number of months that the user has been subscribed for */
  total_months_subscribed: number;

  /** Whether this notification is for a renewal rather than a new purchase */
  is_renewal: boolean;
}

/**
 * Controls which mentions are allowed in a message.
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export const AllowedMentionsEntity = z.object({
  /** An array of allowed mention types to parse from the content */
  parse: z.array(z.nativeEnum(AllowedMentionType)),

  /** Array of role IDs to mention (max 100) */
  roles: z.array(Snowflake).max(100).optional(),

  /** Array of user IDs to mention (max 100) */
  users: z.array(Snowflake).max(100).optional(),

  /** For replies, whether to mention the author of the message being replied to */
  replied_user: z.boolean().optional(),
});

export type AllowedMentionsEntity = z.infer<typeof AllowedMentionsEntity>;

/**
 * Represents a channel mention in message content.
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
 * Represents a file attached to a message.
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export const AttachmentEntity = z.object({
  /** Attachment ID */
  id: Snowflake,

  /** Name of the attached file */
  filename: z.string(),

  /** Title of the file */
  title: z.string().optional(),

  /** Description of the file (max 1024 characters) */
  description: z.string().max(1024).optional(),

  /** The attachment's media type */
  content_type: z.string().optional(),

  /** Size of file in bytes */
  size: z.number().int(),

  /** Source URL of file */
  url: z.string().url(),

  /** A proxied URL of the file */
  proxy_url: z.string().url(),

  /** Height of file (if image) */
  height: z.number().int().nullish(),

  /** Width of file (if image) */
  width: z.number().int().nullish(),

  /** Whether this attachment is ephemeral */
  ephemeral: z.boolean().optional(),

  /** The duration of the audio file (for voice messages) */
  duration_secs: z.number().optional(),

  /** Base64 encoded bytearray representing a sampled waveform (for voice messages) */
  waveform: z.string().optional(),

  /** Attachment flags */
  flags: z.custom<AttachmentFlags>(BitFieldManager.isValidBitField).optional(),
});

export type AttachmentEntity = z.infer<typeof AttachmentEntity>;

/**
 * Represents a field in an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export const EmbedFieldEntity = z.object({
  /** Name of the field (1-256 characters) */
  name: z.string().min(1).max(256),

  /** Value of the field (1-1024 characters) */
  value: z.string().min(1).max(1024),

  /** Whether or not this field should display inline */
  inline: z.boolean().optional(),
});

export type EmbedFieldEntity = z.infer<typeof EmbedFieldEntity>;

/**
 * Represents the footer of an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export const EmbedFooterEntity = z.object({
  /** Footer text (1-2048 characters) */
  text: z.string().min(1).max(2048),

  /** URL of footer icon */
  icon_url: z.string().url().optional(),

  /** A proxied URL of the footer icon */
  proxy_icon_url: z.string().url().optional(),
});

export type EmbedFooterEntity = z.infer<typeof EmbedFooterEntity>;

/**
 * Represents the author of an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export const EmbedAuthorEntity = z.object({
  /** Name of author (1-256 characters) */
  name: z.string().min(1).max(256),

  /** URL of author */
  url: z.string().url().optional(),

  /** URL of author icon */
  icon_url: z.string().url().optional(),

  /** A proxied URL of author icon */
  proxy_icon_url: z.string().url().optional(),
});

export type EmbedAuthorEntity = z.infer<typeof EmbedAuthorEntity>;

/**
 * Represents the provider of an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export const EmbedProviderEntity = z.object({
  /** Name of provider */
  name: z.string().optional(),

  /** URL of provider */
  url: z.string().url().optional(),
});

export type EmbedProviderEntity = z.infer<typeof EmbedProviderEntity>;

/**
 * Represents an image in an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export const EmbedImageEntity = z.object({
  /** Source URL of image */
  url: z.string().url(),

  /** A proxied URL of the image */
  proxy_url: z.string().url().optional(),

  /** Height of image */
  height: z.number().int().optional(),

  /** Width of image */
  width: z.number().int().optional(),
});

export type EmbedImageEntity = z.infer<typeof EmbedImageEntity>;

/**
 * Represents a video in an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export const EmbedVideoEntity = z.object({
  /** Source URL of video */
  url: z.string().url().optional(),

  /** A proxied URL of the video */
  proxy_url: z.string().url().optional(),

  /** Height of video */
  height: z.number().int().optional(),

  /** Width of video */
  width: z.number().int().optional(),
});

export type EmbedVideoEntity = z.infer<typeof EmbedVideoEntity>;

/**
 * Represents a thumbnail in an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export const EmbedThumbnailEntity = z.object({
  /** Source URL of thumbnail */
  url: z.string().url(),

  /** A proxied URL of the thumbnail */
  proxy_url: z.string().url().optional(),

  /** Height of thumbnail */
  height: z.number().int().optional(),

  /** Width of thumbnail */
  width: z.number().int().optional(),
});

export type EmbedThumbnailEntity = z.infer<typeof EmbedThumbnailEntity>;

/**
 * Represents an embed in a message.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export const EmbedEntity = z.object({
  /** Title of embed (0-256 characters) */
  title: z.string().max(256).optional(),

  /** Type of embed (always "rich" for webhook embeds) */
  type: z.nativeEnum(EmbedType).default(EmbedType.Rich),

  /** Description of embed (0-4096 characters) */
  description: z.string().max(4096).optional(),

  /** URL of embed */
  url: z.string().url().optional(),

  /** Timestamp of embed content */
  timestamp: z.string().datetime().optional(),

  /** Color code of the embed */
  color: z.number().int().optional(),

  /** Footer information */
  footer: EmbedFooterEntity.optional(),

  /** Image information */
  image: EmbedImageEntity.optional(),

  /** Thumbnail information */
  thumbnail: EmbedThumbnailEntity.optional(),

  /** Video information */
  video: EmbedVideoEntity.optional(),

  /** Provider information */
  provider: EmbedProviderEntity.optional(),

  /** Author information */
  author: EmbedAuthorEntity.optional(),

  /** Fields information (max 25) */
  fields: z.array(EmbedFieldEntity).max(25).optional(),
});

export type EmbedEntity = z.infer<typeof EmbedEntity>;

/**
 * Represents the breakdown of reaction counts for normal and super reactions.
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export interface ReactionCountDetailsEntity {
  /** Count of super reactions */
  burst: number;

  /** Count of normal reactions */
  normal: number;
}

/**
 * Represents a reaction to a message.
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export interface ReactionEntity {
  /** Total number of times this emoji has been used to react */
  count: number;

  /** Breakdown of normal and super reaction counts */
  count_details: ReactionCountDetailsEntity;

  /** Whether the current user reacted using this emoji */
  me: boolean;

  /** Whether the current user super-reacted using this emoji */
  me_burst: boolean;

  /** Emoji information */
  emoji: Partial<EmojiEntity>;

  /** HEX colors used for super reaction */
  burst_colors?: string[];
}

/**
 * Represents a reference to another message.
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export const MessageReferenceEntity = z.object({
  /** Type of reference */
  type: z
    .nativeEnum(MessageReferenceType)
    .default(MessageReferenceType.Default),

  /** ID of the originating message */
  message_id: Snowflake.optional(),

  /** ID of the originating message's channel */
  channel_id: Snowflake.optional(),

  /** ID of the originating message's guild */
  guild_id: Snowflake.optional(),

  /** When sending, whether to error if the referenced message doesn't exist */
  fail_if_not_exists: z.boolean().optional(),
});

export type MessageReferenceEntity = z.infer<typeof MessageReferenceEntity>;

/**
 * Represents call information associated with a message.
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export interface MessageCallEntity {
  /** Array of user IDs that participated in the call */
  participants: Snowflake[];

  /** Time when the call ended */
  ended_timestamp?: string | null;
}

/**
 * Represents metadata about a message component interaction.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-component-interaction-metadata-structure}
 */
export interface MessageComponentInteractionMetadataEntity {
  /** ID of the interaction */
  id: Snowflake;

  /** Type of interaction */
  type: InteractionType;

  /** User who triggered the interaction */
  user: UserEntity;

  /** IDs for installation context(s) related to an interaction */
  authorizing_integration_owners: Record<string, Snowflake>;

  /** ID of the original response message, present only on follow-up messages */
  original_response_message_id?: Snowflake;

  /** ID of the message that contained the interactive component */
  interacted_message_id?: Snowflake;
}

/**
 * Represents metadata about an application command interaction.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-application-command-interaction-metadata-structure}
 */
export interface ApplicationCommandInteractionMetadataEntity {
  /** ID of the interaction */
  id: Snowflake;

  /** Type of interaction */
  type: InteractionType;

  /** User who triggered the interaction */
  user: UserEntity;

  /** IDs for installation context(s) related to an interaction */
  authorizing_integration_owners: Record<string, Snowflake>;

  /** ID of the original response message, present only on follow-up messages */
  original_response_message_id?: Snowflake;

  /** The user the command was run on, present only on user command interactions */
  target_user?: UserEntity;

  /** The ID of the message the command was run on, present only on message command interactions */
  target_message_id?: Snowflake;
}

/**
 * Represents metadata about a modal submit interaction.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-modal-submit-interaction-metadata-structure}
 */
export interface ModalSubmitInteractionMetadataEntity {
  /** ID of the interaction */
  id: Snowflake;

  /** Type of interaction */
  type: InteractionType;

  /** User who triggered the interaction */
  user: UserEntity;

  /** IDs for installation context(s) related to an interaction */
  authorizing_integration_owners: Record<string, Snowflake>;

  /** ID of the original response message, present only on follow-up messages */
  original_response_message_id?: Snowflake;

  /** Metadata for the interaction that was used to open the modal */
  triggering_interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity;
}

/**
 * Represents an activity associated with a message.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export interface MessageActivityEntity {
  /** Type of message activity */
  type: MessageActivityType;

  /** Party ID from a Rich Presence event */
  party_id?: string;
}

/**
 * Represents a Discord message.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object}
 */
export interface MessageEntity {
  /** ID of the message */
  id: Snowflake;

  /** ID of the channel the message was sent in */
  channel_id: Snowflake;

  /** The author of this message */
  author: UserEntity;

  /** Contents of the message (up to 2000 characters) */
  content: string;

  /** When this message was sent */
  timestamp: string;

  /** When this message was edited (null if never) */
  edited_timestamp: string | null;

  /** Whether this was a TTS message */
  tts: boolean;

  /** Whether this message mentions everyone */
  mention_everyone: boolean;

  /** Users specifically mentioned in the message */
  mentions: UserEntity[];

  /** Roles specifically mentioned in this message */
  mention_roles: Snowflake[];

  /** Any attached files */
  attachments: AttachmentEntity[];

  /** Any embedded content */
  embeds: EmbedEntity[];

  /** Whether this message is pinned */
  pinned: boolean;

  /** Type of message */
  type: MessageType;

  /** Channels specifically mentioned in this message */
  mention_channels?: ChannelMentionEntity[];

  /** Reactions to the message */
  reactions?: ReactionEntity[];

  /** Used for validating a message was sent */
  nonce?: string | number;

  /** If the message is generated by a webhook, this is the webhook's ID */
  webhook_id?: Snowflake;

  /** Sent with Rich Presence-related chat embeds */
  activity?: MessageActivityEntity;

  /** Sent with Rich Presence-related chat embeds */
  application?: Partial<ApplicationEntity>;

  /** If the message is an Interaction or application-owned webhook, this is the ID of the application */
  application_id?: Snowflake;

  /** Message flags combined as a bitfield */
  flags?: MessageFlags;

  /** Components in the message (buttons, select menus, etc.) */
  components?: ActionRowEntity[];

  /** Sticker items sent with the message */
  sticker_items?: StickerItemEntity[];

  /** @deprecated The stickers sent with the message */
  stickers?: StickerEntity[];

  /** Approximate position of the message in a thread */
  position?: number;

  /** Data from a role subscription purchase event */
  role_subscription_data?: RoleSubscriptionDataEntity;

  /** Poll data if this message contains a poll */
  poll?: PollEntity;

  /** Call data if this message is a call */
  call?: MessageCallEntity;

  /** Data showing the source of a crosspost, channel follow add, pin, or reply message */
  message_reference?: MessageReferenceEntity;

  /** Metadata about the interaction that generated this message */
  interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity;

  /** Thread associated with this message */
  thread?: AnyThreadChannelEntity;

  /** Metadata about the interaction that generated this message */
  resolved?: InteractionResolvedDataEntity;

  /** For messages with type Forward, contains the message snapshots */
  message_snapshots?: MessageSnapshotEntity[];

  /** The message associated with the message_reference */
  referenced_message?: MessageEntity | null;
}

/**
 * The message snapshot object contains a minimal subset of fields from a message
 * used in message forwarding.
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-object}
 */
export interface MessageSnapshotEntity {
  /** A partial message with minimal fields */
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
