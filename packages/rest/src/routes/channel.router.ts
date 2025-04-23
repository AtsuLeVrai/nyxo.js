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
import type { Rest } from "../core/index.js";
import type { CreateMessageSchema } from "./message.router.js";
import type { CreateGroupDmSchema } from "./user.router.js";

/**
 * Interface for updating a Group DM channel.
 * Used to modify the name or icon of a group direct message.
 *
 * @remarks
 * Only the creator of the group DM can modify these properties.
 * The icon must be provided as a base64 encoded string of the image data.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export interface GroupDmUpdateOptions {
  /**
   * 1-100 character channel name
   *
   * Name of the group DM visible to all participants.
   */
  name: string;

  /**
   * Base64 encoded icon
   *
   * The icon image for the group DM, provided as a base64 encoded string.
   * The string should include the data URI scheme prefix (e.g., "data:image/jpeg;base64,").
   */
  icon: string;
}

/**
 * Interface for updating a guild channel.
 * Used to modify various properties of text, voice, category, announcement, forum, and media channels.
 *
 * @remarks
 * Different properties apply to different channel types:
 * - Text: name, position, topic, nsfw, rate_limit_per_user, permission_overwrites, parent_id, default_auto_archive_duration
 * - Voice: name, position, bitrate, user_limit, permission_overwrites, parent_id, rtc_region, video_quality_mode
 * - Category: name, position, permission_overwrites
 * - Announcement: name, position, topic, nsfw, permission_overwrites, parent_id, default_auto_archive_duration
 * - Forum: name, position, topic, nsfw, rate_limit_per_user, permission_overwrites, parent_id, default_auto_archive_duration, available_tags, default_reaction_emoji, default_thread_rate_limit_per_user, default_sort_order, default_forum_layout
 * - Media: Same as forum
 *
 * Requires the MANAGE_CHANNELS permission in the guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 */
export interface GuildChannelUpdateOptions {
  /**
   * 1-100 character channel name
   *
   * The new name for the channel. Must be between 1 and 100 characters long.
   * Names are case-insensitive for text and voice channels but case-sensitive for categories.
   */
  name?: string;

  /**
   * Type of channel (only conversion between text and announcement is supported)
   *
   * Allows converting between regular text channels and announcement channels.
   * Other channel type conversions are not supported.
   */
  type?:
    | ChannelType.GuildText
    | ChannelType.AnnouncementThread
    | ChannelType.GuildAnnouncement;

  /**
   * Position in the channel list
   *
   * The position of the channel in the left-hand listing.
   * Positions are ordered in ascending order starting from 0.
   * Channels are sorted by position within their category.
   */
  position?: number;

  /**
   * 0-1024 character channel topic (0-4096 for forum channels)
   *
   * The description of the channel shown at the top.
   * Can contain up to 1024 characters for standard channels, or 4096 for forum channels.
   * Set to null to remove the topic.
   */
  topic?: string | null;

  /**
   * Whether the channel is NSFW
   *
   * If true, users must confirm they want to view the channel content,
   * and the channel will be marked with an NSFW tag.
   */
  nsfw?: boolean;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * The time users must wait between sending messages in seconds.
   * Can be set from 0 (no slowmode) to 21600 (6 hours).
   * Only applies to text, forum, and media channels.
   */
  rate_limit_per_user?: number;

  /**
   * Bitrate for voice channels (min 8000)
   *
   * The audio quality bitrate for voice channels, in bits per second.
   * Minimum is 8000, max depends on guild's boost level:
   * - Default: 96000
   * - Level 1: 128000
   * - Level 2: 256000
   * - Level 3: 384000
   */
  bitrate?: number;

  /**
   * User limit for voice channels (0-99)
   *
   * The maximum number of users that can join the voice channel.
   * Set to 0 for unlimited users. Maximum value is 99.
   * Only applies to voice channels.
   */
  user_limit?: number;

  /**
   * Permission overwrites for the channel
   *
   * Array of permission overwrite objects that define custom permissions
   * for users and roles in the channel.
   * Overwrites define specific allow/deny permissions that override guild-level permissions.
   */
  permission_overwrites?: Partial<OverwriteEntity>[];

  /**
   * ID of the parent category
   *
   * The ID of the category that will contain this channel.
   * Set to null to remove the channel from its current category.
   * Cannot be set for category channels.
   */
  parent_id?: Snowflake | null;

  /**
   * Voice region ID for the channel
   *
   * The voice region for the voice channel.
   * Set to null to use the guild's default region.
   * Only applies to voice channels.
   */
  rtc_region?: string | null;

  /**
   * Video quality mode of the voice channel
   *
   * The video quality mode for the voice channel:
   * - 1: AUTO (Discord chooses quality based on conditions)
   * - 2: FULL (720p 60fps)
   * Only applies to voice channels.
   */
  video_quality_mode?: number;

  /**
   * Default auto-archive duration for threads
   *
   * The default duration in minutes before a thread is automatically archived.
   * Values: 60, 1440 (24 hours), 4320 (3 days), 10080 (7 days)
   * Some durations require guild boost levels.
   */
  default_auto_archive_duration?: AutoArchiveDuration;

  /**
   * Channel flags combined as a bitfield
   *
   * Bitwise integer representing channel-specific flags:
   * - PINNED (1 << 1): Thread is pinned in a forum channel
   * - REQUIRE_TAG (1 << 4): Thread creation requires a tag in a forum channel
   */
  flags?: ChannelFlags;

  /**
   * Set of tags that can be used in a forum channel
   *
   * Array of forum tags available for threads in this forum channel.
   * Maximum of 20 tags per forum channel.
   * Only applies to forum and media channels.
   */
  available_tags?: ForumTagEntity[];

  /**
   * Default emoji for forum thread reactions
   *
   * The default emoji shown as a reaction button on threads in the forum.
   * Set to null to remove the default reaction.
   * Only applies to forum and media channels.
   */
  default_reaction_emoji?: DefaultReactionEntity | null;

  /**
   * Default slowmode for new threads
   *
   * The default rate limit (in seconds) applied to newly created threads.
   * Can be set from 0 (no slowmode) to 21600 (6 hours).
   * Only applies to forum and media channels.
   */
  default_thread_rate_limit_per_user?: number;

  /**
   * Default sort order for forum posts
   *
   * The default sort order for posts in the forum channel:
   * - 0: LATEST_ACTIVITY (default)
   * - 1: CREATION_DATE
   * Set to null to use client app default.
   * Only applies to forum and media channels.
   */
  default_sort_order?: number | null;

  /**
   * Default forum layout view
   *
   * The default layout used to display posts in the forum channel:
   * - 0: NOT_SET
   * - 1: LIST_VIEW
   * - 2: GALLERY_VIEW
   * Only applies to forum and media channels.
   */
  default_forum_layout?: number;
}

/**
 * Interface for updating a thread.
 * Used to modify properties of an existing thread channel, such as archive status, name, or rate limits.
 *
 * @remarks
 * Different permissions are required depending on the field being modified:
 * - Modifying name: MANAGE_THREADS or thread ownership
 * - Archived status: MANAGE_THREADS or thread ownership (unarchiving requires SEND_MESSAGES)
 * - Auto-archive duration: MANAGE_THREADS
 * - Locked status: MANAGE_THREADS
 * - Invitable flag: MANAGE_THREADS
 * - Rate limit: MANAGE_THREADS or MANAGE_CHANNELS
 * - Applied tags: MANAGE_THREADS
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export interface ThreadUpdateOptions {
  /**
   * 1-100 character thread name
   *
   * The new name for the thread. Must be between 1 and 100 characters long.
   * Requires MANAGE_THREADS permission or thread ownership.
   */
  name?: string;

  /**
   * Whether the thread is archived
   *
   * Set to true to archive the thread, false to unarchive it.
   * Archiving a thread prevents new messages and hides it from the active thread list.
   * Requires thread ownership or MANAGE_THREADS to archive.
   * Requires thread ownership or MANAGE_THREADS and SEND_MESSAGES to unarchive.
   */
  archived?: boolean;

  /**
   * Auto-archive duration in minutes
   *
   * The duration in minutes after which the thread automatically archives due to inactivity.
   * Values: 60, 1440 (24 hours), 4320 (3 days), 10080 (7 days)
   * Some durations require guild boost levels.
   * Requires MANAGE_THREADS permission.
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Whether the thread is locked
   *
   * If true, only users with MANAGE_THREADS can unarchive the thread.
   * Must be combined with archived: true if being set to true.
   * Requires MANAGE_THREADS permission.
   */
  locked?: boolean;

  /**
   * Whether non-moderators can add other non-moderators
   *
   * For private threads only. If true, members can add other non-moderator members.
   * If false, only moderators can add members.
   * Requires MANAGE_THREADS permission.
   */
  invitable?: boolean;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * The time users must wait between sending messages in seconds.
   * Can be set from 0 (no slowmode) to 21600 (6 hours).
   * Requires MANAGE_THREADS or MANAGE_CHANNELS permission.
   */
  rate_limit_per_user?: number;

  /**
   * Thread flags combined as a bitfield
   *
   * Bitwise integer representing thread-specific flags.
   * Currently supported flags:
   * - PINNED (1 << 1): Thread is pinned in a forum channel
   */
  flags?: ChannelFlags;

  /**
   * IDs of tags applied to a forum thread
   *
   * Array of tag IDs to apply to a thread in a forum or media channel.
   * Limited to the tags available in the parent channel.
   * Maximum of 5 tags per thread.
   * Requires MANAGE_THREADS permission.
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for editing channel permission overwrites.
 * Used to define or modify custom permissions for roles or users within a specific channel.
 *
 * @remarks
 * Permission overwrites allow for granular control of permissions on a per-channel basis,
 * overriding the guild-level permissions for specific roles or users.
 *
 * Requires the MANAGE_ROLES permission in the guild.
 * The bot's highest role must be higher than the role being edited (for role overwrites).
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export interface ChannelPermissionUpdateOptions {
  /**
   * Bitwise value of all allowed permissions
   *
   * String representing a bitwise value of all permissions to explicitly allow.
   * Permissions not included in either allow or deny will use guild-level defaults.
   * Set to null to remove any existing allows.
   */
  allow?: BitwisePermissionFlags | null;

  /**
   * Bitwise value of all disallowed permissions
   *
   * String representing a bitwise value of all permissions to explicitly deny.
   * Deny overwrites take precedence over allow overwrites.
   * Set to null to remove any existing denies.
   */
  deny?: BitwisePermissionFlags | null;

  /**
   * Type of overwrite: role (0) or member (1)
   *
   * Specifies whether the overwrite applies to a role or a specific user:
   * - 0: Applies to a role
   * - 1: Applies to a user/member
   *
   * The overwriteId used with this schema will be interpreted as either
   * a role ID or user ID depending on this value.
   */
  type: number;
}

/**
 * Interface for creating a channel invite.
 * Used to generate invite links to join a guild channel.
 *
 * @remarks
 * Requires the CREATE_INSTANT_INVITE permission in the channel.
 * Guild channels can have multiple active invites simultaneously.
 * Discord keeps track of which invite was used when a user joins.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export interface ChannelInviteCreateOptions {
  /**
   * Duration of invite in seconds before expiry (0-604800)
   *
   * How long the invite is valid for, in seconds.
   * Set to 0 for an invite that never expires.
   * Maximum value is 604800 (7 days).
   * Defaults to 86400 (24 hours) if not specified.
   */
  max_age: number;

  /**
   * Maximum number of uses (0-100)
   *
   * How many times the invite can be used before it is no longer valid.
   * Set to 0 for unlimited uses.
   * Maximum value is 100.
   * Defaults to 0 (unlimited uses) if not specified.
   */
  max_uses: number;

  /**
   * Whether this invite only grants temporary membership
   *
   * If true, users who join via this invite will be kicked from the guild
   * when they disconnect from voice channels.
   * Useful for events or temporary access.
   * Defaults to false if not specified.
   */
  temporary: boolean;

  /**
   * Whether to create a unique one-time use invite
   *
   * If true, this invite will be different than any other invites created
   * for the same channel, even if they have the same settings.
   * If false, it may reuse an existing invite with matching settings.
   * Defaults to false if not specified.
   */
  unique: boolean;

  /**
   * The type of target for this voice channel invite
   *
   * For voice channel invites, specifies what the invite targets:
   * - 1: STREAM (a specific stream in the voice channel)
   * - 2: EMBEDDED_APPLICATION (an embedded application in the voice channel)
   *
   * Only applies to voice channel invites.
   */
  target_type?: InviteTargetType;

  /**
   * The ID of the user whose stream to display
   *
   * Required when target_type is 1 (STREAM).
   * The user must be streaming in the channel.
   */
  target_user_id?: Snowflake;

  /**
   * The ID of the embedded application to open
   *
   * Required when target_type is 2 (EMBEDDED_APPLICATION).
   * The application must be available for use in the channel.
   * Common application IDs include those for games and activities like YouTube Together.
   */
  target_application_id?: Snowflake;
}

/**
 * Interface for adding a recipient to a Group DM.
 * Used to add a new user to an existing group direct message.
 *
 * @remarks
 * Requires an OAuth2 access token with the gdm.join scope.
 * The token must be from the user being added.
 * Group DMs have a maximum membership limit (typically 10 users).
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export type AddGroupDmRecipientSchema = CreateGroupDmSchema;

/**
 * Interface for creating a thread from an existing message.
 * Used to create a new thread attached to an existing message in a text or announcement channel.
 *
 * @remarks
 * The thread will be of type PUBLIC_THREAD for text channels or ANNOUNCEMENT_THREAD for announcement channels.
 * The created thread ID will be the same as the message ID it was created from.
 * A message can only have one thread created from it.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export interface ThreadFromMessageCreateOptions {
  /**
   * 1-100 character thread name
   *
   * Name of the thread. Must be between 1 and 100 characters long.
   * This will be displayed as the thread's title in the Discord client.
   */
  name: string;

  /**
   * Auto-archive duration in minutes
   *
   * The duration in minutes after which the thread will automatically archive due to inactivity.
   * Values: 60, 1440 (24 hours), 4320 (3 days), 10080 (7 days)
   * Some durations require guild boost levels.
   * Defaults to the channel's default_auto_archive_duration if not specified.
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * The time users must wait between sending messages in the thread, in seconds.
   * Can be set from 0 (no slowmode) to 21600 (6 hours).
   * Set to null to inherit from the parent channel (for forum/media threads).
   */
  rate_limit_per_user?: number | null;
}

/**
 * Interface for creating a thread without an existing message.
 * Used to create a standalone thread in a text or announcement channel that isn't attached to an existing message.
 *
 * @remarks
 * Extends ThreadFromMessageCreateOptions with additional fields specific to standalone threads.
 * For PUBLIC_THREAD and ANNOUNCEMENT_THREAD, everyone with READ_MESSAGES permission can see the thread.
 * For PRIVATE_THREAD, only those invited and those with MANAGE_THREADS can see the thread.
 * Creating PRIVATE_THREAD requires the guild to have the PRIVATE_THREADS feature.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export interface ThreadCreateOptions extends ThreadFromMessageCreateOptions {
  /**
   * Type of thread to create
   *
   * Specifies the type of thread to create:
   * - 10: ANNOUNCEMENT_THREAD (only in announcement channels)
   * - 11: PUBLIC_THREAD (standard public thread)
   * - 12: PRIVATE_THREAD (private thread, requires PRIVATE_THREADS feature)
   *
   * Defaults to PRIVATE_THREAD (12) if not specified.
   */
  type?:
    | ChannelType.AnnouncementThread
    | ChannelType.PrivateThread
    | ChannelType.PublicThread;

  /**
   * Whether non-moderators can add other non-moderators
   *
   * For PRIVATE_THREAD only. If true, thread members can add other non-moderator members.
   * If false, only moderators can add members.
   * Has no effect on PUBLIC_THREAD or ANNOUNCEMENT_THREAD.
   */
  invitable?: boolean;
}

/**
 * Interface for the message portion of starting a thread in a forum or media channel.
 * Defines the content of the first message created along with the forum thread.
 *
 * @remarks
 * This type is a subset of the CreateMessageSchema, containing only the fields
 * that are relevant for creating the initial message in a forum thread.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-forum-and-media-thread-message-params-object}
 */
export type ForumThreadMessageOptions = Pick<
  CreateMessageSchema,
  | "content"
  | "embeds"
  | "allowed_mentions"
  | "components"
  | "sticker_ids"
  | "attachments"
  | "flags"
>;

/**
 * Interface for creating a thread in a forum or media channel.
 * Used to create a new thread post in a forum or media channel along with its initial message.
 *
 * @remarks
 * Forum and media channels organize conversations into thread posts displayed in a grid or list.
 * Each thread must include an initial message.
 * Up to 5 tags can be applied to organize and categorize threads.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
 */
export interface ForumThreadCreateOptions
  extends Pick<CreateMessageSchema, "files" | "payload_json"> {
  /**
   * 1-100 character thread name
   *
   * Name of the thread post. Must be between 1 and 100 characters long.
   * This will be displayed as the thread title in the forum view.
   */
  name: string;

  /**
   * Auto-archive duration in minutes
   *
   * The duration in minutes after which the thread will automatically archive due to inactivity.
   * Values: 60, 1440 (24 hours), 4320 (3 days), 10080 (7 days)
   * Some durations require guild boost levels.
   * Defaults to the forum's default_auto_archive_duration if not specified.
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * The time users must wait between sending messages in the thread, in seconds.
   * Can be set from 0 (no slowmode) to 21600 (6 hours).
   * Set to null to inherit from the parent forum's default_thread_rate_limit_per_user.
   */
  rate_limit_per_user?: number | null;

  /**
   * Contents of the first message in the thread
   *
   * The message that will be posted as the first message in the thread.
   * Required for forum and media threads.
   * Can include text content, embeds, components, and other message features.
   */
  message: ForumThreadMessageOptions;

  /**
   * IDs of tags applied to the thread
   *
   * Array of tag IDs to apply to the thread for categorization.
   * Tags must be from the set of available_tags in the parent forum channel.
   * Maximum of 5 tags per thread.
   * Required if the forum has the REQUIRE_TAG flag enabled.
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for query parameters when listing public archived threads.
 * Used to retrieve archived threads with optional filtering and pagination.
 *
 * @remarks
 * Used for both public and private archived thread endpoints.
 * Threads are returned in descending order by archive timestamp (newest first).
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export interface ArchivedThreadsFetchParams {
  /**
   * Returns threads archived before this timestamp
   *
   * ISO8601 timestamp. Only threads archived before this timestamp will be returned.
   * Useful for pagination and filtering by archive date.
   */
  before?: string;

  /**
   * Maximum number of threads to return
   *
   * Controls how many archived threads to return per request.
   * No standard minimum or maximum values are documented.
   */
  limit?: number;
}

/**
 * Response interface for listing public archived threads.
 * The returned data structure for public, private, and joined private archived thread endpoints.
 *
 * @remarks
 * Contains both the thread channel objects and thread member objects for threads the current user has joined.
 * The has_more flag indicates if pagination is needed to get more results.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface ArchivedThreadsResponse {
  /**
   * Array of thread channel objects
   *
   * Contains all the archived thread channels that match the query.
   * Each object is a complete thread channel entity.
   */
  threads: AnyThreadChannelEntity[];

  /**
   * Array of thread member objects for threads the current user has joined
   *
   * Contains thread member objects only for the threads in the response
   * that the current user has joined.
   * May be a subset of the threads array or empty if the user hasn't joined any.
   */
  members: ThreadMemberEntity[];

  /**
   * Whether there are potentially more threads that could be returned
   *
   * Indicates if there are more archived threads available beyond what was returned.
   * If true, you can paginate to get more results using the before parameter.
   */
  has_more: boolean;
}

/**
 * Router for Discord Channel-related API endpoints.
 *
 * This class provides a collection of static methods for constructing API routes
 * related to channels, including text channels, voice channels, threads,
 * direct messages, and group direct messages.
 *
 * @remarks
 * Channel operations often require specific permissions that vary based on
 * the channel type and the operation being performed.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel}
 */
export class ChannelRouter {
  /**
   * Collection of API route constants for Discord Channel-related endpoints.
   *
   * These routes provide access to Discord's channel management functionality,
   * including text channels, voice channels, threads, DMs, group DMs, and related resources.
   *
   * Each endpoint function takes the necessary parameters (such as channel IDs, user IDs, etc.)
   * and returns the properly formatted API route string to use with REST methods.
   *
   * @remarks
   * All route constants follow the pattern described in Discord's official API documentation.
   * Routes with parameters use functions that accept those parameters and return the formatted route.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel}
   */
  static readonly CHANNEL_ROUTES = {
    /**
     * Route for accessing a specific channel.
     *
     * Used for:
     * - GET: Fetch a channel by ID
     * - PATCH: Update a channel's settings
     * - DELETE: Delete a channel or close a DM
     *
     * @param channelId - The ID of the channel to access
     * @returns `/channels/{channel.id}` route
     * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
     */
    channelBaseEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}` as const,

    /**
     * Route for managing permission overwrites in a channel.
     *
     * Used for:
     * - PUT: Create or update a permission overwrite
     * - DELETE: Delete a permission overwrite
     *
     * @param channelId - The ID of the channel
     * @param overwriteId - The ID of the user or role for the permission overwrite
     * @returns `/channels/{channel.id}/permissions/{overwrite.id}` route
     * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
     */
    channelPermissionEndpoint: (channelId: Snowflake, overwriteId: Snowflake) =>
      `/channels/${channelId}/permissions/${overwriteId}` as const,

    /**
     * Route for managing invites in a channel.
     *
     * Used for:
     * - GET: List all invites for a channel
     * - POST: Create a new invite for a channel
     *
     * @param channelId - The ID of the channel
     * @returns `/channels/{channel.id}/invites` route
     * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
     */
    channelInvitesEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/invites` as const,

    /**
     * Route for accessing all pinned messages in a channel.
     *
     * Used for:
     * - GET: List all pinned messages in a channel
     *
     * @param channelId - The ID of the channel
     * @returns `/channels/{channel.id}/pins` route
     * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
     */
    channelPinsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/pins` as const,

    /**
     * Route for managing a specific pinned message in a channel.
     *
     * Used for:
     * - PUT: Pin a message in a channel
     * - DELETE: Unpin a message from a channel
     *
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message to pin/unpin
     * @returns `/channels/{channel.id}/pins/{message.id}` route
     * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
     */
    channelPinnedMessageEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
    ) => `/channels/${channelId}/pins/${messageId}` as const,

    /**
     * Route for accessing all members of a thread.
     *
     * Used for:
     * - GET: List all members of a thread
     *
     * @param channelId - The ID of the thread
     * @returns `/channels/{channel.id}/thread-members` route
     * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
     */
    channelThreadMembersEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/thread-members` as const,

    /**
     * Route for managing a specific member of a thread.
     *
     * Used for:
     * - GET: Get a thread member
     * - PUT: Add a member to a thread (or join a thread when userId is "@me")
     * - DELETE: Remove a member from a thread (or leave a thread when userId is "@me")
     *
     * @param channelId - The ID of the thread
     * @param userId - The ID of the user, or "@me" for the current user
     * @returns `/channels/{channel.id}/thread-members/{user.id}` route
     * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
     */
    channelThreadMemberEndpoint: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/thread-members/${userId}` as const,

    /**
     * Route for starting a thread without an associated message.
     *
     * Used for:
     * - POST: Create a new thread that is not connected to an existing message
     *
     * This endpoint is also used for creating threads in forum and media channels,
     * but with different request body parameters.
     *
     * @param channelId - The ID of the parent channel
     * @returns `/channels/{channel.id}/threads` route
     * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
     */
    channelStartThreadWithoutMessageEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,

    /**
     * Route for accessing public archived threads in a channel.
     *
     * Used for:
     * - GET: List all public archived threads in a channel
     *
     * Returns PUBLIC_THREAD for text channels and ANNOUNCEMENT_THREAD for announcement channels.
     * Threads are ordered by archive_timestamp in descending order.
     *
     * @param channelId - The ID of the parent channel
     * @returns `/channels/{channel.id}/threads/archived/public` route
     * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
     */
    channelPublicArchivedThreadsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/public` as const,

    /**
     * Route for accessing private archived threads in a channel.
     *
     * Used for:
     * - GET: List all private archived threads in a channel
     *
     * Returns only PRIVATE_THREAD. Requires both MANAGE_THREADS and READ_MESSAGE_HISTORY permissions.
     * Threads are ordered by archive_timestamp in descending order.
     *
     * @param channelId - The ID of the parent channel
     * @returns `/channels/{channel.id}/threads/archived/private` route
     * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
     */
    channelPrivateArchivedThreadsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads/archived/private` as const,

    /**
     * Route for accessing private archived threads that the current user has joined.
     *
     * Used for:
     * - GET: List private archived threads that the current user has joined
     *
     * Only returns PRIVATE_THREAD that the current user has joined.
     * Threads are ordered by their ID in descending order.
     *
     * @param channelId - The ID of the parent channel
     * @returns `/channels/{channel.id}/users/@me/threads/archived/private` route
     * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
     */
    channelJoinedPrivateArchivedThreadsEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/users/@me/threads/archived/private` as const,

    /**
     * Route for starting a thread from an existing message.
     *
     * Used for:
     * - POST: Create a new thread attached to an existing message
     *
     * Creates a PUBLIC_THREAD for text channels and an ANNOUNCEMENT_THREAD for announcement channels.
     * The thread ID will be the same as the message ID.
     *
     * @param channelId - The ID of the parent channel
     * @param messageId - The ID of the message to create a thread from
     * @returns `/channels/{channel.id}/messages/{message.id}/threads` route
     * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
     */
    channelStartThreadFromMessageEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
    ) => `/channels/${channelId}/messages/${messageId}/threads` as const,

    /**
     * Route for starting a thread in a forum or media channel.
     *
     * Used for:
     * - POST: Create a new thread in a forum or media channel
     *
     * Creates a thread with an initial message in a forum or media channel.
     * This endpoint has the same path as channelStartThreadWithoutMessageEndpoint,
     * but with different request body parameters.
     *
     * @param channelId - The ID of the forum or media channel
     * @returns `/channels/{channel.id}/threads` route
     * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel}
     */
    channelStartThreadInForumOrMediaChannelEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/threads` as const,

    /**
     * Route for managing recipients in a group DM.
     *
     * Used for:
     * - PUT: Add a recipient to a group DM
     * - DELETE: Remove a recipient from a group DM
     *
     * @param channelId - The ID of the group DM channel
     * @param userId - The ID of the user to add or remove
     * @returns `/channels/{channel.id}/recipients/{user.id}` route
     * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient}
     */
    channelRecipientsEndpoint: (channelId: Snowflake, userId: Snowflake) =>
      `/channels/${channelId}/recipients/${userId}` as const,

    /**
     * Route for following an announcement channel.
     *
     * Used for:
     * - POST: Follow an announcement channel to send messages to a target channel
     *
     * Creates a webhook-based connection between an announcement channel and a target channel.
     * Messages published in the announcement channel will be forwarded to the target channel.
     *
     * @param channelId - The ID of the announcement channel to follow
     * @returns `/channels/{channel.id}/followers` route
     * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
     */
    channelFollowersEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/followers` as const,

    /**
     * Route for triggering a typing indicator in a channel.
     *
     * Used for:
     * - POST: Trigger a typing indicator for the current user in a channel
     *
     * Shows the typing indicator for about 10 seconds unless a message is sent.
     * This endpoint can be used when a response will take some time to generate.
     *
     * @param channelId - The ID of the channel to show typing in
     * @returns `/channels/{channel.id}/typing` route
     * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
     */
    channelTypingEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/typing` as const,
  } as const;

  /**
   * The REST client used for making API requests to Discord.
   *
   * This private property stores the Rest instance passed to the constructor.
   * It's used by all methods to send HTTP requests to Discord's API endpoints.
   */
  readonly #rest: Rest;

  /**
   * Creates a new ChannelRouter instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a channel by its ID.
   *
   * @param channelId - ID of the channel to fetch
   * @returns A promise that resolves to the channel object
   * @remarks If the channel is a thread, the response includes a thread member object for the current user
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   *
   * @remarks
   * The bot needs access to the channel to fetch it.
   * Returns a 404 error if the channel doesn't exist or the bot doesn't have access.
   * For threads, includes a `member` object if the bot is a member of the thread.
   */
  fetchChannel(channelId: Snowflake): Promise<AnyChannelEntity> {
    return this.#rest.get(
      ChannelRouter.CHANNEL_ROUTES.channelBaseEndpoint(channelId),
    );
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
   *
   * @remarks
   * Different permissions are required depending on the channel type and the fields being updated:
   * - Guild channels: MANAGE_CHANNELS permission
   * - Threads: Varies based on the operation (e.g., MANAGE_THREADS to change archived or locked status)
   *
   * Not all fields can be updated for all channel types. The options parameter should match the channel type:
   * - Use GuildChannelUpdateOptions for regular guild channels
   * - Use ThreadUpdateOptions for threads
   * - Use GroupDmUpdateOptions for group DMs
   *
   * For forum channels, special fields like available_tags and default_reaction_emoji can be updated.
   */
  updateChannel(
    channelId: Snowflake,
    options:
      | GuildChannelUpdateOptions
      | ThreadUpdateOptions
      | GroupDmUpdateOptions,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.patch(
      ChannelRouter.CHANNEL_ROUTES.channelBaseEndpoint(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
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
   *
   * @remarks
   * Different permissions are required depending on the channel type:
   * - Guild channels: MANAGE_CHANNELS permission
   * - Threads: MANAGE_THREADS permission
   * - DM channels: No special permissions required
   *
   * For guild channels and threads, this action is permanent and cannot be undone.
   * For DM channels, this just closes the DM from the bot's perspective.
   *
   * Deleting a category does not automatically delete the channels within it.
   * For forum channels, deleting the channel will delete all threads within it.
   */
  deleteChannel(
    channelId: Snowflake,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.delete(
      ChannelRouter.CHANNEL_ROUTES.channelBaseEndpoint(channelId),
      {
        reason,
      },
    );
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
   *
   * @remarks
   * Requires the MANAGE_ROLES permission in the guild.
   * The bot's highest role must be higher than the role being edited (for role overwrites).
   * Permission overwrites allow you to grant or deny specific permissions to roles or users in a channel.
   * The `type` field must be 0 for role or 1 for member.
   * Permissions values should be provided as string-encoded bitfields.
   * Fires a Channel Update Gateway event.
   */
  editChannelPermissions(
    channelId: Snowflake,
    overwriteId: Snowflake,
    permissions: ChannelPermissionUpdateOptions,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(
      ChannelRouter.CHANNEL_ROUTES.channelPermissionEndpoint(
        channelId,
        overwriteId,
      ),
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
   *
   * @remarks
   * Requires the MANAGE_CHANNELS permission.
   * Only works for guild channels, not DMs or group DMs.
   * Returns all active invites for the channel with detailed information about each.
   */
  fetchChannelInvites(channelId: Snowflake): Promise<InviteEntity[]> {
    return this.#rest.get(
      ChannelRouter.CHANNEL_ROUTES.channelInvitesEndpoint(channelId),
    );
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
   *
   * @remarks
   * Requires the CREATE_INSTANT_INVITE permission.
   * Only works for guild channels, not DMs or group DMs.
   *
   * Parameters:
   * - max_age: Duration in seconds before the invite expires (0 = never expires, max 604800 = 7 days)
   * - max_uses: Maximum number of times the invite can be used (0 = unlimited, max 100)
   * - temporary: Whether the invite grants temporary membership (removed when they disconnect)
   * - unique: Whether to create a unique link even if a similar one exists
   *
   * For voice channels, you can create activity invites with target_type and target_application_id.
   * Fires an Invite Create Gateway event.
   */
  createChannelInvite(
    channelId: Snowflake,
    options: ChannelInviteCreateOptions,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.#rest.post(
      ChannelRouter.CHANNEL_ROUTES.channelInvitesEndpoint(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
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
   *
   * @remarks
   * Requires the MANAGE_ROLES permission in the guild.
   * The bot's highest role must be higher than the role being edited (for role overwrites).
   * Deleting a permission overwrite resets that role or user to using the default permissions for the channel.
   * This action cannot be undone automatically.
   * Fires a Channel Update Gateway event.
   */
  deleteChannelPermission(
    channelId: Snowflake,
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.delete(
      ChannelRouter.CHANNEL_ROUTES.channelPermissionEndpoint(
        channelId,
        overwriteId,
      ),
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
   *
   * @remarks
   * Requires the MANAGE_WEBHOOKS permission in the target channel.
   * The source channel must be an announcement channel (type 5).
   * This creates a webhook in the target channel that will repost messages that are published in the source channel.
   * There is a limit of 10 followed channels per channel.
   * Fires a Webhooks Update Gateway event.
   */
  followAnnouncementChannel(
    channelId: Snowflake,
    webhookChannelId: Snowflake,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.#rest.post(
      ChannelRouter.CHANNEL_ROUTES.channelFollowersEndpoint(channelId),
      {
        body: JSON.stringify({ webhook_channel_id: webhookChannelId }),
        reason,
      },
    );
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
   *
   * @remarks
   * The typing indicator lasts for approximately 10 seconds or until a message is sent.
   * For operations that take longer than 10 seconds, you may need to trigger it multiple times.
   * Generally, bots should use this sparingly and only when there will be a noticeable delay before responding.
   * Fires a Typing Start Gateway event.
   */
  startTyping(channelId: Snowflake): Promise<void> {
    return this.#rest.post(
      ChannelRouter.CHANNEL_ROUTES.channelTypingEndpoint(channelId),
    );
  }

  /**
   * Gets all pinned messages in a channel.
   *
   * @param channelId - ID of the channel
   * @returns A promise that resolves to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   *
   * @remarks
   * Returns all pinned messages in the channel in chronological order (oldest first).
   * A channel can have up to 50 pinned messages.
   * The bot must have access to view the channel and its message history.
   */
  fetchPinnedMessages(channelId: Snowflake): Promise<MessageEntity[]> {
    return this.#rest.get(
      ChannelRouter.CHANNEL_ROUTES.channelPinsEndpoint(channelId),
    );
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
   *
   * @remarks
   * Requires the MANAGE_MESSAGES permission.
   * There is a maximum of 50 pinned messages per channel.
   * The message must be in the same channel as the channelId parameter.
   * Fires a Channel Pins Update Gateway event.
   */
  pinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(
      ChannelRouter.CHANNEL_ROUTES.channelPinnedMessageEndpoint(
        channelId,
        messageId,
      ),
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
   *
   * @remarks
   * Requires the MANAGE_MESSAGES permission.
   * The message must already be pinned in the channel.
   * Fires a Channel Pins Update Gateway event.
   */
  unpinMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.CHANNEL_ROUTES.channelPinnedMessageEndpoint(
        channelId,
        messageId,
      ),
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
   *
   * @remarks
   * The access token must have the `gdm.join` scope.
   * The token must be from the user being added to the group DM.
   * This operation is typically used in OAuth2 flows where a user has authorized your application.
   * Group DMs have a maximum size limit (typically 10 users).
   */
  addGroupDmRecipient(
    channelId: Snowflake,
    userId: Snowflake,
    options: AddGroupDmRecipientSchema,
  ): Promise<void> {
    return this.#rest.put(
      ChannelRouter.CHANNEL_ROUTES.channelRecipientsEndpoint(channelId, userId),
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
   *
   * @remarks
   * The bot must own the group DM or be removing itself from the group.
   * If removing the bot account from the group DM, the channel will be closed for the bot.
   * If all users leave a group DM, it becomes inaccessible.
   */
  removeGroupDmRecipient(
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.CHANNEL_ROUTES.channelRecipientsEndpoint(channelId, userId),
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
   *
   * @remarks
   * The type of thread created depends on the parent channel:
   * - GUILD_TEXT channel → PUBLIC_THREAD (type 11)
   * - GUILD_ANNOUNCEMENT channel → ANNOUNCEMENT_THREAD (type 10)
   *
   * The thread ID will be the same as the message ID it was created from.
   * A message can only have a single thread created from it.
   *
   * Auto-archive durations:
   * - 60 minutes (requires COMMUNITY feature or PREMIUM_TIER level 2)
   * - 1440 minutes (24 hours)
   * - 4320 minutes (3 days, requires PREMIUM_TIER level 1)
   * - 10080 minutes (7 days, requires PREMIUM_TIER level 2)
   *
   * Fires both a Thread Create and a Message Update Gateway event.
   */
  createThreadFromMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: ThreadFromMessageCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannelEntity> {
    return this.#rest.post(
      ChannelRouter.CHANNEL_ROUTES.channelStartThreadFromMessageEndpoint(
        channelId,
        messageId,
      ),
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
   *
   * @remarks
   * The channel must be a text or announcement channel to create threads.
   *
   * Thread types:
   * - PUBLIC_THREAD (type 11): Visible to everyone, anyone can join
   * - PRIVATE_THREAD (type 12): Only visible to those invited (requires COMMUNITY feature)
   * - ANNOUNCEMENT_THREAD (type 10): Can only be created in announcement channels
   *
   * Creating PRIVATE_THREAD requires the COMMUNITY feature to be enabled for the guild.
   * The `invitable` parameter only applies to PRIVATE_THREAD and determines if non-moderators can add others.
   *
   * Fires a Thread Create Gateway event.
   */
  createThread(
    channelId: Snowflake,
    options: ThreadCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannelEntity> {
    return this.#rest.post(
      ChannelRouter.CHANNEL_ROUTES.channelStartThreadWithoutMessageEndpoint(
        channelId,
      ),
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
   *
   * @remarks
   * This method creates a new thread in a forum or media channel along with its first message.
   * Forum threads are designed for topic-based discussions and are organized with tags.
   *
   * The `message` parameter is required and contains the content for the first message in the thread.
   * The `applied_tags` parameter allows you to add tags to the thread for organization (up to 5 tags).
   *
   * Forum threads have the same auto-archive duration options as regular threads.
   * The created thread will be of type PUBLIC_THREAD (type 11).
   *
   * Fires both Thread Create and Message Create Gateway events.
   */
  createForumThread(
    channelId: Snowflake,
    options: ForumThreadCreateOptions | ForumThreadMessageOptions,
    reason?: string,
  ): Promise<GuildForumChannelEntity | GuildMediaChannelEntity> {
    return this.#rest.post(
      ChannelRouter.CHANNEL_ROUTES.channelStartThreadInForumOrMediaChannelEndpoint(
        channelId,
      ),
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
   *
   * @remarks
   * The thread must not be archived.
   * For private threads, the bot must have been added by a member with MANAGE_THREADS permission or be mentioned in the thread.
   * Fires a Thread Members Update Gateway event.
   * Also fires a Thread Create Gateway event with the newly joined thread for the current user.
   */
  joinThread(channelId: Snowflake): Promise<void> {
    return this.#rest.put(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        "@me",
      ),
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
   *
   * @remarks
   * The thread must not be archived.
   * For public threads, any user can be added.
   * For private threads:
   * - Adding a user requires MANAGE_THREADS permission
   * - If `invitable` is true, then thread members can add other users
   * - The user to be added must be able to see the parent channel
   *
   * Fires a Thread Members Update Gateway event.
   */
  addThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.put(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        userId,
      ),
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
   *
   * @remarks
   * The thread must not be archived.
   * A user can always leave a thread they're a member of.
   * Fires a Thread Members Update Gateway event.
   */
  leaveThread(channelId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        "@me",
      ),
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
   *
   * @remarks
   * Removing members requires one of the following:
   * - The MANAGE_THREADS permission
   * - Being the thread creator (only for private threads)
   *
   * The thread must not be archived.
   * Fires a Thread Members Update Gateway event.
   */
  removeThreadMember(channelId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMemberEndpoint(
        channelId,
        userId,
      ),
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
   *
   * @remarks
   * Returns a 404 response if the user is not a member of the thread.
   * When `with_member` is true, the response includes guild member information.
   * Including guild member information requires the GUILD_MEMBERS privileged intent to be enabled.
   */
  fetchThreadMember(
    channelId: Snowflake,
    userId: Snowflake,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.#rest.get(
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
   *
   * @param channelId - ID of the thread
   * @param query - Query parameters for the request
   * @returns A promise that resolves to an array of thread members
   * @remarks
   * - When with_member is true, results will be paginated and include guild member information
   * - Requires the GUILD_MEMBERS Privileged Intent to be enabled
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   *
   * @remarks
   * When `with_member` is true:
   * - Results include detailed guild member information for each thread member
   * - The GUILD_MEMBERS Privileged Intent must be enabled in your application
   * - Results are paginated and can be navigated using the `after` and `limit` parameters
   *
   * When `with_member` is false:
   * - Only basic thread member information is returned
   * - All thread members are returned in a single request (no pagination)
   *
   * The maximum `limit` value is 100 thread members per request.
   */
  fetchThreadMembers(
    channelId: Snowflake,
    query?: ThreadMembersFetchParams,
  ): Promise<ThreadMemberEntity[]> {
    return this.#rest.get(
      ChannelRouter.CHANNEL_ROUTES.channelThreadMembersEndpoint(channelId),
      {
        query,
      },
    );
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
   *
   * @remarks
   * The type of threads returned depends on the parent channel:
   * - GUILD_TEXT channels → PUBLIC_THREAD (type 11)
   * - GUILD_ANNOUNCEMENT channels → ANNOUNCEMENT_THREAD (type 10)
   *
   * Threads are returned in order of archive timestamp, with newest first.
   * The `before` parameter filters for threads archived before the provided timestamp.
   * The response includes a `has_more` flag indicating if there are more archived threads that match the query.
   * The response also includes thread members for threads the current user has joined.
   *
   * Requires the READ_MESSAGE_HISTORY permission for the channel.
   */
  fetchPublicArchivedThreads(
    channelId: Snowflake,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.#rest.get(
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
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of private archived threads
   * @remarks
   * - Returns threads of type PRIVATE_THREAD
   * - Threads are ordered by archive_timestamp in descending order
   * - Requires both the READ_MESSAGE_HISTORY and MANAGE_THREADS permissions
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   *
   * @remarks
   * Only returns threads of type PRIVATE_THREAD (type 12).
   * Requires both the READ_MESSAGE_HISTORY and MANAGE_THREADS permissions.
   *
   * Threads are returned in order of archive timestamp, with newest first.
   * The `before` parameter filters for threads archived before the provided timestamp.
   * The response includes a `has_more` flag indicating if there are more archived threads that match the query.
   * The response also includes thread members for threads the current user has joined.
   *
   * Unlike public threads, which are accessible to anyone with access to the channel, private archived
   * threads are only visible to users with the MANAGE_THREADS permission or those who were invited.
   */
  fetchPrivateArchivedThreads(
    channelId: Snowflake,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.#rest.get(
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
   *
   * @param channelId - ID of the channel
   * @param query - Query parameters for the request
   * @returns A promise that resolves to a list of joined private archived threads
   * @remarks
   * - Returns threads of type PRIVATE_THREAD that the current user has joined
   * - Threads are ordered by their ID in descending order
   * - Requires the READ_MESSAGE_HISTORY permission
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   *
   * @remarks
   * Only returns threads of type PRIVATE_THREAD (type 12) that the current user has joined.
   * Requires the READ_MESSAGE_HISTORY permission.
   *
   * Unlike fetchPrivateArchivedThreads, this method:
   * - Only returns threads that the current user has actually joined
   * - Does not require the MANAGE_THREADS permission
   * - Returns threads ordered by ID rather than archive timestamp
   *
   * The `before` parameter for this endpoint is a thread ID, not a timestamp.
   * The response includes a `has_more` flag indicating if there are more threads that match the query.
   * The response also includes thread members for all returned threads (since the user has joined all of them).
   */
  fetchJoinedPrivateArchivedThreads(
    channelId: Snowflake,
    query?: ArchivedThreadsFetchParams,
  ): Promise<ArchivedThreadsResponse> {
    return this.#rest.get(
      ChannelRouter.CHANNEL_ROUTES.channelJoinedPrivateArchivedThreadsEndpoint(
        channelId,
      ),
      {
        query,
      },
    );
  }
}
