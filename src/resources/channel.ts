import type { Snowflake } from "../common/index.js";
import type { GuildMemberObject } from "./guild.js";
import type { UserObject } from "./user.js";

export enum ChannelType {
  GuildText = 0,
  DM = 1,
  GuildVoice = 2,
  GroupDM = 3,
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

export enum VideoQualityMode {
  Auto = 1,
  Full = 2,
}

export enum ChannelFlags {
  Pinned = 1 << 1,
  RequireTag = 1 << 4,
  HideMediaDownloadOptions = 1 << 15,
}

export enum SortOrderType {
  LatestActivity = 0,
  CreationDate = 1,
}

export enum ForumLayoutType {
  NotSet = 0,
  ListView = 1,
  GalleryView = 2,
}

export enum OverwriteType {
  Role = 0,
  Member = 1,
}

export interface OverwriteObject {
  id: Snowflake;
  type: OverwriteType;
  allow: string;
  deny: string;
}

export interface ThreadMetadataObject {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string | null;
}

export interface ThreadMemberObject {
  id?: Snowflake;
  user_id?: Snowflake;
  join_timestamp: string;
  flags: number;
  member?: GuildMemberObject;
}

export interface ForumTagObject {
  id: Snowflake;
  name: string;
  moderated: boolean;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

export interface DefaultReactionObject {
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

export interface FollowedChannelObject {
  channel_id: Snowflake;
  webhook_id: Snowflake;
}

interface BaseChannelObject {
  id: Snowflake;
  flags?: number | ChannelFlags;
  permissions?: string;
}

interface BaseGuildChannelObject extends BaseChannelObject {
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
  parent_id?: Snowflake | null;
}

interface BaseTextChannelObject extends BaseGuildChannelObject {
  topic?: string | null;
  last_message_id?: Snowflake | null;
  rate_limit_per_user?: number;
  last_pin_timestamp?: string | null;
  nsfw?: boolean;
  default_auto_archive_duration?: number;
}

interface BaseVoiceChannelObject extends BaseGuildChannelObject {
  bitrate: number;
  user_limit: number;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode;
}

interface BaseThreadChannelObject extends BaseChannelObject {
  guild_id: Snowflake;
  name: string;
  parent_id: Snowflake;
  owner_id: Snowflake;
  last_message_id?: Snowflake | null;
  rate_limit_per_user?: number;
  message_count: number;
  member_count: number;
  thread_metadata: ThreadMetadataObject;
  member?: ThreadMemberObject;
  total_message_sent?: number;
}

export interface GuildTextChannelObject extends BaseTextChannelObject {
  type: ChannelType.GuildText;
}

export interface DMChannelObject extends BaseChannelObject {
  type: ChannelType.DM;
  last_message_id?: Snowflake | null;
  recipients: UserObject[];
}

export interface GuildVoiceChannelObject extends BaseVoiceChannelObject {
  type: ChannelType.GuildVoice;
  last_message_id?: Snowflake | null;
  rate_limit_per_user?: number;
  nsfw?: boolean;
}

export interface GroupDMChannelObject extends BaseChannelObject {
  type: ChannelType.GroupDM;
  name?: string | null;
  icon?: string | null;
  recipients: UserObject[];
  last_message_id?: Snowflake | null;
  owner_id: Snowflake;
  application_id?: Snowflake;
  managed?: boolean;
}

export interface GuildCategoryChannelObject extends BaseGuildChannelObject {
  type: ChannelType.GuildCategory;
  nsfw?: boolean;
}

export interface GuildAnnouncementChannelObject extends BaseTextChannelObject {
  type: ChannelType.GuildAnnouncement;
}

export interface AnnouncementThreadChannelObject extends BaseThreadChannelObject {
  type: ChannelType.AnnouncementThread;
  applied_tags?: Snowflake[];
}

export interface PublicThreadChannelObject extends BaseThreadChannelObject {
  type: ChannelType.PublicThread;
  applied_tags?: Snowflake[];
}

export interface PrivateThreadChannelObject extends BaseThreadChannelObject {
  type: ChannelType.PrivateThread;
}

export interface GuildStageVoiceChannelObject extends BaseVoiceChannelObject {
  type: ChannelType.GuildStageVoice;
  topic?: string | null;
}

export interface GuildDirectoryChannelObject extends BaseGuildChannelObject {
  type: ChannelType.GuildDirectory;
}

export interface GuildForumChannelObject extends BaseGuildChannelObject {
  type: ChannelType.GuildForum;
  topic?: string | null;
  last_message_id?: Snowflake | null;
  rate_limit_per_user?: number;
  nsfw?: boolean;
  last_pin_timestamp?: string | null;
  default_auto_archive_duration?: number;
  available_tags: ForumTagObject[];
  default_reaction_emoji?: DefaultReactionObject | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: SortOrderType | null;
  default_forum_layout: ForumLayoutType;
}

export interface GuildMediaChannelObject extends BaseGuildChannelObject {
  type: ChannelType.GuildMedia;
  topic?: string | null;
  last_message_id?: Snowflake | null;
  rate_limit_per_user?: number;
  nsfw?: boolean;
  last_pin_timestamp?: string | null;
  default_auto_archive_duration?: number;
  available_tags: ForumTagObject[];
  default_reaction_emoji?: DefaultReactionObject | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: SortOrderType | null;
}

export type AnyChannelObject =
  | GuildTextChannelObject
  | DMChannelObject
  | GuildVoiceChannelObject
  | GroupDMChannelObject
  | GuildCategoryChannelObject
  | GuildAnnouncementChannelObject
  | AnnouncementThreadChannelObject
  | PublicThreadChannelObject
  | PrivateThreadChannelObject
  | GuildStageVoiceChannelObject
  | GuildDirectoryChannelObject
  | GuildForumChannelObject
  | GuildMediaChannelObject;
