import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { ApplicationObject } from "./application.js";
import type {
  AnnouncementThreadChannelObject,
  PrivateThreadChannelObject,
  PublicThreadChannelObject,
} from "./channel.js";
import type { ActionRowComponentObject } from "./components.js";
import type { EmojiObject } from "./emoji.js";
import type { AnyInteractionObject, ResolvedDataObject } from "./interaction.js";
import type { PollCreateRequestObject, PollObject } from "./poll.js";
import type { StickerItemObject, StickerObject } from "./sticker.js";
import type { UserObject } from "./user.js";

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

export enum MessageActivityType {
  Join = 1,
  Spectate = 2,
  Listen = 3,
  JoinRequest = 5,
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

export enum MessageReferenceType {
  Default = 0,
  Forward = 1,
}

export enum ReactionType {
  Normal = 0,
  Burst = 1,
}

export enum AttachmentFlags {
  IsRemix = 1 << 2,
}

export interface MessageActivityObject {
  type: MessageActivityType;
  party_id?: string;
}

export interface MessageCallObject {
  participants: Snowflake[];
  ended_timestamp?: string | null;
}

export interface MessageReferenceObject {
  type?: MessageReferenceType;
  message_id?: Snowflake;
  channel_id?: Snowflake;
  guild_id?: Snowflake;
  fail_if_not_exists?: boolean;
}

export interface MessageSnapshotObject {
  message: Partial<MessageObject>;
}

export interface MessageInteractionMetadataObject {
  id: Snowflake;
  type: number;
  user: UserObject;
  authorizing_integration_owners: Record<number, Snowflake>;
  original_response_message_id?: Snowflake;
  target_user?: UserObject;
  target_message_id?: Snowflake;
  interacted_message_id?: Snowflake;
  triggering_interaction_metadata?: MessageInteractionMetadataObject;
}

export interface ReactionCountDetailsObject {
  burst: number;
  normal: number;
}

export interface ReactionObject {
  count: number;
  count_details: ReactionCountDetailsObject;
  me: boolean;
  me_burst: boolean;
  emoji: Partial<EmojiObject>;
  burst_colors: string[];
}

export interface EmbedThumbnailObject {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedVideoObject {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedImageObject {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedProviderObject {
  name?: string;
  url?: string;
}

export interface EmbedAuthorObject {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedFooterObject {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedFieldObject {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedObject {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooterObject;
  image?: EmbedImageObject;
  thumbnail?: EmbedThumbnailObject;
  video?: EmbedVideoObject;
  provider?: EmbedProviderObject;
  author?: EmbedAuthorObject;
  fields?: EmbedFieldObject[];
}

export interface AttachmentObject {
  id: Snowflake;
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

export interface ChannelMentionObject {
  id: Snowflake;
  guild_id: Snowflake;
  type: number;
  name: string;
}

export interface AllowedMentionsObject {
  parse?: string[];
  roles?: Snowflake[];
  users?: Snowflake[];
  replied_user?: boolean;
}

export interface RoleSubscriptionDataObject {
  role_subscription_listing_id: Snowflake;
  tier_name: string;
  total_months_subscribed: number;
  is_renewal: boolean;
}

export interface MessagePinObject {
  pinned_at: string;
  message: MessageObject;
}

export interface MessageObject {
  id: Snowflake;
  channel_id: Snowflake;
  author: UserObject;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: UserObject[];
  mention_roles: Snowflake[];
  mention_channels?: ChannelMentionObject[];
  attachments: AttachmentObject[];
  embeds: EmbedObject[];
  reactions?: ReactionObject[];
  nonce?: number | string;
  pinned: boolean;
  webhook_id?: Snowflake;
  type: MessageType;
  activity?: MessageActivityObject;
  application?: Partial<ApplicationObject>;
  application_id?: Snowflake;
  flags?: MessageFlags;
  message_reference?: MessageReferenceObject;
  message_snapshots?: MessageSnapshotObject[];
  referenced_message?: MessageObject | null;
  interaction_metadata?: MessageInteractionMetadataObject;
  interaction?: AnyInteractionObject;
  thread?: AnnouncementThreadChannelObject | PublicThreadChannelObject | PrivateThreadChannelObject;
  components?: ActionRowComponentObject[];
  sticker_items?: StickerItemObject[];
  stickers?: StickerObject[];
  position?: number;
  role_subscription_data?: RoleSubscriptionDataObject;
  resolved?: ResolvedDataObject;
  poll?: PollObject;
  call?: MessageCallObject;
}

// Message Request Interfaces
export interface GetChannelMessagesQuery {
  around?: Snowflake;
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
}

export interface CreateMessageRequest {
  content?: string;
  nonce?: number | string;
  tts?: boolean;
  embeds?: EmbedObject[];
  allowed_mentions?: AllowedMentionsObject;
  message_reference?: MessageReferenceObject;
  components?: ActionRowComponentObject[];
  sticker_ids?: Snowflake[];
  files?: File[];
  payload_json?: string;
  attachments?: Partial<AttachmentObject>[];
  flags?: MessageFlags;
  enforce_nonce?: boolean;
  poll?: PollCreateRequestObject;
}

export interface EditMessageRequest {
  content?: string | null;
  embeds?: EmbedObject[] | null;
  flags?: MessageFlags;
  allowed_mentions?: AllowedMentionsObject | null;
  components?: ActionRowComponentObject[] | null;
  files?: File[];
  payload_json?: string;
  attachments?: AttachmentObject[] | null;
}

export interface BulkDeleteMessagesRequest {
  messages: Snowflake[];
}

export interface GetReactionsQuery {
  type?: ReactionType;
  after?: Snowflake;
  limit?: number;
}

export interface GetChannelPinsQuery {
  before?: string;
  limit?: number;
}

export interface GetChannelPinsResponse {
  items: MessagePinObject[];
  has_more: boolean;
}

export const MessageRoutes = {
  // GET /channels/{channel.id}/messages - Get Channel Messages
  getChannelMessages: ((channelId: Snowflake) =>
    `/channels/${channelId}/messages`) as EndpointFactory<
    `/channels/${string}/messages`,
    ["GET", "POST"],
    MessageObject[],
    false,
    true,
    CreateMessageRequest,
    GetChannelMessagesQuery
  >,

  // GET /channels/{channel.id}/messages/{message.id} - Get Channel Message
  getChannelMessage: ((channelId: Snowflake, messageId: Snowflake) =>
    `/channels/${channelId}/messages/${messageId}`) as EndpointFactory<
    `/channels/${string}/messages/${string}`,
    ["GET", "PATCH", "DELETE"],
    MessageObject,
    true,
    false,
    EditMessageRequest
  >,

  // POST /channels/{channel.id}/messages/{message.id}/crosspost - Crosspost Message
  crosspostMessage: ((channelId: Snowflake, messageId: Snowflake) =>
    `/channels/${channelId}/messages/${messageId}/crosspost`) as EndpointFactory<
    `/channels/${string}/messages/${string}/crosspost`,
    ["POST"],
    MessageObject
  >,

  // PUT /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me - Create Reaction
  createReaction: ((channelId: Snowflake, messageId: Snowflake, emoji: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`) as EndpointFactory<
    `/channels/${string}/messages/${string}/reactions/${string}/@me`,
    ["PUT", "DELETE"],
    void
  >,

  // DELETE /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id} - Delete User Reaction
  deleteUserReaction: ((
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    userId: Snowflake,
  ) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`) as EndpointFactory<
    `/channels/${string}/messages/${string}/reactions/${string}/${string}`,
    ["DELETE"],
    void
  >,

  // GET /channels/{channel.id}/messages/{message.id}/reactions/{emoji} - Get Reactions
  getReactions: ((channelId: Snowflake, messageId: Snowflake, emoji: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`) as EndpointFactory<
    `/channels/${string}/messages/${string}/reactions/${string}`,
    ["DELETE", "GET"],
    UserObject[],
    false,
    false,
    undefined,
    GetReactionsQuery
  >,

  // DELETE /channels/{channel.id}/messages/{message.id}/reactions - Delete All Reactions
  deleteAllReactions: ((channelId: Snowflake, messageId: Snowflake) =>
    `/channels/${channelId}/messages/${messageId}/reactions`) as EndpointFactory<
    `/channels/${string}/messages/${string}/reactions`,
    ["DELETE"],
    void
  >,

  // POST /channels/{channel.id}/messages/bulk-delete - Bulk Delete Messages
  bulkDeleteMessages: ((channelId: Snowflake) =>
    `/channels/${channelId}/messages/bulk-delete`) as EndpointFactory<
    `/channels/${string}/messages/bulk-delete`,
    ["POST"],
    void,
    true,
    false,
    BulkDeleteMessagesRequest
  >,

  // GET /channels/{channel.id}/messages/pins - Get Channel Pins
  getChannelPins: ((channelId: Snowflake) =>
    `/channels/${channelId}/messages/pins`) as EndpointFactory<
    `/channels/${string}/messages/pins`,
    ["GET"],
    GetChannelPinsResponse,
    false,
    false,
    undefined,
    GetChannelPinsQuery
  >,

  // PUT /channels/{channel.id}/messages/pins/{message.id} - Pin Message
  pinMessage: ((channelId: Snowflake, messageId: Snowflake) =>
    `/channels/${channelId}/messages/pins/${messageId}`) as EndpointFactory<
    `/channels/${string}/messages/pins/${string}`,
    ["PUT", "DELETE"],
    void,
    true
  >,

  // GET /channels/{channel.id}/pins - Get Pinned Messages (deprecated)
  getPinnedMessages: ((channelId: Snowflake) => `/channels/${channelId}/pins`) as EndpointFactory<
    `/channels/${string}/pins`,
    ["GET"],
    MessageObject[]
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
