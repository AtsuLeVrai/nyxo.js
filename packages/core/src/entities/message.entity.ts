import type { Snowflake } from "../markdown/index.js";
import type { ApplicationEntity } from "./application.entity.js";
import type {
  AnyThreadBasedChannelEntity,
  ChannelType,
} from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";
import type {
  InteractionResolvedDataEntity,
  InteractionType,
  MessageInteractionEntity,
} from "./interaction.entity.js";
import type { ActionRowEntity } from "./message-components.entity.js";
import type { PollEntity } from "./poll.entity.js";
import type { StickerEntity, StickerItemEntity } from "./sticker.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Types of mentions that can be allowed in messages.
 * Controls which types of mentions will actually notify users.
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
 */
export enum AllowedMentionType {
  /**
   * Controls role mentions.
   * When specified in the `parse` array, roles mentioned in content will trigger notifications.
   */
  RoleMentions = "roles",

  /**
   * Controls user mentions.
   * When specified in the `parse` array, users mentioned in content will trigger notifications.
   */
  UserMentions = "users",

  /**
   * Controls @everyone and @here mentions.
   * When specified in the `parse` array, @everyone and @here mentioned in content will trigger notifications.
   */
  EveryoneMentions = "everyone",
}

/**
 * Flags that can be applied to message attachments.
 * Controls special behaviors for attachments.
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags}
 */
export enum AttachmentFlags {
  /**
   * This attachment has been edited using the remix feature on mobile.
   * Indicates the attachment was modified via Discord's mobile app remix functionality.
   */
  IsRemix = 1 << 2,
}

/**
 * Types of embeds that can be included in a message.
 * Determines the rendering style of the embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
 */
export enum EmbedType {
  /**
   * Generic rich embed (default).
   * Standard Discord embed with customizable content and formatting.
   */
  Rich = "rich",

  /**
   * Image embed.
   * Embed optimized for displaying images.
   */
  Image = "image",

  /**
   * Video embed.
   * Embed optimized for displaying videos.
   */
  Video = "video",

  /**
   * Animated gif image embed rendered as a video embed.
   * GIF that will play like a video in the client.
   */
  Gifv = "gifv",

  /**
   * Article embed.
   * Embed displaying article information.
   */
  Article = "article",

  /**
   * Link embed.
   * Simple embed generated from a URL.
   */
  Link = "link",

  /**
   * Poll result embed.
   * Embed showing poll results after a poll has ended.
   */
  PollResult = "poll_result",
}

/**
 * Types of message references.
 * Determines how associated data is populated and how the reference is displayed.
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
 */
export enum MessageReferenceType {
  /**
   * Standard reference used by replies.
   * Used for normal message replies with referenced_message data.
   */
  Default = 0,

  /**
   * Reference used to point to a message at a point in time.
   * Used for forwarded messages with message_snapshots data.
   */
  Forward = 1,
}

/**
 * Flags that can be applied to messages.
 * Controls message behavior, visibility, and display options.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
 */
export enum MessageFlags {
  /**
   * Message has been published to subscribed channels (via Channel Following).
   * Indicates a message was crossposted to other channels.
   */
  Crossposted = 1 << 0,

  /**
   * Message originated from a message in another channel (via Channel Following).
   * Indicates this message is a crosspost from another channel.
   */
  IsCrosspost = 1 << 1,

  /**
   * Do not include any embeds when serializing this message.
   * Prevents embeds from being shown for this message.
   */
  SuppressEmbeds = 1 << 2,

  /**
   * Source message for this crosspost has been deleted (via Channel Following).
   * Indicates the original message for a crosspost was removed.
   */
  SourceMessageDeleted = 1 << 3,

  /**
   * Message came from the urgent message system.
   * Used for system messages that need attention.
   */
  Urgent = 1 << 4,

  /**
   * Message has an associated thread, with the same id as the message.
   * Indicates a thread was created from this message.
   */
  HasThread = 1 << 5,

  /**
   * Message is only visible to the user who invoked the Interaction.
   * Used for messages that only the interaction user can see.
   */
  Ephemeral = 1 << 6,

  /**
   * Message is an Interaction Response and the bot is "thinking".
   * Displays a loading state for the message.
   */
  Loading = 1 << 7,

  /**
   * Message failed to mention some roles and add their members to the thread.
   * Indicates that not all mentioned roles were successfully added to the thread.
   */
  FailedToMentionSomeRolesInThread = 1 << 8,

  /**
   * Message will not trigger push and desktop notifications.
   * Prevents notification alerts from being sent for this message.
   */
  SuppressNotifications = 1 << 12,

  /**
   * Message is a voice message.
   * Indicates an audio recording sent as a message.
   */
  IsVoiceMessage = 1 << 13,

  /**
   * Message has a snapshot (via Message Forwarding).
   * Indicates this message contains forwarded content.
   */
  HasSnapshot = 1 << 14,

  /**
   * Message is a component message.
   * This message allows you to create fully component driven messages
   */
  IsComponentsV2 = 1 << 15,
}

/**
 * Types of activities that can be associated with a message.
 * Used primarily with Rich Presence features.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
 */
export enum MessageActivityType {
  /**
   * User joined.
   * Indicates a Rich Presence join event.
   */
  Join = 1,

  /**
   * User is spectating.
   * Indicates a Rich Presence spectate event.
   */
  Spectate = 2,

  /**
   * User is listening.
   * Indicates a Rich Presence listen event.
   */
  Listen = 3,

  /**
   * User requested to join.
   * Indicates a Rich Presence request to join event.
   */
  JoinRequest = 5,
}

/**
 * Different types of messages that can be sent in Discord.
 * Determines how the message is rendered and what content it contains.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export enum MessageType {
  /**
   * Default message.
   * Standard user-generated message with content.
   */
  Default = 0,

  /**
   * Recipient added to group DM.
   * System message when a user is added to a group DM.
   */
  RecipientAdd = 1,

  /**
   * Recipient removed from group DM.
   * System message when a user is removed from a group DM.
   */
  RecipientRemove = 2,

  /**
   * Call message.
   * System message for voice/video calls.
   */
  Call = 3,

  /**
   * Channel name change.
   * System message when channel name is changed.
   */
  ChannelNameChange = 4,

  /**
   * Channel icon change.
   * System message when channel icon is changed.
   */
  ChannelIconChange = 5,

  /**
   * Channel pinned message.
   * System message when a message is pinned.
   */
  ChannelPinnedMessage = 6,

  /**
   * User joined guild.
   * System message when a new user joins the server.
   */
  UserJoin = 7,

  /**
   * Guild boost.
   * System message when a user boosts the server.
   */
  GuildBoost = 8,

  /**
   * Guild reached boost tier 1.
   * System message when server reaches Boost Level 1.
   */
  GuildBoostTier1 = 9,

  /**
   * Guild reached boost tier 2.
   * System message when server reaches Boost Level 2.
   */
  GuildBoostTier2 = 10,

  /**
   * Guild reached boost tier 3.
   * System message when server reaches Boost Level 3.
   */
  GuildBoostTier3 = 11,

  /**
   * Channel follow add.
   * System message when a channel is followed.
   */
  ChannelFollowAdd = 12,

  /**
   * Guild discovery disqualified.
   * System message when server is removed from Discovery.
   */
  GuildDiscoveryDisqualified = 14,

  /**
   * Guild discovery requalified.
   * System message when server returns to Discovery.
   */
  GuildDiscoveryRequalified = 15,

  /**
   * Guild discovery grace period initial warning.
   * System message for Discovery eligibility warning.
   */
  GuildDiscoveryGracePeriodInitialWarning = 16,

  /**
   * Guild discovery grace period final warning.
   * System message for Discovery final eligibility warning.
   */
  GuildDiscoveryGracePeriodFinalWarning = 17,

  /**
   * Thread created.
   * System message when a thread is created.
   */
  ThreadCreated = 18,

  /**
   * Reply to a message.
   * Message created as a reply to another message.
   */
  Reply = 19,

  /**
   * Application command.
   * Message created from a chat input command (slash command).
   */
  ChatInputCommand = 20,

  /**
   * Thread starter message.
   * First message in a thread created from an existing message.
   */
  ThreadStarterMessage = 21,

  /**
   * Guild invite reminder.
   * System message reminding to use invites.
   */
  GuildInviteReminder = 22,

  /**
   * Context menu command.
   * Message created from a context menu command.
   */
  ContextMenuCommand = 23,

  /**
   * Auto-moderation action.
   * System message from Auto Mod showing taken actions.
   */
  AutoModerationAction = 24,

  /**
   * Role subscription purchase.
   * System message when a user purchases a premium role.
   */
  RoleSubscriptionPurchase = 25,

  /**
   * Interaction premium upsell.
   * System message prompting to upgrade for premium features.
   */
  InteractionPremiumUpsell = 26,

  /**
   * Stage start.
   * System message when a Stage channel starts.
   */
  StageStart = 27,

  /**
   * Stage end.
   * System message when a Stage channel ends.
   */
  StageEnd = 28,

  /**
   * Stage speaker.
   * System message when a user becomes a speaker in Stage.
   */
  StageSpeaker = 29,

  /**
   * Stage topic.
   * System message when a Stage topic changes.
   */
  StageTopic = 31,

  /**
   * Guild application premium subscription.
   * System message for premium app subscription.
   */
  GuildApplicationPremiumSubscription = 32,

  /**
   * Guild incident alert mode enabled.
   * System message when safety alerts are turned on.
   */
  GuildIncidentAlertModeEnabled = 36,

  /**
   * Guild incident alert mode disabled.
   * System message when safety alerts are turned off.
   */
  GuildIncidentAlertModeDisabled = 37,

  /**
   * Guild incident report raid.
   * System message for a raid alert.
   */
  GuildIncidentReportRaid = 38,

  /**
   * Guild incident report false alarm.
   * System message for a false alarm incident.
   */
  GuildIncidentReportFalseAlarm = 39,

  /**
   * Purchase notification.
   * System message for a purchase notification.
   */
  PurchaseNotification = 44,

  /**
   * Poll result.
   * System message showing poll results.
   */
  PollResult = 46,
}

/**
 * Data for role subscription purchase events.
 * Contains information about premium role subscriptions.
 * @see {@link https://discord.com/developers/docs/resources/message#role-subscription-data-object-role-subscription-data-object-structure}
 */
export interface RoleSubscriptionDataEntity {
  /**
   * ID of the SKU and listing that the user subscribed to.
   * Identifies the specific premium role product that was purchased.
   */
  role_subscription_listing_id: Snowflake;

  /**
   * Name of the tier that the user is subscribed to.
   * The display name of the subscription tier.
   */
  tier_name: string;

  /**
   * The cumulative number of months that the user has been subscribed for.
   * Total subscription duration in months.
   */
  total_months_subscribed: number;

  /**
   * Whether this notification is for a renewal rather than a new purchase.
   * Indicates if this is a recurring payment rather than an initial subscription.
   */
  is_renewal: boolean;
}

/**
 * Controls which mentions are allowed in a message.
 * Used to prevent unwanted pings to users, roles, or everyone.
 * @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mentions-structure}
 */
export interface AllowedMentionsEntity {
  /**
   * An array of allowed mention types to parse from the content.
   * Controls which types of mentions in the message content will trigger notifications.
   */
  parse: AllowedMentionType[];

  /**
   * Array of role IDs to mention.
   * Specific roles that can be pinged, even if roles aren't in the parse array.
   */
  roles?: Snowflake[];

  /**
   * Array of user IDs to mention.
   * Specific users that can be pinged, even if users aren't in the parse array.
   */
  users?: Snowflake[];

  /**
   * For replies, whether to mention the author of the message being replied to.
   * Controls if the replied-to user receives a notification for the reply.
   */
  replied_user?: boolean;
}

/**
 * Represents a channel mention in message content.
 * Created when a channel is mentioned using #channel-name syntax.
 * @see {@link https://discord.com/developers/docs/resources/message#channel-mention-object-channel-mention-structure}
 */
export interface ChannelMentionEntity {
  /**
   * ID of the channel.
   * Unique identifier for the mentioned channel.
   */
  id: Snowflake;

  /**
   * ID of the guild containing the channel.
   * Server ID where the mentioned channel is located.
   */
  guild_id: Snowflake;

  /**
   * The type of channel.
   * Indicates whether this is a text channel, voice channel, etc.
   */
  type: ChannelType;

  /**
   * The name of the channel.
   * Display name of the mentioned channel.
   */
  name: string;
}

/**
 * Represents a file attached to a message.
 * Contains metadata about uploaded files and media.
 * @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure}
 */
export interface AttachmentEntity {
  /**
   * Attachment ID.
   * Unique identifier for the attachment.
   */
  id: Snowflake;

  /**
   * Name of the attached file.
   * Original filename of the uploaded file.
   */
  filename: string;

  /**
   * Title of the file.
   * Custom title assigned to the file.
   */
  title?: string;

  /**
   * Description of the file.
   * Custom description for the attachment.
   */
  description?: string;

  /**
   * The attachment's media type.
   * MIME type of the file (e.g., "image/jpeg", "video/mp4").
   */
  content_type?: string;

  /**
   * Size of file in bytes.
   * File size information.
   */
  size: number;

  /**
   * Source URL of file.
   * Direct link to the file on Discord's CDN.
   */
  url: string;

  /**
   * A proxied URL of the file.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url: string;

  /**
   * Height of file (if image).
   * Height in pixels for image attachments.
   */
  height?: number | null;

  /**
   * Width of file (if image).
   * Width in pixels for image attachments.
   */
  width?: number | null;

  /**
   * Whether this attachment is ephemeral.
   * If true, the attachment will be removed after a set period of time.
   */
  ephemeral?: boolean;

  /**
   * The duration of the audio file (for voice messages).
   * Length in seconds for voice message attachments.
   */
  duration_secs?: number;

  /**
   * Base64 encoded bytearray representing a sampled waveform (for voice messages).
   * Visual representation of audio for voice message attachments.
   */
  waveform?: string;

  /**
   * Attachment flags.
   * Bitfield of flags for special attachment behavior.
   */
  flags?: AttachmentFlags;
}

/**
 * Represents a field in an embed.
 * Contains a titled section with text content in an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure}
 */
export interface EmbedFieldEntity {
  /**
   * Name of the field.
   * Title/header of this field section.
   */
  name: string;

  /**
   * Value of the field.
   * Content text for this field section.
   */
  value: string;

  /**
   * Whether or not this field should display inline.
   * If true, field will be displayed side-by-side with other inline fields.
   */
  inline?: boolean;
}

/**
 * Represents the footer of an embed.
 * Displays text and optional icon at the bottom of an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure}
 */
export interface EmbedFooterEntity {
  /**
   * Footer text.
   * Text displayed in the footer area.
   */
  text: string;

  /**
   * URL of footer icon.
   * Image displayed next to footer text.
   */
  icon_url?: string;

  /**
   * A proxied URL of the footer icon.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_icon_url?: string;
}

/**
 * Represents the author of an embed.
 * Displays author information at the top of an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure}
 */
export interface EmbedAuthorEntity {
  /**
   * Name of author.
   * Display name for the author section.
   */
  name: string;

  /**
   * URL of author.
   * Link for the author's name.
   */
  url?: string;

  /**
   * URL of author icon.
   * Avatar/icon displayed next to author name.
   */
  icon_url?: string;

  /**
   * A proxied URL of author icon.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_icon_url?: string;
}

/**
 * Represents the provider of an embed.
 * Contains information about the source of an embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure}
 */
export interface EmbedProviderEntity {
  /**
   * Name of provider.
   * Name of the service that provided the embed content.
   */
  name?: string;

  /**
   * URL of provider.
   * Link to the provider's site.
   */
  url?: string;
}

/**
 * Represents an image in an embed.
 * Displays an image in the embed body.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure}
 */
export interface EmbedImageEntity {
  /**
   * Source URL of image.
   * Direct link to the image.
   */
  url: string;

  /**
   * A proxied URL of the image.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url?: string;

  /**
   * Height of image.
   * Image height in pixels.
   */
  height?: number;

  /**
   * Width of image.
   * Image width in pixels.
   */
  width?: number;
}

/**
 * Represents a video in an embed.
 * Displays a video in the embed body.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure}
 */
export interface EmbedVideoEntity {
  /**
   * Source URL of video.
   * Direct link to the video.
   */
  url?: string;

  /**
   * A proxied URL of the video.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url?: string;

  /**
   * Height of video.
   * Video height in pixels.
   */
  height?: number;

  /**
   * Width of video.
   * Video width in pixels.
   */
  width?: number;
}

/**
 * Represents a thumbnail in an embed.
 * Displays a smaller image in the embed.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure}
 */
export interface EmbedThumbnailEntity {
  /**
   * Source URL of thumbnail.
   * Direct link to the thumbnail image.
   */
  url: string;

  /**
   * A proxied URL of the thumbnail.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url?: string;

  /**
   * Height of thumbnail.
   * Thumbnail height in pixels.
   */
  height?: number;

  /**
   * Width of thumbnail.
   * Thumbnail width in pixels.
   */
  width?: number;
}

/**
 * Represents an embed in a message.
 * Rich content that can be attached to messages with formatted text and media.
 * @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-structure}
 */
export interface EmbedEntity {
  /**
   * Title of embed.
   * Main heading displayed at the top of the embed.
   */
  title?: string;

  /**
   * Type of embed (always "rich" for webhook embeds).
   * Determines how the embed is rendered.
   */
  type?: EmbedType;

  /**
   * Description of embed.
   * Main text content of the embed.
   */
  description?: string;

  /**
   * URL of embed.
   * Makes the title a clickable link.
   */
  url?: string;

  /**
   * Timestamp of embed content.
   * Displays time in the footer, usually in ISO8601 format.
   */
  timestamp?: string;

  /**
   * Color code of the embed.
   * Color of the left border of the embed in integer format.
   */
  color?: number;

  /**
   * Footer information.
   * Displayed at the bottom of the embed.
   */
  footer?: EmbedFooterEntity;

  /**
   * Image information.
   * Large image displayed in the embed.
   */
  image?: EmbedImageEntity;

  /**
   * Thumbnail information.
   * Small image displayed to the right of the embed.
   */
  thumbnail?: EmbedThumbnailEntity;

  /**
   * Video information.
   * Video displayed in the embed.
   */
  video?: EmbedVideoEntity;

  /**
   * Provider information.
   * Information about the source of the embed.
   */
  provider?: EmbedProviderEntity;

  /**
   * Author information.
   * Displayed at the top of the embed before the title.
   */
  author?: EmbedAuthorEntity;

  /**
   * Fields information.
   * Sections of titled text content within the embed.
   */
  fields?: EmbedFieldEntity[];
}

/**
 * Represents the breakdown of reaction counts for normal and super reactions.
 * Details how many of each reaction type were used.
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-count-details-object-reaction-count-details-structure}
 */
export interface ReactionCountDetailsEntity {
  /**
   * Count of super reactions.
   * Number of premium/burst reactions to this emoji.
   */
  burst: number;

  /**
   * Count of normal reactions.
   * Number of standard reactions to this emoji.
   */
  normal: number;
}

/**
 * Represents a reaction to a message.
 * Contains information about an emoji reaction and how many users reacted with it.
 * @see {@link https://discord.com/developers/docs/resources/message#reaction-object-reaction-structure}
 */
export interface ReactionEntity {
  /**
   * Total number of times this emoji has been used to react.
   * Combined count of all reactions with this emoji.
   */
  count: number;

  /**
   * Breakdown of normal and super reaction counts.
   * Details separating standard and premium/burst reactions.
   */
  count_details: ReactionCountDetailsEntity;

  /**
   * Whether the current user reacted using this emoji.
   * Indicates if the current user has added this reaction.
   */
  me: boolean;

  /**
   * Whether the current user super-reacted using this emoji.
   * Indicates if the current user has added a premium/burst reaction.
   */
  me_burst: boolean;

  /**
   * Emoji information.
   * Details about the emoji used for this reaction.
   */
  emoji: Partial<EmojiEntity>;

  /**
   * HEX colors used for super reaction.
   * Color values used when displaying premium/burst reactions.
   */
  burst_colors?: string[];
}

/**
 * Represents a reference to another message.
 * Used for replies, forwarded messages, and similar references.
 * @see {@link https://discord.com/developers/docs/resources/message#message-reference-structure}
 */
export interface MessageReferenceEntity {
  /**
   * Type of reference.
   * Determines how the reference is displayed and processed.
   */
  type: MessageReferenceType;

  /**
   * ID of the originating message.
   * Identifies the specific message being referenced.
   */
  message_id?: Snowflake;

  /**
   * ID of the originating message's channel.
   * Identifies which channel contains the referenced message.
   */
  channel_id?: Snowflake;

  /**
   * ID of the originating message's guild.
   * Identifies which server contains the referenced message.
   */
  guild_id?: Snowflake;

  /**
   * When sending, whether to error if the referenced message doesn't exist.
   * If false, the reply will send even if the original message was deleted.
   */
  fail_if_not_exists?: boolean;
}

/**
 * Represents call information associated with a message.
 * Contains details about voice calls in DMs or group DMs.
 * @see {@link https://discord.com/developers/docs/resources/message#message-call-object-message-call-object-structure}
 */
export interface MessageCallEntity {
  /**
   * Array of user IDs that participated in the call.
   * List of users who joined the call at some point.
   */
  participants: Snowflake[];

  /**
   * Time when the call ended.
   * ISO8601 timestamp for when the call was terminated, or null if ongoing.
   */
  ended_timestamp?: string | null;
}

/**
 * Represents metadata about a message component interaction.
 * Contains information about a user's interaction with message components.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-message-component-interaction-metadata-structure}
 */
export interface MessageComponentInteractionMetadataEntity {
  /**
   * ID of the interaction.
   * Unique identifier for this specific interaction.
   */
  id: Snowflake;

  /**
   * Type of interaction.
   * The category of interaction (application command, component, etc.).
   */
  type: InteractionType;

  /**
   * User who triggered the interaction.
   * Information about the user who interacted with the component.
   */
  user: UserEntity;

  /**
   * IDs for installation context(s) related to an interaction.
   * Maps installation contexts to their owner IDs.
   */
  authorizing_integration_owners: Record<string, Snowflake>;

  /**
   * ID of the original response message, present only on follow-up messages.
   * Identifies the first response to the interaction.
   */
  original_response_message_id?: Snowflake;

  /**
   * ID of the message that contained the interactive component.
   * Identifies which message had the component that was interacted with.
   */
  interacted_message_id?: Snowflake;
}

/**
 * Represents metadata about an application command interaction.
 * Contains information about a user's interaction with application commands.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-application-command-interaction-metadata-structure}
 */
export interface ApplicationCommandInteractionMetadataEntity {
  /**
   * ID of the interaction.
   * Unique identifier for this specific interaction.
   */
  id: Snowflake;

  /**
   * Type of interaction.
   * The category of interaction (application command, component, etc.).
   */
  type: InteractionType;

  /**
   * User who triggered the interaction.
   * Information about the user who used the command.
   */
  user: UserEntity;

  /**
   * IDs for installation context(s) related to an interaction.
   * Maps installation contexts to their owner IDs.
   */
  authorizing_integration_owners: Record<string, Snowflake>;

  /**
   * ID of the original response message, present only on follow-up messages.
   * Identifies the first response to the interaction.
   */
  original_response_message_id?: Snowflake;

  /**
   * The user the command was run on, present only on user command interactions.
   * For user commands, contains information about the targeted user.
   */
  target_user?: UserEntity;

  /**
   * The ID of the message the command was run on, present only on message command interactions.
   * For message commands, identifies the targeted message.
   */
  target_message_id?: Snowflake;
}

/**
 * Represents metadata about a modal submit interaction.
 * Contains information about a user's submission of a modal form.
 * @see {@link https://discord.com/developers/docs/resources/message#message-interaction-metadata-object-modal-submit-interaction-metadata-structure}
 */
export interface ModalSubmitInteractionMetadataEntity {
  /**
   * ID of the interaction.
   * Unique identifier for this specific interaction.
   */
  id: Snowflake;

  /**
   * Type of interaction.
   * The category of interaction (application command, component, etc.).
   */
  type: InteractionType;

  /**
   * User who triggered the interaction.
   * Information about the user who submitted the modal.
   */
  user: UserEntity;

  /**
   * IDs for installation context(s) related to an interaction.
   * Maps installation contexts to their owner IDs.
   */
  authorizing_integration_owners: Record<string, Snowflake>;

  /**
   * ID of the original response message, present only on follow-up messages.
   * Identifies the first response to the interaction.
   */
  original_response_message_id?: Snowflake;

  /**
   * Metadata for the interaction that was used to open the modal.
   * Details about what interaction triggered this modal.
   */
  triggering_interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity;
}

/**
 * Represents an activity associated with a message.
 * Used primarily with Rich Presence-related chat embeds.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-structure}
 */
export interface MessageActivityEntity {
  /**
   * Type of message activity.
   * Indicates what kind of Rich Presence event this represents.
   */
  type: MessageActivityType;

  /**
   * Party ID from a Rich Presence event.
   * Identifier for a group activity session.
   */
  party_id?: string;
}

/**
 * Represents a Discord message.
 * The primary communication entity in Discord, containing content, attachments, and metadata.
 * @see {@link https://discord.com/developers/docs/resources/message#message-object}
 */
export interface MessageEntity {
  /**
   * ID of the message.
   * Unique identifier for this message.
   */
  id: Snowflake;

  /**
   * ID of the channel the message was sent in.
   * Identifies which channel contains this message.
   */
  channel_id: Snowflake;

  /**
   * The author of this message.
   * Information about the user who sent the message.
   */
  author: UserEntity;

  /**
   * Contents of the message.
   * The actual text content of the message.
   */
  content: string;

  /**
   * When this message was sent.
   * ISO8601 timestamp of when the message was created.
   */
  timestamp: string;

  /**
   * When this message was edited (null if never).
   * ISO8601 timestamp of the last edit, or null if unedited.
   */
  edited_timestamp: string | null;

  /**
   * Whether this was a TTS message.
   * If true, message was sent with text-to-speech.
   */
  tts: boolean;

  /**
   * Whether this message mentions everyone.
   * If true, the message includes an @everyone or @here mention.
   */
  mention_everyone: boolean;

  /**
   * Users specifically mentioned in the message.
   * Array of user objects for users mentioned by @username.
   */
  mentions: UserEntity[];

  /**
   * Roles specifically mentioned in this message.
   * Array of role IDs mentioned by @role.
   */
  mention_roles: Snowflake[];

  /**
   * Any attached files.
   * Array of attachments included with this message.
   */
  attachments: AttachmentEntity[];

  /**
   * Any embedded content.
   * Array of rich embeds displayed with this message.
   */
  embeds: EmbedEntity[];

  /**
   * Whether this message is pinned.
   * If true, the message is pinned to the channel.
   */
  pinned: boolean;

  /**
   * Type of message.
   * Identifies what kind of message this is (default, system, reply, etc.).
   */
  type: MessageType;

  /**
   * Channels specifically mentioned in this message.
   * Array of channel mention objects for channels referenced by #channel-name.
   */
  mention_channels?: ChannelMentionEntity[];

  /**
   * Reactions to the message.
   * Array of reaction objects showing emoji reactions to the message.
   */
  reactions?: ReactionEntity[];

  /**
   * Used for validating a message was sent.
   * Custom identifier that can be used to verify message delivery.
   */
  nonce?: string | number;

  /**
   * If the message is generated by a webhook, this is the webhook's ID.
   * Identifies if the message was sent by a webhook integration.
   */
  webhook_id?: Snowflake;

  /**
   * Sent with Rich Presence-related chat embeds.
   * Activity information for Rich Presence features.
   */
  activity?: MessageActivityEntity;

  /**
   * Sent with Rich Presence-related chat embeds.
   * Application information for Rich Presence features.
   */
  application?: Partial<ApplicationEntity>;

  /**
   * If the message is an Interaction or application-owned webhook, this is the ID of the application.
   * Identifies which application sent this message.
   */
  application_id?: Snowflake;

  /**
   * Message flags combined as a bitfield.
   * Special behavior flags for this message.
   */
  flags?: MessageFlags;

  /**
   * Components in the message (buttons, select menus, etc.).
   * UI components attached to this message.
   */
  components?: ActionRowEntity[];

  /**
   * Sticker items sent with the message.
   * Array of stickers attached to this message.
   */
  sticker_items?: StickerItemEntity[];

  /**
   * @deprecated The stickers sent with the message.
   * Legacy sticker format, use sticker_items instead.
   */
  stickers?: StickerEntity[];

  /**
   * Approximate position of the message in a thread.
   * Index position for this message within a thread.
   */
  position?: number;

  /**
   * Data from a role subscription purchase event.
   * Details about a premium role subscription.
   */
  role_subscription_data?: RoleSubscriptionDataEntity;

  /**
   * Poll data if this message contains a poll.
   * Details for an interactive poll.
   */
  poll?: PollEntity;

  /**
   * Call data if this message is a call.
   * Information about a voice or video call.
   */
  call?: MessageCallEntity;

  /**
   * Data showing the source of a crosspost, channel follow add, pin, or reply message.
   * Reference to another message this message is associated with.
   */
  message_reference?: MessageReferenceEntity;

  /**
   * @deprecated Use interaction_metadata instead.
   * Sent if the message is a response to an interaction.
   */
  interaction?: MessageInteractionEntity;

  /**
   * Metadata about the interaction that generated this message.
   * Information about what interaction created this message.
   */
  interaction_metadata?:
    | ApplicationCommandInteractionMetadataEntity
    | MessageComponentInteractionMetadataEntity
    | ModalSubmitInteractionMetadataEntity;

  /**
   * Thread associated with this message.
   * For messages that created threads, contains the thread information.
   */
  thread?: AnyThreadBasedChannelEntity;

  /**
   * Metadata about the interaction that generated this message.
   * Resolved objects from the interaction that created this message.
   */
  resolved?: InteractionResolvedDataEntity;

  /**
   * The message that this message is a reply to.
   * Contains information about the original message being replied to.
   */
  referenced_message?: MessageEntity | null;

  /**
   * Whether this message is a voice message.
   * If true, the message contains an audio recording.
   */
  message_snapshots?: MessageSnapshotEntity[];
}

/**
 * Represents a snapshot of a message.
 * Contains a copy of a message's content at a specific point in time.
 * @see {@link https://discord.com/developers/docs/resources/message#message-snapshot-object}
 */
export interface MessageSnapshotEntity {
  /**
   * Minimal subset of fields in the forwarded message.
   * Captured state of the forwarded message content.
   */
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
