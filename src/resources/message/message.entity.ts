import type { ApplicationEntity } from "../application/index.js";
import type { AnyThreadBasedChannelEntity, ChannelType } from "../channel/index.js";
import type { AnyComponentEntity } from "../components/index.js";
import type { EmojiEntity } from "../emoji/index.js";
import type { GuildMemberEntity } from "../guild/index.js";
import type {
  InteractionResolvedDataEntity,
  InteractionType,
  MessageInteractionEntity,
} from "../interaction/index.js";
import type { PollEntity } from "../poll/index.js";
import type { StickerEntity, StickerItemEntity } from "../sticker/index.js";
import type { UserEntity } from "../user/index.js";

/**
 * @description Mention filtering types for Discord message allowed mentions configuration.
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
 * @description Bitfield flags for Discord message attachments with special properties.
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
  /** Attachment has been edited using the remix feature on mobile */
  IsRemix = 1 << 2,
}

/**
 * @description Discord embed content types for rich media display in messages.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export enum EmbedType {
  /** Generic embed rendered from embed attributes */
  Rich = "rich",
  /** Image embed */
  Image = "image",
  /** Video embed */
  Video = "video",
  /** Animated GIF image embed rendered as video */
  Gifv = "gifv",
  /** Article embed */
  Article = "article",
  /** Link embed */
  Link = "link",
  /** Poll result embed with voting statistics */
  PollResult = "poll_result",
}

/**
 * @description Message reference types determining how associated data is populated.
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceType {
  /** Standard reference used by replies */
  Default = 0,
  /** Reference used to point to a message at a point in time */
  Forward = 1,
}

/**
 * @description Bitfield flags for Discord messages with special properties and behaviors.
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
  /** Allows creation of fully component-driven messages */
  IsComponentsV2 = 1 << 15,
}

/**
 * @description Activity types for Discord messages with Rich Presence integrations.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export enum MessageActivityType {
  /** Join activity */
  Join = 1,
  /** Spectate activity */
  Spectate = 2,
  /** Listen activity */
  Listen = 3,
  /** Join request activity */
  JoinRequest = 5,
}

/**
 * @description Discord message types defining the purpose and behavior of messages.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export enum MessageType {
  /** Regular user message */
  Default = 0,
  /** User added to group DM or thread */
  RecipientAdd = 1,
  /** User removed from group DM or thread */
  RecipientRemove = 2,
  /** Call started in private channel */
  Call = 3,
  /** Channel name changed */
  ChannelNameChange = 4,
  /** Channel icon changed */
  ChannelIconChange = 5,
  /** Message pinned to channel */
  ChannelPinnedMessage = 6,
  /** Member joined server */
  UserJoin = 7,
  /** Member boosted server */
  GuildBoost = 8,
  /** Member boosted server to tier 1 */
  GuildBoostTier1 = 9,
  /** Member boosted server to tier 2 */
  GuildBoostTier2 = 10,
  /** Member boosted server to tier 3 */
  GuildBoostTier3 = 11,
  /** Channel follow add */
  ChannelFollowAdd = 12,
  /** Server discovery disqualified */
  GuildDiscoveryDisqualified = 14,
  /** Server discovery requalified */
  GuildDiscoveryRequalified = 15,
  /** Server discovery grace period initial warning */
  GuildDiscoveryGracePeriodInitialWarning = 16,
  /** Server discovery grace period final warning */
  GuildDiscoveryGracePeriodFinalWarning = 17,
  /** Thread created from message */
  ThreadCreated = 18,
  /** Message is a reply to another message */
  Reply = 19,
  /** Message from slash command interaction */
  ChatInputCommand = 20,
  /** First message in thread started from message */
  ThreadStarterMessage = 21,
  /** Server invite reminder */
  GuildInviteReminder = 22,
  /** Message from context menu command */
  ContextMenuCommand = 23,
  /** Auto moderation action taken */
  AutoModerationAction = 24,
  /** Role subscription purchase */
  RoleSubscriptionPurchase = 25,
  /** Interaction premium upsell */
  InteractionPremiumUpsell = 26,
  /** Stage instance started */
  StageStart = 27,
  /** Stage instance ended */
  StageEnd = 28,
  /** User became stage speaker */
  StageSpeaker = 29,
  /** Stage topic changed */
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
  /** Poll ended with results */
  PollResult = 46,
}

/**
 * @description Data for role subscription purchases and renewals that prompt ROLE_SUBSCRIPTION_PURCHASE messages.
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-structure}
 */
export interface RoleSubscriptionDataEntity {
  /** Snowflake ID of the SKU and listing that the user is subscribed to */
  role_subscription_listing_id: string;
  /** Name of the tier that the user is subscribed to */
  tier_name: string;
  /** Cumulative number of months that the user has been subscribed for */
  total_months_subscribed: number;
  /** Whether this notification is for a renewal rather than a new purchase */
  is_renewal: boolean;
}

/**
 * @description Configuration for controlling mention notifications in Discord messages.
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object}
 */
export interface AllowedMentionsEntity {
  /** Array of allowed mention types to parse from the content */
  parse: AllowedMentionType[];
  /** Array of role IDs to mention (max 100, mutually exclusive with parse) */
  roles?: string[];
  /** Array of user IDs to mention (max 100, mutually exclusive with parse) */
  users?: string[];
  /** For replies, whether to mention the author of the message being replied to (defaults to false) */
  replied_user?: boolean;
}

/**
 * @description Channel mention object for crossposted messages with channel references.
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-structure}
 */
export interface ChannelMentionEntity {
  /** Snowflake ID of the mentioned channel */
  id: string;
  /** Snowflake ID of the guild containing the channel */
  guild_id: string;
  /** Type of the mentioned channel */
  type: ChannelType;
  /** Display name of the mentioned channel */
  name: string;
}

/**
 * @description File attachment object for Discord messages with metadata and display properties.
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-structure}
 */
export interface AttachmentEntity {
  /** Snowflake ID of the attachment */
  id: string;
  /** Name of the attached file */
  filename: string;
  /** Title of the file (optional display override) */
  title?: string;
  /** Description of the file (max 1024 characters) */
  description?: string;
  /** MIME type of the attachment */
  content_type?: string;
  /** Size of the file in bytes */
  size: number;
  /** Source URL of the file */
  url: string;
  /** Proxied URL of the file through Discord's CDN */
  proxy_url: string;
  /** Height of the file if it's an image (null if not applicable) */
  height?: number | null;
  /** Width of the file if it's an image (null if not applicable) */
  width?: number | null;
  /** Whether this attachment is ephemeral (auto-removed after set period) */
  ephemeral?: boolean;
  /** Duration of audio file in seconds (for voice messages) */
  duration_secs?: number;
  /** Base64 encoded waveform data (for voice messages) */
  waveform?: string;
  /** Attachment flags bitfield for special properties */
  flags?: AttachmentFlags;
}

/**
 * @description Individual field within a Discord embed with name-value pairs.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export interface EmbedFieldEntity {
  /** Name of the field (max 256 characters) */
  name: string;
  /** Value of the field (max 1024 characters) */
  value: string;
  /** Whether this field should display inline with other inline fields */
  inline?: boolean;
}

/**
 * @description Footer section of a Discord embed with text and optional icon.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export interface EmbedFooterEntity {
  /** Footer text (max 2048 characters) */
  text: string;
  /** URL of footer icon (supports http(s) and attachments only) */
  icon_url?: string;
  /** Proxied URL of the footer icon through Discord's CDN */
  proxy_icon_url?: string;
}

/**
 * @description Author section of a Discord embed with name, URL, and optional icon.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export interface EmbedAuthorEntity {
  /** Name of the author (max 256 characters) */
  name: string;
  /** URL of the author (supports http(s) only) */
  url?: string;
  /** URL of author icon (supports http(s) and attachments only) */
  icon_url?: string;
  /** Proxied URL of the author icon through Discord's CDN */
  proxy_icon_url?: string;
}

/**
 * @description Provider information for automatically generated Discord embeds.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export interface EmbedProviderEntity {
  /** Name of the provider */
  name?: string;
  /** URL of the provider */
  url?: string;
}

/**
 * @description Large image displayed in a Discord embed with dimensions.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export interface EmbedImageEntity {
  /** Source URL of the image (supports http(s) and attachments only) */
  url: string;
  /** Proxied URL of the image through Discord's CDN */
  proxy_url?: string;
  /** Height of the image in pixels */
  height?: number;
  /** Width of the image in pixels */
  width?: number;
}

/**
 * @description Video content in a Discord embed (read-only, set by Discord).
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export interface EmbedVideoEntity {
  /** Source URL of the video */
  url?: string;
  /** Proxied URL of the video through Discord's CDN */
  proxy_url?: string;
  /** Height of the video in pixels */
  height?: number;
  /** Width of the video in pixels */
  width?: number;
}

/**
 * @description Small thumbnail image displayed in the top-right of a Discord embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export interface EmbedThumbnailEntity {
  /** Source URL of the thumbnail (supports http(s) and attachments only) */
  url: string;
  /** Proxied URL of the thumbnail through Discord's CDN */
  proxy_url?: string;
  /** Height of the thumbnail in pixels */
  height?: number;
  /** Width of the thumbnail in pixels */
  width?: number;
}

/**
 * @description Rich embed object for displaying formatted content in Discord messages.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export interface EmbedEntity {
  /** Title of the embed (max 256 characters) */
  title?: string;
  /** Type of embed (always "rich" for webhook embeds) */
  type?: EmbedType;
  /** Description of the embed (max 4096 characters) */
  description?: string;
  /** URL that the embed title links to */
  url?: string;
  /** ISO8601 timestamp of embed content */
  timestamp?: string;
  /** Color code of the embed (RGB integer) */
  color?: number;
  /** Footer information displayed at bottom of embed */
  footer?: EmbedFooterEntity;
  /** Large image displayed in embed */
  image?: EmbedImageEntity;
  /** Small thumbnail displayed in top-right */
  thumbnail?: EmbedThumbnailEntity;
  /** Video information (read-only, set by Discord) */
  video?: EmbedVideoEntity;
  /** Provider information (read-only, set by Discord) */
  provider?: EmbedProviderEntity;
  /** Author information displayed at top of embed */
  author?: EmbedAuthorEntity;
  /** Array of field objects (max 25 fields, combined character limit 6000) */
  fields?: EmbedFieldEntity[];
}

/**
 * @description Breakdown of normal and super reaction counts for Discord message reactions.
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-structure}
 */
export interface ReactionCountDetailsEntity {
  /** Count of super reactions */
  burst: number;
  /** Count of normal reactions */
  normal: number;
}

/**
 * @description Reaction object representing emoji reactions on Discord messages.
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export interface ReactionEntity {
  /** Total number of times this emoji has been used to react (including super reacts) */
  count: number;
  /** Reaction count details object with normal and super reaction breakdown */
  count_details: ReactionCountDetailsEntity;
  /** Whether the current user reacted using this emoji */
  me: boolean;
  /** Whether the current user super-reacted using this emoji */
  me_burst: boolean;
  /** Partial emoji information */
  emoji: Partial<EmojiEntity>;
  /** HEX colors used for super reaction */
  burst_colors?: string[];
}

/**
 * @description Reference to another Discord message for replies, crossposting, and forwarding.
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-object-structure}
 */
export interface MessageReferenceEntity {
  /** Type of reference (DEFAULT for replies, FORWARD for message forwarding) */
  type: MessageReferenceType;
  /** Snowflake ID of the originating message */
  message_id?: string;
  /** Snowflake ID of the originating message's channel (required for forwards) */
  channel_id?: string;
  /** Snowflake ID of the originating message's guild */
  guild_id?: string;
  /** Whether to error if the referenced message doesn't exist instead of sending as normal message (defaults to true) */
  fail_if_not_exists?: boolean;
}

/**
 * @description Call information for Discord messages with voice/video call data.
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-structure}
 */
export interface MessageCallEntity {
  /** Array of user IDs that participated in the call */
  participants: string[];
  /** ISO8601 timestamp when the call ended (null if ongoing) */
  ended_timestamp?: string | null;
}

/**
 * @description Interaction metadata for message component interactions like buttons and select menus.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object}
 */
export interface MessageComponentInteractionMetadataEntity {
  /** Snowflake ID of the interaction */
  id: string;
  /** Type of interaction that was used */
  type: InteractionType;
  /** User who triggered the interaction */
  user: UserEntity;
  /** Mapping of installation contexts to their installed application IDs */
  authorizing_integration_owners: Record<string, string>;
  /** Snowflake ID of the original response message (for followup messages) */
  original_response_message_id?: string;
  /** Snowflake ID of the message the component was attached to */
  interacted_message_id?: string;
}

/**
 * @description Interaction metadata for application command interactions like slash commands.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object}
 */
export interface ApplicationCommandInteractionMetadataEntity {
  /** Snowflake ID of the interaction */
  id: string;
  /** Type of interaction that was used */
  type: InteractionType;
  /** User who triggered the interaction */
  user: UserEntity;
  /** Mapping of installation contexts to their installed application IDs */
  authorizing_integration_owners: Record<string, string>;
  /** Snowflake ID of the original response message (for followup messages) */
  original_response_message_id?: string;
  /** User targeted by the command (for user context menu commands) */
  target_user?: UserEntity;
  /** Snowflake ID of message targeted by the command (for message context menu commands) */
  target_message_id?: string;
}

/**
 * @description Interaction metadata for modal submit interactions from form submissions.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object}
 */
export interface ModalSubmitInteractionMetadataEntity {
  /** Snowflake ID of the interaction */
  id: string;
  /** Type of interaction that was used */
  type: InteractionType;
  /** User who submitted the modal */
  user: UserEntity;
  /** Mapping of installation contexts to their installed application IDs */
  authorizing_integration_owners: Record<string, string>;
  /** Snowflake ID of the original response message (for followup messages) */
  original_response_message_id?: string;
  /** Metadata of the interaction that triggered this modal */
  triggering_interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity;
}

/**
 * @description Rich Presence activity information for Discord messages with game/app integration.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export interface MessageActivityEntity {
  /** Type of message activity */
  type: MessageActivityType;
  /** Party ID from a Rich Presence event */
  party_id?: string;
}

/**
 * @description Discord message object representing a message sent in a channel.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-structure}
 */
export interface MessageEntity {
  /** Snowflake ID of the message */
  id: string;
  /** Snowflake ID of the channel the message was sent in */
  channel_id: string;
  /** Author of this message (not guaranteed to be a valid user for webhooks) */
  author: UserEntity;
  /** Contents of the message (up to 2000 characters) */
  content: string;
  /** ISO8601 timestamp of when this message was sent */
  timestamp: string;
  /** ISO8601 timestamp of when this message was edited (null if never) */
  edited_timestamp: string | null;
  /** Whether this was a TTS message */
  tts: boolean;
  /** Whether this message mentions everyone */
  mention_everyone: boolean;
  /** Users specifically mentioned in the message */
  mentions: UserEntity[];
  /** Roles specifically mentioned in this message */
  mention_roles: string[];
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
  /** If the message is generated by a webhook, this is the webhook's id */
  webhook_id?: string;
  /** Sent with Rich Presence-related chat embeds */
  activity?: MessageActivityEntity;
  /** Sent with Rich Presence-related chat embeds */
  application?: Partial<ApplicationEntity>;
  /** If the message is an Interaction or application-owned webhook, this is the id of the application */
  application_id?: string;
  /** Message flags combined as a bitfield */
  flags?: MessageFlags;
  /** Components like buttons, action rows, or other interactive components */
  components?: AnyComponentEntity[];
  /** Sent if the message contains stickers */
  sticker_items?: StickerItemEntity[];
  /** Deprecated - the stickers sent with the message */
  stickers?: StickerEntity[];
  /** Approximate position of the message in a thread */
  position?: number;
  /** Data of the role subscription purchase or renewal that prompted this ROLE_SUBSCRIPTION_PURCHASE message */
  role_subscription_data?: RoleSubscriptionDataEntity;
  /** A poll! */
  poll?: PollEntity;
  /** The call associated with the message */
  call?: MessageCallEntity;
  /** Data showing the source of a crosspost, channel follow add, pin, or reply message */
  message_reference?: MessageReferenceEntity;
  /** Deprecated in favor of interaction_metadata; sent if the message is a response to an Interaction */
  interaction?: MessageInteractionEntity;
  /** Sent if the message is sent as a result of an interaction */
  interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity;
  /** The thread that was started from this message, includes thread member object */
  thread?: AnyThreadBasedChannelEntity;
  /** Data for users, members, channels, and roles in the message's auto-populated select menus */
  resolved?: InteractionResolvedDataEntity;
  /** The message associated with the message_reference */
  referenced_message?: MessageEntity | null;
  /** The message associated with the message_reference (minimal subset of fields) */
  message_snapshots?: MessageSnapshotEntity[];
}

/**
 * @description Message snapshot object containing a minimal subset of message fields for forwarded messages.
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-object}
 */
export interface MessageSnapshotEntity {
  /** Minimal message data (excludes author to prevent spoofing) */
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
 * @description Gateway event data when all reactions for a specific emoji are removed from a message.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji}
 */
export interface GatewayMessageReactionRemoveEmojiEntity {
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
  /** Snowflake ID of the message */
  message_id: string;
  /** Emoji that was removed */
  emoji: Partial<EmojiEntity>;
}

/**
 * @description Gateway event data when all reactions are removed from a message.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all}
 */
export interface GatewayMessageReactionRemoveAllEntity {
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the message */
  message_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
}

/**
 * @description Reaction type enumeration for Discord message reactions.
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionType {
  /** Standard emoji reaction */
  Normal = 0,
  /** Super reaction with animation effects */
  Burst = 1,
}

/**
 * @description Gateway event data when a user removes a reaction from a message.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove}
 */
export interface GatewayMessageReactionRemoveEntity {
  /** Snowflake ID of the user */
  user_id: string;
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the message */
  message_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
  /** Emoji that was used to react */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;
  /** Whether it was a super-reaction */
  burst: boolean;
  /** Type of reaction */
  type: ReactionType;
}

/**
 * @description Gateway event data when a user adds a reaction to a message.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add}
 */
export interface GatewayMessageReactionAddEntity {
  /** Snowflake ID of the user */
  user_id: string;
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the message */
  message_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
  /** Member who reacted if this happened in a guild */
  member?: GuildMemberEntity;
  /** Emoji used to react */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;
  /** Snowflake ID of the user who authored the message being reacted to */
  message_author_id?: string;
  /** Whether it was a super-reaction */
  burst: boolean;
  /** HEX colors used for super-reaction */
  burst_colors?: string[];
  /** Type of reaction */
  type: ReactionType;
}

/**
 * @description Gateway event data when a user adds a reaction to a message.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add}
 */
export interface GatewayMessageReactionAddEntity {
  /** Snowflake ID of the user */
  user_id: string;
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the message */
  message_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
  /** Member who reacted if this happened in a guild */
  member?: GuildMemberEntity;
  /** Emoji used to react */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;
  /** Snowflake ID of the user who authored the message being reacted to */
  message_author_id?: string;
  /** Whether it was a super-reaction */
  burst: boolean;
  /** HEX colors used for super-reaction */
  burst_colors?: string[];
  /** Type of reaction */
  type: ReactionType;
}

/**
 * @description Gateway event data when multiple messages are deleted at once.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk}
 */
export interface GatewayMessageDeleteBulkEntity {
  /** Array of message Snowflake IDs that were deleted */
  ids: string[];
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
}

/**
 * @description Gateway event data when a message is deleted.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete}
 */
export interface GatewayMessageDeleteEntity {
  /** Snowflake ID of the deleted message */
  id: string;
  /** Snowflake ID of the channel */
  channel_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
}

/**
 * @description Gateway event data when a message is sent in a channel.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create}
 */
export interface GatewayMessageCreateEntity extends Omit<MessageEntity, "mentions"> {
  /** Array of users mentioned in the message with partial member data */
  mentions?: (UserEntity & Partial<GuildMemberEntity>)[];
  /** Snowflake ID of the guild where the message was sent */
  guild_id?: string;
  /** Partial member data for the message author if sent in a guild */
  member?: Partial<GuildMemberEntity>;
}

/**
 * @description Gateway event data when a user votes on a message poll.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add}
 */
export interface GatewayMessagePollVoteEntity {
  /** Snowflake ID of the user who voted */
  user_id: string;
  /** Snowflake ID of the channel containing the poll */
  channel_id: string;
  /** Snowflake ID of the message containing the poll */
  message_id: string;
  /** Snowflake ID of the guild */
  guild_id?: string;
  /** ID of the answer the user voted for */
  answer_id: number;
}
