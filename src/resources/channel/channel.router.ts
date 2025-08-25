import type { Rest } from "../../core/index.js";
import type { BitwisePermissionFlags } from "../../enum/index.js";
import type { InviteEntity, InviteTargetType } from "../invite/index.js";
import type {
  CreateMessageSchema,
  MessageCreateV1Options,
  MessageCreateV2Options,
} from "../message/index.js";
import type { GroupDmCreateOptions } from "../user/index.js";
import type {
  AnyChannelEntity,
  AnyThreadBasedChannelEntity,
  AutoArchiveDuration,
  ChannelFlags,
  ChannelType,
  DefaultReactionEntity,
  FollowedChannelEntity,
  ForumTagEntity,
  GuildForumChannelEntity,
  GuildMediaChannelEntity,
  OverwriteEntity,
  ThreadMemberEntity,
} from "./channel.entity.js";

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

export class ChannelRouter {
  static readonly Routes = {
    channelBaseEndpoint: (channelId: string) => `/channels/${channelId}` as const,
    channelPermissionEndpoint: (channelId: string, overwriteId: string) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,
    channelInvitesEndpoint: (channelId: string) => `/channels/${channelId}/invites` as const,
    channelThreadMembersEndpoint: (channelId: string) =>
      `/channels/${channelId}/thread-members` as const,
    channelThreadMemberEndpoint: (channelId: string, userId: string) =>
      `/channels/${channelId}/thread-members/${userId}` as const,
    channelStartThreadWithoutMessageEndpoint: (channelId: string) =>
      `/channels/${channelId}/threads` as const,
    channelPublicArchivedThreadsEndpoint: (channelId: string) =>
      `/channels/${channelId}/threads/archived/public` as const,
    channelPrivateArchivedThreadsEndpoint: (channelId: string) =>
      `/channels/${channelId}/threads/archived/private` as const,
    channelJoinedPrivateArchivedThreadsEndpoint: (channelId: string) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,
    channelStartThreadFromMessageEndpoint: (channelId: string, messageId: string) =>
      `/channels/${channelId}/messages/${messageId}/threads` as const,
    channelStartThreadInForumOrMediaChannelEndpoint: (channelId: string) =>
      `/channels/${channelId}/threads` as const,
    channelRecipientsEndpoint: (channelId: string, userId: string) =>
      `/channels/${channelId}/recipients/${userId}` as const,
    channelFollowersEndpoint: (channelId: string) => `/channels/${channelId}/followers` as const,
    channelTypingEndpoint: (channelId: string) => `/channels/${channelId}/typing` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchChannel(channelId: string): Promise<AnyChannelEntity> {
    return this.#rest.get(ChannelRouter.Routes.channelBaseEndpoint(channelId));
  }
  updateChannel(
    channelId: string,
    options: GuildChannelUpdateOptions | ThreadUpdateOptions | GroupDmUpdateOptions,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.patch(ChannelRouter.Routes.channelBaseEndpoint(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  deleteChannel(channelId: string, reason?: string): Promise<AnyChannelEntity> {
    return this.#rest.delete(ChannelRouter.Routes.channelBaseEndpoint(channelId), {
      reason,
    });
  }
  editChannelPermissions(
    channelId: string,
    overwriteId: string,
    permissions: ChannelPermissionUpdateOptions,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(ChannelRouter.Routes.channelPermissionEndpoint(channelId, overwriteId), {
      body: JSON.stringify(permissions),
      reason,
    });
  }
  fetchChannelInvites(channelId: string): Promise<InviteEntity[]> {
    return this.#rest.get(ChannelRouter.Routes.channelInvitesEndpoint(channelId));
  }
  createChannelInvite(
    channelId: string,
    options: ChannelInviteCreateOptions,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.#rest.post(ChannelRouter.Routes.channelInvitesEndpoint(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  deleteChannelPermission(
    channelId: string,
    overwriteId: string,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.delete(
      ChannelRouter.Routes.channelPermissionEndpoint(channelId, overwriteId),
      { reason },
    );
  }
  followAnnouncementChannel(
    channelId: string,
    webhookChannelId: string,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.#rest.post(ChannelRouter.Routes.channelFollowersEndpoint(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
      reason,
    });
  }
  startTyping(channelId: string): Promise<void> {
    return this.#rest.post(ChannelRouter.Routes.channelTypingEndpoint(channelId));
  }
  addGroupDmRecipient(
    channelId: string,
    userId: string,
    options: GroupDmCreateOptions,
  ): Promise<void> {
    return this.#rest.put(ChannelRouter.Routes.channelRecipientsEndpoint(channelId, userId), {
      body: JSON.stringify(options),
    });
  }
  removeGroupDmRecipient(channelId: string, userId: string): Promise<void> {
    return this.#rest.delete(ChannelRouter.Routes.channelRecipientsEndpoint(channelId, userId));
  }
  createThreadFromMessage(
    channelId: string,
    messageId: string,
    options: ThreadFromMessageCreateOptions,
    reason?: string,
  ): Promise<AnyThreadBasedChannelEntity> {
    return this.#rest.post(
      ChannelRouter.Routes.channelStartThreadFromMessageEndpoint(channelId, messageId),
      { body: JSON.stringify(options), reason },
    );
  }
  createThread(
    channelId: string,
    options: ThreadCreateOptions,
    reason?: string,
  ): Promise<AnyThreadBasedChannelEntity> {
    return this.#rest.post(
      ChannelRouter.Routes.channelStartThreadWithoutMessageEndpoint(channelId),
      { body: JSON.stringify(options), reason },
    );
  }
  createForumThread(
    channelId: string,
    options: ForumThreadCreateOptions | ForumThreadMessageOptions,
    reason?: string,
  ): Promise<GuildForumChannelEntity | GuildMediaChannelEntity> {
    return this.#rest.post(
      ChannelRouter.Routes.channelStartThreadInForumOrMediaChannelEndpoint(channelId),
      { body: JSON.stringify(options), reason },
    );
  }
  joinThread(channelId: string): Promise<void> {
    return this.#rest.put(ChannelRouter.Routes.channelThreadMemberEndpoint(channelId, "@me"));
  }
  addThreadMember(channelId: string, userId: string): Promise<void> {
    return this.#rest.put(ChannelRouter.Routes.channelThreadMemberEndpoint(channelId, userId));
  }
  leaveThread(channelId: string): Promise<void> {
    return this.#rest.delete(ChannelRouter.Routes.channelThreadMemberEndpoint(channelId, "@me"));
  }
  removeThreadMember(channelId: string, userId: string): Promise<void> {
    return this.#rest.delete(ChannelRouter.Routes.channelThreadMemberEndpoint(channelId, userId));
  }
  fetchThreadMember(
    channelId: string,
    userId: string,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.#rest.get(ChannelRouter.Routes.channelThreadMemberEndpoint(channelId, userId), {
      query: { with_member: withMember },
    });
  }
  fetchThreadMembers(
    channelId: string,
    query?: ThreadMembersFetchParams,
  ): Promise<ThreadMemberEntity[]> {
    return this.#rest.get(ChannelRouter.Routes.channelThreadMembersEndpoint(channelId), {
      query,
    });
  }
  fetchPublicArchivedThreads(
    channelId: string,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.#rest.get(ChannelRouter.Routes.channelPublicArchivedThreadsEndpoint(channelId), {
      query,
    });
  }
  fetchPrivateArchivedThreads(
    channelId: string,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.#rest.get(ChannelRouter.Routes.channelPrivateArchivedThreadsEndpoint(channelId), {
      query,
    });
  }
  fetchJoinedPrivateArchivedThreads(
    channelId: string,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.#rest.get(
      ChannelRouter.Routes.channelJoinedPrivateArchivedThreadsEndpoint(channelId),
      {
        query,
      },
    );
  }
}
