export enum AllowedMentionType {
  RoleMentions = "roles",
  UserMentions = "users",
  EveryoneMentions = "everyone",
}

export enum AttachmentFlags {
  IsRemix = 1 << 2,
}

export enum EmbedType {
  Rich = "rich",
  Image = "image",
  Video = "video",
  Gifv = "gifv",
  Article = "article",
  Link = "link",
  PollResult = "poll_result",
}

export enum MessageReferenceType {
  Default = 0,
  Forward = 1,
}

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
  HasSnapshot = 1 << 14,
  IsComponentsV2 = 1 << 15,
}

export enum MessageActivityType {
  Join = 1,
  Spectate = 2,
  Listen = 3,
  JoinRequest = 5,
}

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

export interface RoleSubscriptionDataEntity {
  role_subscription_listing_id: string;
  tier_name: string;
  total_months_subscribed: number;
  is_renewal: boolean;
}

export interface AllowedMentionsEntity {
  parse: AllowedMentionType[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface ChannelMentionEntity {
  id: string;
  guild_id: string;
  type: ChannelType;
  name: string;
}

export interface AttachmentEntity {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number | null;
  width?: number | null;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: AttachmentFlags;
}

export interface EmbedFieldEntity {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedFooterEntity {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedAuthorEntity {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedProviderEntity {
  name?: string;
  url?: string;
}

export interface EmbedImageEntity {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedVideoEntity {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedThumbnailEntity {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedEntity {
  title?: string;
  type?: EmbedType;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooterEntity;
  image?: EmbedImageEntity;
  thumbnail?: EmbedThumbnailEntity;
  video?: EmbedVideoEntity;
  provider?: EmbedProviderEntity;
  author?: EmbedAuthorEntity;
  fields?: EmbedFieldEntity[];
}

export interface ReactionCountDetailsEntity {
  burst: number;
  normal: number;
}

export interface ReactionEntity {
  count: number;
  count_details: ReactionCountDetailsEntity;
  me: boolean;
  me_burst: boolean;
  emoji: Partial<EmojiEntity>;
  burst_colors?: string[];
}

export interface MessageReferenceEntity {
  type: MessageReferenceType;
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
  fail_if_not_exists?: boolean;
}

export interface MessageCallEntity {
  participants: string[];
  ended_timestamp?: string | null;
}

export interface MessageComponentInteractionMetadataEntity {
  id: string;
  type: InteractionType;
  user: UserEntity;
  authorizing_integration_owners: Record<string, string>;
  original_response_message_id?: string;
  interacted_message_id?: string;
}

export interface ApplicationCommandInteractionMetadataEntity {
  id: string;
  type: InteractionType;
  user: UserEntity;
  authorizing_integration_owners: Record<string, string>;
  original_response_message_id?: string;
  target_user?: UserEntity;
  target_message_id?: string;
}

export interface ModalSubmitInteractionMetadataEntity {
  id: string;
  type: InteractionType;
  user: UserEntity;
  authorizing_integration_owners: Record<string, string>;
  original_response_message_id?: string;
  triggering_interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity;
}

export interface MessageActivityEntity {
  type: MessageActivityType;
  party_id?: string;
}

export interface MessageEntity {
  id: string;
  channel_id: string;
  author: UserEntity;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: UserEntity[];
  mention_roles: string[];
  attachments: AttachmentEntity[];
  embeds: EmbedEntity[];
  pinned: boolean;
  type: MessageType;
  mention_channels?: ChannelMentionEntity[];
  reactions?: ReactionEntity[];
  nonce?: string | number;
  webhook_id?: string;
  activity?: MessageActivityEntity;
  application?: Partial<ApplicationEntity>;
  application_id?: string;
  flags?: MessageFlags;
  components?: AnyComponentEntity[];
  sticker_items?: StickerItemEntity[];
  stickers?: StickerEntity[];
  position?: number;
  role_subscription_data?: RoleSubscriptionDataEntity;
  poll?: PollEntity;
  call?: MessageCallEntity;
  message_reference?: MessageReferenceEntity;
  interaction?: MessageInteractionEntity;
  interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity;
  thread?: AnyThreadBasedChannelEntity;
  resolved?: InteractionResolvedDataEntity;
  referenced_message?: MessageEntity | null;
  message_snapshots?: MessageSnapshotEntity[];
}

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

export interface GatewayMessageReactionRemoveEmojiEntity {
  channel_id: string;
  guild_id?: string;
  message_id: string;
  emoji: Partial<EmojiEntity>;
}

export interface GatewayMessageReactionRemoveAllEntity {
  channel_id: string;
  message_id: string;
  guild_id?: string;
}

export enum ReactionType {
  Normal = 0,
  Burst = 1,
}

export interface GatewayMessageReactionRemoveEntity {
  user_id: string;
  channel_id: string;
  message_id: string;
  guild_id?: string;
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;
  burst: boolean;
  type: ReactionType;
}

export interface GatewayMessageReactionAddEntity {
  user_id: string;
  channel_id: string;
  message_id: string;
  guild_id?: string;
  member?: GuildMemberEntity;
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;
  message_author_id?: string;
  burst: boolean;
  burst_colors?: string[];
  type: ReactionType;
}

export interface GatewayMessageDeleteBulkEntity {
  ids: string[];
  channel_id: string;
  guild_id?: string;
}

export interface GatewayMessageDeleteEntity {
  id: string;
  channel_id: string;
  guild_id?: string;
}

export interface GatewayMessageCreateEntity extends Omit<MessageEntity, "mentions"> {
  mentions?: (UserEntity & Partial<GuildMemberEntity>)[];
  guild_id?: string;
  member?: Partial<GuildMemberEntity>;
}

export interface GatewayMessagePollVoteEntity {
  user_id: string;
  channel_id: string;
  message_id: string;
  guild_id?: string;
  answer_id: number;
}

export interface RESTGetChannelMessagesQueryStringParams {
  around?: string;
  before?: string;
  after?: string;
  limit?: number;
}

export interface RESTGetReactionsQueryStringParams {
  type?: ReactionType;
  after?: string;
  limit?: number;
}

export interface RESTGetPinnedMessagesQueryStringParams {
  before?: string;
  limit?: number;
}

export interface RESTCreateMessageBaseJSONParams {
  nonce?: string | number;
  tts?: boolean;
  allowed_mentions?: AllowedMentionsEntity;
  message_reference?: MessageReferenceEntity;
  files?: FileInput | FileInput[];
  payload_json?: string;
  flags?: MessageFlags;
  enforce_nonce?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  sticker_ids?: string[];
  poll?: PollCreateRequestEntity;
  attachments?: AttachmentEntity[];
  components?: AnyComponentEntity[];
}

export interface RESTCreateMessageV1JSONParams
  extends Omit<RESTCreateMessageBaseJSONParams, "flags" | "components"> {
  components?: LegacyActionRowEntity[];
  flags?: Exclude<MessageFlags, MessageFlags.IsComponentsV2>;
}

export interface RESTCreateMessageV2JSONParams
  extends Pick<
    RESTCreateMessageBaseJSONParams,
    | "nonce"
    | "tts"
    | "allowed_mentions"
    | "message_reference"
    | "files"
    | "payload_json"
    | "enforce_nonce"
    | "attachments"
  > {
  components: ComponentsV2MessageComponentEntity[];
  flags: MessageFlags.IsComponentsV2 | (MessageFlags.IsComponentsV2 | MessageFlags);
}

export type RESTCreateMessageJSONParams =
  | RESTCreateMessageV1JSONParams
  | RESTCreateMessageV2JSONParams;

export type RESTEditMessageV1JSONParams = Partial<
  DeepNullable<
    Pick<
      RESTCreateMessageV1JSONParams,
      | "content"
      | "embeds"
      | "flags"
      | "allowed_mentions"
      | "components"
      | "files"
      | "payload_json"
      | "attachments"
    >
  >
>;

export type RESTEditMessageV2JSONParams = Partial<
  DeepNullable<
    Pick<
      RESTCreateMessageV2JSONParams,
      "allowed_mentions" | "files" | "payload_json" | "attachments" | "components" | "flags"
    >
  >
>;

export type RESTEditMessageJSONParams = RESTEditMessageV1JSONParams | RESTEditMessageV2JSONParams;

export interface RESTBulkDeleteMessagesJSONParams {
  messages: string[];
}

export function isComponentsV2Schema(
  schema: RESTCreateMessageJSONParams | RESTEditMessageJSONParams,
): schema is RESTCreateMessageV2JSONParams {
  return schema.flags !== undefined && (Number(schema.flags) & MessageFlags.IsComponentsV2) !== 0;
}

export const MessageRoutes = {
  channelMessages: (channelId: string) => `/channels/${channelId}/messages` as const,
  channelMessage: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}` as const,
  crosspostMessage: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}/crosspost` as const,
  messageReactions: (channelId: string, messageId: string, emoji: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,
  userReaction: (channelId: string, messageId: string, emoji: string, userId = "@me") =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const,
  allMessageReactions: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions` as const,
  bulkDeleteMessages: (channelId: string) => `/channels/${channelId}/messages/bulk-delete` as const,
  pinnedMessages: (channelId: string) => `/channels/${channelId}/messages/pins` as const,
  pinMessage: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/pins/${messageId}` as const,
} as const satisfies RouteBuilder;

export class MessageRouter extends BaseRouter {
  getChannelMessages(
    channelId: string,
    query?: RESTGetChannelMessagesQueryStringParams,
  ): Promise<MessageEntity[]> {
    return this.rest.get(MessageRoutes.channelMessages(channelId), {
      query,
    });
  }

  getChannelMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.get(MessageRoutes.channelMessage(channelId, messageId));
  }

  async createMessage(
    channelId: string,
    options: RESTCreateMessageJSONParams,
  ): Promise<MessageEntity> {
    if (isComponentsV2Schema(options)) {
      if (!options.components || options.components.length === 0) {
        throw new Error("Components V2 messages must have at least one component");
      }
      if (options.components.length > 10) {
        throw new Error("Components V2 messages cannot have more than 10 top-level components");
      }
    } else {
      const hasContent = !!options.content;
      const hasEmbeds = !!(options.embeds && options.embeds.length > 0);
      const hasStickerIds = !!(options.sticker_ids && options.sticker_ids.length > 0);
      const hasComponents = !!(options.components && options.components.length > 0);
      const hasFiles = !!options.files;
      const hasPoll = !!options.poll;

      if (!(hasContent || hasEmbeds || hasStickerIds || hasComponents || hasFiles || hasPoll)) {
        throw new Error(
          "At least one of content, embeds, sticker_ids, components, files, or poll is required",
        );
      }
    }

    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.post(MessageRoutes.channelMessages(channelId), {
      body: JSON.stringify(rest),
      files,
    });
  }

  crosspostMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.post(MessageRoutes.crosspostMessage(channelId, messageId));
  }

  createReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.put(MessageRoutes.userReaction(channelId, messageId, emoji));
  }

  deleteOwnReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.delete(MessageRoutes.userReaction(channelId, messageId, emoji));
  }

  deleteUserReaction(
    channelId: string,
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    return this.rest.delete(MessageRoutes.userReaction(channelId, messageId, emoji, userId));
  }

  getReactions(
    channelId: string,
    messageId: string,
    emoji: string,
    query?: RESTGetReactionsQueryStringParams,
  ): Promise<UserEntity[]> {
    return this.rest.get(MessageRoutes.messageReactions(channelId, messageId, emoji), {
      query,
    });
  }

  deleteAllReactions(channelId: string, messageId: string): Promise<void> {
    return this.rest.delete(MessageRoutes.allMessageReactions(channelId, messageId));
  }

  deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.delete(MessageRoutes.messageReactions(channelId, messageId, emoji));
  }

  async editMessage(
    channelId: string,
    messageId: string,
    options: RESTEditMessageJSONParams,
  ): Promise<MessageEntity> {
    if (isComponentsV2Schema(options)) {
      if (!options.components || options.components.length === 0) {
        throw new Error("Components V2 messages must have at least one component");
      }
      if (options.components.length > 10) {
        throw new Error("Components V2 messages cannot have more than 10 top-level components");
      }
    }

    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.patch(MessageRoutes.channelMessage(channelId, messageId), {
      body: JSON.stringify(rest),
      files: files as FileInput[] | undefined,
    });
  }

  deleteMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.delete(MessageRoutes.channelMessage(channelId, messageId), {
      reason,
    });
  }

  bulkDeleteMessages(
    channelId: string,
    options: RESTBulkDeleteMessagesJSONParams,
    reason?: string,
  ): Promise<void> {
    return this.rest.post(MessageRoutes.bulkDeleteMessages(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  getPinnedMessages(
    channelId: string,
    query?: RESTGetPinnedMessagesQueryStringParams,
  ): Promise<{
    items: Array<{
      pinned_at: string;
      message: MessageEntity;
    }>;
    has_more: boolean;
  }> {
    return this.rest.get(MessageRoutes.pinnedMessages(channelId), {
      query,
    });
  }

  pinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.put(MessageRoutes.pinMessage(channelId, messageId), {
      reason,
    });
  }

  unpinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.delete(MessageRoutes.pinMessage(channelId, messageId), {
      reason,
    });
  }
}
