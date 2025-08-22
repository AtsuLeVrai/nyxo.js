import type { Snowflake } from "../common/index.js";
import type { BitwisePermissionFlags } from "../constants/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { ActionRowComponentObject } from "./components.js";
import type { GuildMemberObject } from "./guild.js";
import type { AnyInviteObject, InviteTargetType } from "./invite.js";
import type { AllowedMentionsObject, AttachmentObject, EmbedObject } from "./message.js";
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

export interface ModifyChannelRequest {
  name?: string;
  icon?: DataUri;
  type?: ChannelType;
  position?: number | null;
  topic?: string | null;
  nsfw?: boolean | null;
  rate_limit_per_user?: number | null;
  bitrate?: number | null;
  user_limit?: number | null;
  permission_overwrites?: Partial<OverwriteObject>[] | null;
  parent_id?: Snowflake | null;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode | null;
  default_auto_archive_duration?: number | null;
  flags?: number;
  available_tags?: ForumTagObject[];
  default_reaction_emoji?: DefaultReactionObject | null;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: SortOrderType | null;
  default_forum_layout?: ForumLayoutType;
  archived?: boolean;
  auto_archive_duration?: number;
  locked?: boolean;
  invitable?: boolean;
  applied_tags?: Snowflake[];
}

// Edit Channel Permissions
export interface EditChannelPermissionsRequest {
  allow?: string;
  deny?: string;
  type: OverwriteType;
}

// Create Channel Invite
export interface CreateChannelInviteRequest {
  max_age?: number;
  max_uses?: number;
  temporary?: boolean;
  unique?: boolean;
  target_type?: InviteTargetType;
  target_user_id?: Snowflake;
  target_application_id?: Snowflake;
}

// Follow Announcement Channel
export interface FollowAnnouncementChannelRequest {
  webhook_channel_id: Snowflake;
}

// Group DM Add Recipient
export interface GroupDMAddRecipientRequest {
  access_token: string;
  nick: string;
}

// Start Thread from Message
export interface StartThreadFromMessageRequest {
  name: string;
  auto_archive_duration?: number;
  rate_limit_per_user?: number | null;
}

// Start Thread without Message
export interface StartThreadWithoutMessageRequest {
  name: string;
  auto_archive_duration?: number;
  type?: ChannelType;
  invitable?: boolean;
  rate_limit_per_user?: number | null;
}

// Forum/Media Thread Message
export interface ForumThreadMessageParamsObject {
  content?: string;
  embeds?: EmbedObject[];
  allowed_mentions?: AllowedMentionsObject;
  components?: ActionRowComponentObject[];
  sticker_ids?: Snowflake[];
  attachments?: Partial<AttachmentObject>[];
  flags?: number;
}

// Start Thread in Forum or Media Channel
export interface StartThreadInForumChannelRequest {
  name: string;
  auto_archive_duration?: number;
  rate_limit_per_user?: number | null;
  message: ForumThreadMessageParamsObject;
  applied_tags?: Snowflake[];
}

// Thread Members responses
export interface ListThreadMembersResponse {
  members: ThreadMemberObject[];
  has_more?: boolean;
}

export interface ListArchivedThreadsResponse {
  threads: ChannelObject[];
  members: ThreadMemberObject[];
  has_more: boolean;
}

export const ChannelRoutes = {
  // GET /channels/{channel.id} - Get Channel
  channel: ((channelId: string) => `/channels/${channelId}`) as EndpointFactory<
    `/channels/${string}`,
    ["GET"],
    ChannelObject
  >,

  // PATCH /channels/{channel.id} - Modify Channel
  modifyChannel: ((channelId: string) => `/channels/${channelId}`) as EndpointFactory<
    `/channels/${string}`,
    ["PATCH"],
    ChannelObject,
    false,
    false,
    ModifyChannelRequest
  >,

  // DELETE /channels/{channel.id} - Delete/Close Channel
  deleteChannel: ((channelId: string) => `/channels/${channelId}`) as EndpointFactory<
    `/channels/${string}`,
    ["DELETE"],
    ChannelObject
  >,

  // PUT /channels/{channel.id}/permissions/{overwrite.id} - Edit Channel Permissions
  editChannelPermissions: ((channelId: string, overwriteId: string) =>
    `/channels/${channelId}/permissions/${overwriteId}`) as EndpointFactory<
    `/channels/${string}/permissions/${string}`,
    ["PUT"],
    void,
    false,
    false,
    EditChannelPermissionsRequest
  >,

  // GET /channels/{channel.id}/invites - Get Channel Invites
  channelInvites: ((channelId: string) => `/channels/${channelId}/invites`) as EndpointFactory<
    `/channels/${string}/invites`,
    ["GET"],
    AnyInviteObject[]
  >,

  // POST /channels/{channel.id}/invites - Create Channel Invite
  createChannelInvite: ((channelId: string) => `/channels/${channelId}/invites`) as EndpointFactory<
    `/channels/${string}/invites`,
    ["POST"],
    AnyInviteObject,
    false,
    false,
    CreateChannelInviteRequest
  >,

  // DELETE /channels/{channel.id}/permissions/{overwrite.id} - Delete Channel Permission
  deleteChannelPermission: ((channelId: string, overwriteId: string) =>
    `/channels/${channelId}/permissions/${overwriteId}`) as EndpointFactory<
    `/channels/${string}/permissions/${string}`,
    ["DELETE"],
    void
  >,

  // POST /channels/{channel.id}/followers - Follow Announcement Channel
  followAnnouncementChannel: ((channelId: string) =>
    `/channels/${channelId}/followers`) as EndpointFactory<
    `/channels/${string}/followers`,
    ["POST"],
    FollowedChannelObject,
    false,
    false,
    FollowAnnouncementChannelRequest
  >,

  // POST /channels/{channel.id}/typing - Trigger Typing Indicator
  triggerTypingIndicator: ((channelId: string) =>
    `/channels/${channelId}/typing`) as EndpointFactory<
    `/channels/${string}/typing`,
    ["POST"],
    void
  >,

  // PUT /channels/{channel.id}/recipients/{user.id} - Group DM Add Recipient
  groupDMAddRecipient: ((channelId: string, userId: string) =>
    `/channels/${channelId}/recipients/${userId}`) as EndpointFactory<
    `/channels/${string}/recipients/${string}`,
    ["PUT"],
    void,
    false,
    false,
    GroupDMAddRecipientRequest
  >,

  // DELETE /channels/{channel.id}/recipients/{user.id} - Group DM Remove Recipient
  groupDMRemoveRecipient: ((channelId: string, userId: string) =>
    `/channels/${channelId}/recipients/${userId}`) as EndpointFactory<
    `/channels/${string}/recipients/${string}`,
    ["DELETE"],
    void
  >,

  // POST /channels/{channel.id}/messages/{message.id}/threads - Start Thread from Message
  startThreadFromMessage: ((channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}/threads`) as EndpointFactory<
    `/channels/${string}/messages/${string}/threads`,
    ["POST"],
    ChannelObject,
    false,
    false,
    StartThreadFromMessageRequest
  >,

  // POST /channels/{channel.id}/threads - Start Thread without Message
  startThreadWithoutMessage: ((channelId: string) =>
    `/channels/${channelId}/threads`) as EndpointFactory<
    `/channels/${string}/threads`,
    ["POST"],
    ChannelObject,
    false,
    false,
    StartThreadWithoutMessageRequest
  >,

  // POST /channels/{channel.id}/threads - Start Thread in Forum or Media Channel
  startThreadInForumChannel: ((channelId: string) =>
    `/channels/${channelId}/threads`) as EndpointFactory<
    `/channels/${string}/threads`,
    ["POST"],
    ChannelObject & { message: unknown }, // Channel with nested message
    false,
    false,
    StartThreadInForumChannelRequest
  >,

  // PUT /channels/{channel.id}/thread-members/@me - Join Thread
  joinThread: ((channelId: string) =>
    `/channels/${channelId}/thread-members/@me`) as EndpointFactory<
    `/channels/${string}/thread-members/@me`,
    ["PUT"],
    void
  >,

  // PUT /channels/{channel.id}/thread-members/{user.id} - Add Thread Member
  addThreadMember: ((channelId: string, userId: string) =>
    `/channels/${channelId}/thread-members/${userId}`) as EndpointFactory<
    `/channels/${string}/thread-members/${string}`,
    ["PUT"],
    void
  >,

  // DELETE /channels/{channel.id}/thread-members/@me - Leave Thread
  leaveThread: ((channelId: string) =>
    `/channels/${channelId}/thread-members/@me`) as EndpointFactory<
    `/channels/${string}/thread-members/@me`,
    ["DELETE"],
    void
  >,

  // DELETE /channels/{channel.id}/thread-members/{user.id} - Remove Thread Member
  removeThreadMember: ((channelId: string, userId: string) =>
    `/channels/${channelId}/thread-members/${userId}`) as EndpointFactory<
    `/channels/${string}/thread-members/${string}`,
    ["DELETE"],
    void
  >,

  // GET /channels/{channel.id}/thread-members/{user.id} - Get Thread Member
  threadMember: ((channelId: string, userId: string) =>
    `/channels/${channelId}/thread-members/${userId}`) as EndpointFactory<
    `/channels/${string}/thread-members/${string}`,
    ["GET"],
    ThreadMemberObject,
    false,
    false,
    undefined,
    {
      with_member?: boolean;
    }
  >,

  // GET /channels/{channel.id}/thread-members - List Thread Members
  threadMembers: ((channelId: string) =>
    `/channels/${channelId}/thread-members`) as EndpointFactory<
    `/channels/${string}/thread-members`,
    ["GET"],
    ThreadMemberObject[],
    false,
    false,
    undefined,
    {
      with_member?: boolean;
      after?: Snowflake;
      limit?: number;
    }
  >,

  // GET /channels/{channel.id}/threads/archived/public - List Public Archived Threads
  publicArchivedThreads: ((channelId: string) =>
    `/channels/${channelId}/threads/archived/public`) as EndpointFactory<
    `/channels/${string}/threads/archived/public`,
    ["GET"],
    ListArchivedThreadsResponse,
    false,
    false,
    undefined,
    {
      before?: string; // ISO8601 timestamp
      limit?: number;
    }
  >,

  // GET /channels/{channel.id}/threads/archived/private - List Private Archived Threads
  privateArchivedThreads: ((channelId: string) =>
    `/channels/${channelId}/threads/archived/private`) as EndpointFactory<
    `/channels/${string}/threads/archived/private`,
    ["GET"],
    ListArchivedThreadsResponse,
    false,
    false,
    undefined,
    {
      before?: string; // ISO8601 timestamp
      limit?: number;
    }
  >,

  // GET /channels/{channel.id}/users/@me/threads/archived/private - List Joined Private Archived Threads
  joinedPrivateArchivedThreads: ((channelId: string) =>
    `/channels/${channelId}/users/@me/threads/archived/private`) as EndpointFactory<
    `/channels/${string}/users/@me/threads/archived/private`,
    ["GET"],
    ListArchivedThreadsResponse,
    false,
    false,
    undefined,
    {
      before?: Snowflake;
      limit?: number;
    }
  >,
} as const;
