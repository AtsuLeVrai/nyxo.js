import type {
  ChannelEntity,
  FollowedChannelEntity,
  InviteEntity,
  MessageEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  AddGroupDmRecipientSchema,
  CreateChannelInviteSchema,
  EditChannelPermissionsSchema,
  ListPublicArchivedThreadsQuerySchema,
  type ListPublicArchivedThreadsResponseEntity,
  ListThreadMembersQuerySchema,
  ModifyChannelGroupDmSchema,
  ModifyChannelGuildChannelSchema,
  ModifyChannelThreadSchema,
  StartThreadFromMessageSchema,
  StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
  StartThreadInForumOrMediaChannelSchema,
  StartThreadWithoutMessageSchema,
} from "../schemas/index.js";

export class ChannelRouter {
  static readonly ROUTES = {
    channelBase: (channelId: Snowflake) => `/channels/${channelId}` as const,
    channelPermission: (channelId: Snowflake, overwriteId: Snowflake) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,
    channelInvites: (channelId: Snowflake) =>
      `/channels/${channelId}/invites` as const,
    channelPins: (channelId: Snowflake) =>
      `/channels/${channelId}/pins` as const,
    channelPinnedMessage: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/pins/${messageId}` as const,
    channelThreadMembers: (channelId: Snowflake) =>
      `/channels/${channelId}/thread-members` as const,
    channelThreadMember: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/thread-members/${userId}` as const,
    channelStartThreadWithoutMessage: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,
    channelPublicArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/public` as const,
    channelPrivateArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/private` as const,
    channelJoinedPrivateArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,
    channelStartThreadFromMessage: (
      channelId: Snowflake,
      messageId: Snowflake,
    ) => `/channels/${channelId}/messages/${messageId}/threads` as const,
    channelStartThreadInForumOrMediaChannel: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,
    channelRecipients: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/recipients/${userId}` as const,
    channelFollowers: (channelId: Snowflake) =>
      `/channels/${channelId}/followers` as const,
    channelTyping: (channelId: Snowflake) =>
      `/channels/${channelId}/typing` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.#rest.get(ChannelRouter.ROUTES.channelBase(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  modifyChannel(
    channelId: Snowflake,
    options:
      | ModifyChannelGuildChannelSchema
      | ModifyChannelThreadSchema
      | ModifyChannelGroupDmSchema,
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
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(ChannelRouter.ROUTES.channelBase(channelId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(channelId: Snowflake, reason?: string): Promise<ChannelEntity> {
    return this.#rest.delete(ChannelRouter.ROUTES.channelBase(channelId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    const result = EditChannelPermissionsSchema.safeParse(permissions);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ChannelRouter.ROUTES.channelPermission(channelId, overwriteId),
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
    return this.#rest.get(ChannelRouter.ROUTES.channelInvites(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    const result = CreateChannelInviteSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(ChannelRouter.ROUTES.channelInvites(channelId), {
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
      ChannelRouter.ROUTES.channelPermission(channelId, overwriteId),
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
    return this.#rest.post(ChannelRouter.ROUTES.channelFollowers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<void> {
    return this.#rest.post(ChannelRouter.ROUTES.channelTyping(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.#rest.get(ChannelRouter.ROUTES.channelPins(channelId));
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
      ChannelRouter.ROUTES.channelPinnedMessage(channelId, messageId),
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
      ChannelRouter.ROUTES.channelPinnedMessage(channelId, messageId),
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
    options: AddGroupDmRecipientSchema,
  ): Promise<void> {
    const result = AddGroupDmRecipientSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ChannelRouter.ROUTES.channelRecipients(channelId, userId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient}
   */
  groupDmRemoveRecipient(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.channelRecipients(channelId, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  startThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: StartThreadFromMessageSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = StartThreadFromMessageSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ChannelRouter.ROUTES.channelStartThreadFromMessage(channelId, messageId),
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
    options: StartThreadWithoutMessageSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = StartThreadWithoutMessageSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ChannelRouter.ROUTES.channelStartThreadWithoutMessage(channelId),
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
      | StartThreadInForumOrMediaChannelSchema
      | StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = z
      .union([
        StartThreadInForumOrMediaChannelSchema,
        StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
      ])
      .safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ChannelRouter.ROUTES.channelStartThreadInForumOrMediaChannel(channelId),
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
    return this.#rest.put(
      ChannelRouter.ROUTES.channelThreadMember(channelId, "@me"),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.put(
      ChannelRouter.ROUTES.channelThreadMember(channelId, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.channelThreadMember(channelId, "@me"),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.ROUTES.channelThreadMember(channelId, userId),
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
      ChannelRouter.ROUTES.channelThreadMember(channelId, userId),
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
    options: ListThreadMembersQuerySchema = {},
  ): Promise<ThreadMemberEntity[]> {
    const result = ListThreadMembersQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.channelThreadMembers(channelId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    channelId: Snowflake,
    options: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    const result = ListPublicArchivedThreadsQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.channelPublicArchivedThreads(channelId),
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
    options: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    const result = ListPublicArchivedThreadsQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.channelPrivateArchivedThreads(channelId),
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
    options: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    const result = ListPublicArchivedThreadsQuerySchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      ChannelRouter.ROUTES.channelJoinedPrivateArchivedThreads(channelId),
      {
        query: result.data,
      },
    );
  }
}
