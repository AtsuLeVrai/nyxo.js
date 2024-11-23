import type { BitwisePermissionFlags } from "../enums/index.js";
import type { Integer, Iso8601, Snowflake } from "../formatting/index.js";
import type { BitFieldResolvable } from "../utils/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

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
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object-default-reaction-structure}
 */
export interface DefaultReactionEntity {
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object-thread-member-structure}
 */
export interface ThreadMemberEntity {
  id?: Snowflake;
  user_id?: Snowflake;
  join_timestamp: Iso8601;
  flags: Integer;
  member?: GuildMemberEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure}
 */
export interface ThreadMetadataEntity {
  archived: boolean;
  auto_archive_duration: Integer;
  archive_timestamp: Iso8601;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: Iso8601 | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export interface OverwriteEntity {
  id: Snowflake;
  type: OverwriteType;
  allow: BitFieldResolvable<BitwisePermissionFlags>;
  deny: BitFieldResolvable<BitwisePermissionFlags>;
}

export enum OverwriteType {
  Role = 0,
  Member = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object-followed-channel-structure}
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
  default_auto_archive_duration?: Integer;
  permissions?: string;
  flags: BitFieldResolvable<ChannelFlags>;
  total_message_sent?: Integer;
  available_tags?: ForumTagEntity[];
  applied_tags?: Snowflake[];
  default_reaction_emoji?: DefaultReactionEntity | null;
  default_thread_rate_limit_per_user?: Integer;
  default_sort_order?: SortOrderType | null;
  default_forum_layout?: ForumLayoutType;
}
