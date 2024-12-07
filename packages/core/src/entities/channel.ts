import type { BitwisePermissionFlags } from "../enums/index.js";
import type { Integer, Iso8601 } from "../formatting/index.js";
import type { BitFieldResolvable, Snowflake } from "../utils/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

/**
 * Represents a forum tag that can be applied to threads in a forum channel.
 *
 * @remarks
 * Forum tags are used to organize and categorize threads within forum and media channels.
 * Only moderators can manage these tags if the tag is set as moderated.
 *
 * @example
 * ```typescript
 * const forumTag: ForumTagEntity = {
 *   id: "123456789",
 *   name: "Help",
 *   moderated: true,
 *   emoji_id: null,
 *   emoji_name: "❓"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
 */
export interface ForumTagEntity {
  /** Unique identifier for the tag */
  id: Snowflake;
  /** Name of the tag (0-20 characters) */
  name: string;
  /** Whether this tag can only be added or removed by moderators */
  moderated: boolean;
  /** The ID of a guild's custom emoji */
  emoji_id: Snowflake | null;
  /** The unicode character of the emoji */
  emoji_name: string | null;
}

/**
 * Represents the default emoji reaction for forum posts.
 *
 * @remarks
 * Exactly one of emoji_id or emoji_name must be set.
 *
 * @example
 * ```typescript
 * const defaultReaction: DefaultReactionEntity = {
 *   emoji_id: null,
 *   emoji_name: "👍"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object}
 */
export interface DefaultReactionEntity {
  /** The ID of a guild's custom emoji */
  emoji_id: Snowflake | null;
  /** The unicode character of the emoji */
  emoji_name: string | null;
}

/**
 * Represents a member of a thread.
 *
 * @remarks
 * Contains information about a user's membership in a thread, including
 * join timestamp and notification settings.
 *
 * @example
 * ```typescript
 * const threadMember: ThreadMemberEntity = {
 *   join_timestamp: "2021-07-15T12:00:00.000Z",
 *   flags: 0
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
export interface ThreadMemberEntity {
  /** The ID of the thread */
  id?: Snowflake;
  /** The ID of the user */
  user_id?: Snowflake;
  /** When the user joined the thread */
  join_timestamp: Iso8601;
  /** User-thread settings, currently only used for notifications */
  flags: Integer;
  /** Additional information about the user */
  member?: GuildMemberEntity;
}

/**
 * Represents metadata for a thread channel.
 *
 * @remarks
 * Contains thread-specific settings and information about its archive status.
 *
 * @example
 * ```typescript
 * const threadMetadata: ThreadMetadataEntity = {
 *   archived: false,
 *   auto_archive_duration: 1440,
 *   archive_timestamp: "2021-07-15T12:00:00.000Z",
 *   locked: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export interface ThreadMetadataEntity {
  /** Whether the thread is archived */
  archived: boolean;
  /** Duration in minutes to automatically archive the thread after inactivity */
  auto_archive_duration: Integer;
  /** Timestamp when the thread's archive status was last changed */
  archive_timestamp: Iso8601;
  /** Whether the thread is locked */
  locked: boolean;
  /** Whether non-moderators can add other non-moderators to the thread */
  invitable?: boolean;
  /** Timestamp when the thread was created */
  create_timestamp?: Iso8601 | null;
}

/**
 * Represents permission overwrites for a channel.
 *
 * @remarks
 * Defines specific permission rules for roles or members in a channel.
 *
 * @example
 * ```typescript
 * const overwrite: OverwriteEntity = {
 *   id: "123456789",
 *   type: OverwriteType.Role,
 *   allow: "2048",
 *   deny: "0"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export interface OverwriteEntity {
  /** Role or user ID */
  id: Snowflake;
  /** The type of overwrite */
  type: OverwriteType;
  /** Permission bit set for allowed permissions */
  allow: BitFieldResolvable<BitwisePermissionFlags>;
  /** Permission bit set for denied permissions */
  deny: BitFieldResolvable<BitwisePermissionFlags>;
}

/**
 * Represents the type of permission overwrite.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export enum OverwriteType {
  /** Role-based overwrite */
  Role = 0,
  /** Member-based overwrite */
  Member = 1,
}

/**
 * Represents a followed announcement channel.
 *
 * @remarks
 * Contains information about a webhook that cross-posts messages to another channel.
 *
 * @example
 * ```typescript
 * const followedChannel: FollowedChannelEntity = {
 *   channel_id: "123456789",
 *   webhook_id: "987654321"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object}
 */
export interface FollowedChannelEntity {
  /** Source channel ID */
  channel_id: Snowflake;
  /** Created webhook ID */
  webhook_id: Snowflake;
}

/**
 * Represents the layout type for forum channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types}
 */
export enum ForumLayoutType {
  /** No default layout set */
  NotSet = 0,
  /** Display posts as a list */
  ListView = 1,
  /** Display posts as a grid of tiles */
  GalleryView = 2,
}

/**
 * Represents the sort order type for forum channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types}
 */
export enum SortOrderType {
  /** Sort by latest activity */
  LatestActivity = 0,
  /** Sort by creation date */
  CreationDate = 1,
}

/**
 * Represents the channel flags.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
 */
export enum ChannelFlags {
  /** Thread is pinned to the top of its parent channel */
  Pinned = 1 << 1,
  /** Thread requires a tag */
  RequireTag = 1 << 4,
  /** Hide embedded media download options (media channels only) */
  HideMediaDownloadOptions = 1 << 15,
}

/**
 * Represents the video quality mode for voice channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes}
 */
export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  Auto = 1,
  /** 720p video quality */
  Full = 2,
}

/**
 * Represents the different types of channels in Discord.
 *
 * @remarks
 * Available in API v9 and above.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export enum ChannelType {
  /** A text channel within a server */
  GuildText = 0,
  /** A direct message between users */
  Dm = 1,
  /** A voice channel within a server */
  GuildVoice = 2,
  /** A direct message between multiple users */
  GroupDm = 3,
  /** An organizational category */
  GuildCategory = 4,
  /** A channel that users can follow and crosspost into their own server */
  GuildAnnouncement = 5,
  /** A temporary sub-channel within a GuildAnnouncement channel */
  AnnouncementThread = 10,
  /** A temporary sub-channel within a GuildText or GuildForum channel */
  PublicThread = 11,
  /** A private temporary sub-channel */
  PrivateThread = 12,
  /** A voice channel for hosting events with an audience */
  GuildStageVoice = 13,
  /** The channel in a hub containing listed servers */
  GuildDirectory = 14,
  /** Channel that can only contain threads */
  GuildForum = 15,
  /** Channel that can only contain threads, similar to GuildForum */
  GuildMedia = 16,
}

/**
 * Represents a Discord channel.
 *
 * @remarks
 * Channels are the main form of communication in Discord.
 * They can be text channels, voice channels, DMs, categories, or various types of threads.
 * Different properties are available depending on the channel type.
 *
 * @example
 * ```typescript
 * const textChannel: ChannelEntity = {
 *   id: "123456789",
 *   type: ChannelType.GuildText,
 *   name: "general",
 *   flags: 0
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export interface ChannelEntity {
  /** The ID of this channel */
  id: Snowflake;
  /** The type of channel */
  type: ChannelType;
  /** The ID of the guild (may be missing for some channel objects) */
  guild_id?: Snowflake;
  /** Sorting position of the channel */
  position?: Integer;
  /** Explicit permission overwrites for members and roles */
  permission_overwrites?: OverwriteEntity[];
  /** The name of the channel (1-100 characters) */
  name?: string | null;
  /** The channel topic (0-4096 characters for forum/media channels, 0-1024 for others) */
  topic?: string | null;
  /** Whether the channel is NSFW */
  nsfw?: boolean;
  /** The id of the last message sent in this channel */
  last_message_id?: Snowflake | null;
  /** The bitrate (in bits) of the voice channel */
  bitrate?: Integer;
  /** The user limit of the voice channel */
  user_limit?: Integer;
  /** Amount of seconds a user has to wait before sending another message */
  rate_limit_per_user?: Integer;
  /** The recipients of the DM */
  recipients?: UserEntity[];
  /** Icon hash of the group DM */
  icon?: string | null;
  /** ID of the creator of the group DM or thread */
  owner_id?: Snowflake;
  /** Application ID of the group DM creator if bot-created */
  application_id?: Snowflake;
  /** Whether the channel is managed by an application */
  managed?: boolean;
  /** ID of the parent category for a channel or thread */
  parent_id?: Snowflake | null;
  /** When the last pinned message was pinned */
  last_pin_timestamp?: Iso8601 | null;
  /** Voice region ID for the voice channel */
  rtc_region?: string | null;
  /** The camera video quality mode of the voice channel */
  video_quality_mode?: VideoQualityMode;
  /** Number of messages in a thread */
  message_count?: Integer;
  /** Approximate number of users in a thread */
  member_count?: Integer;
  /** Thread-specific fields */
  thread_metadata?: ThreadMetadataEntity;
  /** Thread member object for the current user if they have joined the thread */
  member?: ThreadMemberEntity;
  /** Default duration that the clients use for newly created threads */
  default_auto_archive_duration?: Integer;
  /** Computed permissions for the invoking user in the channel */
  permissions?: string;
  /** Channel flags combined as a bit field */
  flags: BitFieldResolvable<ChannelFlags>;
  /** Number of messages ever sent in a thread */
  total_message_sent?: Integer;
  /** The set of tags that can be used in a forum channel */
  available_tags?: ForumTagEntity[];
  /** The IDs of the set of tags that have been applied to a thread */
  applied_tags?: Snowflake[];
  /** The emoji to show in the add reaction button */
  default_reaction_emoji?: DefaultReactionEntity | null;
  /** The initial rate_limit_per_user to set on newly created threads */
  default_thread_rate_limit_per_user?: Integer;
  /** The default sort order type used to order forum posts */
  default_sort_order?: SortOrderType | null;
  /** The default forum layout type */
  default_forum_layout?: ForumLayoutType;
}
