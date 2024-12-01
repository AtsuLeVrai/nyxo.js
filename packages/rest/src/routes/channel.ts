import type {
  ChannelEntity,
  FollowedChannelEntity,
  Integer,
  InviteEntity,
  InviteTargetType,
  MessageEntity,
  OverwriteEntity,
  Snowflake,
  ThreadMemberEntity,
  ThreadMetadataEntity,
} from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export type StartThreadFromMessageOptions = Pick<
  ChannelEntity & ThreadMetadataEntity,
  "auto_archive_duration" | "rate_limit_per_user" | "name"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export type StartThreadWithoutMessageOptions = Pick<
  ChannelEntity & ThreadMetadataEntity,
  | "auto_archive_duration"
  | "rate_limit_per_user"
  | "name"
  | "type"
  | "invitable"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export type EditChannelPermissionsOptions = Pick<
  OverwriteEntity,
  "type" | "allow" | "deny"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export type ModifyChannelOptions = Pick<
  ChannelEntity & ThreadMetadataEntity,
  | "name"
  | "icon"
  | "type"
  | "position"
  | "topic"
  | "nsfw"
  | "rate_limit_per_user"
  | "bitrate"
  | "user_limit"
  | "permission_overwrites"
  | "parent_id"
  | "rtc_region"
  | "video_quality_mode"
  | "default_auto_archive_duration"
  | "flags"
  | "available_tags"
  | "default_reaction_emoji"
  | "default_thread_rate_limit_per_user"
  | "default_sort_order"
  | "default_forum_layout"
  | "applied_tags"
  | "archived"
  | "auto_archive_duration"
  | "locked"
  | "invitable"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export interface CreateChannelInviteOptions {
  max_age?: Integer;
  max_uses?: Integer;
  temporary?: boolean;
  unique?: boolean;
  target_type?: InviteTargetType;
  target_user_id?: Snowflake;
  target_application_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface GetArchivedThreadsResponse {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}

export class ChannelRouter extends Router {
  static routes = {
    base: (channelId: Snowflake): `/channels/${Snowflake}` => {
      return `/channels/${channelId}` as const;
    },
    permissions: (
      channelId: Snowflake,
      overwriteId: Snowflake,
    ): `/channels/${Snowflake}/permissions/${Snowflake}` => {
      return `/channels/${channelId}/permissions/${overwriteId}` as const;
    },
    invites: (channelId: Snowflake): `/channels/${Snowflake}/invites` => {
      return `/channels/${channelId}/invites` as const;
    },
    pins: (channelId: Snowflake): `/channels/${Snowflake}/pins` => {
      return `/channels/${channelId}/pins` as const;
    },
    pinnedMessage: (
      channelId: Snowflake,
      messageId: Snowflake,
    ): `/channels/${Snowflake}/pins/${Snowflake}` => {
      return `/channels/${channelId}/pins/${messageId}` as const;
    },
    threadMembers: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/thread-members` => {
      return `/channels/${channelId}/thread-members` as const;
    },
    threadMember: (
      channelId: Snowflake,
      userId: Snowflake,
    ): `/channels/${Snowflake}/thread-members/${Snowflake}` => {
      return `/channels/${channelId}/thread-members/${userId}` as const;
    },
    threads: (channelId: Snowflake): `/channels/${Snowflake}/threads` => {
      return `/channels/${channelId}/threads` as const;
    },
    publicArchivedThreads: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/threads/archived/public` => {
      return `/channels/${channelId}/threads/archived/public` as const;
    },
    privateArchivedThreads: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/threads/archived/private` => {
      return `/channels/${channelId}/threads/archived/private` as const;
    },
    joinedPrivateArchivedThreads: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/users/@me/threads/archived/private` => {
      return `/channels/${channelId}/users/@me/threads/archived/private` as const;
    },
    messageThreads: (
      channelId: Snowflake,
      messageId: Snowflake,
    ): `/channels/${Snowflake}/messages/${Snowflake}/threads` => {
      return `/channels/${channelId}/messages/${messageId}/threads` as const;
    },
    recipients: (
      channelId: Snowflake,
      userId: Snowflake,
    ): `/channels/${Snowflake}/recipients/${Snowflake}` => {
      return `/channels/${channelId}/recipients/${userId}` as const;
    },
    followers: (channelId: Snowflake): `/channels/${Snowflake}/followers` => {
      return `/channels/${channelId}/followers` as const;
    },
    typing: (channelId: Snowflake): `/channels/${Snowflake}/typing` => {
      return `/channels/${channelId}/typing` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.get(ChannelRouter.routes.base(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  modifyChannel(
    channelId: Snowflake,
    options: ModifyChannelOptions,
  ): Promise<ChannelEntity> {
    return this.patch(ChannelRouter.routes.base(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.delete(ChannelRouter.routes.base(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsOptions,
  ): Promise<void> {
    return this.put(ChannelRouter.routes.permissions(channelId, overwriteId), {
      body: JSON.stringify(permissions),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.get(ChannelRouter.routes.invites(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteOptions = {},
  ): Promise<InviteEntity> {
    return this.post(ChannelRouter.routes.invites(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.get(ChannelRouter.routes.pins(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.put(ChannelRouter.routes.pinnedMessage(channelId, messageId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.delete(
      ChannelRouter.routes.pinnedMessage(channelId, messageId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  startThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: StartThreadFromMessageOptions,
  ): Promise<ChannelEntity> {
    return this.post(
      ChannelRouter.routes.messageThreads(channelId, messageId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  startThreadWithoutMessage(
    channelId: Snowflake,
    options: StartThreadWithoutMessageOptions,
  ): Promise<ChannelEntity> {
    return this.post(ChannelRouter.routes.threads(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.put(ChannelRouter.routes.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.put(ChannelRouter.routes.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.delete(ChannelRouter.routes.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<ThreadMemberEntity> {
    return this.get(ChannelRouter.routes.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  listThreadMembers(channelId: Snowflake): Promise<ThreadMemberEntity[]> {
    return this.get(ChannelRouter.routes.threadMembers(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    channelId: Snowflake,
  ): Promise<GetArchivedThreadsResponse> {
    return this.get(ChannelRouter.routes.publicArchivedThreads(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  listPrivateArchivedThreads(
    channelId: Snowflake,
  ): Promise<GetArchivedThreadsResponse> {
    return this.get(ChannelRouter.routes.privateArchivedThreads(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  listJoinedPrivateArchivedThreads(
    channelId: Snowflake,
  ): Promise<GetArchivedThreadsResponse> {
    return this.get(
      ChannelRouter.routes.joinedPrivateArchivedThreads(channelId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
  ): Promise<FollowedChannelEntity> {
    return this.post(ChannelRouter.routes.followers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<void> {
    return this.post(ChannelRouter.routes.typing(channelId));
  }
}
