import type { BitwisePermissionFlags } from "../enums/index.js";
import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
 */
export interface ForumTagEntity {
  id: Snowflake;
  name: string;
  moderated: boolean;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object}
 */
export interface DefaultReactionEntity {
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
export interface ThreadMemberEntity {
  id?: Snowflake;
  user_id?: Snowflake;
  join_timestamp: Iso8601;
  flags: Integer;
  member?: GuildMemberEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export interface ThreadMetadataEntity {
  archived: boolean;
  auto_archive_duration: 60 | 1440 | 4320 | 10080;
  archive_timestamp: Iso8601;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: Iso8601 | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export interface OverwriteEntity {
  id: Snowflake;
  type: OverwriteType;
  allow: BitwisePermissionFlags;
  deny: BitwisePermissionFlags;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export enum OverwriteType {
  Role = 0,
  Member = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object}
 */
export interface FollowedChannelEntity {
  channel_id: Snowflake;
  webhook_id: Snowflake;
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
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export interface ChannelEntity {
  id: Snowflake;
  type: ChannelType;
  guild_id?: Snowflake;
  position?: Integer;
  permission_overwrites?: OverwriteEntity[];
  name?: string | null;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: Snowflake | null;
  bitrate?: Integer;
  user_limit?: Integer;
  rate_limit_per_user?: Integer;
  recipients?: UserEntity[];
  icon?: string | null;
  owner_id?: Snowflake;
  application_id?: Snowflake;
  managed?: boolean;
  parent_id?: Snowflake | null;
  last_pin_timestamp?: Iso8601 | null;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode;
  message_count?: Integer;
  member_count?: Integer;
  thread_metadata?: ThreadMetadataEntity;
  member?: ThreadMemberEntity;
  default_auto_archive_duration?: 60 | 1440 | 4320 | 10080;
  permissions?: string;
  flags: ChannelFlags;
  total_message_sent?: Integer;
  available_tags?: ForumTagEntity[];
  applied_tags?: Snowflake[];
  default_reaction_emoji?: DefaultReactionEntity | null;
  default_thread_rate_limit_per_user?: Integer;
  default_sort_order?: SortOrderType | null;
  default_forum_layout?: ForumLayoutType;
}

/**
 * Guild Text Channel - {@link ChannelType.GuildText}
 */
export interface GuildTextChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "nsfw"
    | "last_message_id"
    | "rate_limit_per_user"
    | "parent_id"
    | "last_pin_timestamp"
    | "default_auto_archive_duration"
    | "permissions"
    | "flags"
  > {
  type: ChannelType.GuildText;
  guild_id: Snowflake;
}

/**
 * DM Channel - {@link ChannelType.Dm}
 */
export interface DmChannelEntity
  extends Pick<
    ChannelEntity,
    "id" | "type" | "last_message_id" | "recipients" | "last_pin_timestamp"
  > {
  type: ChannelType.Dm;
  recipients: UserEntity[];
}

/**
 * Guild Voice Channel - {@link ChannelType.GuildVoice}
 */
export interface GuildVoiceChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "bitrate"
    | "user_limit"
    | "parent_id"
    | "rtc_region"
    | "video_quality_mode"
    | "flags"
  > {
  type: ChannelType.GuildVoice;
  guild_id: Snowflake;
  bitrate: Integer;
  user_limit: Integer;
}

/**
 * Group DM Channel - {@link ChannelType.GroupDm}
 */
export interface GroupDmChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "name"
    | "last_message_id"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
  > {
  type: ChannelType.GroupDm;
  recipients: UserEntity[];
  owner_id: Snowflake;
}

/**
 * Guild Category Channel - {@link ChannelType.GuildCategory}
 */
export interface GuildCategoryChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "nsfw"
    | "flags"
  > {
  type: ChannelType.GuildCategory;
  guild_id: Snowflake;
}

/**
 * Guild Announcement Channel - {@link ChannelType.GuildAnnouncement}
 */
export interface GuildAnnouncementChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "nsfw"
    | "last_message_id"
    | "parent_id"
    | "default_auto_archive_duration"
    | "flags"
  > {
  type: ChannelType.GuildAnnouncement;
  guild_id: Snowflake;
}

/**
 * Thread Channel Base - {@link ChannelType.AnnouncementThread}, {@link ChannelType.PublicThread}, {@link ChannelType.PrivateThread}
 */
export interface ThreadChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "name"
    | "member_count"
    | "message_count"
    | "thread_metadata"
    | "member"
    | "rate_limit_per_user"
    | "parent_id"
    | "owner_id"
    | "last_message_id"
    | "flags"
    | "total_message_sent"
    | "applied_tags"
  > {
  type:
    | ChannelType.AnnouncementThread
    | ChannelType.PublicThread
    | ChannelType.PrivateThread;
  guild_id: Snowflake;
  thread_metadata: ThreadMetadataEntity;
  parent_id: Snowflake;
}

/**
 * Guild Stage Voice Channel - {@link ChannelType.GuildStageVoice}
 */
export interface GuildStageVoiceChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "bitrate"
    | "user_limit"
    | "parent_id"
    | "rtc_region"
    | "topic"
    | "flags"
  > {
  type: ChannelType.GuildStageVoice;
  guild_id: Snowflake;
  bitrate: Integer;
  user_limit: Integer;
}

/**
 * Guild Forum Channel - {@link ChannelType.GuildForum}
 */
export interface GuildForumChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "nsfw"
    | "rate_limit_per_user"
    | "parent_id"
    | "flags"
    | "available_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  type: ChannelType.GuildForum;
  guild_id: Snowflake;
  available_tags: ForumTagEntity[];
}

/**
 * Guild Media Channel - {@link ChannelType.GuildMedia}
 */
export interface GuildMediaChannelEntity
  extends Pick<
    ChannelEntity,
    | "id"
    | "type"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "nsfw"
    | "rate_limit_per_user"
    | "parent_id"
    | "flags"
    | "available_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
  > {
  type: ChannelType.GuildMedia;
  guild_id: Snowflake;
  available_tags: ForumTagEntity[];
}

// Export union type of all channel types
export type AnyChannelEntity =
  | GuildTextChannelEntity
  | DmChannelEntity
  | GuildVoiceChannelEntity
  | GroupDmChannelEntity
  | GuildCategoryChannelEntity
  | GuildAnnouncementChannelEntity
  | ThreadChannelEntity
  | GuildStageVoiceChannelEntity
  | GuildForumChannelEntity
  | GuildMediaChannelEntity;
