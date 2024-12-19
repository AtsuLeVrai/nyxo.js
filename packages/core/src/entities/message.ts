import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
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
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export interface RoleSubscriptionDataEntity {
  role_subscription_listing_id: Snowflake;
  tier_name: string;
  total_months_subscribed: number;
  is_renewal: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export interface AllowedMentionsEntity {
  parse: AllowedMentionType[];
  roles?: Snowflake[];
  users?: Snowflake[];
  replied_user?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export type AllowedMentionType = "roles" | "users" | "everyone";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-channel-mention-structure}
 */
export interface ChannelMentionEntity {
  id: Snowflake;
  guild_id: Snowflake;
  type: ChannelType;
  name: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
  IsRemix = 1 << 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export interface AttachmentEntity {
  id: Snowflake;
  filename: string;
  title?: string;
  description?: string;
  content_type?: string;
  size: Integer;
  url: string;
  proxy_url: string;
  height?: Integer | null;
  width?: Integer | null;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: AttachmentFlags;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export interface EmbedFieldEntity {
  name: string;
  value: string;
  inline?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export interface EmbedFooterEntity {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export interface EmbedAuthorEntity {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export interface EmbedProviderEntity {
  name?: string;
  url?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export interface EmbedImageEntity {
  url: string;
  proxy_url?: string;
  height?: Integer;
  width?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export interface EmbedVideoEntity {
  url?: string;
  proxy_url?: string;
  height?: Integer;
  width?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export interface EmbedThumbnailEntity {
  url: string;
  proxy_url?: string;
  height?: Integer;
  width?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export enum EmbedType {
  Rich = "rich",
  Image = "image",
  Video = "video",
  Gifv = "gifv",
  Article = "article",
  Link = "link",
  PollResult = "poll_result",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export interface EmbedEntity {
  title?: string;
  type?: EmbedType;
  description?: string;
  url?: string;
  timestamp?: Iso8601;
  color?: Integer;
  footer?: EmbedFooterEntity;
  image?: EmbedImageEntity;
  thumbnail?: EmbedThumbnailEntity;
  video?: EmbedVideoEntity;
  provider?: EmbedProviderEntity;
  author?: EmbedAuthorEntity;
  fields?: EmbedFieldEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export interface ReactionCountDetailsEntity {
  burst: Integer;
  normal: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export interface ReactionEntity {
  count: Integer;
  count_details: ReactionCountDetailsEntity;
  me: boolean;
  me_burst: boolean;
  emoji: Partial<EmojiEntity>;
  burst_colors: unknown[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-structure}
 */
export interface MessageSnapshotEntity {
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
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceType {
  Default = 0,
  Forward = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export interface MessageReferenceEntity {
  type?: MessageReferenceType;
  message_id?: Snowflake;
  channel_id?: Snowflake;
  guild_id?: Snowflake;
  fail_if_not_exists?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export interface MessageCallEntity {
  participants: Snowflake[];
  ended_timestamp?: Iso8601 | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-modal-submit-interaction-metadata-structure}
 */
export interface ModalSubmitInteractionMetadataEntity {
  id: Snowflake;
  type: InteractionType;
  user: UserEntity;
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  original_response_message_id?: Snowflake;
  triggering_interaction_metadata:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-component-interaction-metadata-structure}
 */
export interface MessageComponentInteractionMetadataEntity {
  id: Snowflake;
  type: InteractionType;
  user: UserEntity;
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  original_response_message_id?: Snowflake;
  interacted_message_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-application-command-interaction-metadata-structure}
 */
export interface ApplicationCommandInteractionMetadataEntity {
  id: Snowflake;
  type: InteractionType;
  user: UserEntity;
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  original_response_message_id?: Snowflake;
  target_user?: UserEntity;
  target_message_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
 */
export enum MessageFlags {
  Crossposted = 1 << 0,
  IsCrosspost = 1 << 1,
  SuppressEmbeds = 1 << 2,
  SourceMessageDeleted = 1 << 3,
  Urgent = 1 << 4,
  HasThread = 1 << 5,
  Ephemeral = 1 << 6,
  Loading = 1 << 7,
  FailedToMentionSomeRolesInThread = 1 << 8,
  SuppressNotifications = 1 << 12,
  IsVoiceMessage = 1 << 13,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export enum MessageActivityType {
  Join = 1,
  Spectate = 2,
  Listen = 3,
  JoinRequest = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export interface MessageActivityEntity {
  type: MessageActivityType;
  party_id?: string;
}

/**
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
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-structure}
 */
export interface MessageEntity {
  id: Snowflake;
  channel_id: Snowflake;
  author: UserEntity;
  content: string;
  timestamp: Iso8601;
  edited_timestamp: Iso8601 | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: UserEntity[];
  mention_roles: Snowflake[];
  mention_channels?: ChannelMentionEntity[];
  attachments: AttachmentEntity[];
  embeds: EmbedEntity[];
  reactions?: ReactionEntity[];
  nonce?: Integer | string;
  pinned: boolean;
  webhook_id?: Snowflake;
  type: MessageType;
  activity?: MessageActivityEntity;
  application?: Partial<ApplicationEntity>;
  application_id?: Snowflake;
  flags?: MessageFlags;
  message_reference?: MessageReferenceEntity;
  message_snapshots?: MessageSnapshotEntity[];
  referenced_message?: MessageEntity | null;
  interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity;
  /** @deprecated Deprecated in favor of interaction_metadata */
  interaction?: MessageInteractionEntity;
  thread?: ChannelEntity;
  components?: ActionRowEntity[];
  sticker_items?: StickerItemEntity[];
  /** @deprecated Deprecated the stickers sent with the message */
  stickers?: StickerEntity[];
  position?: Integer;
  role_subscription_data?: RoleSubscriptionDataEntity;
  resolved?: InteractionResolvedData;
  poll?: PollEntity;
  call?: MessageCallEntity;
}
