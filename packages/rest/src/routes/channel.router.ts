import type {
  ChannelEntity,
  FollowedChannelEntity,
  InviteEntity,
  MessageEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import { BaseRouter } from "../bases/index.js";
import type {
  AddGroupDmRecipientSchema,
  CreateChannelInviteSchema,
  EditChannelPermissionsSchema,
  ListPublicArchivedThreadsQuerySchema,
  ListPublicArchivedThreadsResponseEntity,
  ListThreadMembersQuerySchema,
  ModifyChannelGroupDmSchema,
  ModifyChannelGuildChannelSchema,
  ModifyChannelThreadSchema,
  StartThreadFromMessageSchema,
  StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
  StartThreadInForumOrMediaChannelSchema,
  StartThreadWithoutMessageSchema,
} from "../schemas/index.js";

/**
 * Router for Discord Channel-related API endpoints.
 * Provides methods to interact with channels, including text channels,
 * voice channels, DMs, group DMs, threads, and more.
 *
 * @remarks
 * Channel operations often require specific permissions that vary based on
 * the channel type and the operation being performed.
 */
export class ChannelRouter extends BaseRouter {
  /**
   * API route constants for channel-related endpoints.
   */
  static readonly ROUTES = {
    /** Base endpoint for a channel */
    channelBase: (channelId: Snowflake) => `/channels/${channelId}` as const,

    /** Endpoint for managing a specific permission overwrite in a channel */
    channelPermission: (channelId: Snowflake, overwriteId: Snowflake) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,

    /** Endpoint for managing invites in a channel */
    channelInvites: (channelId: Snowflake) =>
      `/channels/${channelId}/invites` as const,

    /** Endpoint for managing pinned messages in a channel */
    channelPins: (channelId: Snowflake) =>
      `/channels/${channelId}/pins` as const,

    /** Endpoint for a specific pinned message in a channel */
    channelPinnedMessage: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/pins/${messageId}` as const,

    /** Endpoint for managing thread members in a thread channel */
    channelThreadMembers: (channelId: Snowflake) =>
      `/channels/${channelId}/thread-members` as const,

    /** Endpoint for managing a specific thread member in a thread channel */
    channelThreadMember: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/thread-members/${userId}` as const,

    /** Endpoint for starting a thread without a message */
    channelStartThreadWithoutMessage: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,

    /** Endpoint for accessing public archived threads in a channel */
    channelPublicArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/public` as const,

    /** Endpoint for accessing private archived threads in a channel */
    channelPrivateArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/private` as const,

    /** Endpoint for accessing private archived threads the current user has joined */
    channelJoinedPrivateArchivedThreads: (channelId: Snowflake) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,

    /** Endpoint for starting a thread from a message */
    channelStartThreadFromMessage: (
      channelId: Snowflake,
      messageId: Snowflake,
    ) => `/channels/${channelId}/messages/${messageId}/threads` as const,

    /** Endpoint for starting a thread in a forum or media channel */
    channelStartThreadInForumOrMediaChannel: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,

    /** Endpoint for managing recipients in a group DM */
    channelRecipients: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/recipients/${userId}` as const,

    /** Endpoint for following an announcement channel */
    channelFollowers: (channelId: Snowflake) =>
      `/channels/${channelId}/followers` as const,

    /** Endpoint for triggering typing indicators */
    channelTyping: (channelId: Snowflake) =>
      `/channels/${channelId}/typing` as const,
  } as const;

  /**
   * Fetches a channel by its ID.
   *
   * @param channelId - ID of the channel to fetch
   * @returns A promise that resolves to the channel object
   * @remarks If the channel is a thread, the response includes a thread member object for the current user
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel(channelId: Snowflake): Promise<ChannelEntity> {
    return this.rest.get(ChannelRouter.ROUTES.channelBase(channelId));
  }

  /**
   * Modifies a channel's settings.
   *
   * @param channelId - ID of the channel to modify
   * @param options - Settings to modify, specific to the channel type
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the updated channel
   * @remarks
   * - For guild channels, requires the MANAGE_CHANNELS permission
   * - For threads, requires various permissions depending on the fields being modified
   * - Fires a Channel Update Gateway event
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
    return this.rest.patch(ChannelRouter.ROUTES.channelBase(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Deletes a channel, or closes a private message.
   *
   * @param channelId - ID of the channel to delete
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the deleted channel
   * @remarks
   * - For guild channels, requires the MANAGE_CHANNELS permission, or MANAGE_THREADS for threads
   * - Deleting a category does not delete its child channels
   * - Fires a Channel Delete Gateway event
   * - Deleting a guild channel cannot be undone
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(channelId: Snowflake, reason?: string): Promise<ChannelEntity> {
    return this.rest.delete(ChannelRouter.ROUTES.channelBase(channelId), {
      reason,
    });
  }

  /**
   * Edits the permission overwrites for a user or role in a channel.
   *
   * @param channelId - ID of the channel
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @remarks
   * - Only usable for guild channels
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.rest.put(
      ChannelRouter.ROUTES.channelPermission(channelId, overwriteId),
      {
        body: JSON.stringify(permissions),
        reason,
      },
    );
  }

  /**
   * Gets a list of invites for a channel.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to an array of invite objects
   * @remarks
   * - Only usable for guild channels
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.rest.get(ChannelRouter.ROUTES.channelInvites(channelId));
  }

  /**
   * Creates a new invite for a channel.
   *
   * @param channelId - ID of the channel
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created invite
   * @remarks
   * - Only usable for guild channels
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.rest.post(ChannelRouter.ROUTES.channelInvites(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Deletes a permission overwrite for a user or role in a channel.
   *
   * @param channelId - ID of the channel
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the channel
   * @remarks
   * - Only usable for guild channels
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  deleteChannelPermission(
    channelId: Snowflake,
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.rest.delete(
      ChannelRouter.ROUTES.channelPermission(channelId, overwriteId),
      {
        reason,
      },
    );
  }

  /**
   * Follows an announcement channel to send messages to a target channel.
   *
   * @param channelId - ID of the announcement channel to follow
   * @param webhookChannelId - ID of the target channel that will receive crossposted messages
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the followed channel information
   * @remarks
   * - Requires the MANAGE_WEBHOOKS permission in the target channel
   * - Fires a Webhooks Update Gateway event for the target channel
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.rest.post(ChannelRouter.ROUTES.channelFollowers(channelId), {
      body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
      reason,
    });
  }

  /**
   * Triggers a typing indicator for a channel.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to void on success
   * @remarks
   * - Fires a Typing Start Gateway event
   * - Generally bots should not use this route, but it can be useful when responding
   *   to a command that will take a few seconds of processing
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator(channelId: Snowflake): Promise<void> {
    return this.rest.post(ChannelRouter.ROUTES.channelTyping(channelId));
  }

  /**
   * Gets all pinned messages in a channel.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.rest.get(ChannelRouter.ROUTES.channelPins(channelId));
  }

  /**
   * Pins a message in a channel.
   *
   * @param channelId - ID of the channel
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * - Maximum of 50 pinned messages per channel
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.rest.put(
      ChannelRouter.ROUTES.channelPinnedMessage(channelId, messageId),
      {
        reason,
      },
    );
  }

  /**
   * Unpins a message in a channel.
   *
   * @param channelId - ID of the channel
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.rest.delete(
      ChannelRouter.ROUTES.channelPinnedMessage(channelId, messageId),
      {
        reason,
      },
    );
  }

  /**
   * Adds a recipient to a Group DM.
   *
   * @param channelId - ID of the group DM channel
   * @param userId - ID of the user to add
   * @param options - Access token and nickname details
   * @returns A promise that resolves to void on success
   * @remarks The access token must have the gdm.join scope
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient}
   */
  groupDmAddRecipient(
    channelId: Snowflake,
    userId: Snowflake,
    options: AddGroupDmRecipientSchema,
  ): Promise<void> {
    return this.rest.put(
      ChannelRouter.ROUTES.channelRecipients(channelId, userId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Removes a recipient from a Group DM.
   *
   * @param channelId - ID of the group DM channel
   * @param userId - ID of the user to remove
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient}
   */
  groupDmRemoveRecipient(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<void> {
    return this.rest.delete(
      ChannelRouter.ROUTES.channelRecipients(channelId, userId),
    );
  }

  /**
   * Creates a new thread from an existing message.
   *
   * @param channelId - ID of the channel
   * @param messageId - ID of the message to start the thread from
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created thread channel
   * @remarks
   * - Fires a Thread Create and a Message Update Gateway event
   * - When called on a GUILD_TEXT channel, creates a PUBLIC_THREAD
   * - When called on a GUILD_ANNOUNCEMENT channel, creates an ANNOUNCEMENT_THREAD
   * - The thread ID will be the same as the source message ID
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  startThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: StartThreadFromMessageSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.rest.post(
      ChannelRouter.ROUTES.channelStartThreadFromMessage(channelId, messageId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Creates a new thread that is not connected to an existing message.
   *
   * @param channelId - ID of the channel
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created thread channel
   * @remarks
   * - Fires a Thread Create Gateway event
   * - By default creates a PRIVATE_THREAD if type is not specified
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  startThreadWithoutMessage(
    channelId: Snowflake,
    options: StartThreadWithoutMessageSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.rest.post(
      ChannelRouter.ROUTES.channelStartThreadWithoutMessage(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Creates a new thread in a forum or media channel, and sends a message within the created thread.
   *
   * @param channelId - ID of the forum or media channel
   * @param options - Thread and initial message configuration
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created thread channel with a nested message object
   * @remarks
   * - Fires Thread Create and Message Create Gateway events
   * - Requires the SEND_MESSAGES permission
   * - The type of the created thread is PUBLIC_THREAD
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel}
   */
  startThreadInForumOrMediaChannel(
    channelId: Snowflake,
    options:
      | StartThreadInForumOrMediaChannelSchema
      | StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.rest.post(
      ChannelRouter.ROUTES.channelStartThreadInForumOrMediaChannel(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Adds the current user to a thread.
   *
   * @param channelId - ID of the thread
   * @returns A promise that resolves to void on success
   * @remarks
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update and Thread Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.rest.put(
      ChannelRouter.ROUTES.channelThreadMember(channelId, "@me"),
    );
  }

  /**
   * Adds another member to a thread.
   *
   * @param channelId - ID of the thread
   * @param userId - ID of the user to add
   * @returns A promise that resolves to void on success
   * @remarks
   * - Requires the ability to send messages in the thread
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.rest.put(
      ChannelRouter.ROUTES.channelThreadMember(channelId, userId),
    );
  }

  /**
   * Removes the current user from a thread.
   *
   * @param channelId - ID of the thread
   * @returns A promise that resolves to void on success
   * @remarks
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.rest.delete(
      ChannelRouter.ROUTES.channelThreadMember(channelId, "@me"),
    );
  }

  /**
   * Removes another member from a thread.
   *
   * @param channelId - ID of the thread
   * @param userId - ID of the user to remove
   * @returns A promise that resolves to void on success
   * @remarks
   * - Requires the MANAGE_THREADS permission, or the creator of the thread if it is a PRIVATE_THREAD
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.rest.delete(
      ChannelRouter.ROUTES.channelThreadMember(channelId, userId),
    );
  }

  /**
   * Gets a member of a thread.
   *
   * @param channelId - ID of the thread
   * @param userId - ID of the thread member to get
   * @param withMember - Whether to include guild member information
   * @returns A promise that resolves to the thread member
   * @remarks Returns a 404 response if the user is not a member of the thread
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.rest.get(
      ChannelRouter.ROUTES.channelThreadMember(channelId, userId),
      {
        query: { with_member: withMember },
      },
    );
  }

  /**
   * Lists members of a thread.
   *
   * @param channelId - ID of the thread
   * @param query - Query parameters for the request
   * @returns A promise that resolves to an array of thread members
   * @remarks
   * - When with_member is true, results will be paginated and include guild member information
   * - Requires the GUILD_MEMBERS Privileged Intent to be enabled
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  listThreadMembers(
    channelId: Snowflake,
    query: ListThreadMembersQuerySchema = {},
  ): Promise<ThreadMemberEntity[]> {
    return this.rest.get(ChannelRouter.ROUTES.channelThreadMembers(channelId), {
      query,
    });
  }

  /**
   * Lists public archived threads in a channel.
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of public archived threads
   * @remarks
   * - Returns threads of type PUBLIC_THREAD for GUILD_TEXT channels
   * - Returns threads of type ANNOUNCEMENT_THREAD for GUILD_ANNOUNCEMENT channels
   * - Threads are ordered by archive_timestamp in descending order
   * - Requires the READ_MESSAGE_HISTORY permission
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    channelId: Snowflake,
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.rest.get(
      ChannelRouter.ROUTES.channelPublicArchivedThreads(channelId),
      {
        query,
      },
    );
  }

  /**
   * Lists private archived threads in a channel.
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of private archived threads
   * @remarks
   * - Returns threads of type PRIVATE_THREAD
   * - Threads are ordered by archive_timestamp in descending order
   * - Requires both the READ_MESSAGE_HISTORY and MANAGE_THREADS permissions
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  listPrivateArchivedThreads(
    channelId: Snowflake,
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.rest.get(
      ChannelRouter.ROUTES.channelPrivateArchivedThreads(channelId),
      {
        query,
      },
    );
  }

  /**
   * Lists private archived threads that the current user has joined.
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of joined private archived threads
   * @remarks
   * - Returns threads of type PRIVATE_THREAD that the current user has joined
   * - Threads are ordered by their ID in descending order
   * - Requires the READ_MESSAGE_HISTORY permission
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  listJoinedPrivateArchivedThreads(
    channelId: Snowflake,
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.rest.get(
      ChannelRouter.ROUTES.channelJoinedPrivateArchivedThreads(channelId),
      {
        query,
      },
    );
  }
}
