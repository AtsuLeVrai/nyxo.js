export enum OverwriteType {
  Role = 0,
  Member = 1,
}

export enum ForumLayoutType {
  NotSet = 0,
  ListView = 1,
  GalleryView = 2,
}

export enum SortOrderType {
  LatestActivity = 0,
  CreationDate = 1,
}

export enum ChannelFlags {
  Pinned = 1 << 1,
  RequireTag = 1 << 4,
  HideMediaDownloadOptions = 1 << 15,
}

export enum VideoQualityMode {
  Auto = 1,
  Full = 2,
}

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

export interface ForumTagEntity {
  id: string;
  name: string;
  moderated: boolean;
  emoji_id: string | null;
  emoji_name: string | null;
}

export interface DefaultReactionEntity {
  emoji_id: string | null;
  emoji_name: string | null;
}

export type AutoArchiveDuration = 60 | 1440 | 4320 | 10080;

export interface ThreadMetadataEntity {
  archived: boolean;
  auto_archive_duration: AutoArchiveDuration;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string | null;
}

export interface ThreadMemberEntity {
  id?: string;
  user_id?: string;
  join_timestamp: string;
  flags: number;
  member?: GuildMemberEntity;
}

export interface OverwriteEntity {
  id: string;
  type: OverwriteType;
  allow: `${BitwisePermissionFlags}`;
  deny: `${BitwisePermissionFlags}`;
}

export interface FollowedChannelEntity {
  channel_id: string;
  webhook_id: string;
}

export interface ChannelPinsUpdateEntity {
  guild_id?: string;
  channel_id: string;
  last_pin_timestamp: string | null;
}

export interface ThreadListSyncEntity {
  guild_id: string;
  channel_ids?: string[];
  threads: AnyThreadBasedChannelEntity[];
  members: ThreadMemberEntity[];
}

export interface ThreadMemberUpdateEntity extends ThreadMemberEntity {
  guild_id: string;
}

export interface ThreadMembersUpdateEntity {
  id: string;
  guild_id: string;
  member_count: number;
  added_members?: ThreadMemberEntity[];
  removed_member_ids?: string[];
}

export interface ChannelEntity {
  id: string;
  type: ChannelType;
  guild_id?: string;
  position?: number;
  permission_overwrites?: OverwriteEntity[];
  name?: string | null;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: UserEntity[];
  icon?: string | null;
  owner_id?: string;
  application_id?: string;
  managed?: boolean;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode;
  message_count?: number;
  member_count?: number;
  thread_metadata?: ThreadMetadataEntity;
  member?: ThreadMemberEntity;
  default_auto_archive_duration?: AutoArchiveDuration;
  permissions?: string;
  flags: ChannelFlags;
  total_message_sent?: number;
  available_tags?: ForumTagEntity[];
  applied_tags?: string[];
  default_reaction_emoji?: DefaultReactionEntity | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: SortOrderType | null;
  default_forum_layout?: ForumLayoutType;
}

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
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
  > {
  type: ChannelType.GuildText;
  guild_id: string;
}

export interface DMChannelEntity
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
    | "available_tags"
  > {
  type: ChannelType.Dm;
  recipients: UserEntity[];
}

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
  type: ChannelType.GuildVoice;
  guild_id: string;
  bitrate: number;
  user_limit: number;
}

export interface GroupDMChannelEntity
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
    | "available_tags"
  > {
  type: ChannelType.GroupDm;
  recipients: UserEntity[];
  owner_id: string;
}

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
  type: ChannelType.GuildCategory;
  guild_id: string;
}

export interface GuildAnnouncementChannelEntity
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
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  type: ChannelType.GuildAnnouncement;
  guild_id: string;
}

export interface PublicThreadChannelEntity
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
  type: ChannelType.PublicThread;
  guild_id: string;
  thread_metadata: ThreadMetadataEntity;
  parent_id: string;
}

export interface PrivateThreadChannelEntity
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
  type: ChannelType.PrivateThread;
  guild_id: string;
  thread_metadata: ThreadMetadataEntity;
  parent_id: string;
  invitable?: boolean;
}

export interface AnnouncementThreadChannelEntity
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
  type: ChannelType.AnnouncementThread;
  guild_id: string;
  thread_metadata: ThreadMetadataEntity;
  parent_id: string;
}

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
  type: ChannelType.GuildStageVoice;
  guild_id: string;
  bitrate: number;
  user_limit: number;
}

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
  > {
  type: ChannelType.GuildForum;
  guild_id: string;
  available_tags: ForumTagEntity[];
}

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
  > {
  type: ChannelType.GuildMedia;
  guild_id: string;
  available_tags: ForumTagEntity[];
}

export interface GuildDirectoryChannelEntity
  extends Omit<
    ChannelEntity,
    | "topic"
    | "nsfw"
    | "last_message_id"
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
    | "default_auto_archive_duration"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  type: ChannelType.GuildDirectory;
  guild_id: string;
}

export type AnyThreadBasedChannelEntity =
  | PublicThreadChannelEntity
  | PrivateThreadChannelEntity
  | AnnouncementThreadChannelEntity;

export type AnyGuildBasedChannelEntity =
  | GuildTextChannelEntity
  | GuildVoiceChannelEntity
  | GuildCategoryChannelEntity
  | GuildAnnouncementChannelEntity
  | GuildStageVoiceChannelEntity
  | GuildForumChannelEntity
  | GuildMediaChannelEntity
  | GuildDirectoryChannelEntity;

export type AnyDmBasedChannelEntity = DMChannelEntity | GroupDMChannelEntity;

export type AnyChannelEntity =
  | AnyDmBasedChannelEntity
  | AnyGuildBasedChannelEntity
  | AnyThreadBasedChannelEntity;

export interface GroupDmUpdateOptions {
  name: string;
  icon: string;
}

export interface GuildChannelUpdateOptions {
  name?: string;
  type?: ChannelType.GuildText | ChannelType.AnnouncementThread | ChannelType.GuildAnnouncement;
  position?: number;
  topic?: string | null;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  bitrate?: number;
  user_limit?: number;
  permission_overwrites?: Partial<OverwriteEntity>[];
  parent_id?: string | null;
  rtc_region?: string | null;
  video_quality_mode?: number;
  default_auto_archive_duration?: AutoArchiveDuration;
  flags?: ChannelFlags;
  available_tags?: ForumTagEntity[];
  default_reaction_emoji?: DefaultReactionEntity | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: number | null;
  default_forum_layout?: number;
}

export interface ThreadUpdateOptions {
  name?: string;
  archived?: boolean;
  auto_archive_duration?: AutoArchiveDuration;
  locked?: boolean;
  invitable?: boolean;
  rate_limit_per_user?: number;
  flags?: ChannelFlags;
  applied_tags?: string[];
}

export interface ChannelPermissionUpdateOptions {
  allow?: BitwisePermissionFlags | null;
  deny?: BitwisePermissionFlags | null;
  type: number;
}

export interface ChannelInviteCreateOptions {
  max_age: number;
  max_uses: number;
  temporary: boolean;
  unique: boolean;
  target_type?: InviteTargetType;
  target_user_id?: string;
  target_application_id?: string;
}

export interface ThreadFromMessageCreateOptions {
  name: string;
  auto_archive_duration?: AutoArchiveDuration;
  rate_limit_per_user?: number | null;
}

export interface ThreadCreateOptions extends ThreadFromMessageCreateOptions {
  type?: ChannelType.AnnouncementThread | ChannelType.PrivateThread | ChannelType.PublicThread;
  invitable?: boolean;
}

export type ForumThreadMessageOptions =
  | Pick<
      MessageCreateV1Options,
      | "content"
      | "embeds"
      | "allowed_mentions"
      | "components"
      | "sticker_ids"
      | "attachments"
      | "flags"
    >
  | Pick<MessageCreateV2Options, "allowed_mentions" | "components" | "attachments" | "flags">;

export interface ForumThreadCreateOptions
  extends Pick<CreateMessageSchema, "files" | "payload_json"> {
  name: string;
  auto_archive_duration?: AutoArchiveDuration;
  rate_limit_per_user?: number | null;
  message: ForumThreadMessageOptions;
  applied_tags?: string[];
}

export interface ArchivedThreadsFetchParams {
  before?: string;
  limit?: number;
}

export interface ArchivedThreadsResponse {
  threads: AnyThreadBasedChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}

export interface ThreadMembersFetchParams {
  with_member?: boolean;
  after?: string;
  limit?: number;
}
