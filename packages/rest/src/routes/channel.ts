import type {
  ChannelEntity,
  FollowedChannelEntity,
  InviteEntity,
  MessageEntity,
  OverwriteEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface StartThreadFromMessageOptions {
  name: string;
  auto_archive_duration?: number;
  rate_limit_per_user?: number;
}

interface StartThreadWithoutMessageOptions
  extends StartThreadFromMessageOptions {
  type?: number;
  invitable?: boolean;
}

interface EditChannelPermissionsOptions {
  allow?: string;
  deny?: string;
  type: number;
}

interface ModifyChannelOptions {
  name?: string;
  type?: number;
  position?: number;
  topic?: string;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  bitrate?: number;
  user_limit?: number;
  permission_overwrites?: Partial<OverwriteEntity>[];
  parent_id?: Snowflake;
  rtc_region?: string;
}

interface CreateChannelInviteOptions {
  max_age?: number;
  max_uses?: number;
  temporary?: boolean;
  unique?: boolean;
  target_type?: number;
  target_user_id?: Snowflake;
  target_application_id?: Snowflake;
}

interface GetArchivedThreadsResponse {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}

export class ChannelRoutes {
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

    // Group DM routes
    recipients: (
      channelId: Snowflake,
      userId: Snowflake,
    ): `/channels/${Snowflake}/recipients/${Snowflake}` => {
      return `/channels/${channelId}/recipients/${userId}` as const;
    },

    // Misc routes
    followers: (channelId: Snowflake): `/channels/${Snowflake}/followers` => {
      return `/channels/${channelId}/followers` as const;
    },
    typing: (channelId: Snowflake): `/channels/${Snowflake}/typing` => {
      return `/channels/${channelId}/typing` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.#rest.get(ChannelRoutes.routes.base(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  modifyChannel(
    channelId: Snowflake,
    options: ModifyChannelOptions,
  ): Promise<ChannelEntity> {
    return this.#rest.patch(ChannelRoutes.routes.base(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.#rest.delete(ChannelRoutes.routes.base(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsOptions,
  ): Promise<void> {
    return this.#rest.put(
      ChannelRoutes.routes.permissions(channelId, overwriteId),
      {
        body: JSON.stringify(permissions),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.#rest.get(ChannelRoutes.routes.invites(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteOptions = {},
  ): Promise<InviteEntity> {
    return this.#rest.post(ChannelRoutes.routes.invites(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.#rest.get(ChannelRoutes.routes.pins(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.#rest.put(
      ChannelRoutes.routes.pinnedMessage(channelId, messageId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRoutes.routes.pinnedMessage(channelId, messageId),
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
    return this.#rest.post(
      ChannelRoutes.routes.messageThreads(channelId, messageId),
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
    return this.#rest.post(ChannelRoutes.routes.threads(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.#rest.put(ChannelRoutes.routes.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.put(ChannelRoutes.routes.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRoutes.routes.threadMember(channelId, "@me"),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<ThreadMemberEntity> {
    return this.#rest.get(ChannelRoutes.routes.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  listThreadMembers(channelId: Snowflake): Promise<ThreadMemberEntity[]> {
    return this.#rest.get(ChannelRoutes.routes.threadMembers(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    channelId: Snowflake,
  ): Promise<GetArchivedThreadsResponse> {
    return this.#rest.get(
      ChannelRoutes.routes.publicArchivedThreads(channelId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  listPrivateArchivedThreads(
    channelId: Snowflake,
  ): Promise<GetArchivedThreadsResponse> {
    return this.#rest.get(
      ChannelRoutes.routes.privateArchivedThreads(channelId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  listJoinedPrivateArchivedThreads(
    channelId: Snowflake,
  ): Promise<GetArchivedThreadsResponse> {
    return this.#rest.get(
      ChannelRoutes.routes.joinedPrivateArchivedThreads(channelId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
  ): Promise<FollowedChannelEntity> {
    return this.#rest.post(ChannelRoutes.routes.followers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<void> {
    return this.#rest.post(ChannelRoutes.routes.typing(channelId));
  }
}
