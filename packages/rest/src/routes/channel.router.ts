import type {
  AnyChannelEntity,
  AnyThreadChannelEntity,
  AutoArchiveDuration,
  BitwisePermissionFlags,
  ChannelFlags,
  ChannelType,
  DefaultReactionEntity,
  FollowedChannelEntity,
  ForumTagEntity,
  GuildForumChannelEntity,
  GuildMediaChannelEntity,
  InviteEntity,
  InviteTargetType,
  MessageEntity,
  OverwriteEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";
import type {
  CreateMessageSchema,
  MessageCreateV1Options,
  MessageCreateV2Options,
} from "./message.router.js";
import type { GroupDmCreateOptions } from "./user.router.js";

/**
 * Interface for updating a Group DM channel.
 * Used to modify the name or icon of a group direct message.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export interface GroupDmUpdateOptions {
  /**
   * 1-100 character channel name
   * Name of the group DM visible to all participants.
   */
  name: string;

  /**
   * Base64 encoded icon
   * The icon image for the group DM, provided as a base64 encoded string.
   */
  icon: string;
}

/**
 * Interface for updating a guild channel.
 * Used to modify properties of text, voice, category, announcement, forum, and media channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 */
export interface GuildChannelUpdateOptions {
  /**
   * 1-100 character channel name
   * The new name for the channel.
   */
  name?: string;

  /**
   * Type of channel (only conversion between text and announcement is supported)
   * Allows converting between regular text channels and announcement channels.
   */
  type?:
    | ChannelType.GuildText
    | ChannelType.AnnouncementThread
    | ChannelType.GuildAnnouncement;

  /**
   * Position in the channel list
   * The position of the channel in the left-hand listing.
   */
  position?: number;

  /**
   * 0-1024 character channel topic (0-4096 for forum channels)
   * The description of the channel shown at the top.
   */
  topic?: string | null;

  /**
   * Whether the channel is NSFW
   * If true, users must confirm they want to view the channel content.
   */
  nsfw?: boolean;

  /**
   * Slowmode rate limit in seconds (0-21600)
   * The time users must wait between sending messages.
   */
  rate_limit_per_user?: number;

  /**
   * Bitrate for voice channels (min 8000)
   * The audio quality bitrate for voice channels, in bits per second.
   */
  bitrate?: number;

  /**
   * User limit for voice channels (0-99)
   * The maximum number of users that can join the voice channel.
   */
  user_limit?: number;

  /**
   * Permission overwrites for the channel
   * Array of permission overwrite objects for users and roles.
   */
  permission_overwrites?: Partial<OverwriteEntity>[];

  /**
   * ID of the parent category
   * The ID of the category that will contain this channel.
   */
  parent_id?: Snowflake | null;

  /**
   * Voice region ID for the channel
   * The voice region for the voice channel.
   */
  rtc_region?: string | null;

  /**
   * Video quality mode of the voice channel
   * The video quality mode for the voice channel (1=AUTO, 2=FULL).
   */
  video_quality_mode?: number;

  /**
   * Default auto-archive duration for threads
   * The default duration before a thread is automatically archived.
   */
  default_auto_archive_duration?: AutoArchiveDuration;

  /**
   * Channel flags combined as a bitfield
   * Bitwise integer representing channel-specific flags.
   */
  flags?: ChannelFlags;

  /**
   * Set of tags that can be used in a forum channel
   * Array of forum tags available for threads in this forum channel.
   */
  available_tags?: ForumTagEntity[];

  /**
   * Default emoji for forum thread reactions
   * The default emoji shown as a reaction button on threads in the forum.
   */
  default_reaction_emoji?: DefaultReactionEntity | null;

  /**
   * Default slowmode for new threads
   * The default rate limit applied to newly created threads.
   */
  default_thread_rate_limit_per_user?: number;

  /**
   * Default sort order for forum posts
   * The default sort order for posts in the forum channel.
   */
  default_sort_order?: number | null;

  /**
   * Default forum layout view
   * The default layout used to display posts in the forum channel.
   */
  default_forum_layout?: number;
}

/**
 * Interface for updating a thread.
 * Used to modify properties of an existing thread channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export interface ThreadUpdateOptions {
  /**
   * 1-100 character thread name
   * The new name for the thread.
   */
  name?: string;

  /**
   * Whether the thread is archived
   * Set to true to archive the thread, false to unarchive it.
   */
  archived?: boolean;

  /**
   * Auto-archive duration in minutes
   * The duration after which the thread automatically archives.
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Whether the thread is locked
   * If true, only users with MANAGE_THREADS can unarchive the thread.
   */
  locked?: boolean;

  /**
   * Whether non-moderators can add other non-moderators
   * For private threads only.
   */
  invitable?: boolean;

  /**
   * Slowmode rate limit in seconds (0-21600)
   * The time users must wait between sending messages.
   */
  rate_limit_per_user?: number;

  /**
   * Thread flags combined as a bitfield
   * Bitwise integer representing thread-specific flags.
   */
  flags?: ChannelFlags;

  /**
   * IDs of tags applied to a forum thread
   * Array of tag IDs to apply to a thread in a forum or media channel.
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for editing channel permission overwrites.
 * Used to define custom permissions for roles or users within a specific channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export interface ChannelPermissionUpdateOptions {
  /**
   * Bitwise value of all allowed permissions
   * String representing permissions to explicitly allow.
   */
  allow?: BitwisePermissionFlags | null;

  /**
   * Bitwise value of all disallowed permissions
   * String representing permissions to explicitly deny.
   */
  deny?: BitwisePermissionFlags | null;

  /**
   * Type of overwrite: role (0) or member (1)
   * Specifies whether the overwrite applies to a role or a specific user.
   */
  type: number;
}

/**
 * Interface for creating a channel invite.
 * Used to generate invite links to join a guild channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export interface ChannelInviteCreateOptions {
  /**
   * Duration of invite in seconds before expiry (0-604800)
   * How long the invite is valid for, in seconds.
   */
  max_age: number;

  /**
   * Maximum number of uses (0-100)
   * How many times the invite can be used before it is no longer valid.
   */
  max_uses: number;

  /**
   * Whether this invite only grants temporary membership
   * If true, users will be kicked when they disconnect from voice.
   */
  temporary: boolean;

  /**
   * Whether to create a unique one-time use invite
   * If true, this invite will be different than any other invites.
   */
  unique: boolean;

  /**
   * The type of target for this voice channel invite
   * For voice channel invites, specifies what the invite targets.
   */
  target_type?: InviteTargetType;

  /**
   * The ID of the user whose stream to display
   * Required when target_type is 1 (STREAM).
   */
  target_user_id?: Snowflake;

  /**
   * The ID of the embedded application to open
   * Required when target_type is 2 (EMBEDDED_APPLICATION).
   */
  target_application_id?: Snowflake;
}

/**
 * Interface for creating a thread from an existing message.
 * Used to create a thread attached to a message in a text or announcement channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export interface ThreadFromMessageCreateOptions {
  /**
   * 1-100 character thread name
   * Name of the thread displayed as the thread's title.
   */
  name: string;

  /**
   * Auto-archive duration in minutes
   * The duration after which the thread will automatically archive.
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Slowmode rate limit in seconds (0-21600)
   * The time users must wait between sending messages in the thread.
   */
  rate_limit_per_user?: number | null;
}

/**
 * Interface for creating a thread without an existing message.
 * Used to create a standalone thread not attached to an existing message.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export interface ThreadCreateOptions extends ThreadFromMessageCreateOptions {
  /**
   * Type of thread to create
   * Specifies the type of thread to create.
   */
  type?:
    | ChannelType.AnnouncementThread
    | ChannelType.PrivateThread
    | ChannelType.PublicThread;

  /**
   * Whether non-moderators can add other non-moderators
   * For PRIVATE_THREAD only.
   */
  invitable?: boolean;
}

/**
 * Interface for the message portion of starting a thread in a forum or media channel.
 * Defines the content of the first message in the forum thread.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-forum-and-media-thread-message-params-object}
 */
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
  | Pick<
      MessageCreateV2Options,
      "allowed_mentions" | "components" | "attachments" | "flags"
    >;

/**
 * Interface for creating a thread in a forum or media channel.
 * Used to create a new thread post with an initial message.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
 */
export interface ForumThreadCreateOptions
  extends Pick<CreateMessageSchema, "files" | "payload_json"> {
  /**
   * 1-100 character thread name
   * Name of the thread post displayed as the thread title.
   */
  name: string;

  /**
   * Auto-archive duration in minutes
   * The duration after which the thread will automatically archive.
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Slowmode rate limit in seconds (0-21600)
   * The time users must wait between sending messages in the thread.
   */
  rate_limit_per_user?: number | null;

  /**
   * Contents of the first message in the thread
   * The message that will be posted as the first message in the thread.
   */
  message: ForumThreadMessageOptions;

  /**
   * IDs of tags applied to the thread
   * Array of tag IDs to apply to the thread for categorization.
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for query parameters when listing archived threads.
 * Used to retrieve archived threads with optional filtering and pagination.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export interface ArchivedThreadsFetchParams {
  /**
   * Returns threads archived before this timestamp
   * ISO8601 timestamp for filtering by archive date.
   */
  before?: string;

  /**
   * Maximum number of threads to return
   * Controls how many archived threads to return per request.
   */
  limit?: number;
}

/**
 * Response interface for listing archived threads.
 * The returned data structure for archived thread endpoints.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface ArchivedThreadsResponse {
  /**
   * Array of thread channel objects
   * Contains all the archived thread channels that match the query.
   */
  threads: AnyThreadChannelEntity[];

  /**
   * Array of thread member objects for threads the current user has joined
   * Contains thread member objects for the threads in the response.
   */
  members: ThreadMemberEntity[];

  /**
   * Whether there are potentially more threads that could be returned
   * Indicates if there are more archived threads available for pagination.
   */
  has_more: boolean;
}

/**
 * Interface for query parameters when fetching thread members.
 * Used to retrieve members of a thread with optional pagination.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export interface ThreadMembersFetchParams {
  /**
   * Whether to include a guild member object for each thread member
   * If true, includes guild member objects for each thread member.
   */
  with_member?: boolean;

  /**
   * Get thread members after this user ID
   * Used for pagination to fetch members after a specific user ID.
   */
  after?: Snowflake;

  /**
   * Max number of thread members to return (1-100)
   * Controls how many thread members to return per request.
   */
  limit?: number;
}

/**
 * Router for Discord Channel-related API endpoints.
 * Provides methods for managing channels, threads, permissions, and invites.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel}
 */
export class ChannelRouter extends BaseRouter {
  /**
   * API route constants for Discord Channel-related endpoints.
   */
  static readonly CHANNEL_ROUTES = {
    /**
     * Route for accessing a specific channel.
     * @param channelId - The ID of the channel to access
     */
    channelBaseEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}` as const,

    /**
     * Route for managing permission overwrites in a channel.
     * @param channelId - The ID of the channel
     * @param overwriteId - The ID of the user or role for the permission overwrite
     */
    channelPermissionEndpoint: (channelId: Snowflake, overwriteId: Snowflake) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,

    /**
     * Route for managing invites in a channel.
     * @param channelId - The ID of the channel
     */
    channelInvitesEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/invites` as const,

    /**
     * Route for accessing all pinned messages in a channel.
     * @param channelId - The ID of the channel
     */
    channelPinsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/pins` as const,

    /**
     * Route for managing a specific pinned message in a channel.
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message to pin/unpin
     */
    channelPinnedMessageEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
    ) => `/channels/${channelId}/pins/${messageId}` as const,

    /**
     * Route for accessing all members of a thread.
     * @param channelId - The ID of the thread
     */
    channelThreadMembersEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/thread-members` as const,

    /**
     * Route for managing a specific member of a thread.
     * @param channelId - The ID of the thread
     * @param userId - The ID of the user, or "@me" for the current user
     */
    channelThreadMemberEndpoint: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/thread-members/${userId}` as const,

    /**
     * Route for starting a thread without an associated message.
     * @param channelId - The ID of the parent channel
     */
    channelStartThreadWithoutMessageEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,

    /**
     * Route for accessing public archived threads in a channel.
     * @param channelId - The ID of the parent channel
     */
    channelPublicArchivedThreadsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/public` as const,

    /**
     * Route for accessing private archived threads in a channel.
     * @param channelId - The ID of the parent channel
     */
    channelPrivateArchivedThreadsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/private` as const,

    /**
     * Route for accessing private archived threads that the current user has joined.
     * @param channelId - The ID of the parent channel
     */
    channelJoinedPrivateArchivedThreadsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,

    /**
     * Route for starting a thread from an existing message.
     * @param channelId - The ID of the parent channel
     * @param messageId - The ID of the message to create a thread from
     */
    channelStartThreadFromMessageEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
    ) => `/channels/${channelId}/messages/${messageId}/threads` as const,

    /**
     * Route for starting a thread in a forum or media channel.
     * @param channelId - The ID of the forum or media channel
     */
    channelStartThreadInForumOrMediaChannelEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,

    /**
     * Route for managing recipients in a group DM.
     * @param channelId - The ID of the group DM channel
     * @param userId - The ID of the user to add or remove
     */
    channelRecipientsEndpoint: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/recipients/${userId}` as const,

    /**
     * Route for following an announcement channel.
     * @param channelId - The ID of the announcement channel to follow
     */
    channelFollowersEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/followers` as const,

    /**
     * Route for triggering a typing indicator in a channel.
     * @param channelId - The ID of the channel to show typing in
     */
    channelTypingEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/typing` as const,
  } as const;

  /**
   * Fetches a channel by its ID.
   * If the channel is a thread, includes thread member object for the current user.
   *
   * @param channelId - ID of the channel to fetch
   * @returns A promise that resolves to the channel object
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  fetchChannel(channelId: Snowflake): Promise<AnyChannelEntity> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelBaseEndpoint(channelId),
    );
  }

  /**
   * Modifies a channel's settings.
   * Updates properties specific to the channel type.
   *
   * @param channelId - ID of the channel to modify
   * @param options - Settings to modify, specific to the channel type
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the updated channel
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  updateChannel(
    channelId: Snowflake,
    options:
      | GuildChannelUpdateOptions
      | ThreadUpdateOptions
      | GroupDmUpdateOptions,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.patch(
      ChannelRouter.CHANNEL_ROUTES.channelBaseEndpoint(channelId),
      options,
      { reason },
    );
  }

  /**
   * Deletes a channel, or closes a private message.
   * This action is permanent for guild channels.
   *
   * @param channelId - ID of the channel to delete
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the deleted channel
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel(
    channelId: Snowflake,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.delete(
      ChannelRouter.CHANNEL_ROUTES.channelBaseEndpoint(channelId),
      { reason },
    );
  }

  /**
   * Edits the permission overwrites for a user or role in a channel.
   * Allows granular control of permissions on a per-channel basis.
   *
   * @param channelId - ID of the channel
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: ChannelPermissionUpdateOptions,
    reason?: string,
  ): Promise<void> {
    return this.put(
      ChannelRouter.CHANNEL_ROUTES.channelPermissionEndpoint(
        channelId,
        overwriteId,
      ),
      permissions,
      { reason },
    );
  }

  /**
   * Gets a list of invites for a channel.
   * Returns all active invites for the guild channel.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to an array of invite objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  fetchChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelInvitesEndpoint(channelId),
    );
  }

  /**
   * Creates a new invite for a channel.
   * Generates an invite link with customizable settings.
   *
   * @param channelId - ID of the channel
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created invite
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createChannelInvite(
    channelId: Snowflake,
    options: ChannelInviteCreateOptions,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.post(
      ChannelRouter.CHANNEL_ROUTES.channelInvitesEndpoint(channelId),
      options,
      { reason },
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in a channel.
   * Removes custom permissions for that entity in the channel.
   *
   * @param channelId - ID of the channel
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the channel
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  deleteChannelPermission(
    channelId: Snowflake,
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.delete(
      ChannelRouter.CHANNEL_ROUTES.channelPermissionEndpoint(
        channelId,
        overwriteId,
      ),
      { reason },
    );
  }

  /**
   * Follows an announcement channel to send messages to a target channel.
   * Creates a webhook connection between the announcement and target channels.
   *
   * @param channelId - ID of the announcement channel to follow
   * @param webhookChannelId - ID of the target channel that will receive crossposted messages
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the followed channel information
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.post(
      ChannelRouter.CHANNEL_ROUTES.channelFollowersEndpoint(channelId),
      { webhook_channel_id: webhookChannelId },
      { reason },
    );
  }

  /**
   * Triggers a typing indicator for a channel.
   * Shows that the bot is "typing" for about 10 seconds.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  startTyping(channelId: Snowflake): Promise<void> {
    return this.post(
      ChannelRouter.CHANNEL_ROUTES.channelTypingEndpoint(channelId),
    );
  }

  /**
   * Gets all pinned messages in a channel.
   * Returns messages in chronological order.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  fetchPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelPinsEndpoint(channelId),
    );
  }

  /**
   * Pins a message in a channel.
   * Adds the message to the channel's pinned messages.
   *
   * @param channelId - ID of the channel
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.put(
      ChannelRouter.CHANNEL_ROUTES.channelPinnedMessageEndpoint(
        channelId,
        messageId,
      ),
      undefined,
      { reason },
    );
  }

  /**
   * Unpins a message in a channel.
   * Removes the message from the channel's pinned messages.
   *
   * @param channelId - ID of the channel
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      ChannelRouter.CHANNEL_ROUTES.channelPinnedMessageEndpoint(
        channelId,
        messageId,
      ),
      { reason },
    );
  }

  /**
   * Adds a recipient to a Group DM.
   * Requires a token with the gdm.join scope from the user.
   *
   * @param channelId - ID of the group DM channel
   * @param userId - ID of the user to add
   * @param options - Access token and nickname details
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient}
   */
  addGroupDmRecipient(
    channelId: Snowflake,
    userId: Snowflake,
    options: GroupDmCreateOptions,
  ): Promise<void> {
    return this.put(
      ChannelRouter.CHANNEL_ROUTES.channelRecipientsEndpoint(channelId, userId),
      options,
    );
  }

  /**
   * Removes a recipient from a Group DM.
   * The bot must own the group DM or be removing itself.
   *
   * @param channelId - ID of the group DM channel
   * @param userId - ID of the user to remove
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient}
   */
  removeGroupDmRecipient(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<void> {
    return this.delete(
      ChannelRouter.CHANNEL_ROUTES.channelRecipientsEndpoint(channelId, userId),
    );
  }

  /**
   * Creates a new thread from an existing message.
   * The thread will be connected to the source message.
   *
   * @param channelId - ID of the channel
   * @param messageId - ID of the message to start the thread from
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created thread channel
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  createThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: ThreadFromMessageCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannelEntity> {
    return this.post(
      ChannelRouter.CHANNEL_ROUTES.channelStartThreadFromMessageEndpoint(
        channelId,
        messageId,
      ),
      options,
      { reason },
    );
  }

  /**
   * Creates a new thread that is not connected to an existing message.
   * Creates a standalone thread in a text or announcement channel.
   *
   * @param channelId - ID of the channel
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created thread channel
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  createThread(
    channelId: Snowflake,
    options: ThreadCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannelEntity> {
    return this.post(
      ChannelRouter.CHANNEL_ROUTES.channelStartThreadWithoutMessageEndpoint(
        channelId,
      ),
      options,
      { reason },
    );
  }

  /**
   * Creates a new thread in a forum or media channel, with an initial message.
   * Forum threads are designed for topic-based discussions.
   *
   * @param channelId - ID of the forum or media channel
   * @param options - Thread and initial message configuration
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created thread channel with a nested message
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel}
   */
  createForumThread(
    channelId: Snowflake,
    options: ForumThreadCreateOptions | ForumThreadMessageOptions,
    reason?: string,
  ): Promise<GuildForumChannelEntity | GuildMediaChannelEntity> {
    return this.post(
      ChannelRouter.CHANNEL_ROUTES.channelStartThreadInForumOrMediaChannelEndpoint(
        channelId,
      ),
      options,
      { reason },
    );
  }

  /**
   * Adds the current user to a thread.
   * The thread must not be archived.
   *
   * @param channelId - ID of the thread
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.put(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        "@me",
      ),
    );
  }

  /**
   * Adds another member to a thread.
   * For private threads, requires MANAGE_THREADS permission.
   *
   * @param channelId - ID of the thread
   * @param userId - ID of the user to add
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.put(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        userId,
      ),
    );
  }

  /**
   * Removes the current user from a thread.
   * A user can always leave a thread they're a member of.
   *
   * @param channelId - ID of the thread
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.delete(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        "@me",
      ),
    );
  }

  /**
   * Removes another member from a thread.
   * Requires MANAGE_THREADS permission or thread ownership for private threads.
   *
   * @param channelId - ID of the thread
   * @param userId - ID of the user to remove
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        userId,
      ),
    );
  }

  /**
   * Gets a member of a thread.
   * Returns details about a user's thread membership.
   *
   * @param channelId - ID of the thread
   * @param userId - ID of the thread member to get
   * @param withMember - Whether to include guild member information
   * @returns A promise that resolves to the thread member
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  fetchThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        userId,
      ),
      {
        query: { with_member: withMember },
      },
    );
  }

  /**
   * Lists members of a thread.
   * Returns users who have joined a thread.
   *
   * @param channelId - ID of the thread
   * @param query - Query parameters for the request
   * @returns A promise that resolves to an array of thread members
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  fetchThreadMembers(
    channelId: Snowflake,
    query?: ThreadMembersFetchParams,
  ): Promise<ThreadMemberEntity[]> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMembersEndpoint(channelId),
      {
        query,
      },
    );
  }

  /**
   * Lists public archived threads in a channel.
   * Returns threads ordered by archive timestamp.
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of public archived threads
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  fetchPublicArchivedThreads(
    channelId: Snowflake,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelPublicArchivedThreadsEndpoint(
        channelId,
      ),
      {
        query,
      },
    );
  }

  /**
   * Lists private archived threads in a channel.
   * Requires both READ_MESSAGE_HISTORY and MANAGE_THREADS permissions.
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of private archived threads
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  fetchPrivateArchivedThreads(
    channelId: Snowflake,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelPrivateArchivedThreadsEndpoint(
        channelId,
      ),
      {
        query,
      },
    );
  }

  /**
   * Lists private archived threads that the current user has joined.
   * Only returns threads the current user has been added to.
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of joined private archived threads
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  fetchJoinedPrivateArchivedThreads(
    channelId: Snowflake,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.get(
      ChannelRouter.CHANNEL_ROUTES.channelJoinedPrivateArchivedThreadsEndpoint(
        channelId,
      ),
      {
        query,
      },
    );
  }
}
