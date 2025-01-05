import { z } from "zod";
import {
  BitFieldManager,
  type Snowflake,
  SnowflakeSchema,
} from "../managers/index.js";
import {
  type ApplicationEntity,
  ApplicationIntegrationType,
  ApplicationSchema,
} from "./application.entity.js";
import {
  type AnyThreadChannelEntity,
  AnyThreadChannelSchema,
  ChannelType,
} from "./channel.entity.js";
import { EmojiSchema } from "./emoji.entity.js";
import {
  type InteractionResolvedDataEntity,
  InteractionResolvedDataSchema,
  InteractionType,
  type MessageInteractionEntity,
} from "./interaction.entity.js";
import {
  type ActionRowEntity,
  ActionRowSchema,
} from "./message-components.entity.js";
import { type PollEntity, PollSchema } from "./poll.entity.js";
import {
  type StickerEntity,
  type StickerItemEntity,
  StickerItemSchema,
  StickerSchema,
} from "./sticker.entity.js";
import { type UserEntity, UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export const RoleSubscriptionDataSchema = z
  .object({
    role_subscription_listing_id: SnowflakeSchema,
    tier_name: z.string(),
    total_months_subscribed: z.number(),
    is_renewal: z.boolean(),
  })
  .strict();

export type RoleSubscriptionDataEntity = z.infer<
  typeof RoleSubscriptionDataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export const AllowedMentionType = {
  roleMentions: "roles",
  userMentions: "users",
  everyoneMentions: "everyone",
} as const;

export type AllowedMentionType =
  (typeof AllowedMentionType)[keyof typeof AllowedMentionType];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export const AllowedMentionsSchema = z
  .object({
    parse: z.array(z.nativeEnum(AllowedMentionType)),
    roles: z.array(SnowflakeSchema).optional(),
    users: z.array(SnowflakeSchema).optional(),
    replied_user: z.boolean().optional(),
  })
  .strict();

export type AllowedMentionsEntity = z.infer<typeof AllowedMentionsSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-channel-mention-structure}
 */
export const ChannelMentionSchema = z
  .object({
    id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    type: z.nativeEnum(ChannelType),
    name: z.string(),
  })
  .strict();

export type ChannelMentionEntity = z.infer<typeof ChannelMentionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export const AttachmentFlags = {
  isRemix: 1 << 2,
} as const;

export type AttachmentFlags =
  (typeof AttachmentFlags)[keyof typeof AttachmentFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export const AttachmentSchema = z
  .object({
    id: SnowflakeSchema,
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
    flags: z
      .nativeEnum(AttachmentFlags)
      .transform((value) => new BitFieldManager(value))
      .optional(),
  })
  .strict();

export type AttachmentEntity = z.infer<typeof AttachmentSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export const EmbedFieldSchema = z
  .object({
    name: z.string().max(256),
    value: z.string().max(1024),
    inline: z.boolean().optional(),
  })
  .strict();

export type EmbedFieldEntity = z.infer<typeof EmbedFieldSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export const EmbedFooterSchema = z
  .object({
    text: z.string().max(2048),
    icon_url: z.string().url().optional(),
    proxy_icon_url: z.string().url().optional(),
  })
  .strict();

export type EmbedFooterEntity = z.infer<typeof EmbedFooterSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export const EmbedAuthorSchema = z
  .object({
    name: z.string().max(256),
    url: z.string().url().optional(),
    icon_url: z.string().url().optional(),
    proxy_icon_url: z.string().url().optional(),
  })
  .strict();

export type EmbedAuthorEntity = z.infer<typeof EmbedAuthorSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export const EmbedProviderSchema = z
  .object({
    name: z.string().optional(),
    url: z.string().url().optional(),
  })
  .strict();

export type EmbedProviderEntity = z.infer<typeof EmbedProviderSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export const EmbedImageSchema = z
  .object({
    url: z.string().url(),
    proxy_url: z.string().url().optional(),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .strict();

export type EmbedImageEntity = z.infer<typeof EmbedImageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export const EmbedVideoSchema = z
  .object({
    url: z.string().url().optional(),
    proxy_url: z.string().url().optional(),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .strict();

export type EmbedVideoEntity = z.infer<typeof EmbedVideoSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export const EmbedThumbnailSchema = z
  .object({
    url: z.string().url(),
    proxy_url: z.string().url().optional(),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .strict();

export type EmbedThumbnailEntity = z.infer<typeof EmbedThumbnailSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export const EmbedType = {
  rich: "rich",
  image: "image",
  video: "video",
  gifv: "gifv",
  article: "article",
  link: "link",
  pollResult: "poll_result",
} as const;

export type EmbedType = (typeof EmbedType)[keyof typeof EmbedType];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export const EmbedSchema = z
  .object({
    title: z.string().max(256).optional(),
    type: z.nativeEnum(EmbedType).optional().default(EmbedType.rich),
    description: z.string().max(4096).optional(),
    url: z.string().url().optional(),
    timestamp: z.string().datetime().optional(),
    color: z.number().int().optional(),
    footer: EmbedFooterSchema.optional(),
    image: EmbedImageSchema.optional(),
    thumbnail: EmbedThumbnailSchema.optional(),
    video: EmbedVideoSchema.optional(),
    provider: EmbedProviderSchema.optional(),
    author: EmbedAuthorSchema.optional(),
    fields: z.array(EmbedFieldSchema).max(25).optional(),
  })
  .strict();

export type EmbedEntity = z.infer<typeof EmbedSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export const ReactionCountDetailsSchema = z
  .object({
    burst: z.number().int(),
    normal: z.number().int(),
  })
  .strict();

export type ReactionCountDetailsEntity = z.infer<
  typeof ReactionCountDetailsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export const ReactionSchema = z
  .object({
    count: z.number().int(),
    count_details: ReactionCountDetailsSchema,
    me: z.boolean(),
    me_burst: z.boolean(),
    emoji: EmojiSchema.partial(),
    burst_colors: z.unknown(),
  })
  .strict();

export type ReactionEntity = z.infer<typeof ReactionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export const MessageReferenceType = {
  default: 0,
  forward: 1,
} as const;

export type MessageReferenceType =
  (typeof MessageReferenceType)[keyof typeof MessageReferenceType];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export const MessageReferenceSchema = z
  .object({
    type: z
      .nativeEnum(MessageReferenceType)
      .optional()
      .default(MessageReferenceType.default),
    message_id: SnowflakeSchema.optional(),
    channel_id: SnowflakeSchema.optional(),
    guild_id: SnowflakeSchema.optional(),
    fail_if_not_exists: z.boolean().optional(),
  })
  .strict();

export type MessageReferenceEntity = z.infer<typeof MessageReferenceSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export const MessageCallSchema = z
  .object({
    participants: z.array(SnowflakeSchema),
    ended_timestamp: z.string().datetime().nullish(),
  })
  .strict();

export type MessageCallEntity = z.infer<typeof MessageCallSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-component-interaction-metadata-structure}
 */
export const MessageComponentInteractionMetadataSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.lazy(() => z.nativeEnum(InteractionType)),
    user: UserSchema,
    authorizing_integration_owners: z.record(
      z.nativeEnum(ApplicationIntegrationType),
      SnowflakeSchema,
    ),
    original_response_message_id: SnowflakeSchema.optional(),
    interacted_message_id: SnowflakeSchema,
  })
  .strict();

export type MessageComponentInteractionMetadataEntity = z.infer<
  typeof MessageComponentInteractionMetadataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-application-command-interaction-metadata-structure}
 */
export const ApplicationCommandInteractionMetadataSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.lazy(() => z.nativeEnum(InteractionType)),
    user: UserSchema,
    authorizing_integration_owners: z.record(
      z.nativeEnum(ApplicationIntegrationType),
      SnowflakeSchema,
    ),
    original_response_message_id: SnowflakeSchema.optional(),
    target_user: UserSchema.optional(),
    target_message_id: SnowflakeSchema.optional(),
  })
  .strict();

export type ApplicationCommandInteractionMetadataEntity = z.infer<
  typeof ApplicationCommandInteractionMetadataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-modal-submit-interaction-metadata-structure}
 */
export const ModalSubmitInteractionMetadataSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.lazy(() => z.nativeEnum(InteractionType)),
    user: UserSchema,
    authorizing_integration_owners: z.record(
      z.nativeEnum(ApplicationIntegrationType),
      SnowflakeSchema,
    ),
    original_response_message_id: SnowflakeSchema.optional(),
    triggering_interaction_metadata: z.union([
      ApplicationCommandInteractionMetadataSchema,
      MessageComponentInteractionMetadataSchema,
    ]),
  })
  .strict();

export type ModalSubmitInteractionMetadataEntity = z.infer<
  typeof ModalSubmitInteractionMetadataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
 */
export const MessageFlags = {
  crossposted: 1 << 0,
  isCrosspost: 1 << 1,
  suppressEmbeds: 1 << 2,
  sourceMessageDeleted: 1 << 3,
  urgent: 1 << 4,
  hasThread: 1 << 5,
  ephemeral: 1 << 6,
  loading: 1 << 7,
  failedToMentionSomeRolesInThread: 1 << 8,
  suppressNotifications: 1 << 12,
  isVoiceMessage: 1 << 13,
} as const;

export type MessageFlags = (typeof MessageFlags)[keyof typeof MessageFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export const MessageActivityType = {
  join: 1,
  spectate: 2,
  listen: 3,
  joinRequest: 5,
} as const;

export type MessageActivityType =
  (typeof MessageActivityType)[keyof typeof MessageActivityType];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export const MessageActivitySchema = z
  .object({
    type: z.nativeEnum(MessageActivityType),
    party_id: z.string().optional(),
  })
  .strict();

export type MessageActivityEntity = z.infer<typeof MessageActivitySchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export const MessageType = {
  default: 0,
  recipientAdd: 1,
  recipientRemove: 2,
  call: 3,
  channelNameChange: 4,
  channelIconChange: 5,
  channelPinnedMessage: 6,
  userJoin: 7,
  guildBoost: 8,
  guildBoostTier1: 9,
  guildBoostTier2: 10,
  guildBoostTier3: 11,
  channelFollowAdd: 12,
  guildDiscoveryDisqualified: 14,
  guildDiscoveryRequalified: 15,
  guildDiscoveryGracePeriodInitialWarning: 16,
  guildDiscoveryGracePeriodFinalWarning: 17,
  threadCreated: 18,
  reply: 19,
  chatInputCommand: 20,
  threadStarterMessage: 21,
  guildInviteReminder: 22,
  contextMenuCommand: 23,
  autoModerationAction: 24,
  roleSubscriptionPurchase: 25,
  interactionPremiumUpsell: 26,
  stageStart: 27,
  stageEnd: 28,
  stageSpeaker: 29,
  stageTopic: 31,
  guildApplicationPremiumSubscription: 32,
  guildIncidentAlertModeEnabled: 36,
  guildIncidentAlertModeDisabled: 37,
  guildIncidentReportRaid: 38,
  guildIncidentReportFalseAlarm: 39,
  purchaseNotification: 44,
  pollResult: 46,
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-structure}
 */
export interface MessageEntity {
  id: Snowflake;
  channel_id: Snowflake;
  author: UserEntity;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: UserEntity[];
  mention_roles: Snowflake[];
  mention_channels?: ChannelMentionEntity[];
  attachments: AttachmentEntity[];
  embeds: EmbedEntity[];
  reactions?: ReactionEntity[];
  nonce?: number | string;
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
  thread?: AnyThreadChannelEntity;
  components?: ActionRowEntity[];
  sticker_items?: StickerItemEntity[];
  /** @deprecated Deprecated the stickers sent with the message */
  stickers?: StickerEntity[];
  position?: number;
  role_subscription_data?: RoleSubscriptionDataEntity;
  resolved?: InteractionResolvedDataEntity;
  poll?: PollEntity;
  call?: MessageCallEntity;
}

export const MessageSchema: z.ZodObject<z.ZodRawShape> = z
  .object({
    id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
    author: UserSchema,
    content: z.string(),
    timestamp: z.string().datetime(),
    edited_timestamp: z.string().datetime().nullable(),
    tts: z.boolean(),
    mention_everyone: z.boolean(),
    mentions: z.array(UserSchema),
    mention_roles: z.array(SnowflakeSchema),
    mention_channels: z.array(ChannelMentionSchema).optional(),
    attachments: z.array(AttachmentSchema),
    embeds: z.array(EmbedSchema),
    reactions: z.array(ReactionSchema).optional(),
    nonce: z.union([z.string(), z.number().int()]).optional(),
    pinned: z.boolean(),
    webhook_id: SnowflakeSchema.optional(),
    type: z.nativeEnum(MessageType),
    activity: MessageActivitySchema.optional(),
    application: ApplicationSchema.partial().optional(),
    application_id: SnowflakeSchema.optional(),
    message_reference: z.lazy(() => MessageReferenceSchema).optional(),
    referenced_message: z
      .lazy(() => MessageSchema)
      .nullable()
      .optional(),
    flags: z
      .nativeEnum(MessageFlags)
      .transform((value) => new BitFieldManager<MessageFlags>(value))
      .optional(),
    interaction_metadata: z
      .union([
        ApplicationCommandInteractionMetadataSchema,
        MessageComponentInteractionMetadataSchema,
        ModalSubmitInteractionMetadataSchema,
      ])
      .optional(),
    thread: z.lazy(() => AnyThreadChannelSchema).optional(),
    components: z.array(ActionRowSchema).optional(),
    sticker_items: z.array(StickerItemSchema).optional(),
    stickers: z.array(StickerSchema).optional(),
    position: z.number().int().optional(),
    role_subscription_data: RoleSubscriptionDataSchema.optional(),
    resolved: z.lazy(() => InteractionResolvedDataSchema.optional()),
    poll: PollSchema.optional(),
    call: MessageCallSchema.optional(),
  })
  .strict();

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

// @ts-expect-error Zod does not like circular references
export const MessageSnapshotSchema: z.ZodObject<z.ZodRawShape> = z.lazy(() =>
  z
    .object({
      message: MessageSchema.pick({
        type: true,
        content: true,
        embeds: true,
        attachments: true,
        timestamp: true,
        edited_timestamp: true,
        flags: true,
        mentions: true,
        mention_roles: true,
        stickers: true,
        sticker_items: true,
        components: true,
      }),
    })
    .strict(),
);
