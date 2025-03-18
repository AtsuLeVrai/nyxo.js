import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * Type of channel permission overwrite
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#overwrite-object}
 */
export enum OverwriteType {
  /** Role permission overwrite */
  Role = 0,

  /** Member permission overwrite */
  Member = 1,
}

/**
 * Layout types for forum channels
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-forum-layout-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-sort-order-types}
 */
export enum SortOrderType {
  /** Sort forum posts by activity */
  LatestActivity = 0,

  /** Sort forum posts by creation time (from most recent to oldest) */
  CreationDate = 1,
}

/**
 * Channel flags as a bitfield
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-flags}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-video-quality-modes}
 */
export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  Auto = 1,

  /** 720p video quality */
  Full = 2,
}

/**
 * Channel types enumeration
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#forum-tag-object}
 */
export const ForumTagEntity = z.object({
  /** ID of the tag */
  id: Snowflake,

  /** Name of the tag (0-20 characters) */
  name: z.string().min(0).max(20),

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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#default-reaction-object}
 */
export const DefaultReactionEntity = z.object({
  /** ID of a guild's custom emoji, null if standard emoji */
  emoji_id: Snowflake.nullable(),

  /** Unicode character of the emoji, null if custom emoji is used */
  emoji_name: z.string().nullable(),
});

export type DefaultReactionEntity = z.infer<typeof DefaultReactionEntity>;

/**
 * Union of all auto-archive durations
 */
export const AutoArchiveDuration = z.union([
  z.literal(60),
  z.literal(1440),
  z.literal(4320),
  z.literal(10080),
]);

export type AutoArchiveDuration = z.infer<typeof AutoArchiveDuration>;

/**
 * Thread-specific metadata
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#thread-metadata-object}
 */
export const ThreadMetadataEntity = z.object({
  /** Whether the thread is archived */
  archived: z.boolean(),

  /** Duration in minutes to automatically archive the thread after inactivity */
  auto_archive_duration: AutoArchiveDuration,

  /** Timestamp when the thread's archive status was last changed */
  archive_timestamp: z.string(),

  /** Whether the thread is locked */
  locked: z.boolean(),

  /** Whether non-moderators can add other non-moderators to the thread */
  invitable: z.boolean().optional(),

  /** Timestamp when the thread was created */
  create_timestamp: z.string().nullable().optional(),
});

export type ThreadMetadataEntity = z.infer<typeof ThreadMetadataEntity>;

/**
 * Represents a user's membership in a thread
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#thread-member-object}
 */
export const ThreadMemberEntity = z.object({
  /** ID of the thread */
  id: Snowflake.optional(),

  /** ID of the user */
  user_id: Snowflake.optional(),

  /** Time the user last joined the thread */
  join_timestamp: z.string(),

  /** User-thread settings, currently only used for notifications */
  flags: z.number(),

  /** Additional information about the user */
  member: z.lazy(() => GuildMemberEntity).optional(),
});

export type ThreadMemberEntity = z.infer<typeof ThreadMemberEntity>;

/**
 * Channel permission overwrite object
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#overwrite-object}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#followed-channel-object}
 */
export const FollowedChannelEntity = z.object({
  /** Source channel ID */
  channel_id: Snowflake,

  /** Created target webhook ID */
  webhook_id: Snowflake,
});

export type FollowedChannelEntity = z.infer<typeof FollowedChannelEntity>;

/**
 * Base channel structure for all channel types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-structure}
 */
export const ChannelEntity = z.object({
  /** The ID of this channel */
  id: Snowflake,

  /** The type of channel */
  type: z.nativeEnum(ChannelType),

  /** The ID of the guild (may be missing for some channel objects) */
  guild_id: Snowflake.optional(),

  /** Sorting position of the channel */
  position: z.number().int().optional(),

  /** Explicit permission overwrites for members and roles */
  permission_overwrites: OverwriteEntity.array().optional(),

  /** The name of the channel (1-100 characters) */
  name: z.string().min(1).max(100).nullable().optional(),

  /** The channel topic (0-4096 characters for forums, 0-1024 for others) */
  topic: z.string().optional(),

  /** Whether the channel is NSFW */
  nsfw: z.boolean().optional(),

  /** ID of the last message sent in this channel */
  last_message_id: Snowflake.nullable().optional(),

  /** Bitrate (in bits) of the voice channel */
  bitrate: z.number().int().optional(),

  /** User limit of the voice channel */
  user_limit: z.number().int().optional(),

  /** Slowmode rate limit per user in seconds */
  rate_limit_per_user: z.number().int().optional(),

  /** Recipients of the DM */
  recipients: z
    .lazy(() => UserEntity)
    .array()
    .optional(),

  /** Icon hash of the group DM */
  icon: z.string().nullable().optional(),

  /** ID of the creator of the group DM or thread */
  owner_id: Snowflake.optional(),

  /** Application ID of the group DM creator if bot-created */
  application_id: Snowflake.optional(),

  /** Whether the channel is managed by an application */
  managed: z.boolean().optional(),

  /** ID of the parent category or text channel for threads */
  parent_id: Snowflake.nullable().optional(),

  /** When the last pinned message was pinned */
  last_pin_timestamp: z.string().nullable().optional(),

  /** Voice region ID for the voice channel */
  rtc_region: z.string().nullable().optional(),

  /** Camera video quality mode of the voice channel */
  video_quality_mode: z.nativeEnum(VideoQualityMode).optional(),

  /** Number of messages in a thread (excluding the initial message) */
  message_count: z.number().int().optional(),

  /** Approximate count of users in a thread (stops at 50) */
  member_count: z.number().int().optional(),

  /** Thread-specific fields not needed by other channels */
  thread_metadata: ThreadMetadataEntity.optional(),

  /** Thread member object for the current user if joined */
  member: ThreadMemberEntity.optional(),

  /** Default auto archive duration for newly created threads */
  default_auto_archive_duration: AutoArchiveDuration.optional(),

  /** Computed permissions for the invoking user in the channel */
  permissions: z.string().optional(),

  /** Channel flags combined as a bitfield */
  flags: z.union([z.number(), z.nativeEnum(ChannelFlags)]),

  /** Total number of messages ever sent in a thread */
  total_message_sent: z.number().int().optional(),

  /** Set of tags that can be used in a forum or media channel */
  available_tags: ForumTagEntity.optional(),

  /** IDs of tags applied to a thread in a forum or media channel */
  applied_tags: Snowflake.array().optional(),

  /** Default emoji for the add reaction button on threads */
  default_reaction_emoji: DefaultReactionEntity.nullable().optional(),

  /** Initial rate_limit_per_user to set on newly created threads */
  default_thread_rate_limit_per_user: z.number().int().optional(),

  /** Default sort order for forum posts */
  default_sort_order: z.nativeEnum(SortOrderType).nullable().optional(),

  /** Default forum layout view */
  default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
});

export type ChannelEntity = z.infer<typeof ChannelEntity>;

/**
 * Guild Text Channel - A text channel within a server
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildTextChannelEntity = ChannelEntity.omit({
  bitrate: true,
  user_limit: true,
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  thread_metadata: true,
  member: true,
  available_tags: true,
}).extend({
  type: z.literal(ChannelType.GuildText),
  guild_id: Snowflake.optional(),
});

export type GuildTextChannelEntity = z.infer<typeof GuildTextChannelEntity>;

/**
 * DM Channel - A direct message between users
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const DmChannelEntity = ChannelEntity.omit({
  guild_id: true,
  position: true,
  permission_overwrites: true,
  name: true,
  topic: true,
  nsfw: true,
  bitrate: true,
  user_limit: true,
  parent_id: true,
  rtc_region: true,
  video_quality_mode: true,
  thread_metadata: true,
  default_auto_archive_duration: true,
  flags: true,
  available_tags: true,
}).extend({
  type: z.literal(ChannelType.Dm),
  recipients: z.lazy(() => UserEntity).array(),
});

export type DmChannelEntity = z.infer<typeof DmChannelEntity>;

/**
 * Guild Voice Channel - A voice channel within a server
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildVoiceChannelEntity = ChannelEntity.omit({
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  thread_metadata: true,
  member: true,
  message_count: true,
  available_tags: true,
  applied_tags: true,
  default_reaction_emoji: true,
  default_thread_rate_limit_per_user: true,
  default_sort_order: true,
  default_forum_layout: true,
}).extend({
  type: z.literal(ChannelType.GuildVoice),
  guild_id: Snowflake.optional(),
  bitrate: z.number().int(),
  user_limit: z.number().int(),
});

export type GuildVoiceChannelEntity = z.infer<typeof GuildVoiceChannelEntity>;

/**
 * Group DM Channel - A direct message between multiple users
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GroupDmChannelEntity = ChannelEntity.omit({
  guild_id: true,
  position: true,
  permission_overwrites: true,
  nsfw: true,
  bitrate: true,
  user_limit: true,
  parent_id: true,
  rate_limit_per_user: true,
  rtc_region: true,
  video_quality_mode: true,
  thread_metadata: true,
  default_auto_archive_duration: true,
  flags: true,
  available_tags: true,
}).extend({
  type: z.literal(ChannelType.GroupDm),
  recipients: z.lazy(() => UserEntity).array(),
  owner_id: Snowflake,
});

export type GroupDmChannelEntity = z.infer<typeof GroupDmChannelEntity>;

/**
 * Guild Category Channel - An organizational category that contains channels
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildCategoryChannelEntity = ChannelEntity.omit({
  topic: true,
  last_message_id: true,
  bitrate: true,
  user_limit: true,
  rate_limit_per_user: true,
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  parent_id: true,
  last_pin_timestamp: true,
  rtc_region: true,
  video_quality_mode: true,
  message_count: true,
  member_count: true,
  thread_metadata: true,
  member: true,
  default_auto_archive_duration: true,
  available_tags: true,
}).extend({
  type: z.literal(ChannelType.GuildCategory),
  guild_id: Snowflake.optional(),
});

export type GuildCategoryChannelEntity = z.infer<
  typeof GuildCategoryChannelEntity
>;

/**
 * Guild Announcement Channel - A channel that users can follow and crosspost into their own server
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildAnnouncementChannelEntity = ChannelEntity.omit({
  bitrate: true,
  user_limit: true,
  rate_limit_per_user: true,
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  rtc_region: true,
  video_quality_mode: true,
  message_count: true,
  member_count: true,
  thread_metadata: true,
  member: true,
  available_tags: true,
  applied_tags: true,
  default_reaction_emoji: true,
  default_thread_rate_limit_per_user: true,
  default_sort_order: true,
  default_forum_layout: true,
}).extend({
  type: z.literal(ChannelType.GuildAnnouncement),
  guild_id: Snowflake.optional(),
});

export type GuildAnnouncementChannelEntity = z.infer<
  typeof GuildAnnouncementChannelEntity
>;

/**
 * Public Thread Channel - A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const PublicThreadChannelEntity = ChannelEntity.omit({
  permission_overwrites: true,
  topic: true,
  bitrate: true,
  user_limit: true,
  recipients: true,
  icon: true,
  application_id: true,
  managed: true,
  rtc_region: true,
  video_quality_mode: true,
  default_auto_archive_duration: true,
  default_forum_layout: true,
}).extend({
  type: z.literal(ChannelType.PublicThread),
  guild_id: Snowflake.optional(),
  thread_metadata: ThreadMetadataEntity,
  parent_id: Snowflake,
});

export type PublicThreadChannelEntity = z.infer<
  typeof PublicThreadChannelEntity
>;

/**
 * Private Thread Channel - A temporary sub-channel within a GUILD_TEXT channel with limited access
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const PrivateThreadChannelEntity = ChannelEntity.omit({
  permission_overwrites: true,
  topic: true,
  bitrate: true,
  user_limit: true,
  recipients: true,
  icon: true,
  application_id: true,
  managed: true,
  rtc_region: true,
  video_quality_mode: true,
  default_auto_archive_duration: true,
  default_forum_layout: true,
}).extend({
  type: z.literal(ChannelType.PrivateThread),
  guild_id: Snowflake.optional(),
  thread_metadata: ThreadMetadataEntity,
  parent_id: Snowflake,
  // The invitable field is only present for private threads
  invitable: z.boolean().optional(),
});

export type PrivateThreadChannelEntity = z.infer<
  typeof PrivateThreadChannelEntity
>;

/**
 * Announcement Thread Channel - A temporary sub-channel within a GUILD_ANNOUNCEMENT channel
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const AnnouncementThreadChannelEntity = ChannelEntity.omit({
  permission_overwrites: true,
  topic: true,
  bitrate: true,
  user_limit: true,
  recipients: true,
  icon: true,
  application_id: true,
  managed: true,
  rtc_region: true,
  video_quality_mode: true,
  default_auto_archive_duration: true,
  default_forum_layout: true,
}).extend({
  type: z.literal(ChannelType.AnnouncementThread),
  guild_id: Snowflake.optional(),
  thread_metadata: ThreadMetadataEntity,
  parent_id: Snowflake,
});

export type AnnouncementThreadChannelEntity = z.infer<
  typeof AnnouncementThreadChannelEntity
>;

/**
 * Union of all thread channel types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const AnyThreadChannelEntity = z.discriminatedUnion("type", [
  PublicThreadChannelEntity,
  PrivateThreadChannelEntity,
  AnnouncementThreadChannelEntity,
]);

export type AnyThreadChannelEntity = z.infer<typeof AnyThreadChannelEntity>;

/**
 * Guild Stage Voice Channel - A voice channel for hosting events with an audience
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildStageVoiceChannelEntity = ChannelEntity.omit({
  last_message_id: true,
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  thread_metadata: true,
  member: true,
  message_count: true,
  member_count: true,
  default_auto_archive_duration: true,
  available_tags: true,
  applied_tags: true,
  default_reaction_emoji: true,
  default_thread_rate_limit_per_user: true,
  default_sort_order: true,
  default_forum_layout: true,
}).extend({
  type: z.literal(ChannelType.GuildStageVoice),
  guild_id: Snowflake.optional(),
  bitrate: z.number().int(),
  user_limit: z.number().int(),
});

export type GuildStageVoiceChannelEntity = z.infer<
  typeof GuildStageVoiceChannelEntity
>;

/**
 * Guild Forum Channel - Channel that can only contain threads
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildForumChannelEntity = ChannelEntity.omit({
  bitrate: true,
  user_limit: true,
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  rtc_region: true,
  video_quality_mode: true,
  message_count: true,
  member_count: true,
  thread_metadata: true,
  member: true,
  last_message_id: true,
  available_tags: true,
}).extend({
  type: z.literal(ChannelType.GuildForum),
  guild_id: Snowflake.optional(),
  available_tags: ForumTagEntity.array(),
});

export type GuildForumChannelEntity = z.infer<typeof GuildForumChannelEntity>;

/**
 * Guild Media Channel - Channel that can only contain threads, similar to GUILD_FORUM
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/channel.md#channel-object-channel-types}
 */
export const GuildMediaChannelEntity = ChannelEntity.omit({
  bitrate: true,
  user_limit: true,
  recipients: true,
  icon: true,
  owner_id: true,
  application_id: true,
  managed: true,
  rtc_region: true,
  video_quality_mode: true,
  message_count: true,
  member_count: true,
  thread_metadata: true,
  member: true,
  last_message_id: true,
  default_forum_layout: true,
  available_tags: true,
}).extend({
  type: z.literal(ChannelType.GuildMedia),
  guild_id: Snowflake.optional(),
  available_tags: ForumTagEntity.array(),
});

export type GuildMediaChannelEntity = z.infer<typeof GuildMediaChannelEntity>;

/**
 * Union type of all channel types with discriminated union pattern
 */
export const AnyChannelEntity = z.discriminatedUnion("type", [
  GuildTextChannelEntity,
  DmChannelEntity,
  GuildVoiceChannelEntity,
  GroupDmChannelEntity,
  GuildCategoryChannelEntity,
  GuildAnnouncementChannelEntity,
  GuildStageVoiceChannelEntity,
  GuildForumChannelEntity,
  GuildMediaChannelEntity,
  ...AnyThreadChannelEntity.options,
]);

export type AnyChannelEntity = z.infer<typeof AnyChannelEntity>;
