import {
  type AnyChannelEntity,
  type AutoArchiveDuration,
  BitField,
  type BitwisePermissionFlags,
  type ChannelEntity,
  ChannelFlags,
  ChannelType,
  type DefaultReactionEntity,
  type FollowedChannelEntity,
  type FormattedChannel,
  type FormattedUser,
  type ForumLayoutType,
  type ForumTagEntity,
  formatChannel,
  formatUser,
  type InviteEntity,
  type OverwriteEntity,
  type Snowflake,
  SnowflakeUtil,
  type SortOrderType,
  type ThreadMemberEntity,
  type ThreadMetadataEntity,
  type VideoQualityMode,
} from "@nyxojs/core";
import type {
  ChannelInviteCreateOptions,
  ChannelPermissionUpdateOptions,
  CreateMessageSchema,
  ForumThreadCreateOptions,
  GroupDmCreateOptions,
  GuildChannelUpdateOptions,
  MessagesFetchParams,
  ThreadCreateOptions,
  ThreadFromMessageCreateOptions,
  ThreadUpdateOptions,
  WebhookCreateOptions,
} from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import { Guild, GuildMember } from "./guild.class.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";
import { Webhook } from "./webhook.class.js";

/**
 * Represents a user's membership in a Discord thread.
 *
 * The ThreadMember class encapsulates a user's status, permissions, and
 * metadata related to their participation in a specific thread channel.
 * It provides methods to interact with and modify a user's thread membership.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
@Cacheable<GuildBased<ThreadMemberEntity>>(
  "threadMembers",
  (entity) => `${entity.guild_id}:${entity.id}:${entity.user_id}`,
)
export class ThreadMember
  extends BaseClass<GuildBased<ThreadMemberEntity>>
  implements Enforce<PropsToCamel<GuildBased<ThreadMemberEntity>>>
{
  /**
   * Gets the ID of the thread this membership belongs to.
   *
   * This property may be omitted in certain API responses.
   *
   * @returns The thread ID as a Snowflake string, or undefined if not available
   */
  readonly id = this.rawData.id;

  /**
   * Gets the ID of the guild this thread member belongs to.
   *
   * This property may be omitted in certain API responses.
   *
   * @returns The guild ID as a Snowflake string, or undefined if not available
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the ID of the user who is a member of the thread.
   *
   * This property may be omitted in certain API responses.
   *
   * @returns The user ID as a Snowflake string, or undefined if not available
   */
  readonly userId = this.rawData.user_id;

  /**
   * Gets the timestamp when the user last joined the thread.
   *
   * This is an ISO8601 timestamp string representing when the user joined
   * or was added to the thread.
   *
   * @returns The join timestamp as an ISO8601 string
   */
  readonly joinTimestamp = this.rawData.join_timestamp;

  /**
   * Gets the flags for this thread member.
   *
   * These flags represent the user's thread-specific settings, such as
   * notification preferences.
   *
   * @returns A BitField of thread member flags
   */
  readonly flags = new BitField<number>(this.rawData.flags);

  /**
   * Gets the guild member object associated with this thread member.
   *
   * This is only included when explicitly requested with the `with_member` parameter
   * in API requests.
   *
   * @returns The guild member entity, or undefined if not available
   */
  readonly member = this.rawData.member
    ? new GuildMember(this.client, {
        ...this.rawData.member,
        guild_id: this.guildId,
      })
    : undefined;

  /**
   * Gets the Date object representing when this user joined the thread.
   *
   * @returns The Date when the user joined the thread
   */
  get joinedAt(): Date {
    return new Date(this.joinTimestamp);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when the user joined the thread.
   *
   * @returns The join timestamp in milliseconds
   */
  get joinedTimestamp(): number {
    return this.joinedAt.getTime();
  }

  /**
   * Gets the User instance if it has been cached.
   *
   * @returns The User instance, or undefined if not cached
   */
  get user(): User | undefined {
    if (!this.member?.user) {
      return undefined;
    }

    return this.member.user;
  }

  /**
   * Duration in days since the user joined the thread.
   *
   * @returns The number of days since the user joined the thread
   */
  get joinedDaysAgo(): number {
    return Math.floor(
      (Date.now() - this.joinedTimestamp) / (1000 * 60 * 60 * 24),
    );
  }

  /**
   * Fetches the User instance for this thread member.
   *
   * This method lazily loads and caches the User object.
   *
   * @returns A promise resolving to the User instance
   * @throws Error if the user ID is not available or the user cannot be fetched
   */
  async fetchUser(): Promise<User> {
    if (!this.userId) {
      throw new Error("User ID is not available for this thread member");
    }

    try {
      const userData = await this.client.rest.users.fetchUser(this.userId);
      return new User(this.client, userData);
    } catch (error) {
      throw new Error(`Failed to fetch user for thread member: ${error}`);
    }
  }

  /**
   * Fetches the GuildMember instance for this thread member.
   *
   * This method lazily loads and caches the GuildMember object.
   *
   * @param guildId - The ID of the guild to fetch the member from
   * @returns A promise resolving to the GuildMember instance
   * @throws Error if the user or guild information is not available
   */
  async fetchGuildMember(guildId: Snowflake): Promise<GuildMember> {
    if (!this.userId) {
      throw new Error("User ID is not available for this thread member");
    }

    try {
      const user = await this.fetchUser();
      return await user.fetchGuildMember(guildId);
    } catch (error) {
      throw new Error(
        `Failed to fetch guild member for thread member: ${error}`,
      );
    }
  }

  /**
   * Fetches the thread channel that this membership belongs to.
   *
   * @returns A promise resolving to the thread channel instance
   * @throws Error if the thread ID is not available or the thread cannot be fetched
   */
  async fetchThread(): Promise<AnyThreadChannel> {
    if (!this.id) {
      throw new Error("Thread ID is not available");
    }

    try {
      const channelData = await this.client.rest.channels.fetchChannel(this.id);
      const channel = channelFactory(this.client, channelData);

      if (!channel.isThreadChannel()) {
        throw new Error(`Channel with ID ${this.id} is not a thread`);
      }

      return channel as AnyThreadChannel;
    } catch (error) {
      throw new Error(`Failed to fetch thread: ${error}`);
    }
  }

  /**
   * Removes the user from the thread.
   *
   * @returns A promise that resolves when the user is removed from the thread
   * @throws Error if the thread or user ID is not available
   */
  async remove(): Promise<void> {
    if (!this.id) {
      throw new Error("Thread ID is not available");
    }

    if (!this.userId) {
      throw new Error("User ID is not available");
    }

    try {
      await this.client.rest.channels.removeThreadMember(this.id, this.userId);
    } catch (error) {
      throw new Error(`Failed to remove user from thread: ${error}`);
    }
  }

  /**
   * Formats this thread member as a mention string for the user.
   *
   * @returns The formatted user mention
   */
  override toString(): FormattedUser | `Unknown User` {
    return this.userId ? formatUser(this.userId) : "Unknown User";
  }
}

/**
 * Base class representing a Discord channel.
 *
 * The Channel class provides a foundation for all types of Discord channels,
 * offering common properties and methods for interacting with channels.
 *
 * This class serves as an abstract base; specific channel types are represented
 * by derived classes that provide type-specific functionality.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object}
 */
@Cacheable<ChannelEntity>("channels", (entity) => entity.id)
export class Channel
  extends BaseClass<ChannelEntity>
  implements Enforce<PropsToCamel<ChannelEntity>>
{
  /**
   * Gets the unique ID of this channel.
   *
   * This ID is permanent and will not change for the lifetime of the channel.
   * It can be used for API operations and persistent references.
   *
   * @returns The channel's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the type of this channel.
   *
   * The type determines what features and properties are available on the channel.
   * Different channel types serve different purposes in Discord.
   *
   * @returns The channel type as an enum value
   */
  readonly type = this.rawData.type;

  /**
   * Gets the ID of the guild that this channel belongs to, if applicable.
   *
   * This will be undefined for DM and group DM channels.
   *
   * @returns The guild ID as a Snowflake string, or undefined if not in a guild
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the position of this channel in the guild's channel list.
   *
   * Lower position values appear higher in the Discord UI.
   * This property is undefined for channels not in a guild.
   *
   * @returns The channel's position, or undefined if not applicable
   */
  readonly position = this.rawData.position;

  /**
   * Gets the permission overwrites for this channel.
   *
   * Overwrites define custom permissions for specific users or roles in this channel,
   * overriding the permissions they have in the guild.
   *
   * @returns An array of permission overwrites, or undefined if none
   */
  readonly permissionOverwrites = this.rawData.permission_overwrites;

  /**
   * Gets the name of this channel.
   *
   * Channel names must be between 1 and 100 characters long.
   * This will be undefined for DM channels, which don't have custom names.
   *
   * @returns The channel's name, or null/undefined if not applicable
   */
  readonly name = this.rawData.name;

  /**
   * Gets the topic of this channel.
   *
   * The topic is a description shown at the top of the channel in Discord.
   * Limited to 0-1024 characters for most channels, 0-4096 for forum channels.
   *
   * @returns The channel's topic, or undefined if not set
   */
  readonly topic = this.rawData.topic;

  /**
   * Checks if this channel is marked as NSFW (Not Safe For Work).
   *
   * NSFW channels require users to confirm they want to view the content.
   *
   * @returns True if the channel is NSFW, false otherwise or if not applicable
   */
  readonly nsfw = Boolean(this.rawData.nsfw);

  /**
   * Gets the ID of the last message sent in this channel.
   *
   * This may be undefined for voice channels or channels with no messages.
   * Note that this ID may not point to a valid message if it was deleted.
   *
   * @returns The last message ID, or null/undefined if not applicable
   */
  readonly lastMessageId = this.rawData.last_message_id;

  /**
   * Gets the bitrate of the voice channel, in bits per second.
   *
   * This is only applicable to voice channels. Higher bitrates provide better
   * audio quality but require more bandwidth.
   *
   * @returns The bitrate in bits per second, or undefined if not a voice channel
   */
  readonly bitrate = this.rawData.bitrate;

  /**
   * Gets the user limit of the voice channel.
   *
   * This is the maximum number of users that can join the voice channel.
   * A value of 0 means there is no limit.
   *
   * @returns The user limit, or undefined if not a voice channel
   */
  readonly userLimit = this.rawData.user_limit;

  /**
   * Gets the rate limit per user (slowmode) for this channel.
   *
   * This is the number of seconds a user must wait between sending messages.
   * A value of 0 means there is no rate limit.
   *
   * @returns The rate limit in seconds, or undefined if not applicable
   */
  readonly rateLimitPerUser = this.rawData.rate_limit_per_user;

  /**
   * Gets the users who are recipients of this direct message.
   *
   * This is only applicable to DM and group DM channels.
   *
   * @returns An array of user objects, or undefined if not a DM channel
   */
  readonly recipients = this.rawData.recipients?.map(
    (user) => new User(this.client, user),
  );

  /**
   * Gets the icon hash of the group DM channel.
   *
   * This is only applicable to group DM channels.
   *
   * @returns The icon hash, or null/undefined if not set or not applicable
   */
  readonly icon = this.rawData.icon;

  /**
   * Gets the ID of the creator of this channel.
   *
   * This is only applicable to group DM channels and threads.
   *
   * @returns The creator's user ID, or undefined if not applicable
   */
  readonly ownerId = this.rawData.owner_id;

  /**
   * Gets the application ID of the group DM creator if it was created by a bot.
   *
   * This is only applicable to group DM channels created by bots.
   *
   * @returns The application ID, or undefined if not applicable
   */
  readonly applicationId = this.rawData.application_id;

  /**
   * Checks if this channel is managed by an application.
   *
   * Managed channels are created and controlled by an application or integration.
   *
   * @returns True if the channel is managed, false otherwise or if not applicable
   */
  readonly managed = Boolean(this.rawData.managed);

  /**
   * Gets the ID of the parent category or text channel for threads.
   *
   * For channels in a category, this is the category's ID.
   * For threads, this is the ID of the parent text channel.
   *
   * @returns The parent ID, or null/undefined if not in a category or not a thread
   */
  readonly parentId = this.rawData.parent_id;

  /**
   * Gets the timestamp of when the last pinned message was pinned.
   *
   * This is an ISO8601 timestamp string.
   *
   * @returns The last pin timestamp, or null/undefined if no pins or not applicable
   */
  readonly lastPinTimestamp = this.rawData.last_pin_timestamp;

  /**
   * Gets the voice region ID for the voice channel.
   *
   * This is the server region for the voice channel.
   * A value of null means automatic region selection.
   *
   * @returns The region ID, or null/undefined if automatic or not a voice channel
   */
  readonly rtcRegion = this.rawData.rtc_region;

  /**
   * Gets the video quality mode for the voice channel.
   *
   * This determines the video quality and bandwidth usage for video in the channel.
   *
   * @returns The video quality mode, or undefined if not a voice channel
   */
  readonly videoQualityMode = this.rawData.video_quality_mode;

  /**
   * Gets the number of messages in a thread.
   *
   * This count excludes the initial message and is only applicable to threads.
   *
   * @returns The message count, or undefined if not a thread
   */
  readonly messageCount = this.rawData.message_count;

  /**
   * Gets the approximate number of members in a thread.
   *
   * This count is capped at 50 for performance reasons.
   *
   * @returns The member count, or undefined if not a thread
   */
  readonly memberCount = this.rawData.member_count;

  /**
   * Gets the thread-specific metadata.
   *
   * This includes information like archive status, auto-archive duration, etc.
   *
   * @returns The thread metadata, or undefined if not a thread
   */
  readonly threadMetadata = this.rawData.thread_metadata;

  /**
   * Gets the thread member object for the current user if they've joined the thread.
   *
   * @returns The thread member object, or undefined if not applicable
   */
  readonly member = this.rawData.member
    ? new ThreadMember(this.client, {
        ...this.rawData.member,
        guild_id: this.guildId as string,
      })
    : undefined;

  /**
   * Gets the default auto archive duration for newly created threads.
   *
   * This is the time in minutes after which new threads will automatically archive
   * if there's no activity.
   *
   * @returns The default auto archive duration, or undefined if not applicable
   */
  readonly defaultAutoArchiveDuration =
    this.rawData.default_auto_archive_duration;

  /**
   * Gets the computed permissions for the current user in this channel.
   *
   * This is a string representation of a permission bitfield.
   *
   * @returns The permissions string, or undefined if not available
   */
  readonly permissions = new BitField<BitwisePermissionFlags>(
    this.rawData.permissions ?? 0n,
  );

  /**
   * Gets the channel flags.
   *
   * These flags represent additional settings and features of the channel.
   *
   * @returns The channel flags
   */
  readonly flags = new BitField<ChannelFlags>(this.rawData.flags);

  /**
   * Gets the total number of messages ever sent in a thread.
   *
   * Unlike messageCount, this doesn't decrease when messages are deleted.
   *
   * @returns The total message count, or undefined if not a thread
   */
  readonly totalMessageSent = this.rawData.total_message_sent;

  /**
   * Gets the tags available in a forum or media channel.
   *
   * These are the tags that can be applied to threads in the channel.
   *
   * @returns An array of forum tags, or undefined if not a forum/media channel
   */
  readonly availableTags = this.rawData.available_tags;

  /**
   * Gets the IDs of tags applied to a thread in a forum or media channel.
   *
   * @returns An array of tag IDs, or undefined if not applicable
   */
  readonly appliedTags = this.rawData.applied_tags;

  /**
   * Gets the default emoji for the add reaction button on forum threads.
   *
   * @returns The default reaction emoji object, or null/undefined if not set
   */
  readonly defaultReactionEmoji = this.rawData.default_reaction_emoji;

  /**
   * Gets the default rate limit per user for newly created threads.
   *
   * This is the slowmode setting that will be applied to new threads.
   *
   * @returns The default rate limit in seconds, or undefined if not applicable
   */
  readonly defaultThreadRateLimitPerUser =
    this.rawData.default_thread_rate_limit_per_user;

  /**
   * Gets the default sort order for forum posts.
   *
   * This determines how threads are sorted in forum channels by default.
   *
   * @returns The sort order, or null/undefined if not set
   */
  readonly defaultSortOrder = this.rawData.default_sort_order;

  /**
   * Gets the default forum layout view.
   *
   * This determines how forum posts are displayed by default.
   *
   * @returns The forum layout type, or undefined if not a forum channel
   */
  readonly defaultForumLayout = this.rawData.default_forum_layout;

  /**
   * Gets the date when this channel was created.
   *
   * This is calculated from the channel's ID, which contains a timestamp.
   *
   * @returns The creation date
   */
  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  /**
   * Gets the creation timestamp of this channel in milliseconds.
   *
   * @returns The creation timestamp
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Checks if this channel belongs to a guild.
   *
   * @returns True if this is a guild channel, false otherwise
   */
  get isGuildChannel(): boolean {
    return this.guildId !== undefined;
  }

  /**
   * Checks if this channel is a text-based channel where messages can be sent.
   *
   * @returns True if this is a text-based channel, false otherwise
   */
  get isTextBased(): boolean {
    return [
      ChannelType.GuildText,
      ChannelType.Dm,
      ChannelType.GroupDm,
      ChannelType.GuildAnnouncement,
      ChannelType.AnnouncementThread,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.GuildForum,
      ChannelType.GuildMedia,
    ].includes(this.type);
  }

  /**
   * Checks if this channel is a voice-based channel.
   *
   * @returns True if this is a voice-based channel, false otherwise
   */
  get isVoiceBased(): boolean {
    return [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(
      this.type,
    );
  }

  /**
   * Checks if this channel is a thread.
   *
   * @returns True if this is a thread channel, false otherwise
   */
  get isThread(): boolean {
    return [
      ChannelType.AnnouncementThread,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
    ].includes(this.type);
  }

  /**
   * Checks if this channel is a forum channel.
   *
   * @returns True if this is a forum channel, false otherwise
   */
  get isForum(): boolean {
    return this.type === ChannelType.GuildForum;
  }

  /**
   * Checks if this channel is a media channel.
   *
   * @returns True if this is a media channel, false otherwise
   */
  get isMedia(): boolean {
    return this.type === ChannelType.GuildMedia;
  }

  /**
   * Checks if this channel is a category.
   *
   * @returns True if this is a category channel, false otherwise
   */
  get isCategory(): boolean {
    return this.type === ChannelType.GuildCategory;
  }

  /**
   * Checks if this channel is viewable by the current user.
   *
   * @returns True if the channel is viewable, false otherwise
   */
  get isViewable(): boolean {
    if (!this.isGuildChannel) {
      return true;
    }

    return true; // In a full implementation, this would check permissions
  }

  /**
   * Fetches the guild that this channel belongs to.
   *
   * @returns A promise resolving to the Guild instance
   * @throws Error if this is not a guild channel
   */
  async fetchGuild(): Promise<Guild> {
    if (!this.isGuildChannel) {
      throw new Error("This channel does not belong to a guild");
    }

    try {
      const guild = await this.client.rest.guilds.fetchGuild(
        this.guildId as Snowflake,
      );
      return new Guild(this.client, guild);
    } catch (error) {
      throw new Error(`Failed to fetch guild for channel: ${error}`);
    }
  }

  /**
   * Fetches the parent channel of this channel.
   *
   * For channels in a category, this is the category.
   * For threads, this is the parent text channel.
   *
   * @returns A promise resolving to the parent Channel instance, or null if none
   */
  async fetchParent(): Promise<AnyChannel | null> {
    if (!this.parentId) {
      return null;
    }

    try {
      const channel = await this.client.rest.channels.fetchChannel(
        this.parentId,
      );
      return channelFactory(this.client, channel);
    } catch (error) {
      throw new Error(`Failed to fetch parent channel: ${error}`);
    }
  }

  /**
   * Fetches all messages in the channel.
   *
   * @param query - Optional parameters for fetching messages
   * @returns A promise resolving to an array of Message instances
   */
  async fetchMessages(query?: MessagesFetchParams): Promise<Message[]> {
    if (!this.isTextBased) {
      throw new Error("Cannot fetch messages in a non-text channel");
    }

    try {
      const messages = await this.client.rest.messages.fetchMessages(
        this.id,
        query,
      );
      return messages.map((message) => new Message(this.client, message));
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error}`);
    }
  }

  /**
   * Fetches a specific message in the channel.
   *
   * @param messageId - ID of the message to fetch
   * @returns A promise resolving to the Message instance
   */
  async fetchMessage(messageId: Snowflake): Promise<Message> {
    if (!this.isTextBased) {
      throw new Error("Cannot fetch messages in a non-text channel");
    }

    try {
      const message = await this.client.rest.messages.fetchMessage(
        this.id,
        messageId,
      );
      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to fetch message: ${error}`);
    }
  }

  /**
   * Sends a message to the channel.
   *
   * @param content - Content of the message to send
   * @returns A promise resolving to the sent Message instance
   */
  async send(content: string | CreateMessageSchema): Promise<Message> {
    if (!this.isTextBased) {
      throw new Error("Cannot send messages to a non-text channel");
    }

    const options = typeof content === "string" ? { content } : content;

    try {
      const message = await this.client.rest.messages.sendMessage(
        this.id,
        options,
      );
      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  /**
   * Creates a webhook in the channel.
   *
   * @param options - Options for the webhook
   * @returns A promise resolving to the Webhook instance
   */
  async createWebhook(options: WebhookCreateOptions): Promise<Webhook> {
    if (!this.isGuildChannel) {
      throw new Error("Webhooks can only be created in guild channels");
    }

    try {
      const webhook = await this.client.rest.webhooks.createWebhook(
        this.id,
        options,
      );
      return new Webhook(this.client, webhook);
    } catch (error) {
      throw new Error(`Failed to create webhook: ${error}`);
    }
  }

  /**
   * Fetches all webhooks in the channel.
   *
   * @returns A promise resolving to an array of Webhook instances
   */
  async fetchWebhooks(): Promise<Webhook[]> {
    if (!this.isGuildChannel) {
      throw new Error("Cannot fetch webhooks for non-guild channels");
    }

    try {
      const webhooks = await this.client.rest.webhooks.fetchChannelWebhooks(
        this.id,
      );
      return webhooks.map((webhook) => new Webhook(this.client, webhook));
    } catch (error) {
      throw new Error(`Failed to fetch webhooks: ${error}`);
    }
  }

  /**
   * Creates an invite to the channel.
   *
   * @param options - Options for the invite
   * @returns A promise resolving to the InviteEntity
   */
  async createInvite(
    options: ChannelInviteCreateOptions,
  ): Promise<InviteEntity> {
    if (!this.isGuildChannel) {
      throw new Error("Cannot create invites for non-guild channels");
    }

    try {
      return await this.client.rest.channels.createChannelInvite(
        this.id,
        options,
      );
    } catch (error) {
      throw new Error(`Failed to create invite: ${error}`);
    }
  }

  /**
   * Fetches all invites for the channel.
   *
   * @returns A promise resolving to an array of InviteEntity objects
   */
  async fetchInvites(): Promise<InviteEntity[]> {
    if (!this.isGuildChannel) {
      throw new Error("Cannot fetch invites for non-guild channels");
    }

    try {
      return await this.client.rest.channels.fetchChannelInvites(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch invites: ${error}`);
    }
  }

  /**
   * Edits the channel.
   *
   * @param options - Options to update
   * @param reason - Reason for the edit
   * @returns A promise resolving to the updated Channel instance
   */
  async edit(
    options: GuildChannelUpdateOptions,
    reason?: string,
  ): Promise<AnyChannel> {
    try {
      const channelData = await this.client.rest.channels.updateChannel(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, channelData);
    } catch (error) {
      throw new Error(`Failed to edit channel: ${error}`);
    }
  }

  /**
   * Deletes the channel.
   *
   * @param reason - Reason for the deletion
   * @returns A promise resolving to the deleted Channel instance
   */
  async delete(reason?: string): Promise<AnyChannel> {
    try {
      const channelData = await this.client.rest.channels.deleteChannel(
        this.id,
        reason,
      );
      return channelFactory(this.client, channelData);
    } catch (error) {
      throw new Error(`Failed to delete channel: ${error}`);
    }
  }

  /**
   * Updates the channel's permission overwrites for a user or role.
   *
   * @param id - ID of the user or role
   * @param options - Permission options to set
   * @param reason - Reason for the update
   * @returns A promise resolving when the permissions are updated
   */
  async updatePermissions(
    id: Snowflake,
    options: ChannelPermissionUpdateOptions,
    reason?: string,
  ): Promise<void> {
    if (!this.isGuildChannel) {
      throw new Error("Cannot update permissions for non-guild channels");
    }

    try {
      await this.client.rest.channels.editChannelPermissions(
        this.id,
        id,
        options,
        reason,
      );
    } catch (error) {
      throw new Error(`Failed to update permissions: ${error}`);
    }
  }

  /**
   * Deletes a permission overwrite for a user or role.
   *
   * @param id - ID of the user or role
   * @param reason - Reason for the deletion
   * @returns A promise resolving when the permission overwrite is deleted
   */
  async deletePermission(id: Snowflake, reason?: string): Promise<void> {
    if (!this.isGuildChannel) {
      throw new Error("Cannot delete permissions for non-guild channels");
    }

    try {
      await this.client.rest.channels.deleteChannelPermission(
        this.id,
        id,
        reason,
      );
    } catch (error) {
      throw new Error(`Failed to delete permission: ${error}`);
    }
  }

  /**
   * Triggers a typing indicator in the channel.
   *
   * @returns A promise resolving when the typing indicator is triggered
   */
  async startTyping(): Promise<void> {
    if (!this.isTextBased) {
      throw new Error("Cannot trigger typing in a non-text channel");
    }

    try {
      await this.client.rest.channels.startTyping(this.id);
    } catch (error) {
      throw new Error(`Failed to start typing: ${error}`);
    }
  }

  /**
   * Pins a message in the channel.
   *
   * @param messageId - ID of the message to pin
   * @param reason - Reason for pinning the message
   * @returns A promise resolving when the message is pinned
   */
  async pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    if (!this.isTextBased) {
      throw new Error("Cannot pin messages in a non-text channel");
    }

    try {
      await this.client.rest.channels.pinMessage(this.id, messageId, reason);
    } catch (error) {
      throw new Error(`Failed to pin message: ${error}`);
    }
  }

  /**
   * Unpins a message in the channel.
   *
   * @param messageId - ID of the message to unpin
   * @param reason - Reason for unpinning the message
   * @returns A promise resolving when the message is unpinned
   */
  async unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    if (!this.isTextBased) {
      throw new Error("Cannot unpin messages in a non-text channel");
    }

    try {
      await this.client.rest.channels.unpinMessage(this.id, messageId, reason);
    } catch (error) {
      throw new Error(`Failed to unpin message: ${error}`);
    }
  }

  /**
   * Fetches all pinned messages in the channel.
   *
   * @returns A promise resolving to an array of Message instances
   */
  async fetchPinnedMessages(): Promise<Message[]> {
    if (!this.isTextBased) {
      throw new Error("Cannot fetch pinned messages in a non-text channel");
    }

    try {
      const messages = await this.client.rest.channels.fetchPinnedMessages(
        this.id,
      );
      return messages.map((message) => new Message(this.client, message));
    } catch (error) {
      throw new Error(`Failed to fetch pinned messages: ${error}`);
    }
  }

  /**
   * Follows an announcement channel to send messages to a target channel.
   *
   * @param targetChannelId - ID of the channel to send announcements to
   * @returns A promise resolving to a FollowedChannelEntity
   */
  async follow(targetChannelId: Snowflake): Promise<FollowedChannelEntity> {
    if (this.type !== ChannelType.GuildAnnouncement) {
      throw new Error("Only announcement channels can be followed");
    }

    try {
      return await this.client.rest.channels.followAnnouncementChannel(
        this.id,
        targetChannelId,
      );
    } catch (error) {
      throw new Error(`Failed to follow channel: ${error}`);
    }
  }

  /**
   * Formats this channel as a mention string.
   *
   * @returns The formatted channel mention
   */
  override toString(): FormattedChannel {
    return formatChannel(this.id);
  }

  /**
   * Type guard to check if this is a text channel.
   *
   * @returns True if this is a text channel, false otherwise
   */
  isTextChannel(): this is GuildTextChannel {
    return this.type === ChannelType.GuildText;
  }

  /**
   * Type guard to check if this is a DM channel.
   *
   * @returns True if this is a DM channel, false otherwise
   */
  isDmChannel(): this is DmChannel {
    return this.type === ChannelType.Dm;
  }

  /**
   * Type guard to check if this is a voice channel.
   *
   * @returns True if this is a voice channel, false otherwise
   */
  isVoiceChannel(): this is GuildVoiceChannel {
    return this.type === ChannelType.GuildVoice;
  }

  /**
   * Type guard to check if this is a group DM channel.
   *
   * @returns True if this is a group DM channel, false otherwise
   */
  isGroupDmChannel(): this is GroupDmChannel {
    return this.type === ChannelType.GroupDm;
  }

  /**
   * Type guard to check if this is a category channel.
   *
   * @returns True if this is a category channel, false otherwise
   */
  isCategoryChannel(): this is GuildCategoryChannel {
    return this.type === ChannelType.GuildCategory;
  }

  /**
   * Type guard to check if this is an announcement channel.
   *
   * @returns True if this is an announcement channel, false otherwise
   */
  isAnnouncementChannel(): this is GuildAnnouncementChannel {
    return this.type === ChannelType.GuildAnnouncement;
  }

  /**
   * Type guard to check if this is a stage voice channel.
   *
   * @returns True if this is a stage voice channel, false otherwise
   */
  isStageChannel(): this is GuildStageVoiceChannel {
    return this.type === ChannelType.GuildStageVoice;
  }

  /**
   * Type guard to check if this is a forum channel.
   *
   * @returns True if this is a forum channel, false otherwise
   */
  isForumChannel(): this is GuildForumChannel {
    return this.type === ChannelType.GuildForum;
  }

  /**
   * Type guard to check if this is a media channel.
   *
   * @returns True if this is a media channel, false otherwise
   */
  isMediaChannel(): this is GuildMediaChannel {
    return this.type === ChannelType.GuildMedia;
  }

  /**
   * Type guard to check if this is a thread channel.
   *
   * @returns True if this is a thread channel, false otherwise
   */
  isThreadChannel(): this is AnyThreadChannel {
    return this.isThread;
  }

  /**
   * Type guard to check if this is a guild channel.
   *
   * @returns True if this is a guild channel, false otherwise
   */
  isGuildBasedChannel(): this is GuildChannel {
    return this.isGuildChannel;
  }

  /**
   * Type guard to check if this is a private channel.
   *
   * @returns True if this is a private channel, false otherwise
   */
  isPrivateChannel(): this is PrivateChannel {
    return !this.isGuildChannel;
  }
}

/**
 * Mixin interface for channels within a guild context.
 *
 * This interface extends the base Channel class with guild-specific properties
 * and functionalities. Channels implementing this interface are part of a guild
 * and have access to guild-related data.
 */
export interface GuildChannel extends Channel {
  /**
   * The ID of the guild that this channel belongs to.
   */
  readonly guildId: Snowflake;

  /**
   * The position of this channel in the guild's channel list.
   */
  readonly position: number;

  /**
   * The permission overwrites for this channel.
   */
  readonly permissionOverwrites: OverwriteEntity[];
}

/**
 * Mixin interface for private channels (DMs and group DMs).
 *
 * This interface extends the base Channel class with properties specific
 * to direct communication channels between users.
 */
export interface PrivateChannel extends Channel {
  /**
   * The recipients of this private channel.
   */
  readonly recipients: User[];
}

/**
 * Mixin interface for text-based channels.
 *
 * This interface extends the base Channel class with properties and methods
 * specific to channels that can send and receive text messages.
 */
export interface TextBasedChannel extends Channel {
  /**
   * The ID of the last message sent in this channel.
   */
  readonly lastMessageId: Snowflake | null;

  /**
   * The rate limit per user (slowmode) for this channel.
   */
  readonly rateLimitPerUser: number;

  /**
   * Sends a message to the channel.
   *
   * @param content - Content of the message to send
   * @returns A promise resolving to the sent Message instance
   */
  send(content: string | CreateMessageSchema): Promise<Message>;

  /**
   * Fetches messages from the channel.
   *
   * @param query - Optional parameters for fetching messages
   * @returns A promise resolving to an array of Message instances
   */
  fetchMessages(query?: MessagesFetchParams): Promise<Message[]>;

  /**
   * Fetches a specific message by ID.
   *
   * @param messageId - ID of the message to fetch
   * @returns A promise resolving to the Message instance
   */
  fetchMessage(messageId: Snowflake): Promise<Message>;
}

/**
 * Mixin interface for voice-based channels.
 *
 * This interface extends the base Channel class with properties and methods
 * specific to channels that support voice communication.
 */
export interface VoiceBasedChannel extends Channel {
  /**
   * The bitrate of the voice channel in bits per second.
   */
  readonly bitrate: number;

  /**
   * The user limit of the voice channel.
   */
  readonly userLimit: number;

  /**
   * The voice region ID for the voice channel.
   */
  readonly rtcRegion: string | null;
}

/**
 * Interface for thread-specific functionality.
 *
 * This interface extends the TextBasedChannel interface with properties and methods
 * specific to thread channels.
 */
// @ts-expect-error
export interface ThreadChannel extends TextBasedChannel {
  /**
   * The thread-specific metadata.
   */
  readonly threadMetadata: ThreadMetadataEntity;

  /**
   * The ID of the parent channel for this thread.
   */
  readonly parentId: Snowflake;

  /**
   * The message count in this thread.
   */
  readonly messageCount: number;

  /**
   * The member count in this thread.
   */
  readonly memberCount: number;

  /**
   * The thread member object for the current user if they've joined the thread.
   */
  readonly member: ThreadMemberEntity;

  /**
   * The total number of messages ever sent in this thread.
   */
  readonly totalMessageSent: number;

  /**
   * Joins the thread.
   *
   * @returns A promise resolving when the thread is joined
   */
  join(): Promise<void>;

  /**
   * Leaves the thread.
   *
   * @returns A promise resolving when the thread is left
   */
  leave(): Promise<void>;

  /**
   * Adds a member to the thread.
   *
   * @param userId - ID of the user to add
   * @returns A promise resolving when the member is added
   */
  addMember(userId: Snowflake): Promise<void>;

  /**
   * Removes a member from the thread.
   *
   * @param userId - ID of the user to remove
   * @returns A promise resolving when the member is removed
   */
  removeMember(userId: Snowflake): Promise<void>;
}

/**
 * Represents a text channel within a guild.
 *
 * Guild text channels are the standard communication channels in a server,
 * allowing members to send messages, embed content, and share files.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildTextChannel
  extends Channel
  implements GuildChannel, TextBasedChannel
{
  /**
   * The type of this channel, always GuildText (0).
   *
   * @returns The channel type (GuildText)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildText {
    return ChannelType.GuildText;
  }

  /**
   * Creates a thread from a message in this channel.
   *
   * @param messageId - ID of the message to create a thread from
   * @param options - Options for the thread
   * @param reason - Reason for creating the thread
   * @returns A promise resolving to the created thread
   */
  async createThreadFromMessage(
    messageId: Snowflake,
    options: ThreadFromMessageCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannel> {
    try {
      const thread = await this.client.rest.channels.createThreadFromMessage(
        this.id,
        messageId,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as AnyThreadChannel;
    } catch (error) {
      throw new Error(`Failed to create thread from message: ${error}`);
    }
  }

  /**
   * Creates a new thread in this channel without attaching it to a message.
   *
   * @param options - Options for the thread
   * @param reason - Reason for creating the thread
   * @returns A promise resolving to the created thread
   */
  async createThread(
    options: ThreadCreateOptions,
    reason?: string,
  ): Promise<AnyThreadChannel> {
    try {
      const thread = await this.client.rest.channels.createThread(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as AnyThreadChannel;
    } catch (error) {
      throw new Error(`Failed to create thread: ${error}`);
    }
  }

  /**
   * Sets the channel topic.
   *
   * @param topic - New topic for the channel
   * @param reason - Reason for updating the topic
   * @returns A promise resolving to the updated channel
   */
  async setTopic(
    topic: string | null,
    reason?: string,
  ): Promise<GuildTextChannel> {
    try {
      const updatedChannel = await this.edit({ topic }, reason);
      return updatedChannel as GuildTextChannel;
    } catch (error) {
      throw new Error(`Failed to set topic: ${error}`);
    }
  }

  /**
   * Sets the slowmode (rate limit per user) for the channel.
   *
   * @param seconds - Number of seconds users must wait between messages
   * @param reason - Reason for updating the rate limit
   * @returns A promise resolving to the updated channel
   */
  async setRateLimitPerUser(
    seconds: number,
    reason?: string,
  ): Promise<GuildTextChannel> {
    try {
      const updatedChannel = await this.edit(
        { rate_limit_per_user: seconds },
        reason,
      );
      return updatedChannel as GuildTextChannel;
    } catch (error) {
      throw new Error(`Failed to set rate limit: ${error}`);
    }
  }

  /**
   * Sets whether this channel is NSFW.
   *
   * @param nsfw - Whether the channel should be NSFW
   * @param reason - Reason for updating the NSFW status
   * @returns A promise resolving to the updated channel
   */
  async setNsfw(nsfw: boolean, reason?: string): Promise<GuildTextChannel> {
    try {
      const updatedChannel = await this.edit({ nsfw }, reason);
      return updatedChannel as GuildTextChannel;
    } catch (error) {
      throw new Error(`Failed to set NSFW status: ${error}`);
    }
  }
}

/**
 * Represents a direct message channel between two users.
 *
 * DM channels are private conversations between the client user and another user.
 * They are not associated with any guild and have different properties from guild channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class DmChannel
  extends Channel
  implements PrivateChannel, TextBasedChannel
{
  /**
   * The type of this channel, always Dm (1).
   *
   * @returns The channel type (Dm)
   */
  // @ts-expect-error
  override get type(): ChannelType.Dm {
    return ChannelType.Dm;
  }

  /**
   * Gets the recipient user of this DM channel.
   *
   * @returns The recipient User instance
   */
  get recipient(): User | undefined {
    if (!this.recipients || this.recipients.length === 0) {
      return undefined;
    }
    return this.recipients[0];
  }

  /**
   * Closes this DM channel.
   *
   * @returns A promise resolving to the closed channel
   */
  async close(): Promise<DmChannel> {
    try {
      const channelData = await this.client.rest.channels.deleteChannel(
        this.id,
      );
      return new DmChannel(this.client, channelData);
    } catch (error) {
      throw new Error(`Failed to close DM channel: ${error}`);
    }
  }
}

/**
 * Represents a voice channel within a guild.
 *
 * Guild voice channels allow members to communicate via voice and video,
 * with features like user limits, bitrate settings, and region selection.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildVoiceChannel
  extends Channel
  implements GuildChannel, VoiceBasedChannel
{
  /**
   * The type of this channel, always GuildVoice (2).
   *
   * @returns The channel type (GuildVoice)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildVoice {
    return ChannelType.GuildVoice;
  }

  /**
   * Sets the bitrate for this voice channel.
   *
   * @param bitrate - New bitrate in bits per second
   * @param reason - Reason for updating the bitrate
   * @returns A promise resolving to the updated channel
   */
  async setBitrate(
    bitrate: number,
    reason?: string,
  ): Promise<GuildVoiceChannel> {
    try {
      const updatedChannel = await this.edit({ bitrate }, reason);
      return updatedChannel as GuildVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set bitrate: ${error}`);
    }
  }

  /**
   * Sets the user limit for this voice channel.
   *
   * @param userLimit - New user limit (0 for unlimited)
   * @param reason - Reason for updating the user limit
   * @returns A promise resolving to the updated channel
   */
  async setUserLimit(
    userLimit: number,
    reason?: string,
  ): Promise<GuildVoiceChannel> {
    try {
      const updatedChannel = await this.edit({ user_limit: userLimit }, reason);
      return updatedChannel as GuildVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set user limit: ${error}`);
    }
  }

  /**
   * Sets the RTC region for this voice channel.
   *
   * @param rtcRegion - New RTC region (null for automatic)
   * @param reason - Reason for updating the RTC region
   * @returns A promise resolving to the updated channel
   */
  async setRtcRegion(
    rtcRegion: string | null,
    reason?: string,
  ): Promise<GuildVoiceChannel> {
    try {
      const updatedChannel = await this.edit({ rtc_region: rtcRegion }, reason);
      return updatedChannel as GuildVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set RTC region: ${error}`);
    }
  }

  /**
   * Sets the video quality mode for this voice channel.
   *
   * @param videoQualityMode - New video quality mode
   * @param reason - Reason for updating the video quality mode
   * @returns A promise resolving to the updated channel
   */
  async setVideoQualityMode(
    videoQualityMode: VideoQualityMode,
    reason?: string,
  ): Promise<GuildVoiceChannel> {
    try {
      const updatedChannel = await this.edit(
        { video_quality_mode: videoQualityMode },
        reason,
      );
      return updatedChannel as GuildVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set video quality mode: ${error}`);
    }
  }
}

/**
 * Represents a group direct message channel.
 *
 * Group DM channels are private conversations between multiple users.
 * They are not associated with any guild and have different properties from guild channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GroupDmChannel
  extends Channel
  implements PrivateChannel, TextBasedChannel
{
  /**
   * The type of this channel, always GroupDm (3).
   *
   * @returns The channel type (GroupDm)
   */
  // @ts-expect-error
  override get type(): ChannelType.GroupDm {
    return ChannelType.GroupDm;
  }

  /**
   * Gets the recipient users of this group DM channel.
   *
   * @returns An array of User instances
   */
  get users(): User[] {
    if (!this.recipients) {
      return [];
    }
    return this.recipients;
  }

  /**
   * Adds a user to this group DM.
   *
   * @param userId - ID of the user to add
   * @param options - Options for the user
   * @returns A promise resolving when the user is added
   */
  async addUser(
    userId: Snowflake,
    options: GroupDmCreateOptions,
  ): Promise<void> {
    try {
      await this.client.rest.channels.addGroupDmRecipient(
        this.id,
        userId,
        options,
      );
    } catch (error) {
      throw new Error(`Failed to add user to group DM: ${error}`);
    }
  }

  /**
   * Removes a user from this group DM.
   *
   * @param userId - ID of the user to remove
   * @returns A promise resolving when the user is removed
   */
  async removeUser(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeGroupDmRecipient(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove user from group DM: ${error}`);
    }
  }

  /**
   * Updates this group DM's name and/or icon.
   *
   * @param options - Options to update
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated channel
   */
  override async edit(
    options: GuildChannelUpdateOptions,
    reason?: string,
  ): Promise<GroupDmChannel> {
    try {
      const channelData = await this.client.rest.channels.updateChannel(
        this.id,
        options,
        reason,
      );
      return new GroupDmChannel(this.client, channelData);
    } catch (error) {
      throw new Error(`Failed to edit group DM: ${error}`);
    }
  }
}

/**
 * Represents a category channel within a guild.
 *
 * Category channels are used to organize other channels into groups.
 * They cannot contain messages but serve as containers for other guild channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildCategoryChannel extends Channel implements GuildChannel {
  /**
   * The type of this channel, always GuildCategory (4).
   *
   * @returns The channel type (GuildCategory)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildCategory {
    return ChannelType.GuildCategory;
  }

  /**
   * Fetches all channels in this category.
   *
   * @returns A promise resolving to an array of channel instances
   */
  async fetchChildren(): Promise<Channel[]> {
    if (!this.guildId) {
      throw new Error(
        "Cannot fetch children for a category without a guild ID",
      );
    }

    try {
      const guildChannels = await this.client.rest.guilds.fetchChannels(
        this.guildId,
      );

      const childChannels = guildChannels.filter(
        (channel) => "parent_id" in channel && channel.parent_id === this.id,
      );

      return childChannels.map((channel) =>
        channelFactory(this.client, channel),
      );
    } catch (error) {
      throw new Error(`Failed to fetch category children: ${error}`);
    }
  }

  /**
   * Creates a channel within this category.
   *
   * @param options - Options for the new channel
   * @param reason - Reason for creating the channel
   * @returns A promise resolving to the created channel
   */
  async createChannel(
    options: AnyChannelEntity,
    reason?: string,
  ): Promise<Channel> {
    if (!this.guildId) {
      throw new Error(
        "Cannot create a channel in a category without a guild ID",
      );
    }

    try {
      // Add this category as the parent
      if ("parent_id" in options) {
        options.parent_id = this.id;
      }

      const channelData = await this.client.rest.guilds.createGuildChannel(
        this.guildId,
        options,
        reason,
      );

      return channelFactory(this.client, channelData);
    } catch (error) {
      throw new Error(`Failed to create channel in category: ${error}`);
    }
  }
}

/**
 * Represents an announcement channel (news channel) within a guild.
 *
 * Announcement channels are similar to text channels but allow messages
 * to be published and followed by other servers.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildAnnouncementChannel
  extends Channel
  implements GuildChannel, TextBasedChannel
{
  /**
   * The type of this channel, always GuildAnnouncement (5).
   *
   * @returns The channel type (GuildAnnouncement)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildAnnouncement {
    return ChannelType.GuildAnnouncement;
  }

  /**
   * Creates a thread from a message in this announcement channel.
   *
   * @param messageId - ID of the message to create a thread from
   * @param options - Options for the thread
   * @param reason - Reason for creating the thread
   * @returns A promise resolving to the created thread
   */
  async createThreadFromMessage(
    messageId: Snowflake,
    options: ThreadFromMessageCreateOptions,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    try {
      const thread = await this.client.rest.channels.createThreadFromMessage(
        this.id,
        messageId,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as AnnouncementThreadChannel;
    } catch (error) {
      throw new Error(`Failed to create thread from message: ${error}`);
    }
  }

  /**
   * Publishes a message to following channels.
   *
   * @param messageId - ID of the message to publish
   * @returns A promise resolving to the published message
   */
  async publishMessage(messageId: Snowflake): Promise<Message> {
    try {
      const message = await this.client.rest.messages.crosspostMessage(
        this.id,
        messageId,
      );
      return new Message(this.client, message);
    } catch (error) {
      throw new Error(`Failed to publish message: ${error}`);
    }
  }
}

/**
 * Represents a thread in an announcement channel.
 *
 * Announcement threads are connected to specific messages in an announcement channel
 * and provide a space for focused discussion about that announcement.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class AnnouncementThreadChannel
  extends Channel
  implements GuildChannel, ThreadChannel
{
  /**
   * The type of this channel, always AnnouncementThread (10).
   *
   * @returns The channel type (AnnouncementThread)
   */
  // @ts-expect-error
  override get type(): ChannelType.AnnouncementThread {
    return ChannelType.AnnouncementThread;
  }

  /**
   * Joins this thread.
   *
   * @returns A promise resolving when the thread is joined
   */
  async join(): Promise<void> {
    try {
      await this.client.rest.channels.joinThread(this.id);
    } catch (error) {
      throw new Error(`Failed to join thread: ${error}`);
    }
  }

  /**
   * Leaves this thread.
   *
   * @returns A promise resolving when the thread is left
   */
  async leave(): Promise<void> {
    try {
      await this.client.rest.channels.leaveThread(this.id);
    } catch (error) {
      throw new Error(`Failed to leave thread: ${error}`);
    }
  }

  /**
   * Adds a member to this thread.
   *
   * @param userId - ID of the user to add
   * @returns A promise resolving when the member is added
   */
  async addMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.addThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to add member to thread: ${error}`);
    }
  }

  /**
   * Removes a member from this thread.
   *
   * @param userId - ID of the user to remove
   * @returns A promise resolving when the member is removed
   */
  async removeMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove member from thread: ${error}`);
    }
  }

  /**
   * Fetches members of this thread.
   *
   * @returns A promise resolving to an array of thread member objects
   */
  async fetchMembers(): Promise<ThreadMemberEntity[]> {
    try {
      return await this.client.rest.channels.fetchThreadMembers(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch thread members: ${error}`);
    }
  }

  /**
   * Updates this thread with new properties.
   *
   * @param options - Properties to update
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  override async edit(
    options: ThreadUpdateOptions,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    try {
      const thread = await this.client.rest.channels.updateChannel(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as AnnouncementThreadChannel;
    } catch (error) {
      throw new Error(`Failed to edit thread: ${error}`);
    }
  }

  /**
   * Archives or unarchives this thread.
   *
   * @param archived - Whether the thread should be archived
   * @param reason - Reason for the action
   * @returns A promise resolving to the updated thread
   */
  setArchived(
    archived: boolean,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    return this.edit({ archived }, reason);
  }

  /**
   * Sets the auto-archive duration for this thread.
   *
   * @param duration - The auto-archive duration in minutes
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  setAutoArchiveDuration(
    duration: AutoArchiveDuration,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    return this.edit({ auto_archive_duration: duration }, reason);
  }
}

/**
 * Represents a public thread in a text or forum channel.
 *
 * Public threads are visible to everyone who can see the channel
 * and can be joined by any member with access to the channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class PublicThreadChannel
  extends Channel
  implements GuildChannel, ThreadChannel
{
  /**
   * The type of this channel, always PublicThread (11).
   *
   * @returns The channel type (PublicThread)
   */
  // @ts-expect-error
  override get type(): ChannelType.PublicThread {
    return ChannelType.PublicThread;
  }

  /**
   * Joins this thread.
   *
   * @returns A promise resolving when the thread is joined
   */
  async join(): Promise<void> {
    try {
      await this.client.rest.channels.joinThread(this.id);
    } catch (error) {
      throw new Error(`Failed to join thread: ${error}`);
    }
  }

  /**
   * Leaves this thread.
   *
   * @returns A promise resolving when the thread is left
   */
  async leave(): Promise<void> {
    try {
      await this.client.rest.channels.leaveThread(this.id);
    } catch (error) {
      throw new Error(`Failed to leave thread: ${error}`);
    }
  }

  /**
   * Adds a member to this thread.
   *
   * @param userId - ID of the user to add
   * @returns A promise resolving when the member is added
   */
  async addMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.addThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to add member to thread: ${error}`);
    }
  }

  /**
   * Removes a member from this thread.
   *
   * @param userId - ID of the user to remove
   * @returns A promise resolving when the member is removed
   */
  async removeMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove member from thread: ${error}`);
    }
  }

  /**
   * Fetches members of this thread.
   *
   * @returns A promise resolving to an array of thread member objects
   */
  async fetchMembers(): Promise<ThreadMemberEntity[]> {
    try {
      return await this.client.rest.channels.fetchThreadMembers(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch thread members: ${error}`);
    }
  }

  /**
   * Updates this thread with new properties.
   *
   * @param options - Properties to update
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  override async edit(
    options: ThreadUpdateOptions,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    try {
      const thread = await this.client.rest.channels.updateChannel(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as PublicThreadChannel;
    } catch (error) {
      throw new Error(`Failed to edit thread: ${error}`);
    }
  }

  /**
   * Archives or unarchives this thread.
   *
   * @param archived - Whether the thread should be archived
   * @param reason - Reason for the action
   * @returns A promise resolving to the updated thread
   */
  setArchived(
    archived: boolean,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    return this.edit({ archived }, reason);
  }

  /**
   * Sets the auto-archive duration for this thread.
   *
   * @param duration - The auto-archive duration in minutes
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  setAutoArchiveDuration(
    duration: AutoArchiveDuration,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    return this.edit({ auto_archive_duration: duration }, reason);
  }

  /**
   * Sets the rate limit per user (slowmode) for this thread.
   *
   * @param seconds - The rate limit in seconds
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  setRateLimitPerUser(
    seconds: number,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    return this.edit({ rate_limit_per_user: seconds }, reason);
  }
}

/**
 * Represents a private thread in a text channel.
 *
 * Private threads are only visible to those who are explicitly added to the thread
 * or users with the MANAGE_THREADS permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class PrivateThreadChannel
  extends Channel
  implements GuildChannel, ThreadChannel
{
  /**
   * The type of this channel, always PrivateThread (12).
   *
   * @returns The channel type (PrivateThread)
   */
  // @ts-expect-error
  override get type(): ChannelType.PrivateThread {
    return ChannelType.PrivateThread;
  }

  /**
   * Joins this thread.
   *
   * @returns A promise resolving when the thread is joined
   */
  async join(): Promise<void> {
    try {
      await this.client.rest.channels.joinThread(this.id);
    } catch (error) {
      throw new Error(`Failed to join thread: ${error}`);
    }
  }

  /**
   * Leaves this thread.
   *
   * @returns A promise resolving when the thread is left
   */
  async leave(): Promise<void> {
    try {
      await this.client.rest.channels.leaveThread(this.id);
    } catch (error) {
      throw new Error(`Failed to leave thread: ${error}`);
    }
  }

  /**
   * Adds a member to this thread.
   *
   * @param userId - ID of the user to add
   * @returns A promise resolving when the member is added
   */
  async addMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.addThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to add member to thread: ${error}`);
    }
  }

  /**
   * Removes a member from this thread.
   *
   * @param userId - ID of the user to remove
   * @returns A promise resolving when the member is removed
   */
  async removeMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove member from thread: ${error}`);
    }
  }

  /**
   * Fetches members of this thread.
   *
   * @returns A promise resolving to an array of thread member objects
   */
  async fetchMembers(): Promise<ThreadMemberEntity[]> {
    try {
      return await this.client.rest.channels.fetchThreadMembers(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch thread members: ${error}`);
    }
  }

  /**
   * Updates this thread with new properties.
   *
   * @param options - Properties to update
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  override async edit(
    options: ThreadUpdateOptions,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    try {
      const thread = await this.client.rest.channels.updateChannel(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as PrivateThreadChannel;
    } catch (error) {
      throw new Error(`Failed to edit thread: ${error}`);
    }
  }

  /**
   * Archives or unarchives this thread.
   *
   * @param archived - Whether the thread should be archived
   * @param reason - Reason for the action
   * @returns A promise resolving to the updated thread
   */
  setArchived(
    archived: boolean,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ archived }, reason);
  }

  /**
   * Sets the auto-archive duration for this thread.
   *
   * @param duration - The auto-archive duration in minutes
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  setAutoArchiveDuration(
    duration: AutoArchiveDuration,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ auto_archive_duration: duration }, reason);
  }

  /**
   * Sets the rate limit per user (slowmode) for this thread.
   *
   * @param seconds - The rate limit in seconds
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  setRateLimitPerUser(
    seconds: number,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ rate_limit_per_user: seconds }, reason);
  }

  /**
   * Sets whether non-moderators can add other non-moderators to this thread.
   *
   * @param invitable - Whether the thread should be invitable
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated thread
   */
  setInvitable(
    invitable: boolean,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ invitable }, reason);
  }
}

/**
 * Represents a stage channel within a guild.
 *
 * Stage channels are specialized voice channels for hosting presentations,
 * panels, or other speaker-focused events.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildStageVoiceChannel
  extends Channel
  implements GuildChannel, VoiceBasedChannel
{
  /**
   * The type of this channel, always GuildStageVoice (13).
   *
   * @returns The channel type (GuildStageVoice)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildStageVoice {
    return ChannelType.GuildStageVoice;
  }

  /**
   * Sets the topic of this stage channel.
   *
   * @param topic - New topic for the stage
   * @param reason - Reason for updating the topic
   * @returns A promise resolving to the updated channel
   */
  async setTopic(
    topic: string | null,
    reason?: string,
  ): Promise<GuildStageVoiceChannel> {
    try {
      const updatedChannel = await this.edit({ topic }, reason);
      return updatedChannel as GuildStageVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set topic: ${error}`);
    }
  }

  /**
   * Sets the bitrate for this stage channel.
   *
   * @param bitrate - New bitrate in bits per second
   * @param reason - Reason for updating the bitrate
   * @returns A promise resolving to the updated channel
   */
  async setBitrate(
    bitrate: number,
    reason?: string,
  ): Promise<GuildStageVoiceChannel> {
    try {
      const updatedChannel = await this.edit({ bitrate }, reason);
      return updatedChannel as GuildStageVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set bitrate: ${error}`);
    }
  }

  /**
   * Sets the RTC region for this stage channel.
   *
   * @param rtcRegion - New RTC region (null for automatic)
   * @param reason - Reason for updating the RTC region
   * @returns A promise resolving to the updated channel
   */
  async setRtcRegion(
    rtcRegion: string | null,
    reason?: string,
  ): Promise<GuildStageVoiceChannel> {
    try {
      const updatedChannel = await this.edit({ rtc_region: rtcRegion }, reason);
      return updatedChannel as GuildStageVoiceChannel;
    } catch (error) {
      throw new Error(`Failed to set RTC region: ${error}`);
    }
  }
}

/**
 * Represents a forum channel within a guild.
 *
 * Forum channels are structured channels where each post creates a new thread.
 * These channels support tags, sorting options, and other organization features.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildForumChannel extends Channel implements GuildChannel {
  /**
   * The type of this channel, always GuildForum (15).
   *
   * @returns The channel type (GuildForum)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildForum {
    return ChannelType.GuildForum;
  }

  /**
   * Creates a thread in this forum channel.
   *
   * @param options - Options for the new thread
   * @param reason - Reason for creating the thread
   * @returns A promise resolving to the created thread
   */
  async createThread(
    options: ForumThreadCreateOptions,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    try {
      const thread = await this.client.rest.channels.createForumThread(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as PublicThreadChannel;
    } catch (error) {
      throw new Error(`Failed to create forum thread: ${error}`);
    }
  }

  /**
   * Edits the forum channel's settings.
   *
   * @param options - New settings for the channel
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated channel
   */
  override async edit(
    options: Partial<GuildChannelUpdateOptions>,
    reason?: string,
  ): Promise<GuildForumChannel> {
    try {
      const updatedChannel = await super.edit(options, reason);
      return updatedChannel as GuildForumChannel;
    } catch (error) {
      throw new Error(`Failed to edit forum channel: ${error}`);
    }
  }

  /**
   * Sets the available tags for this forum channel.
   *
   * @param tags - Array of forum tags to set
   * @param reason - Reason for updating the tags
   * @returns A promise resolving to the updated channel
   */
  setAvailableTags(
    tags: ForumTagEntity[],
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ available_tags: tags }, reason);
  }

  /**
   * Sets the default reaction emoji for this forum channel.
   *
   * @param emoji - Default reaction emoji to set
   * @param reason - Reason for updating the default reaction
   * @returns A promise resolving to the updated channel
   */
  setDefaultReactionEmoji(
    emoji: DefaultReactionEntity | null,
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ default_reaction_emoji: emoji }, reason);
  }

  /**
   * Sets the default sort order for this forum channel.
   *
   * @param sortOrder - Default sort order to set
   * @param reason - Reason for updating the sort order
   * @returns A promise resolving to the updated channel
   */
  setDefaultSortOrder(
    sortOrder: SortOrderType | null,
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ default_sort_order: sortOrder }, reason);
  }

  /**
   * Sets the default forum layout for this forum channel.
   *
   * @param layout - Default forum layout to set
   * @param reason - Reason for updating the layout
   * @returns A promise resolving to the updated channel
   */
  setDefaultForumLayout(
    layout: ForumLayoutType,
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ default_forum_layout: layout }, reason);
  }
}

/**
 * Represents a media channel within a guild.
 *
 * Media channels are similar to forum channels but optimized for visual content.
 * Each post creates a new thread, with an emphasis on images and videos.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildMediaChannel extends Channel implements GuildChannel {
  /**
   * The type of this channel, always GuildMedia (16).
   *
   * @returns The channel type (GuildMedia)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildMedia {
    return ChannelType.GuildMedia;
  }

  /**
   * Creates a thread in this media channel.
   *
   * @param options - Options for the new thread
   * @param reason - Reason for creating the thread
   * @returns A promise resolving to the created thread
   */
  async createThread(
    options: ForumThreadCreateOptions,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    try {
      const thread = await this.client.rest.channels.createForumThread(
        this.id,
        options,
        reason,
      );
      return channelFactory(this.client, thread) as PublicThreadChannel;
    } catch (error) {
      throw new Error(`Failed to create media thread: ${error}`);
    }
  }

  /**
   * Edits the media channel's settings.
   *
   * @param options - New settings for the channel
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated channel
   */
  override async edit(
    options: Partial<GuildChannelUpdateOptions>,
    reason?: string,
  ): Promise<GuildMediaChannel> {
    try {
      const updatedChannel = await super.edit(options, reason);
      return updatedChannel as GuildMediaChannel;
    } catch (error) {
      throw new Error(`Failed to edit media channel: ${error}`);
    }
  }

  /**
   * Sets the available tags for this media channel.
   *
   * @param tags - Array of forum tags to set
   * @param reason - Reason for updating the tags
   * @returns A promise resolving to the updated channel
   */
  setAvailableTags(
    tags: ForumTagEntity[],
    reason?: string,
  ): Promise<GuildMediaChannel> {
    return this.edit({ available_tags: tags }, reason);
  }

  /**
   * Sets the default reaction emoji for this media channel.
   *
   * @param emoji - Default reaction emoji to set
   * @param reason - Reason for updating the default reaction
   * @returns A promise resolving to the updated channel
   */
  setDefaultReactionEmoji(
    emoji: DefaultReactionEntity | null,
    reason?: string,
  ): Promise<GuildMediaChannel> {
    return this.edit({ default_reaction_emoji: emoji }, reason);
  }

  /**
   * Sets the default sort order for this media channel.
   *
   * @param sortOrder - Default sort order to set
   * @param reason - Reason for updating the sort order
   * @returns A promise resolving to the updated channel
   */
  setDefaultSortOrder(
    sortOrder: SortOrderType | null,
    reason?: string,
  ): Promise<GuildMediaChannel> {
    return this.edit({ default_sort_order: sortOrder }, reason);
  }

  /**
   * Sets whether to hide media download options in this channel.
   *
   * @param hide - Whether to hide media download options
   * @param reason - Reason for the update
   * @returns A promise resolving to the updated channel
   */
  setHideMediaDownloadOptions(
    hide: boolean,
    reason?: string,
  ): Promise<GuildMediaChannel> {
    if (hide) {
      this.flags.add(ChannelFlags.HideMediaDownloadOptions);
    } else {
      this.flags.remove(ChannelFlags.HideMediaDownloadOptions);
    }

    return this.edit({ flags: Number(this.flags.valueOf()) }, reason);
  }
}

/**
 * Represents a directory channel within a guild.
 *
 * Directory channels are used in Student Hubs to list associated servers.
 * This is a specialized channel type with limited usage.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
// @ts-ignore TODO: Fix this
export class GuildDirectoryChannel extends Channel implements GuildChannel {
  /**
   * The type of this channel, always GuildDirectory (14).
   *
   * @returns The channel type (GuildDirectory)
   */
  // @ts-expect-error
  override get type(): ChannelType.GuildDirectory {
    return ChannelType.GuildDirectory;
  }
}

/**
 * Type alias for any thread-based channel.
 */
export type AnyThreadChannel =
  | AnnouncementThreadChannel
  | PublicThreadChannel
  | PrivateThreadChannel;

/**
 * Type union representing any channel type.
 * Comprehensive union that includes all possible channel types.
 */
export type AnyChannel =
  | GuildTextChannel
  | DmChannel
  | GuildVoiceChannel
  | GroupDmChannel
  | GuildCategoryChannel
  | GuildAnnouncementChannel
  | AnnouncementThreadChannel
  | PublicThreadChannel
  | PrivateThreadChannel
  | GuildStageVoiceChannel
  | GuildForumChannel
  | GuildMediaChannel
  | GuildDirectoryChannel;
