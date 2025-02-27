import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import { ApplicationEntity } from "./application.entity.js";
import { AnyThreadChannelEntity, ChannelType } from "./channel.entity.js";
import { EmojiEntity } from "./emoji.entity.js";
import { InteractionType } from "./interaction.entity.js";
import { ActionRowEntity } from "./message-components.entity.js";
import { PollEntity } from "./poll.entity.js";
import { StickerEntity, StickerItemEntity } from "./sticker.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export enum AllowedMentionType {
  RoleMentions = "roles",
  UserMentions = "users",
  EveryoneMentions = "everyone",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
  IsRemix = 1 << 2,
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
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceType {
  Default = 0,
  Forward = 1,
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
  GurchaseNotification = 44,
  PollResult = 46,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export const RoleSubscriptionDataEntity = z.object({
  role_subscription_listing_id: Snowflake,
  tier_name: z.string(),
  total_months_subscribed: z.number(),
  is_renewal: z.boolean(),
});

export type RoleSubscriptionDataEntity = z.infer<
  typeof RoleSubscriptionDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export const AllowedMentionsEntity = z.object({
  parse: z.array(z.nativeEnum(AllowedMentionType)),
  roles: z.array(Snowflake).optional(),
  users: z.array(Snowflake).optional(),
  replied_user: z.boolean().optional(),
});

export type AllowedMentionsEntity = z.infer<typeof AllowedMentionsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-channel-mention-structure}
 */
export const ChannelMentionEntity = z.object({
  id: Snowflake,
  guild_id: Snowflake,
  type: z.nativeEnum(ChannelType),
  name: z.string(),
});

export type ChannelMentionEntity = z.infer<typeof ChannelMentionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export const AttachmentEntity = z.object({
  id: Snowflake,
  filename: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  content_type: z.string().optional(),
  size: z.number().int(),
  url: z.string().url(),
  proxy_url: z.string().url(),
  height: z.number().int().nullish(),
  width: z.number().int().nullish(),
  ephemeral: z.boolean().optional(),
  duration_secs: z.number().optional(),
  waveform: z.string().optional(),
  flags: z.custom<AttachmentFlags>(BitFieldManager.isValidBitField).optional(),
});

export type AttachmentEntity = z.infer<typeof AttachmentEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export const EmbedFieldEntity = z.object({
  name: z.string().max(256),
  value: z.string().max(1024),
  inline: z.boolean().optional(),
});

export type EmbedFieldEntity = z.infer<typeof EmbedFieldEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export const EmbedFooterEntity = z.object({
  text: z.string().max(2048),
  icon_url: z.string().url().optional(),
  proxy_icon_url: z.string().url().optional(),
});

export type EmbedFooterEntity = z.infer<typeof EmbedFooterEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export const EmbedAuthorEntity = z.object({
  name: z.string().max(256),
  url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
  proxy_icon_url: z.string().url().optional(),
});

export type EmbedAuthorEntity = z.infer<typeof EmbedAuthorEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export const EmbedProviderEntity = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
});

export type EmbedProviderEntity = z.infer<typeof EmbedProviderEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export const EmbedImageEntity = z.object({
  url: z.string().url(),
  proxy_url: z.string().url().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

export type EmbedImageEntity = z.infer<typeof EmbedImageEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export const EmbedVideoEntity = z.object({
  url: z.string().url().optional(),
  proxy_url: z.string().url().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

export type EmbedVideoEntity = z.infer<typeof EmbedVideoEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export const EmbedThumbnailEntity = z.object({
  url: z.string().url(),
  proxy_url: z.string().url().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

export type EmbedThumbnailEntity = z.infer<typeof EmbedThumbnailEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export const EmbedEntity = z.object({
  title: z.string().max(256).optional(),
  type: z.nativeEnum(EmbedType).default(EmbedType.Rich),
  description: z.string().max(4096).optional(),
  url: z.string().url().optional(),
  timestamp: z.string().datetime().optional(),
  color: z.number().int().optional(),
  footer: EmbedFooterEntity.optional(),
  image: EmbedImageEntity.optional(),
  thumbnail: EmbedThumbnailEntity.optional(),
  video: EmbedVideoEntity.optional(),
  provider: EmbedProviderEntity.optional(),
  author: EmbedAuthorEntity.optional(),
  fields: z.array(EmbedFieldEntity).max(25).optional(),
});

export type EmbedEntity = z.infer<typeof EmbedEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export const ReactionCountDetailsEntity = z.object({
  burst: z.number().int(),
  normal: z.number().int(),
});

export type ReactionCountDetailsEntity = z.infer<
  typeof ReactionCountDetailsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export const ReactionEntity = z.object({
  count: z.number().int(),
  count_details: ReactionCountDetailsEntity,
  me: z.boolean(),
  me_burst: z.boolean(),
  emoji: EmojiEntity.partial(),
  burst_colors: z.unknown(),
});

export type ReactionEntity = z.infer<typeof ReactionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export const MessageReferenceEntity = z.object({
  type: z
    .nativeEnum(MessageReferenceType)
    .default(MessageReferenceType.Default),
  message_id: Snowflake.optional(),
  channel_id: Snowflake.optional(),
  guild_id: Snowflake.optional(),
  fail_if_not_exists: z.boolean().optional(),
});

export type MessageReferenceEntity = z.infer<typeof MessageReferenceEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export const MessageCallEntity = z.object({
  participants: z.array(Snowflake),
  ended_timestamp: z.string().datetime().nullish(),
});

export type MessageCallEntity = z.infer<typeof MessageCallEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-component-interaction-metadata-structure}
 */
export const MessageComponentInteractionMetadataEntity = z.object({
  id: Snowflake,
  type: z.lazy(() => z.nativeEnum(InteractionType)),
  user: UserEntity,
  authorizing_integration_owners: z.record(z.string(), Snowflake),
  original_response_message_id: Snowflake.optional(),
  interacted_message_id: Snowflake.optional(),
});

export type MessageComponentInteractionMetadataEntity = z.infer<
  typeof MessageComponentInteractionMetadataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-application-command-interaction-metadata-structure}
 */
export const ApplicationCommandInteractionMetadataEntity = z.object({
  id: Snowflake,
  type: z.lazy(() => z.nativeEnum(InteractionType)),
  user: UserEntity,
  authorizing_integration_owners: z.record(z.string(), Snowflake),
  original_response_message_id: Snowflake.optional(),
  target_user: UserEntity.optional(),
  target_message_id: Snowflake.optional(),
});

export type ApplicationCommandInteractionMetadataEntity = z.infer<
  typeof ApplicationCommandInteractionMetadataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-modal-submit-interaction-metadata-structure}
 */
export const ModalSubmitInteractionMetadataEntity = z.object({
  id: Snowflake,
  type: z.lazy(() => z.nativeEnum(InteractionType)),
  user: UserEntity,
  authorizing_integration_owners: z.record(z.string(), Snowflake),
  original_response_message_id: Snowflake.optional(),
  triggering_interaction_metadata: z
    .union([
      ApplicationCommandInteractionMetadataEntity,
      MessageComponentInteractionMetadataEntity,
    ])
    .optional(),
});

export type ModalSubmitInteractionMetadataEntity = z.infer<
  typeof ModalSubmitInteractionMetadataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export const MessageActivityEntity = z.object({
  type: z.nativeEnum(MessageActivityType),
  party_id: z.string().optional(),
});

export type MessageActivityEntity = z.infer<typeof MessageActivityEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object Message Object}
 */
export const MessageEntity = z.object({
  id: Snowflake,
  channel_id: Snowflake,
  author: UserEntity,
  content: z.string(),
  timestamp: z.string(),
  edited_timestamp: z.string().datetime().nullable(),
  tts: z.boolean(),
  mention_everyone: z.boolean(),
  mentions: z.array(UserEntity),
  mention_roles: z.array(Snowflake),
  attachments: z.array(AttachmentEntity),
  embeds: z.array(EmbedEntity),
  pinned: z.boolean(),
  type: z.nativeEnum(MessageType),
  mention_channels: z.array(ChannelMentionEntity).optional(),
  reactions: z.array(ReactionEntity).optional(),
  nonce: z.union([z.string(), z.number().int()]).optional(),
  webhook_id: Snowflake.optional(),
  activity: MessageActivityEntity.optional(),
  application: ApplicationEntity.partial().optional(),
  application_id: Snowflake.optional(),
  flags: z.custom<MessageFlags>(BitFieldManager.isValidBitField).optional(),
  components: z.array(ActionRowEntity).optional(),
  sticker_items: z.array(StickerItemEntity).optional(),
  /** @deprecated The stickers sent with the message */
  stickers: z.array(StickerEntity).optional(),
  position: z.number().int().optional(),
  role_subscription_data: RoleSubscriptionDataEntity.optional(),
  poll: PollEntity.optional(),
  call: MessageCallEntity.optional(),
  message_reference: z.lazy(() => MessageReferenceEntity).optional(),
  interaction_metadata: z
    .union([
      ApplicationCommandInteractionMetadataEntity,
      MessageComponentInteractionMetadataEntity,
      ModalSubmitInteractionMetadataEntity,
    ])
    .optional(),
  thread: z.lazy(() => AnyThreadChannelEntity).optional(),
  /**
   * TODO: Yeah again, circular dependency...
   * resolved: z.lazy(() => InteractionResolvedDataEntity.optional()),
   * message_snapshots: z.array(MessageSnapshotEntity).optional(),
   * referenced_message: MessageEntityBase.nullish(),
   */
});

export type MessageEntity = z.infer<typeof MessageEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-object Message Snapshot Object}
 */
// TODO: I have a big problem with this entity, I don't know how to implement it without a circular dependency and zod...
