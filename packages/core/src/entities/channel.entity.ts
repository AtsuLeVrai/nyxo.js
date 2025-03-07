import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Type of channel permission overwrite
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export enum OverwriteType {
  /** Role permission overwrite */
  Role = 0,

  /** Member permission overwrite */
  Member = 1,
}

/**
 * Layout types for forum channels
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types}
 */
export enum ForumLayoutType {
  /** No default has been set for forum channel */
  NotSet = 0,

  /** Display posts as a list */
  ListView = 1,

  /** Display posts as a collection of tiles */
  GalleryView = 2,
}

/**
 * Sort order types for forum/media channels
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types}
 */
export enum SortOrderType {
  /** Sort forum posts by activity */
  LatestActivity = 0,

  /** Sort forum posts by creation time (from most recent to oldest) */
  CreationDate = 1,
}

/**
 * Channel flags as a bitfield
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
 */
export enum ChannelFlags {
  /** Thread is pinned to the top of its parent forum/media channel */
  Pinned = 1 << 1,

  /** Thread requires a tag to be specified when creating */
  RequireTag = 1 << 4,

  /** When set hides the embedded media download options (media channels only) */
  HideMediaDownloadOptions = 1 << 15,
}

/**
 * Video quality modes for voice channels
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes}
 */
export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  Auto = 1,

  /** 720p video quality */
  Full = 2,
}

/**
 * Channel types enumeration
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

  /** An organizational category that contains channels */
  GuildCategory = 4,

  /** A channel that users can follow and crosspost into their own server */
  GuildAnnouncement = 5,

  /** A temporary sub-channel within a GUILD_ANNOUNCEMENT channel */
  AnnouncementThread = 10,

  /** A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel */
  PublicThread = 11,

  /** A temporary sub-channel within a GUILD_TEXT channel with limited access */
  PrivateThread = 12,

  /** A voice channel for hosting events with an audience */
  GuildStageVoice = 13,

  /** The channel in a hub containing the listed servers */
  GuildDirectory = 14,

  /** Channel that can only contain threads */
  GuildForum = 15,

  /** Channel that can only contain threads, similar to GUILD_FORUM */
  GuildMedia = 16,
}

/**
 * Forum tag object structure
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
 */
export const ForumTagEntity = z.object({
  /** ID of the tag */
  id: Snowflake,

  /** Name of the tag (0-20 characters) */
  name: z.string(),

  /** Whether this tag can only be added/removed by members with MANAGE_THREADS permission */
  moderated: z.boolean(),

  /** ID of a guild's custom emoji, null if no emoji */
  emoji_id: Snowflake.nullable(),

  /** Unicode character of the emoji, null if no emoji or if custom emoji is used */
  emoji_name: z.string().nullable(),
});

export type ForumTagEntity = z.infer<typeof ForumTagEntity>;

/**
 * Default reaction object for forum posts
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object}
 */
export const DefaultReactionEntity = z.object({
  /** ID of a guild's custom emoji, null if standard emoji */
  emoji_id: Snowflake.nullable(),

  /** Unicode character of the emoji, null if custom emoji is used */
  emoji_name: z.string().nullable(),
});

export type DefaultReactionEntity = z.infer<typeof DefaultReactionEntity>;

/**
 * Represents a user's membership in a thread
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
export interface ThreadMemberEntity {
  /** ID of the thread */
  id?: Snowflake;

  /** ID of the user */
  user_id?: Snowflake;

  /** Time the user last joined the thread */
  join_timestamp: string;

  /** User-thread settings, currently only used for notifications */
  flags: number;

  /** Additional information about the user */
  member?: GuildMemberEntity;
}

/**
 * Thread-specific metadata
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export interface ThreadMetadataEntity {
  /** Whether the thread is archived */
  archived: boolean;

  /** Duration in minutes to automatically archive the thread after inactivity */
  auto_archive_duration: 60 | 1440 | 4320 | 10080;

  /** Timestamp when the thread's archive status was last changed */
  archive_timestamp: string;

  /** Whether the thread is locked */
  locked: boolean;

  /** Whether non-moderators can add other non-moderators to the thread */
  invitable?: boolean;

  /** Timestamp when the thread was created */
  create_timestamp?: string | null;
}

/**
 * Channel permission overwrite object
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export const OverwriteEntity = z.object({
  /** Role or user ID */
  id: Snowflake,

  /** Type of overwrite: 0 for role or 1 for member */
  type: z.nativeEnum(OverwriteType),

  /** Permission bit set for allowed permissions */
  allow: z.string(),

  /** Permission bit set for denied permissions */
  deny: z.string(),
});

export type OverwriteEntity = z.infer<typeof OverwriteEntity>;

/**
 * Represents an announcement channel that has been followed
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object}
 */
export interface FollowedChannelEntity {
  /** Source channel ID */
  channel_id: Snowflake;

  /** Created target webhook ID */
  webhook_id: Snowflake;
}

/**
 * Base channel structure for all channel types
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
  position?: number;

  /** Explicit permission overwrites for members and roles */
  permission_overwrites?: OverwriteEntity[];

  /** The name of the channel (1-100 characters) */
  name?: string | null;

  /** The channel topic (0-4096 characters for forums, 0-1024 for others) */
  topic?: string;

  /** Whether the channel is NSFW */
  nsfw?: boolean;

  /** ID of the last message sent in this channel */
  last_message_id?: Snowflake | null;

  /** Bitrate (in bits) of the voice channel */
  bitrate?: number;

  /** User limit of the voice channel */
  user_limit?: number;

  /** Slowmode rate limit per user in seconds */
  rate_limit_per_user?: number;

  /** Recipients of the DM */
  recipients?: UserEntity[];

  /** Icon hash of the group DM */
  icon?: string | null;

  /** ID of the creator of the group DM or thread */
  owner_id?: Snowflake;

  /** Application ID of the group DM creator if bot-created */
  application_id?: Snowflake;

  /** Whether the channel is managed by an application */
  managed?: boolean;

  /** ID of the parent category or text channel for threads */
  parent_id?: Snowflake | null;

  /** When the last pinned message was pinned */
  last_pin_timestamp?: string | null;

  /** Voice region ID for the voice channel */
  rtc_region?: string | null;

  /** Camera video quality mode of the voice channel */
  video_quality_mode?: VideoQualityMode;

  /** Number of messages in a thread (excluding the initial message) */
  message_count?: number;

  /** Approximate count of users in a thread (stops at 50) */
  member_count?: number;

  /** Thread-specific fields not needed by other channels */
  thread_metadata?: ThreadMetadataEntity;

  /** Thread member object for the current user if joined */
  member?: ThreadMemberEntity;

  /** Default auto archive duration for newly created threads */
  default_auto_archive_duration?: 60 | 1440 | 4320 | 10080;

  /** Computed permissions for the invoking user in the channel */
  permissions?: string;

  /** Channel flags combined as a bitfield */
  flags: ChannelFlags;

  /** Total number of messages ever sent in a thread */
  total_message_sent?: number;

  /** Set of tags that can be used in a forum or media channel */
  available_tags?: ForumTagEntity;

  /** IDs of tags applied to a thread in a forum or media channel */
  applied_tags?: Snowflake[];

  /** Default emoji for the add reaction button on threads */
  default_reaction_emoji?: DefaultReactionEntity | null;

  /** Initial rate_limit_per_user to set on newly created threads */
  default_thread_rate_limit_per_user?: number;

  /** Default sort order for forum posts */
  default_sort_order?: SortOrderType | null;

  /** Default forum layout view */
  default_forum_layout?: ForumLayoutType;
}

/**
 * Guild Text Channel - A text channel within a server
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildTextChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "thread_metadata"
    | "member"
    | "available_tags"
  > {
  /** Channel type: regular guild text channel */
  type: ChannelType.GuildText;

  /** The ID of the guild this channel belongs to */
  guild_id?: Snowflake;
}

/**
 * DM Channel - A direct message between users
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface DmChannelEntity
  extends Omit<
    ChannelEntity,
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "nsfw"
    | "bitrate"
    | "user_limit"
    | "parent_id"
    | "rtc_region"
    | "video_quality_mode"
    | "thread_metadata"
    | "default_auto_archive_duration"
    | "flags"
    | "available_tags"
  > {
  /** Channel type: direct message */
  type: ChannelType.Dm;

  /** Recipients of the DM */
  recipients: UserEntity[];
}

/**
 * Guild Voice Channel - A voice channel within a server
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildVoiceChannelEntity
  extends Omit<
    ChannelEntity,
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "thread_metadata"
    | "member"
    | "message_count"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  /** Channel type: guild voice channel */
  type: ChannelType.GuildVoice;

  /** The ID of the guild this channel belongs to */
  guild_id?: Snowflake;

  /** The bitrate (in bits) of the voice channel */
  bitrate: number;

  /** The user limit of the voice channel */
  user_limit: number;
}

/**
 * Group DM Channel - A direct message between multiple users
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GroupDmChannelEntity
  extends Omit<
    ChannelEntity,
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "nsfw"
    | "bitrate"
    | "user_limit"
    | "parent_id"
    | "rate_limit_per_user"
    | "rtc_region"
    | "video_quality_mode"
    | "thread_metadata"
    | "default_auto_archive_duration"
    | "flags"
    | "available_tags"
  > {
  /** Channel type: group DM */
  type: ChannelType.GroupDm;

  /** Recipients of the group DM */
  recipients: UserEntity[];

  /** ID of the creator of the group DM */
  owner_id: Snowflake;
}

/**
 * Guild Category Channel - An organizational category that contains channels
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildCategoryChannelEntity
  extends Omit<
    ChannelEntity,
    | "topic"
    | "last_message_id"
    | "bitrate"
    | "user_limit"
    | "rate_limit_per_user"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "parent_id"
    | "last_pin_timestamp"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "default_auto_archive_duration"
    | "available_tags"
  > {
  /** Channel type: guild category */
  type: ChannelType.GuildCategory;

  /** The ID of the guild this category belongs to */
  guild_id?: Snowflake;
}

/**
 * Guild Announcement Channel - A channel that users can follow and crosspost into their own server
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildAnnouncementChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "rate_limit_per_user"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  /** Channel type: guild announcement */
  type: ChannelType.GuildAnnouncement;

  /** The ID of the guild this announcement channel belongs to */
  guild_id?: Snowflake;
}

/**
 * Public Thread Channel - A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface AnyThreadChannelEntity
  extends Omit<
    ChannelEntity,
    | "permission_overwrites"
    | "topic"
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "default_auto_archive_duration"
    | "default_forum_layout"
  > {
  /** Channel type: public thread */
  type:
    | ChannelType.PublicThread
    | ChannelType.PrivateThread
    | ChannelType.AnnouncementThread;

  /** The ID of the guild this thread belongs to */
  guild_id?: Snowflake;

  /** Thread-specific metadata */
  thread_metadata: ThreadMetadataEntity;

  /** ID of the text channel this thread was created in */
  parent_id: Snowflake;
}

/**
 * Guild Stage Voice Channel - A voice channel for hosting events with an audience
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildStageVoiceChannelEntity
  extends Omit<
    ChannelEntity,
    | "last_message_id"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "thread_metadata"
    | "member"
    | "message_count"
    | "member_count"
    | "default_auto_archive_duration"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  /** Channel type: guild stage voice */
  type: ChannelType.GuildStageVoice;

  /** The ID of the guild this stage channel belongs to */
  guild_id?: Snowflake;

  /** The bitrate (in bits) of the stage channel */
  bitrate: number;

  /** The user limit of the stage channel */
  user_limit: number;
}

/**
 * Guild Forum Channel - Channel that can only contain threads
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildForumChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "last_message_id"
    | "available_tags"
  > {
  /** Channel type: guild forum */
  type: ChannelType.GuildForum;

  /** The ID of the guild this forum belongs to */
  guild_id?: Snowflake;

  /** Set of tags that can be used in the forum */
  available_tags: ForumTagEntity[];
}

/**
 * Guild Media Channel - Channel that can only contain threads, similar to GUILD_FORUM
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildMediaChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "last_message_id"
    | "default_forum_layout"
    | "available_tags"
  > {
  /** Channel type: guild media */
  type: ChannelType.GuildMedia;

  /** The ID of the guild this media channel belongs to */
  guild_id?: Snowflake;

  /** Set of tags that can be used in the media channel */
  available_tags: ForumTagEntity[];
}

/**
 * Union type of all channel types with discriminated union pattern
 */
export type AnyChannelEntity =
  | GuildTextChannelEntity
  | DmChannelEntity
  | GuildVoiceChannelEntity
  | GroupDmChannelEntity
  | GuildCategoryChannelEntity
  | GuildAnnouncementChannelEntity
  | GuildStageVoiceChannelEntity
  | GuildForumChannelEntity
  | GuildMediaChannelEntity
  | AnyThreadChannelEntity;
