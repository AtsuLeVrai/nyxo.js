import type { Snowflake } from "../common/index.js";
import type { BitwisePermissionFlags } from "../constants/index.js";
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
  allow: `${BitwisePermissionFlags}`;
  deny: `${BitwisePermissionFlags}`;
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

export interface ChannelObject {
  id: Snowflake;
  type: ChannelType;
  guild_id?: Snowflake;
  position?: number;
  permission_overwrites?: OverwriteObject[];
  name?: string | null;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: Snowflake | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: UserObject[];
  icon?: string | null;
  owner_id?: Snowflake;
  application_id?: Snowflake;
  managed?: boolean;
  parent_id?: Snowflake | null;
  last_pin_timestamp?: string | null;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode;
  message_count?: number;
  member_count?: number;
  thread_metadata?: ThreadMetadataObject;
  member?: ThreadMemberObject;
  default_auto_archive_duration?: number;
  permissions?: string;
  flags?: number | ChannelFlags;
  total_message_sent?: number;
  available_tags?: ForumTagObject[];
  applied_tags?: Snowflake[];
  default_reaction_emoji?: DefaultReactionObject | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: SortOrderType | null;
  default_forum_layout?: ForumLayoutType;
}

export interface GuildTextChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "last_message_id"
    | "rate_limit_per_user"
    | "last_pin_timestamp"
    | "nsfw"
    | "default_auto_archive_duration"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildText;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
}

export interface DMChannelObject
  extends Pick<ChannelObject, "id" | "last_message_id" | "recipients" | "flags" | "permissions"> {
  type: ChannelType.DM;
  recipients: UserObject[];
}

export interface GuildVoiceChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "bitrate"
    | "user_limit"
    | "rtc_region"
    | "video_quality_mode"
    | "last_message_id"
    | "rate_limit_per_user"
    | "nsfw"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildVoice;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
  bitrate: number;
  user_limit: number;
}

export interface GroupDMChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "name"
    | "icon"
    | "recipients"
    | "last_message_id"
    | "owner_id"
    | "application_id"
    | "managed"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GroupDM;
  recipients: UserObject[];
  owner_id: Snowflake;
}

export interface GuildCategoryChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "nsfw"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildCategory;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
}

export interface GuildAnnouncementChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "last_message_id"
    | "rate_limit_per_user"
    | "last_pin_timestamp"
    | "nsfw"
    | "default_auto_archive_duration"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildAnnouncement;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
}

export interface AnnouncementThreadChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "name"
    | "parent_id"
    | "owner_id"
    | "last_message_id"
    | "rate_limit_per_user"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "total_message_sent"
    | "applied_tags"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.AnnouncementThread;
  guild_id: Snowflake;
  name: string;
  parent_id: Snowflake;
  owner_id: Snowflake;
  message_count: number;
  member_count: number;
  thread_metadata: ThreadMetadataObject;
}

export interface PublicThreadChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "name"
    | "parent_id"
    | "owner_id"
    | "last_message_id"
    | "rate_limit_per_user"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "total_message_sent"
    | "applied_tags"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.PublicThread;
  guild_id: Snowflake;
  name: string;
  parent_id: Snowflake;
  owner_id: Snowflake;
  message_count: number;
  member_count: number;
  thread_metadata: ThreadMetadataObject;
}

export interface PrivateThreadChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "name"
    | "parent_id"
    | "owner_id"
    | "last_message_id"
    | "rate_limit_per_user"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "total_message_sent"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.PrivateThread;
  guild_id: Snowflake;
  name: string;
  parent_id: Snowflake;
  owner_id: Snowflake;
  message_count: number;
  member_count: number;
  thread_metadata: ThreadMetadataObject;
}

export interface GuildStageVoiceChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "bitrate"
    | "user_limit"
    | "rtc_region"
    | "video_quality_mode"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildStageVoice;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
  bitrate: number;
  user_limit: number;
}

export interface GuildDirectoryChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildDirectory;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
}

export interface GuildForumChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "last_message_id"
    | "rate_limit_per_user"
    | "nsfw"
    | "last_pin_timestamp"
    | "default_auto_archive_duration"
    | "available_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildForum;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
  available_tags: ForumTagObject[];
  default_forum_layout: ForumLayoutType;
}

export interface GuildMediaChannelObject
  extends Pick<
    ChannelObject,
    | "id"
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "last_message_id"
    | "rate_limit_per_user"
    | "nsfw"
    | "last_pin_timestamp"
    | "default_auto_archive_duration"
    | "available_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "parent_id"
    | "flags"
    | "permissions"
  > {
  type: ChannelType.GuildMedia;
  guild_id: Snowflake;
  position: number;
  permission_overwrites: OverwriteObject[];
  name: string;
  available_tags: ForumTagObject[];
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
