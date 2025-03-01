import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

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
export const ThreadMemberEntity = z.object({
  /** ID of the thread */
  id: Snowflake.optional(),

  /** ID of the user */
  user_id: Snowflake.optional(),

  /** Time the user last joined the thread */
  join_timestamp: z.string().datetime(),

  /** User-thread settings, currently only used for notifications */
  flags: z.custom<number>(BitFieldManager.isValidBitField),

  /** Additional information about the user */
  member: z.lazy(() => GuildMemberEntity).optional(),
});

export type ThreadMemberEntity = z.infer<typeof ThreadMemberEntity>;

/**
 * Thread-specific metadata
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export const ThreadMetadataEntity = z.object({
  /** Whether the thread is archived */
  archived: z.boolean(),

  /** Duration in minutes to automatically archive the thread after inactivity */
  auto_archive_duration: z.union([
    z.literal(60),
    z.literal(1440),
    z.literal(4320),
    z.literal(10080),
  ]),

  /** Timestamp when the thread's archive status was last changed */
  archive_timestamp: z.string().datetime(),

  /** Whether the thread is locked */
  locked: z.boolean(),

  /** Whether non-moderators can add other non-moderators to the thread */
  invitable: z.boolean().optional(),

  /** Timestamp when the thread was created */
  create_timestamp: z.string().datetime().nullish(),
});

export type ThreadMetadataEntity = z.infer<typeof ThreadMetadataEntity>;

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
export const FollowedChannelEntity = z.object({
  /** Source channel ID */
  channel_id: Snowflake,

  /** Created target webhook ID */
  webhook_id: Snowflake,
});

export type FollowedChannelEntity = z.infer<typeof FollowedChannelEntity>;

/**
 * Base channel structure for all channel types
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
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
  permission_overwrites: z.array(OverwriteEntity).optional(),

  /** The name of the channel (1-100 characters) */
  name: z.string().nullish(),

  /** The channel topic (0-4096 characters for forums, 0-1024 for others) */
  topic: z.string().nullish(),

  /** Whether the channel is NSFW */
  nsfw: z.boolean().optional(),

  /** ID of the last message sent in this channel */
  last_message_id: Snowflake.nullish(),

  /** Bitrate (in bits) of the voice channel */
  bitrate: z.number().int().optional(),

  /** User limit of the voice channel */
  user_limit: z.number().int().optional(),

  /** Slowmode rate limit per user in seconds */
  rate_limit_per_user: z.number().int().optional(),

  /** Recipients of the DM */
  recipients: z.array(z.lazy(() => UserEntity)).optional(),

  /** Icon hash of the group DM */
  icon: z.string().nullish(),

  /** ID of the creator of the group DM or thread */
  owner_id: Snowflake.optional(),

  /** Application ID of the group DM creator if bot-created */
  application_id: Snowflake.optional(),

  /** Whether the channel is managed by an application */
  managed: z.boolean().optional(),

  /** ID of the parent category or text channel for threads */
  parent_id: Snowflake.nullish(),

  /** When the last pinned message was pinned */
  last_pin_timestamp: z.string().datetime().nullish(),

  /** Voice region ID for the voice channel */
  rtc_region: z.string().nullish(),

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
  default_auto_archive_duration: z
    .union([z.literal(60), z.literal(1440), z.literal(4320), z.literal(10080)])
    .optional(),

  /** Computed permissions for the invoking user in the channel */
  permissions: z.string().optional(),

  /** Channel flags combined as a bitfield */
  flags: z.custom<ChannelFlags>(BitFieldManager.isValidBitField),

  /** Total number of messages ever sent in a thread */
  total_message_sent: z.number().int().optional(),

  /** Set of tags that can be used in a forum or media channel */
  available_tags: z.array(ForumTagEntity).optional(),

  /** IDs of tags applied to a thread in a forum or media channel */
  applied_tags: z.array(Snowflake).optional(),

  /** Default emoji for the add reaction button on threads */
  default_reaction_emoji: DefaultReactionEntity.nullish(),

  /** Initial rate_limit_per_user to set on newly created threads */
  default_thread_rate_limit_per_user: z.number().int().optional(),

  /** Default sort order for forum posts */
  default_sort_order: z.nativeEnum(SortOrderType).nullish(),

  /** Default forum layout view */
  default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
});

export type ChannelEntity = z.infer<typeof ChannelEntity>;

/**
 * Guild Text Channel - A text channel within a server
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildTextChannelEntity = ChannelEntity.extend({
  /** Channel type: regular guild text channel */
  type: z.literal(ChannelType.GuildText),

  /** The ID of the guild this channel belongs to */
  guild_id: Snowflake.optional(),
}).omit({
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
});

export type GuildTextChannelEntity = z.infer<typeof GuildTextChannelEntity>;

/**
 * DM Channel - A direct message between users
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const DmChannelEntity = ChannelEntity.extend({
  /** Channel type: direct message */
  type: z.literal(ChannelType.Dm),

  /** Recipients of the DM */
  recipients: z.array(z.lazy(() => UserEntity)),
}).omit({
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
});

export type DmChannelEntity = z.infer<typeof DmChannelEntity>;

/**
 * Guild Voice Channel - A voice channel within a server
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildVoiceChannelEntity = ChannelEntity.extend({
  /** Channel type: guild voice channel */
  type: z.literal(ChannelType.GuildVoice),

  /** The ID of the guild this channel belongs to */
  guild_id: Snowflake.optional(),

  /** The bitrate (in bits) of the voice channel */
  bitrate: z.number().int(),

  /** The user limit of the voice channel */
  user_limit: z.number().int(),
}).omit({
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
});

export type GuildVoiceChannelEntity = z.infer<typeof GuildVoiceChannelEntity>;

/**
 * Group DM Channel - A direct message between multiple users
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GroupDmChannelEntity = ChannelEntity.extend({
  /** Channel type: group DM */
  type: z.literal(ChannelType.GroupDm),

  /** Recipients of the group DM */
  recipients: z.array(z.lazy(() => UserEntity)),

  /** ID of the creator of the group DM */
  owner_id: Snowflake,
}).omit({
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
});

export type GroupDmChannelEntity = z.infer<typeof GroupDmChannelEntity>;

/**
 * Guild Category Channel - An organizational category that contains channels
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildCategoryChannelEntity = ChannelEntity.extend({
  /** Channel type: guild category */
  type: z.literal(ChannelType.GuildCategory),

  /** The ID of the guild this category belongs to */
  guild_id: Snowflake.optional(),
}).omit({
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
});

export type GuildCategoryChannelEntity = z.infer<
  typeof GuildCategoryChannelEntity
>;

/**
 * Guild Announcement Channel - A channel that users can follow and crosspost into their own server
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildAnnouncementChannelEntity = ChannelEntity.extend({
  /** Channel type: guild announcement */
  type: z.literal(ChannelType.GuildAnnouncement),

  /** The ID of the guild this announcement channel belongs to */
  guild_id: Snowflake.optional(),
}).omit({
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
});

export type GuildAnnouncementChannelEntity = z.infer<
  typeof GuildAnnouncementChannelEntity
>;

/**
 * Public Thread Channel - A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const PublicThreadChannelEntity = ChannelEntity.extend({
  /** Channel type: public thread */
  type: z.literal(ChannelType.PublicThread),

  /** The ID of the guild this thread belongs to */
  guild_id: Snowflake.optional(),

  /** Thread-specific metadata */
  thread_metadata: ThreadMetadataEntity,

  /** ID of the text channel this thread was created in */
  parent_id: Snowflake,
}).omit({
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
});

export type PublicThreadChannelEntity = z.infer<
  typeof PublicThreadChannelEntity
>;

/**
 * Private Thread Channel - A temporary sub-channel within a GUILD_TEXT channel with limited access
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const PrivateThreadChannelEntity = PublicThreadChannelEntity.extend({
  /** Channel type: private thread */
  type: z.literal(ChannelType.PrivateThread),
});

export type PrivateThreadChannelEntity = z.infer<
  typeof PrivateThreadChannelEntity
>;

/**
 * Announcement Thread Channel - A temporary sub-channel within a GUILD_ANNOUNCEMENT channel
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const AnnouncementThreadChannelEntity = PublicThreadChannelEntity.extend(
  {
    /** Channel type: announcement thread */
    type: z.literal(ChannelType.AnnouncementThread),
  },
);

export type AnnouncementThreadChannelEntity = z.infer<
  typeof AnnouncementThreadChannelEntity
>;

/**
 * Union type of all thread channel types
 */
export const AnyThreadChannelEntity = z.union([
  PublicThreadChannelEntity,
  PrivateThreadChannelEntity,
  AnnouncementThreadChannelEntity,
]);

export type AnyThreadChannelEntity = z.infer<typeof AnyThreadChannelEntity>;

/**
 * Guild Stage Voice Channel - A voice channel for hosting events with an audience
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildStageVoiceChannelEntity = ChannelEntity.extend({
  /** Channel type: guild stage voice */
  type: z.literal(ChannelType.GuildStageVoice),

  /** The ID of the guild this stage channel belongs to */
  guild_id: Snowflake.optional(),

  /** The bitrate (in bits) of the stage channel */
  bitrate: z.number().int(),

  /** The user limit of the stage channel */
  user_limit: z.number().int(),
}).omit({
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
});

export type GuildStageVoiceChannelEntity = z.infer<
  typeof GuildStageVoiceChannelEntity
>;

/**
 * Guild Forum Channel - Channel that can only contain threads
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildForumChannelEntity = ChannelEntity.extend({
  /** Channel type: guild forum */
  type: z.literal(ChannelType.GuildForum),

  /** The ID of the guild this forum belongs to */
  guild_id: Snowflake.optional(),

  /** Set of tags that can be used in the forum */
  available_tags: z.array(ForumTagEntity),
}).omit({
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
});

export type GuildForumChannelEntity = z.infer<typeof GuildForumChannelEntity>;

/**
 * Guild Media Channel - Channel that can only contain threads, similar to GUILD_FORUM
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const GuildMediaChannelEntity = ChannelEntity.extend({
  /** Channel type: guild media */
  type: z.literal(ChannelType.GuildMedia),

  /** The ID of the guild this media channel belongs to */
  guild_id: Snowflake.optional(),

  /** Set of tags that can be used in the media channel */
  available_tags: z.array(ForumTagEntity),
}).omit({
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
