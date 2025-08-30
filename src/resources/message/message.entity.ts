import type { ApplicationEntity } from "../application/index.js";
import type { AnyThreadBasedChannelEntity, ChannelType } from "../channel/index.js";
import type { ActionRowEntity } from "../components/index.js";
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
import type { ReactionType } from "./message.router.js";

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
  components?: ActionRowEntity[];
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
