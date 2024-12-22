import type {
  Integer,
  InviteTargetType,
  OverwriteEntity,
  ThreadMetadataEntity,
} from "@nyxjs/core";
import {
  type ChannelEntity,
  ChannelType,
  type FollowedChannelEntity,
  type InviteEntity,
  type MessageEntity,
  OverwriteType,
  type Snowflake,
  type ThreadMemberEntity,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export type StartThreadFromMessageOptionsEntity = Pick<
  ChannelEntity & ThreadMetadataEntity,
  "auto_archive_duration" | "rate_limit_per_user" | "name"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export type StartThreadWithoutMessageOptionsEntity = Pick<
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
export type EditChannelPermissionsOptionsEntity = Pick<
  OverwriteEntity,
  "type" | "allow" | "deny"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export type ModifyChannelOptionsEntity = Pick<
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
export interface CreateChannelInviteOptionsEntity {
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
export interface GetArchivedThreadsResponseEntity {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}

export interface ChannelRoutes {
  readonly base: (channelId: Snowflake) => `/channels/${Snowflake}`;
  readonly permissions: (
    channelId: Snowflake,
    overwriteId: Snowflake,
  ) => `/channels/${Snowflake}/permissions/${Snowflake}`;
  readonly invites: (channelId: Snowflake) => `/channels/${Snowflake}/invites`;
  readonly pins: (channelId: Snowflake) => `/channels/${Snowflake}/pins`;
  readonly pinnedMessage: (
    channelId: Snowflake,
    messageId: Snowflake,
  ) => `/channels/${Snowflake}/pins/${Snowflake}`;
  readonly threadMembers: (
    channelId: Snowflake,
  ) => `/channels/${Snowflake}/thread-members`;
  readonly threadMember: (
    channelId: Snowflake,
    userId: Snowflake | "@me",
  ) => `/channels/${Snowflake}/thread-members/${Snowflake | "@me"}`;
  readonly startThreadWithoutMessage: (
    channelId: Snowflake,
  ) => `/channels/${Snowflake}/threads`;
  readonly publicArchivedThreads: (
    channelId: Snowflake,
  ) => `/channels/${Snowflake}/threads/archived/public`;
  readonly privateArchivedThreads: (
    channelId: Snowflake,
  ) => `/channels/${Snowflake}/threads/archived/private`;
  readonly joinedPrivateArchivedThreads: (
    channelId: Snowflake,
  ) => `/channels/${Snowflake}/users/@me/threads/archived/private`;
  readonly startThreadFromMessage: (
    channelId: Snowflake,
    messageId: Snowflake,
  ) => `/channels/${Snowflake}/messages/${Snowflake}/threads`;
  readonly recipients: (
    channelId: Snowflake,
    userId: Snowflake,
  ) => `/channels/${Snowflake}/recipients/${Snowflake}`;
  readonly followers: (
    channelId: Snowflake,
  ) => `/channels/${Snowflake}/followers`;
  readonly typing: (channelId: Snowflake) => `/channels/${Snowflake}/typing`;
}

export enum ChannelLimitBitrate {
  Normal = 96000,
  Boost1 = 128000,
  Boost2 = 256000,
  Boost3 = 384000,
  Vip = 384000,
}

export class ChannelRouter extends BaseRouter {
  static readonly MAX_LENGTH_NAME = 100;
  static readonly MAX_LENGTH_NAME_MIN = 1;
  static readonly MAX_LENGTH_TOPIC = 1024;
  static readonly MAX_LENGTH_FORUM_TOPIC = 4096;
  static readonly MAX_LENGTH_MESSAGE = 2000;
  static readonly MAX_LENGTH_TAG_NAME = 20;
  static readonly THREAD_LIMIT_AUTO_ARCHIVE_DURATION = [
    60, 1440, 4320, 10080,
  ] as const;
  static readonly THREAD_LIMIT_MAX_THREADS = 1000;
  static readonly THREAD_LIMIT_MAX_MEMBERS = 100;
  static readonly THREAD_LIMIT_MAX_APPLIED_TAGS = 5;
  static readonly CHANNEL_LIMIT_CHANNELS_PER_CATEGORY = 50;
  static readonly CHANNEL_LIMIT_VOICE_BITRATE = ChannelLimitBitrate;
  static readonly CHANNEL_LIMIT_STAGE_BITRATE = 64000;
  static readonly CHANNEL_LIMIT_VOICE_USER_LIMIT = 64000;
  static readonly CHANNEL_LIMIT_STAGE_USER_LIMIT = 10000;
  static readonly CHANNEL_LIMIT_MAX_PINS = 50;
  static readonly CHANNEL_LIMIT_MAX_OVERWRITES = 100;
  static readonly MESSAGE_LIMIT_BULK_DELETE_MIN = 2;
  static readonly MESSAGE_LIMIT_BULK_DELETE_MAX = 100;
  static readonly MESSAGE_LIMIT_BULK_DELETE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;
  static readonly FORUM_LIMIT_MAX_TAGS = 20;
  static readonly FORUM_LIMIT_MAX_TAG_NAME = 20;
  static readonly FORUM_LIMIT_MAX_THREAD_TAGS = 5;
  static readonly RATE_LIMIT_MAX_SLOWMODE = 21600;
  static readonly RATE_LIMIT_MIN_SLOWMODE = 0;

  static readonly ROUTES: ChannelRoutes = {
    base: (channelId) => `/channels/${channelId}` as const,

    permissions: (channelId, overwriteId) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,

    invites: (channelId) => `/channels/${channelId}/invites` as const,

    pins: (channelId) => `/channels/${channelId}/pins` as const,

    pinnedMessage: (channelId, messageId) =>
      `/channels/${channelId}/pins/${messageId}` as const,

    threadMembers: (channelId) =>
      `/channels/${channelId}/thread-members` as const,

    threadMember: (channelId, userId) =>
      `/channels/${channelId}/thread-members/${userId}` as const,

    startThreadWithoutMessage: (channelId) =>
      `/channels/${channelId}/threads` as const,

    publicArchivedThreads: (channelId) =>
      `/channels/${channelId}/threads/archived/public` as const,

    privateArchivedThreads: (channelId) =>
      `/channels/${channelId}/threads/archived/private` as const,

    joinedPrivateArchivedThreads: (channelId) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,

    startThreadFromMessage: (channelId, messageId) =>
      `/channels/${channelId}/messages/${messageId}/threads` as const,

    recipients: (channelId, userId) =>
      `/channels/${channelId}/recipients/${userId}` as const,

    followers: (channelId) => `/channels/${channelId}/followers` as const,

    typing: (channelId) => `/channels/${channelId}/typing` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.put(ChannelRouter.ROUTES.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.put(ChannelRouter.ROUTES.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.delete(ChannelRouter.ROUTES.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete(ChannelRouter.ROUTES.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.get(ChannelRouter.ROUTES.threadMember(channelId, userId), {
      query: { with_member: withMember },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  listThreadMembers(
    channelId: Snowflake,
    options?: {
      with_member?: boolean;
      after?: Snowflake;
      limit?: number;
    },
  ): Promise<ThreadMemberEntity[]> {
    const limit = Math.min(options?.limit ?? 100, 100);

    return this.get(ChannelRouter.ROUTES.threadMembers(channelId), {
      query: {
        with_member: options?.with_member,
        after: options?.after,
        limit,
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    channelId: Snowflake,
    before?: Date,
    limit?: number,
  ): Promise<GetArchivedThreadsResponseEntity> {
    return this.get(ChannelRouter.ROUTES.publicArchivedThreads(channelId), {
      query: {
        before: before?.toISOString(),
        limit,
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  listPrivateArchivedThreads(
    channelId: Snowflake,
    before?: Date,
    limit?: number,
  ): Promise<GetArchivedThreadsResponseEntity> {
    return this.get(ChannelRouter.ROUTES.privateArchivedThreads(channelId), {
      query: {
        before: before?.toISOString(),
        limit,
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  listJoinedPrivateArchivedThreads(
    channelId: Snowflake,
    before?: Snowflake,
    limit?: number,
  ): Promise<GetArchivedThreadsResponseEntity> {
    return this.get(
      ChannelRouter.ROUTES.joinedPrivateArchivedThreads(channelId),
      {
        query: { before, limit },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient}
   */
  groupDmAddRecipient(
    channelId: Snowflake,
    userId: Snowflake,
    options: {
      access_token: string;
      nick?: string;
    },
  ): Promise<void> {
    return this.put(ChannelRouter.ROUTES.recipients(channelId, userId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient}
   */
  groupDmRemoveRecipient(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<void> {
    return this.delete(ChannelRouter.ROUTES.recipients(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.post(ChannelRouter.ROUTES.followers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<void> {
    return this.post(ChannelRouter.ROUTES.typing(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.get(ChannelRouter.ROUTES.base(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  modifyChannel(
    channelId: Snowflake,
    options: ModifyChannelOptionsEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    if (options.name) {
      this.#validateChannelName(options.name);
    }

    if (options.topic) {
      this.#validateChannelTopic(options.topic, options.type);
    }

    if (options.rate_limit_per_user !== undefined) {
      this.#validateRateLimit(options.rate_limit_per_user);
    }

    if (options.position !== undefined && options.position < 0) {
      throw new Error("Channel position cannot be negative");
    }

    if (options.bitrate !== undefined) {
      const limits = ChannelRouter.CHANNEL_LIMIT_VOICE_BITRATE;
      if (
        options.type === ChannelType.GuildStageVoice &&
        options.bitrate > ChannelRouter.CHANNEL_LIMIT_STAGE_BITRATE
      ) {
        throw new Error(
          `Stage channel bitrate cannot exceed ${ChannelRouter.CHANNEL_LIMIT_STAGE_BITRATE}`,
        );
      }
      if (options.bitrate > limits.Boost3) {
        throw new Error(`Voice channel bitrate cannot exceed ${limits.Boost3}`);
      }
    }

    if (options.user_limit !== undefined) {
      const maxLimit =
        options.type === ChannelType.GuildStageVoice
          ? ChannelRouter.CHANNEL_LIMIT_STAGE_USER_LIMIT
          : ChannelRouter.CHANNEL_LIMIT_VOICE_USER_LIMIT;

      if (options.user_limit > maxLimit) {
        throw new Error(`User limit cannot exceed ${maxLimit}`);
      }
    }

    if (
      options.permission_overwrites &&
      options.permission_overwrites.length >
        ChannelRouter.CHANNEL_LIMIT_MAX_OVERWRITES
    ) {
      throw new Error(
        `Cannot exceed ${ChannelRouter.CHANNEL_LIMIT_MAX_OVERWRITES} permission overwrites`,
      );
    }

    if (
      options.available_tags &&
      options.available_tags.length > ChannelRouter.FORUM_LIMIT_MAX_TAGS
    ) {
      throw new Error(
        `Cannot exceed ${ChannelRouter.FORUM_LIMIT_MAX_TAGS} available tags`,
      );
    }

    if (options.available_tags) {
      for (const tag of options.available_tags) {
        if (tag.name.length > ChannelRouter.FORUM_LIMIT_MAX_TAG_NAME) {
          throw new Error(
            `Tag name cannot exceed ${ChannelRouter.FORUM_LIMIT_MAX_TAG_NAME} characters`,
          );
        }
      }
    }

    if (
      options.auto_archive_duration &&
      !ChannelRouter.THREAD_LIMIT_AUTO_ARCHIVE_DURATION.includes(
        options.auto_archive_duration,
      )
    ) {
      throw new Error("Invalid auto archive duration");
    }

    return this.patch(ChannelRouter.ROUTES.base(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(channelId: Snowflake, reason?: string): Promise<ChannelEntity> {
    return this.delete(ChannelRouter.ROUTES.base(channelId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsOptionsEntity,
    reason?: string,
  ): Promise<void> {
    if (
      ![OverwriteType.Role, OverwriteType.Member].includes(permissions.type)
    ) {
      throw new Error("Invalid overwrite type");
    }

    return this.put(ChannelRouter.ROUTES.permissions(channelId, overwriteId), {
      body: JSON.stringify(permissions),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  deleteChannelPermission(
    channelId: Snowflake,
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.delete(
      ChannelRouter.ROUTES.permissions(channelId, overwriteId),
      {
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.get(ChannelRouter.ROUTES.invites(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteOptionsEntity = {},
    reason?: string,
  ): Promise<InviteEntity> {
    if (options.max_age !== undefined && options.max_age < 0) {
      throw new Error("Max age cannot be negative");
    }

    if (
      options.max_uses !== undefined &&
      (options.max_uses < 0 || options.max_uses > 100)
    ) {
      throw new Error("Max uses must be between 0 and 100");
    }

    return this.post(ChannelRouter.ROUTES.invites(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.get(ChannelRouter.ROUTES.pins(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  async pinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    const pinnedMessages = await this.getPinnedMessages(channelId);
    if (pinnedMessages.length >= ChannelRouter.CHANNEL_LIMIT_MAX_PINS) {
      throw new Error(
        `Cannot exceed ${ChannelRouter.CHANNEL_LIMIT_MAX_PINS} pinned messages`,
      );
    }

    return this.put(ChannelRouter.ROUTES.pinnedMessage(channelId, messageId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      ChannelRouter.ROUTES.pinnedMessage(channelId, messageId),
      {
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  startThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: StartThreadFromMessageOptionsEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    this.#validateChannelName(options.name);

    if (options.rate_limit_per_user !== undefined) {
      this.#validateRateLimit(options.rate_limit_per_user);
    }

    if (
      options.auto_archive_duration &&
      !ChannelRouter.THREAD_LIMIT_AUTO_ARCHIVE_DURATION.includes(
        options.auto_archive_duration,
      )
    ) {
      throw new Error("Invalid auto archive duration");
    }

    return this.post(
      ChannelRouter.ROUTES.startThreadFromMessage(channelId, messageId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  startThreadWithoutMessage(
    channelId: Snowflake,
    options: StartThreadWithoutMessageOptionsEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    this.#validateChannelName(options.name);

    if (options.rate_limit_per_user !== undefined) {
      this.#validateRateLimit(options.rate_limit_per_user);
    }

    if (
      options.auto_archive_duration &&
      !ChannelRouter.THREAD_LIMIT_AUTO_ARCHIVE_DURATION.includes(
        options.auto_archive_duration,
      )
    ) {
      throw new Error("Invalid auto archive duration");
    }

    if (
      options.type !== ChannelType.PrivateThread &&
      options.type !== ChannelType.PublicThread
    ) {
      throw new Error("Invalid thread type");
    }

    return this.post(
      ChannelRouter.ROUTES.startThreadWithoutMessage(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  #validateChannelName(name?: string | null): void {
    if (!name) {
      throw new Error("Channel name is required");
    }

    if (
      name.length < ChannelRouter.MAX_LENGTH_NAME_MIN ||
      name.length > ChannelRouter.MAX_LENGTH_NAME
    ) {
      throw new Error(
        `Channel name must be between ${ChannelRouter.MAX_LENGTH_NAME_MIN} and ${ChannelRouter.MAX_LENGTH_NAME} characters`,
      );
    }
  }

  #validateChannelTopic(topic: string, type?: ChannelType): void {
    const maxLength =
      type === ChannelType.GuildForum || type === ChannelType.GuildMedia
        ? ChannelRouter.MAX_LENGTH_FORUM_TOPIC
        : ChannelRouter.MAX_LENGTH_TOPIC;

    if (topic.length > maxLength) {
      throw new Error(`Channel topic cannot exceed ${maxLength} characters`);
    }
  }

  #validateRateLimit(rateLimit: number): void {
    if (
      rateLimit < ChannelRouter.RATE_LIMIT_MIN_SLOWMODE ||
      rateLimit > ChannelRouter.RATE_LIMIT_MAX_SLOWMODE
    ) {
      throw new Error(
        `Rate limit must be between ${ChannelRouter.RATE_LIMIT_MIN_SLOWMODE} and ${ChannelRouter.RATE_LIMIT_MAX_SLOWMODE} seconds`,
      );
    }
  }
}
