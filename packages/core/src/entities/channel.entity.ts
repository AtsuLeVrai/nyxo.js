import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export enum OverwriteType {
  Role = 0,
  Member = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types}
 */
export enum ForumLayoutType {
  NotSet = 0,
  ListView = 1,
  GalleryView = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types}
 */
export enum SortOrderType {
  LatestActivity = 0,
  CreationDate = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
 */
export enum ChannelFlags {
  Pinned = 1 << 1,
  RequireTag = 1 << 4,
  HideMediaDownloadOptions = 1 << 15,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes}
 */
export enum VideoQualityMode {
  Auto = 1,
  Full = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export enum ChannelType {
  GuildText = 0,
  Dm = 1,
  GuildVoice = 2,
  GroupDm = 3,
  GuildCategory = 4,
  GuildAnnouncement = 5,
  AnnouncementThread = 10,
  PublicThread = 11,
  PrivateThread = 12,
  GuildStageVoice = 13,
  GuildDirectory = 14,
  GuildForum = 15,
  GuildMedia = 16,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
 */
export const ForumTagEntity = z.object({
  id: Snowflake,
  name: z.string(),
  moderated: z.boolean(),
  emoji_id: Snowflake.nullable(),
  emoji_name: z.string().nullable(),
});

export type ForumTagEntity = z.infer<typeof ForumTagEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object}
 */
export const DefaultReactionEntity = z.object({
  emoji_id: Snowflake.nullable(),
  emoji_name: z.string().nullable(),
});

export type DefaultReactionEntity = z.infer<typeof DefaultReactionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
export const ThreadMemberEntity = z.object({
  id: Snowflake.optional(),
  user_id: Snowflake.optional(),
  join_timestamp: z.string().datetime(),
  flags: z.custom<number>(BitFieldManager.isValidBitField),
  member: z.lazy(() => GuildMemberEntity.optional()),
});

export type ThreadMemberEntity = z.infer<typeof ThreadMemberEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export const ThreadMetadataEntity = z.object({
  archived: z.boolean(),
  auto_archive_duration: z.union([
    z.literal(60),
    z.literal(1440),
    z.literal(4320),
    z.literal(10080),
  ]),
  archive_timestamp: z.string().datetime(),
  locked: z.boolean(),
  invitable: z.boolean().optional(),
  create_timestamp: z.string().datetime().nullish(),
});

export type ThreadMetadataEntity = z.infer<typeof ThreadMetadataEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export const OverwriteEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(OverwriteType),
  allow: z.string(),
  deny: z.string(),
});

export type OverwriteEntity = z.infer<typeof OverwriteEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object}
 */
export const FollowedChannelEntity = z.object({
  channel_id: Snowflake,
  webhook_id: Snowflake,
});

export type FollowedChannelEntity = z.infer<typeof FollowedChannelEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export const ChannelEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(ChannelType),
  guild_id: Snowflake.optional(),
  position: z.number().int().optional(),
  permission_overwrites: z.array(OverwriteEntity).optional(),
  name: z.string().nullish(),
  topic: z.string().nullish(),
  nsfw: z.boolean().optional(),
  last_message_id: Snowflake.nullish(),
  bitrate: z.number().int().optional(),
  user_limit: z.number().int().optional(),
  rate_limit_per_user: z.number().int().optional(),
  recipients: z.array(z.lazy(() => UserEntity)).optional(),
  icon: z.string().nullish(),
  owner_id: Snowflake.optional(),
  application_id: Snowflake.optional(),
  managed: z.boolean().optional(),
  parent_id: Snowflake.nullish(),
  last_pin_timestamp: z.string().datetime().nullish(),
  rtc_region: z.string().nullish(),
  video_quality_mode: z.nativeEnum(VideoQualityMode).optional(),
  message_count: z.number().int().optional(),
  member_count: z.number().int().optional(),
  thread_metadata: ThreadMetadataEntity.optional(),
  member: ThreadMemberEntity.optional(),
  default_auto_archive_duration: z
    .union([z.literal(60), z.literal(1440), z.literal(4320), z.literal(10080)])
    .optional(),
  permissions: z.string().optional(),
  flags: z.custom<ChannelFlags>(BitFieldManager.isValidBitField),
  total_message_sent: z.number().int().optional(),
  available_tags: z.array(ForumTagEntity).optional(),
  applied_tags: z.array(Snowflake).optional(),
  default_reaction_emoji: DefaultReactionEntity.nullish(),
  default_thread_rate_limit_per_user: z.number().int().optional(),
  default_sort_order: z.nativeEnum(SortOrderType).nullish(),
  default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
});

export type ChannelEntity = z.infer<typeof ChannelEntity>;

/**
 * Guild Text Channel - {@link ChannelType.GuildText}
 */
export const GuildTextChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildText),
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
 * DM Channel - {@link ChannelType.Dm}
 */
export const DmChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.Dm),
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
 * Guild Voice Channel - {@link ChannelType.GuildVoice}
 */
export const GuildVoiceChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildVoice),
  guild_id: Snowflake.optional(),
  bitrate: z.number().int(),
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
 * Group DM Channel - {@link ChannelType.GroupDm}
 */
export const GroupDmChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GroupDm),
  recipients: z.array(z.lazy(() => UserEntity)),
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
 * Guild Category Channel - {@link ChannelType.GuildCategory}
 */
export const GuildCategoryChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildCategory),
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
 * Guild Announcement Channel - {@link ChannelType.GuildAnnouncement}
 */
export const GuildAnnouncementChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildAnnouncement),
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
 * Thread Channel Base - {@link ChannelType.PublicThread}
 */
export const PublicThreadChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.PublicThread),
  guild_id: Snowflake.optional(),
  thread_metadata: ThreadMetadataEntity,
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
 * Thread Channel Base - {@link ChannelType.PrivateThread}
 */
export const PrivateThreadChannelEntity = PublicThreadChannelEntity.extend({
  type: z.literal(ChannelType.PrivateThread),
});

export type PrivateThreadChannelEntity = z.infer<
  typeof PrivateThreadChannelEntity
>;

/**
 * Thread Channel Base - {@link ChannelType.AnnouncementThread}
 */
export const AnnouncementThreadChannelEntity = PublicThreadChannelEntity.extend(
  {
    type: z.literal(ChannelType.AnnouncementThread),
  },
);

export type AnnouncementThreadChannelEntity = z.infer<
  typeof AnnouncementThreadChannelEntity
>;

// Export union type of all thread channel types
export const AnyThreadChannelEntity = z.union([
  PublicThreadChannelEntity,
  PrivateThreadChannelEntity,
  AnnouncementThreadChannelEntity,
]);

export type AnyThreadChannelEntity = z.infer<typeof AnyThreadChannelEntity>;

/**
 * Guild Stage Voice Channel - {@link ChannelType.GuildStageVoice}
 */
export const GuildStageVoiceChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildStageVoice),
  guild_id: Snowflake.optional(),
  bitrate: z.number().int(),
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
 * Guild Forum Channel - {@link ChannelType.GuildForum}
 */
export const GuildForumChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildForum),
  guild_id: Snowflake.optional(),
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
 * Guild Media Channel - {@link ChannelType.GuildMedia}
 */
export const GuildMediaChannelEntity = ChannelEntity.extend({
  type: z.literal(ChannelType.GuildMedia),
  guild_id: Snowflake.optional(),
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

// Export union type of all channel types
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
