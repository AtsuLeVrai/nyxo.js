import type {
  ChannelEntity,
  FollowedChannelEntity,
  InviteEntity,
  MessageEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import { z } from "zod";
import type { Rest } from "../rest.js";
import {
  AddGroupDmRecipientEntity,
  CreateChannelInviteEntity,
  EditChannelPermissionsEntity,
  ListPublicArchivedThreadsQueryEntity,
  type ListPublicArchivedThreadsResponseEntity,
  ListThreadMembersQueryEntity,
  ModifyChannelGroupDmEntity,
  ModifyChannelGuildChannelEntity,
  ModifyChannelThreadEntity,
  StartThreadFromMessageEntity,
  StartThreadInForumOrMediaChannelEntity,
  StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity,
  StartThreadWithoutMessageEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

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
  getChannel(channelId: Snowflake): Promise<HttpResponse<ChannelEntity>> {
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
  ): Promise<HttpResponse<ChannelEntity>> {
    const result = z
      .union([
        ModifyChannelGuildChannelEntity,
        ModifyChannelThreadEntity,
        ModifyChannelGroupDmEntity,
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
  deleteChannel(
    channelId: Snowflake,
    reason?: string,
  ): Promise<HttpResponse<ChannelEntity>> {
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
  ): Promise<HttpResponse<void>> {
    const result = EditChannelPermissionsEntity.safeParse(permissions);
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
  getChannelInvites(
    channelId: Snowflake,
  ): Promise<HttpResponse<InviteEntity[]>> {
    return this.#rest.get(ChannelRouter.ROUTES.invites(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteEntity,
    reason?: string,
  ): Promise<HttpResponse<InviteEntity>> {
    const result = CreateChannelInviteEntity.safeParse(options);
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
  ): Promise<HttpResponse<ChannelEntity>> {
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
  ): Promise<HttpResponse<FollowedChannelEntity>> {
    return this.#rest.post(ChannelRouter.ROUTES.followers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<HttpResponse<void>> {
    return this.#rest.post(ChannelRouter.ROUTES.typing(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(
    channelId: Snowflake,
  ): Promise<HttpResponse<MessageEntity[]>> {
    return this.#rest.get(ChannelRouter.ROUTES.pins(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<HttpResponse<void>> {
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
  ): Promise<HttpResponse<void>> {
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
    options: AddGroupDmRecipientEntity,
  ): Promise<HttpResponse<void>> {
    const result = AddGroupDmRecipientEntity.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.put(ChannelRouter.ROUTES.recipients(channelId, userId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient}
   */
  groupDmRemoveRecipient(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<HttpResponse<void>> {
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
  ): Promise<HttpResponse<ChannelEntity>> {
    const result = StartThreadFromMessageEntity.safeParse(options);
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
  ): Promise<HttpResponse<ChannelEntity>> {
    const result = StartThreadWithoutMessageEntity.safeParse(options);
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
  ): Promise<HttpResponse<ChannelEntity>> {
    const result = z
      .union([
        StartThreadInForumOrMediaChannelEntity,
        StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity,
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
  joinThread(channelId: Snowflake): Promise<HttpResponse<void>> {
    return this.#rest.put(ChannelRouter.ROUTES.threadMember(channelId, "@me"));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<HttpResponse<void>> {
    return this.#rest.put(ChannelRouter.ROUTES.threadMember(channelId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.threadMember(channelId, "@me"),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<HttpResponse<void>> {
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
  ): Promise<HttpResponse<ThreadMemberEntity>> {
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
  ): Promise<HttpResponse<ThreadMemberEntity[]>> {
    const result = ListThreadMembersQueryEntity.safeParse(options);
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
  ): Promise<HttpResponse<ListPublicArchivedThreadsResponseEntity>> {
    const result = ListPublicArchivedThreadsQueryEntity.safeParse(options);
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
  ): Promise<HttpResponse<ListPublicArchivedThreadsResponseEntity>> {
    const result = ListPublicArchivedThreadsQueryEntity.safeParse(options);
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
  ): Promise<HttpResponse<ListPublicArchivedThreadsResponseEntity>> {
    const result = ListPublicArchivedThreadsQueryEntity.safeParse(options);
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
