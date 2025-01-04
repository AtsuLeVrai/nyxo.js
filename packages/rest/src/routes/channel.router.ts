import type {
  ChannelEntity,
  FollowedChannelEntity,
  InviteEntity,
  MessageEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import { z } from "zod";
import type { Rest } from "../core/index.js";
import {
  type CreateChannelInviteEntity,
  CreateChannelInviteSchema,
  type EditChannelPermissionsEntity,
  EditChannelPermissionsSchema,
  type ListPublicArchivedThreadsQueryEntity,
  ListPublicArchivedThreadsQuerySchema,
  type ListPublicArchivedThreadsResponse,
  type ListThreadMembersQueryEntity,
  ListThreadMembersQuerySchema,
  type ModifyChannelGroupDmEntity,
  ModifyChannelGroupDmSchema,
  type ModifyChannelGuildChannelEntity,
  ModifyChannelGuildChannelSchema,
  type ModifyChannelThreadEntity,
  ModifyChannelThreadSchema,
  type StartThreadFromMessageEntity,
  StartThreadFromMessageSchema,
  type StartThreadInForumOrMediaChannelEntity,
  type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity,
  StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
  StartThreadInForumOrMediaChannelSchema,
  type StartThreadWithoutMessageEntity,
  StartThreadWithoutMessageSchema,
} from "../schemas/index.js";

export class ChannelRouter {
  static readonly ROUTES = {
    base: (channelId: Snowflake) => `/channels/${channelId}` as const,
    permissions: (channelId: Snowflake, overwriteId: Snowflake) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,
    invites: (channelId: Snowflake) =>
      `/channels/${channelId}/invites` as const,
    pins: (channelId: Snowflake) => `/channels/${channelId}/pins` as const,
    pinnedMessage: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/pins/${messageId}` as const,
    threadMembers: (channelId: Snowflake) =>
      `/channels/${channelId}/thread-members` as const,
    threadMember: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/thread-members/${userId}` as const,
    startThreadWithoutMessage: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,
    publicArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/public` as const,
    privateArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/private` as const,
    joinedPrivateArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,
    startThreadFromMessage: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}/threads` as const,
    startThreadInForumOrMediaChannel: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,
    recipients: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/recipients/${userId}` as const,
    followers: (channelId: Snowflake) =>
      `/channels/${channelId}/followers` as const,
    typing: (channelId: Snowflake) => `/channels/${channelId}/typing` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.#rest.get(ChannelRouter.ROUTES.base(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  modifyChannel(
    channelId: Snowflake,
    options:
      | ModifyChannelGuildChannelEntity
      | ModifyChannelThreadEntity
      | ModifyChannelGroupDmEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = z
      .union([
        ModifyChannelGuildChannelSchema,
        ModifyChannelThreadSchema,
        ModifyChannelGroupDmSchema,
      ])
      .safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.patch(ChannelRouter.ROUTES.base(channelId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(channelId: Snowflake, reason?: string): Promise<ChannelEntity> {
    return this.#rest.delete(ChannelRouter.ROUTES.base(channelId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsEntity,
    reason?: string,
  ): Promise<void> {
    const result = EditChannelPermissionsSchema.safeParse(permissions);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.put(
      ChannelRouter.ROUTES.permissions(channelId, overwriteId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.#rest.get(ChannelRouter.ROUTES.invites(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteEntity,
    reason?: string,
  ): Promise<InviteEntity> {
    const result = CreateChannelInviteSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.post(ChannelRouter.ROUTES.invites(channelId), {
      body: JSON.stringify(result.data),
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
    return this.#rest.delete(
      ChannelRouter.ROUTES.permissions(channelId, overwriteId),
      {
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.#rest.post(ChannelRouter.ROUTES.followers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<void> {
    return this.#rest.post(ChannelRouter.ROUTES.typing(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.#rest.get(ChannelRouter.ROUTES.pins(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(
      ChannelRouter.ROUTES.pinnedMessage(channelId, messageId),
      {
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.pinnedMessage(channelId, messageId),
      {
        reason,
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
    return this.#rest.put(ChannelRouter.ROUTES.recipients(channelId, userId), {
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
    return this.#rest.delete(
      ChannelRouter.ROUTES.recipients(channelId, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  startThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: StartThreadFromMessageEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = StartThreadFromMessageSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.post(
      ChannelRouter.ROUTES.startThreadFromMessage(channelId, messageId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  startThreadWithoutMessage(
    channelId: Snowflake,
    options: StartThreadWithoutMessageEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = StartThreadWithoutMessageSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.post(
      ChannelRouter.ROUTES.startThreadWithoutMessage(channelId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel}
   */
  startThreadInForumOrMediaChannel(
    channelId: Snowflake,
    options:
      | StartThreadInForumOrMediaChannelEntity
      | StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = z
      .union([
        StartThreadInForumOrMediaChannelSchema,
        StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
      ])
      .safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.post(
      ChannelRouter.ROUTES.startThreadInForumOrMediaChannel(channelId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.#rest.put(ChannelRouter.ROUTES.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.put(ChannelRouter.ROUTES.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.threadMember(channelId, "@me"),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.threadMember(channelId, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.#rest.get(
      ChannelRouter.ROUTES.threadMember(channelId, userId),
      {
        query: { with_member: withMember },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  listThreadMembers(
    channelId: Snowflake,
    options: ListThreadMembersQueryEntity = {},
  ): Promise<ThreadMemberEntity[]> {
    const result = ListThreadMembersQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(ChannelRouter.ROUTES.threadMembers(channelId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    channelId: Snowflake,
    options: ListPublicArchivedThreadsQueryEntity = {},
  ): Promise<ListPublicArchivedThreadsResponse> {
    const result = ListPublicArchivedThreadsQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.publicArchivedThreads(channelId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  listPrivateArchivedThreads(
    channelId: Snowflake,
    options: ListPublicArchivedThreadsQueryEntity = {},
  ): Promise<ListPublicArchivedThreadsResponse> {
    const result = ListPublicArchivedThreadsQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.privateArchivedThreads(channelId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  listJoinedPrivateArchivedThreads(
    channelId: Snowflake,
    options: ListPublicArchivedThreadsQueryEntity = {},
  ): Promise<ListPublicArchivedThreadsResponse> {
    const result = ListPublicArchivedThreadsQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.joinedPrivateArchivedThreads(channelId),
      {
        query: result.data,
      },
    );
  }
}
