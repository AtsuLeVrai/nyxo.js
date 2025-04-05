import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  type AutoArchiveDuration,
  BitFieldManager,
  ChannelFlags,
  ChannelType,
  type DefaultReactionEntity,
  type DmChannelEntity,
  type FollowedChannelEntity,
  type FormattedChannel,
  type ForumLayoutType,
  type ForumTagEntity,
  type GroupDmChannelEntity,
  type GuildAnnouncementChannelEntity,
  type GuildCategoryChannelEntity,
  type GuildForumChannelEntity,
  type GuildMediaChannelEntity,
  type GuildStageVoiceChannelEntity,
  type GuildTextChannelEntity,
  type GuildVoiceChannelEntity,
  type InviteEntity,
  type MessageEntity,
  type OverwriteEntity,
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
  type Snowflake,
  type SortOrderType,
  type ThreadMemberEntity,
  type ThreadMetadataEntity,
  type VideoQualityMode,
  formatChannel,
} from "@nyxjs/core";
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
  StartThreadInForumOrMediaChannelSchema,
  StartThreadWithoutMessageSchema,
} from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Base Channel class representing Discord channels.
 *
 * This serves as the base class for all specific channel types and provides
 * common functionality and properties shared across all channel types.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel}
 */
export class Channel<
  T extends AnyChannelEntity = AnyChannelEntity,
> extends BaseClass<T> {
  /**
   * The unique ID of this channel
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The type of this channel
   */
  get type(): ChannelType {
    return this.data.type;
  }

  /**
   * The channel flags as a BitFieldManager
   */
  get flags(): BitFieldManager<ChannelFlags> {
    const flagsValue =
      "flags" in this.data && this.data.flags !== undefined
        ? this.data.flags
        : 0;
    return new BitFieldManager<ChannelFlags>(BigInt(flagsValue));
  }

  /**
   * The computed permissions for the invoking user in the channel, if applicable
   */
  get permissions(): string | undefined {
    return this.data.permissions;
  }

  /**
   * Returns a mention string for the channel
   *
   * @returns A channel mention string in the format `<#ID>`
   */
  get mention(): FormattedChannel {
    return formatChannel(this.id);
  }

  /**
   * Fetches this channel from the API, updating the current instance with fresh data
   *
   * @returns Promise resolving to this channel with updated data
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  async fetch(): Promise<this> {
    const data = await this.client.rest.channels.getChannel(this.id);
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Deletes this channel, or closes it if it's a DM
   *
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the deleted channel
   * @remarks
   * - For guild channels, requires the MANAGE_CHANNELS permission, or MANAGE_THREADS for threads
   * - Deleting a category does not delete its child channels
   * - Fires a Channel Delete Gateway event
   * - Deleting a guild channel cannot be undone
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  async delete(reason?: string): Promise<Channel> {
    const data = await this.client.rest.channels.deleteChannel(this.id, reason);
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Triggers a typing indicator for this channel
   *
   * @returns Promise that resolves when the typing indicator is triggered
   * @remarks
   * - Fires a Typing Start Gateway event
   * - Generally bots should not use this route, but it can be useful when responding
   *   to a command that will take a few seconds of processing
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTyping(): Promise<void> {
    return this.client.rest.channels.triggerTypingIndicator(this.id);
  }

  /**
   * Checks if this channel has a specified flag
   *
   * @param flag - The flag to check for
   * @returns Whether this channel has the specified flag
   */
  hasFlag(flag: keyof typeof ChannelFlags | number): boolean {
    const flagValue =
      typeof flag === "number" ? BigInt(flag) : BigInt(ChannelFlags[flag]);
    return this.flags.has(flagValue);
  }
}

/**
 * Represents a guild text channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class TextChannel extends Channel<GuildTextChannelEntity> {
  /**
   * The type of this channel (always GuildText)
   */
  override get type(): ChannelType.GuildText {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * The ID of the parent category or text channel for threads, if applicable
   */
  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  /**
   * The topic of this channel
   */
  get topic(): string | undefined {
    return this.data.topic;
  }

  /**
   * Whether this channel is NSFW
   */
  get nsfw(): boolean | undefined {
    return this.data.nsfw;
  }

  /**
   * The ID of the last message sent in this channel
   */
  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  /**
   * The slowmode rate limit per user in seconds
   */
  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  /**
   * The timestamp of the last pinned message
   */
  get lastPinTimestamp(): Date | null | undefined {
    if (this.data.last_pin_timestamp) {
      return new Date(this.data.last_pin_timestamp);
    }
    return null;
  }

  /**
   * The default auto-archive duration for newly created threads
   */
  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  /**
   * Modifies this text channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<TextChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<TextChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets a list of invites for this channel
   *
   * @returns Promise resolving to an array of invite objects
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getInvites(): Promise<InviteEntity[]> {
    return this.client.rest.channels.getChannelInvites(this.id);
  }

  /**
   * Creates a new invite for this channel
   *
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created invite
   * @remarks
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite(
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.client.rest.channels.createChannelInvite(
      this.id,
      options,
      reason,
    );
  }

  /**
   * Gets all pinned messages in this channel
   *
   * @returns Promise resolving to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(): Promise<MessageEntity[]> {
    return this.client.rest.channels.getPinnedMessages(this.id);
  }

  /**
   * Pins a message in this channel
   *
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is pinned
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * - Maximum of 50 pinned messages per channel
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.pinMessage(this.id, messageId, reason);
  }

  /**
   * Unpins a message in this channel
   *
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is unpinned
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.unpinMessage(this.id, messageId, reason);
  }

  /**
   * Creates a new thread from a message in this channel
   *
   * @param messageId - ID of the message to start the thread from
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created thread channel
   * @remarks
   * - Fires a Thread Create and a Message Update Gateway event
   * - Creates a PUBLIC_THREAD
   * - The thread ID will be the same as the source message ID
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  async createThreadFromMessage(
    messageId: Snowflake,
    options: StartThreadFromMessageSchema,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    const data = await this.client.rest.channels.startThreadFromMessage(
      this.id,
      messageId,
      options,
      reason,
    );
    return new PublicThreadChannel(
      this.client,
      data as PublicThreadChannelEntity,
    );
  }

  /**
   * Creates a new thread that is not connected to an existing message
   *
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created thread channel
   * @remarks
   * - Fires a Thread Create Gateway event
   * - By default creates a PRIVATE_THREAD if type is not specified
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  async createThread(
    options: StartThreadWithoutMessageSchema,
    reason?: string,
  ): Promise<PublicThreadChannel | PrivateThreadChannel> {
    const data = await this.client.rest.channels.startThreadWithoutMessage(
      this.id,
      options,
      reason,
    );

    if (data.type === ChannelType.PrivateThread) {
      return new PrivateThreadChannel(
        this.client,
        data as PrivateThreadChannelEntity,
      );
    }
    return new PublicThreadChannel(
      this.client,
      data as PublicThreadChannelEntity,
    );
  }

  /**
   * Lists public archived threads in this channel
   *
   * @param query - Query parameters for the request
   * @returns Promise resolving to a list of public archived threads
   * @remarks
   * - Returns threads of type PUBLIC_THREAD
   * - Threads are ordered by archive_timestamp in descending order
   * - Requires the READ_MESSAGE_HISTORY permission
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.client.rest.channels.listPublicArchivedThreads(this.id, query);
  }

  /**
   * Lists private archived threads in this channel
   *
   * @param query - Query parameters for the request
   * @returns Promise resolving to a list of private archived threads
   * @remarks
   * - Returns threads of type PRIVATE_THREAD
   * - Threads are ordered by archive_timestamp in descending order
   * - Requires both the READ_MESSAGE_HISTORY and MANAGE_THREADS permissions
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  listPrivateArchivedThreads(
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.client.rest.channels.listPrivateArchivedThreads(this.id, query);
  }

  /**
   * Lists private archived threads in this channel that the current user has joined
   *
   * @param query - Query parameters for the request
   * @returns Promise resolving to a list of joined private archived threads
   * @remarks
   * - Returns threads of type PRIVATE_THREAD that the current user has joined
   * - Threads are ordered by their ID in descending order
   * - Requires the READ_MESSAGE_HISTORY permission
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  listJoinedPrivateArchivedThreads(
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.client.rest.channels.listJoinedPrivateArchivedThreads(
      this.id,
      query,
    );
  }
}

/**
 * Represents a direct message channel between users.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class DmChannel extends Channel<DmChannelEntity> {
  /**
   * The type of this channel (always Dm)
   */
  override get type(): ChannelType.Dm {
    return this.data.type;
  }

  /**
   * The ID of the last message sent in this channel
   */
  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  /**
   * The recipients of this DM
   */
  get recipients(): User[] {
    return this.data.recipients.map((user) => new User(this.client, user));
  }

  /**
   * The timestamp of the last pinned message
   */
  get lastPinTimestamp(): Date | null | undefined {
    if (this.data.last_pin_timestamp) {
      return new Date(this.data.last_pin_timestamp);
    }
    return null;
  }

  /**
   * Gets all pinned messages in this channel
   *
   * @returns Promise resolving to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(): Promise<MessageEntity[]> {
    return this.client.rest.channels.getPinnedMessages(this.id);
  }

  /**
   * Pins a message in this channel
   *
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is pinned
   * @remarks
   * - Fires a Channel Pins Update Gateway event
   * - Maximum of 50 pinned messages per channel
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.pinMessage(this.id, messageId, reason);
  }

  /**
   * Unpins a message in this channel
   *
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is unpinned
   * @remarks
   * - Fires a Channel Pins Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.unpinMessage(this.id, messageId, reason);
  }
}

/**
 * Represents a guild voice channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class VoiceChannel extends Channel<GuildVoiceChannelEntity> {
  /**
   * The type of this channel (always GuildVoice)
   */
  override get type(): ChannelType.GuildVoice {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * The ID of the parent category or text channel for threads, if applicable
   */
  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  /**
   * The bitrate of this voice channel
   */
  get bitrate(): number {
    return this.data.bitrate;
  }

  /**
   * The user limit of this voice channel
   */
  get userLimit(): number {
    return this.data.user_limit;
  }

  /**
   * The voice region ID for this voice channel
   */
  get rtcRegion(): string | null | undefined {
    return this.data.rtc_region;
  }

  /**
   * The video quality mode of this voice channel
   */
  get videoQualityMode(): VideoQualityMode | undefined {
    return this.data.video_quality_mode;
  }

  /**
   * Whether this channel is NSFW
   */
  get nsfw(): boolean | undefined {
    return this.data.nsfw;
  }

  /**
   * Modifies this voice channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<VoiceChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<VoiceChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets a list of invites for this channel
   *
   * @returns Promise resolving to an array of invite objects
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getInvites(): Promise<InviteEntity[]> {
    return this.client.rest.channels.getChannelInvites(this.id);
  }

  /**
   * Creates a new invite for this channel
   *
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created invite
   * @remarks
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite(
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.client.rest.channels.createChannelInvite(
      this.id,
      options,
      reason,
    );
  }
}

/**
 * Represents a group DM channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class GroupDmChannel extends Channel<GroupDmChannelEntity> {
  /**
   * The type of this channel (always GroupDm)
   */
  override get type(): ChannelType.GroupDm {
    return this.data.type;
  }

  /**
   * The name of this group DM
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The ID of the last message sent in this channel
   */
  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  /**
   * The recipients of this group DM
   */
  get recipients(): User[] {
    return this.data.recipients.map((user) => new User(this.client, user));
  }

  /**
   * The icon hash of this group DM
   */
  get icon(): string | null | undefined {
    return this.data.icon;
  }

  /**
   * The ID of the owner of this group DM
   */
  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  /**
   * The ID of the application that created this group DM, if applicable
   */
  get applicationId(): Snowflake | undefined {
    return this.data.application_id;
  }

  /**
   * The timestamp of the last pinned message
   */
  get lastPinTimestamp(): Date | null | undefined {
    if (this.data.last_pin_timestamp) {
      return new Date(this.data.last_pin_timestamp);
    }
    return null;
  }

  /**
   * Modifies this group DM's settings
   *
   * @param options - Settings to modify
   * @returns Promise resolving to the updated channel
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(options: ModifyChannelGroupDmSchema): Promise<GroupDmChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets all pinned messages in this channel
   *
   * @returns Promise resolving to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(): Promise<MessageEntity[]> {
    return this.client.rest.channels.getPinnedMessages(this.id);
  }

  /**
   * Pins a message in this channel
   *
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is pinned
   * @remarks
   * - Fires a Channel Pins Update Gateway event
   * - Maximum of 50 pinned messages per channel
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.pinMessage(this.id, messageId, reason);
  }

  /**
   * Unpins a message in this channel
   *
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is unpinned
   * @remarks
   * - Fires a Channel Pins Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.unpinMessage(this.id, messageId, reason);
  }

  /**
   * Adds a recipient to this group DM
   *
   * @param userId - ID of the user to add
   * @param options - Access token and nickname details
   * @returns Promise that resolves when the user is added
   * @remarks The access token must have the gdm.join scope
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient}
   */
  addRecipient(
    userId: Snowflake,
    options: AddGroupDmRecipientSchema,
  ): Promise<void> {
    return this.client.rest.channels.groupDmAddRecipient(
      this.id,
      userId,
      options,
    );
  }

  /**
   * Removes a recipient from this group DM
   *
   * @param userId - ID of the user to remove
   * @returns Promise that resolves when the user is removed
   * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient}
   */
  removeRecipient(userId: Snowflake): Promise<void> {
    return this.client.rest.channels.groupDmRemoveRecipient(this.id, userId);
  }
}

/**
 * Represents a guild category channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class CategoryChannel extends Channel<GuildCategoryChannelEntity> {
  /**
   * The type of this channel (always GuildCategory)
   */
  override get type(): ChannelType.GuildCategory {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * Whether this channel is NSFW
   */
  get nsfw(): boolean | undefined {
    return this.data.nsfw;
  }

  /**
   * Modifies this category channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<CategoryChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<CategoryChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }
}

/**
 * Represents a guild announcement channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class AnnouncementChannel extends Channel<GuildAnnouncementChannelEntity> {
  /**
   * The type of this channel (always GuildAnnouncement)
   */
  override get type(): ChannelType.GuildAnnouncement {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * The ID of the parent category or text channel for threads, if applicable
   */
  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  /**
   * The topic of this channel
   */
  get topic(): string | undefined {
    return this.data.topic;
  }

  /**
   * Whether this channel is NSFW
   */
  get nsfw(): boolean | undefined {
    return this.data.nsfw;
  }

  /**
   * The ID of the last message sent in this channel
   */
  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  /**
   * The timestamp of the last pinned message
   */
  get lastPinTimestamp(): Date | null | undefined {
    if (this.data.last_pin_timestamp) {
      return new Date(this.data.last_pin_timestamp);
    }
    return null;
  }

  /**
   * The default auto-archive duration for newly created threads
   */
  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  /**
   * Modifies this announcement channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<AnnouncementChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<AnnouncementChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets a list of invites for this channel
   *
   * @returns Promise resolving to an array of invite objects
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getInvites(): Promise<InviteEntity[]> {
    return this.client.rest.channels.getChannelInvites(this.id);
  }

  /**
   * Creates a new invite for this channel
   *
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created invite
   * @remarks
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite(
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.client.rest.channels.createChannelInvite(
      this.id,
      options,
      reason,
    );
  }

  /**
   * Gets all pinned messages in this channel
   *
   * @returns Promise resolving to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(): Promise<MessageEntity[]> {
    return this.client.rest.channels.getPinnedMessages(this.id);
  }

  /**
   * Pins a message in this channel
   *
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is pinned
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * - Maximum of 50 pinned messages per channel
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.pinMessage(this.id, messageId, reason);
  }

  /**
   * Unpins a message in this channel
   *
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is unpinned
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.unpinMessage(this.id, messageId, reason);
  }

  /**
   * Follows this announcement channel to send messages to a target channel
   *
   * @param webhookChannelId - ID of the target channel that will receive crossposted messages
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the followed channel information
   * @remarks
   * - Requires the MANAGE_WEBHOOKS permission in the target channel
   * - Fires a Webhooks Update Gateway event for the target channel
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  follow(
    webhookChannelId: Snowflake,
    reason?: string,
  ): Promise<FollowedChannelEntity> {
    return this.client.rest.channels.followAnnouncementChannel(
      this.id,
      webhookChannelId,
      reason,
    );
  }

  /**
   * Creates a new thread from a message in this channel
   *
   * @param messageId - ID of the message to start the thread from
   * @param options - Thread configuration options
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created thread channel
   * @remarks
   * - Fires a Thread Create and a Message Update Gateway event
   * - Creates an ANNOUNCEMENT_THREAD
   * - The thread ID will be the same as the source message ID
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  async createThreadFromMessage(
    messageId: Snowflake,
    options: StartThreadFromMessageSchema,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    const data = await this.client.rest.channels.startThreadFromMessage(
      this.id,
      messageId,
      options,
      reason,
    );
    return new AnnouncementThreadChannel(
      this.client,
      data as AnnouncementThreadChannelEntity,
    );
  }

  /**
   * Lists public archived threads in this channel
   *
   * @param query - Query parameters for the request
   * @returns Promise resolving to a list of public archived threads
   * @remarks
   * - Returns threads of type ANNOUNCEMENT_THREAD
   * - Threads are ordered by archive_timestamp in descending order
   * - Requires the READ_MESSAGE_HISTORY permission
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  listPublicArchivedThreads(
    query: ListPublicArchivedThreadsQuerySchema = {},
  ): Promise<ListPublicArchivedThreadsResponseEntity> {
    return this.client.rest.channels.listPublicArchivedThreads(this.id, query);
  }
}

/**
 * Abstract base class for thread channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
abstract class ThreadChannelBase<
  T extends AnyThreadChannelEntity,
> extends Channel<T> {
  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The ID of the parent channel that this thread belongs to
   */
  get parentId(): Snowflake {
    return this.data.parent_id;
  }

  /**
   * The ID of the last message sent in this thread
   */
  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  /**
   * The number of messages in this thread
   */
  get messageCount(): number | undefined {
    return this.data.message_count;
  }

  /**
   * The approximate count of members in this thread
   */
  get memberCount(): number | undefined {
    return this.data.member_count;
  }

  /**
   * The thread-specific metadata
   */
  get threadMetadata(): ThreadMetadataEntity {
    return this.data.thread_metadata;
  }

  /**
   * The thread member object for the current user if they've joined the thread
   */
  get member(): ThreadMemberEntity | undefined {
    return this.data.member;
  }

  /**
   * The slowmode rate limit per user in seconds
   */
  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  /**
   * The timestamp of the last pinned message
   */
  get lastPinTimestamp(): Date | null | undefined {
    if (this.data.last_pin_timestamp) {
      return new Date(this.data.last_pin_timestamp);
    }
    return null;
  }

  /**
   * The total number of messages ever sent in this thread
   */
  get totalMessageSent(): number | undefined {
    return this.data.total_message_sent;
  }

  /**
   * The IDs of tags applied to this thread in a forum or media channel
   */
  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }

  /**
   * The ID of the owner of this thread
   */
  get ownerId(): Snowflake | undefined {
    return this.data.owner_id;
  }

  /**
   * Whether this thread is archived
   */
  get archived(): boolean {
    return this.threadMetadata.archived;
  }

  /**
   * The auto-archive duration of this thread in minutes
   */
  get autoArchiveDuration(): AutoArchiveDuration {
    return this.threadMetadata.auto_archive_duration;
  }

  /**
   * The timestamp when this thread's archive status was last changed
   */
  get archiveTimestamp(): Date {
    return new Date(this.threadMetadata.archive_timestamp);
  }

  /**
   * Whether this thread is locked
   */
  get locked(): boolean {
    return this.threadMetadata.locked;
  }

  /**
   * Whether non-moderators can add other non-moderators to this thread
   */
  get invitable(): boolean | undefined {
    return this.threadMetadata.invitable;
  }

  /**
   * The timestamp when this thread was created
   */
  get createTimestamp(): Date | null | undefined {
    if (this.threadMetadata.create_timestamp) {
      return new Date(this.threadMetadata.create_timestamp);
    }
    return null;
  }

  /**
   * Modifies this thread's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated thread
   * @remarks
   * - Requires various permissions depending on the fields being modified
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelThreadSchema,
    reason?: string,
  ): Promise<this> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets all pinned messages in this thread
   *
   * @returns Promise resolving to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages(): Promise<MessageEntity[]> {
    return this.client.rest.channels.getPinnedMessages(this.id);
  }

  /**
   * Pins a message in this thread
   *
   * @param messageId - ID of the message to pin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is pinned
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * - Maximum of 50 pinned messages per channel
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.pinMessage(this.id, messageId, reason);
  }

  /**
   * Unpins a message in this thread
   *
   * @param messageId - ID of the message to unpin
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the message is unpinned
   * @remarks
   * - Requires the MANAGE_MESSAGES permission
   * - Fires a Channel Pins Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    return this.client.rest.channels.unpinMessage(this.id, messageId, reason);
  }

  /**
   * Joins this thread
   *
   * @returns Promise that resolves when the thread is joined
   * @remarks
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update and Thread Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  join(): Promise<void> {
    return this.client.rest.channels.joinThread(this.id);
  }

  /**
   * Adds a member to this thread
   *
   * @param userId - ID of the user to add
   * @returns Promise that resolves when the member is added
   * @remarks
   * - Requires the ability to send messages in the thread
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addMember(userId: Snowflake): Promise<void> {
    return this.client.rest.channels.addThreadMember(this.id, userId);
  }

  /**
   * Leaves this thread
   *
   * @returns Promise that resolves when the thread is left
   * @remarks
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leave(): Promise<void> {
    return this.client.rest.channels.leaveThread(this.id);
  }

  /**
   * Removes a member from this thread
   *
   * @param userId - ID of the user to remove
   * @returns Promise that resolves when the member is removed
   * @remarks
   * - Requires the MANAGE_THREADS permission, or the creator of the thread if it is a PRIVATE_THREAD
   * - Requires the thread to not be archived
   * - Fires a Thread Members Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeMember(userId: Snowflake): Promise<void> {
    return this.client.rest.channels.removeThreadMember(this.id, userId);
  }

  /**
   * Gets a member of this thread
   *
   * @param userId - ID of the thread member to get
   * @param withMember - Whether to include guild member information
   * @returns Promise resolving to the thread member
   * @remarks Returns a 404 response if the user is not a member of the thread
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getMember(
    userId: Snowflake,
    withMember = false,
  ): Promise<ThreadMemberEntity> {
    return this.client.rest.channels.getThreadMember(
      this.id,
      userId,
      withMember,
    );
  }

  /**
   * Lists members of this thread
   *
   * @param query - Query parameters for the request
   * @returns Promise resolving to an array of thread members
   * @remarks
   * - When with_member is true, results will be paginated and include guild member information
   * - Requires the GUILD_MEMBERS Privileged Intent to be enabled
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  listMembers(
    query: ListThreadMembersQuerySchema = {},
  ): Promise<ThreadMemberEntity[]> {
    return this.client.rest.channels.listThreadMembers(this.id, query);
  }
}

/**
 * Represents a public thread channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class PublicThreadChannel extends ThreadChannelBase<PublicThreadChannelEntity> {
  /**
   * The type of this channel (always PublicThread)
   */
  override get type(): ChannelType.PublicThread {
    return this.data.type;
  }
}

/**
 * Represents a private thread channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class PrivateThreadChannel extends ThreadChannelBase<PrivateThreadChannelEntity> {
  /**
   * The type of this channel (always PrivateThread)
   */
  override get type(): ChannelType.PrivateThread {
    return this.data.type;
  }

  /**
   * Whether non-moderators can add other non-moderators to this thread
   */
  override get invitable(): boolean {
    return Boolean(this.data.invitable);
  }
}

/**
 * Represents an announcement thread channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class AnnouncementThreadChannel extends ThreadChannelBase<AnnouncementThreadChannelEntity> {
  /**
   * The type of this channel (always AnnouncementThread)
   */
  override get type(): ChannelType.AnnouncementThread {
    return this.data.type;
  }
}

/**
 * Represents a guild stage voice channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class StageChannel extends Channel<GuildStageVoiceChannelEntity> {
  /**
   * The type of this channel (always GuildStageVoice)
   */
  override get type(): ChannelType.GuildStageVoice {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * The ID of the parent category or text channel for threads, if applicable
   */
  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  /**
   * The bitrate of this stage channel
   */
  get bitrate(): number {
    return this.data.bitrate;
  }

  /**
   * The user limit of this stage channel
   */
  get userLimit(): number {
    return this.data.user_limit;
  }

  /**
   * The voice region ID for this stage channel
   */
  get rtcRegion(): string | null | undefined {
    return this.data.rtc_region;
  }

  /**
   * The topic of this stage channel
   */
  get topic(): string | undefined {
    return this.data.topic;
  }

  /**
   * Modifies this stage channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<StageChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<StageChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets a list of invites for this channel
   *
   * @returns Promise resolving to an array of invite objects
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getInvites(): Promise<InviteEntity[]> {
    return this.client.rest.channels.getChannelInvites(this.id);
  }

  /**
   * Creates a new invite for this channel
   *
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created invite
   * @remarks
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite(
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.client.rest.channels.createChannelInvite(
      this.id,
      options,
      reason,
    );
  }
}

/**
 * Represents a guild forum channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class ForumChannel extends Channel<GuildForumChannelEntity> {
  /**
   * The type of this channel (always GuildForum)
   */
  override get type(): ChannelType.GuildForum {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * The ID of the parent category or text channel for threads, if applicable
   */
  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  /**
   * The topic of this forum channel
   */
  get topic(): string | undefined {
    return this.data.topic;
  }

  /**
   * Whether this forum channel is NSFW
   */
  get nsfw(): boolean | undefined {
    return this.data.nsfw;
  }

  /**
   * The set of tags that can be used in this forum channel
   */
  get availableTags(): ForumTagEntity[] {
    return this.data.available_tags;
  }

  /**
   * The default emoji for forum thread reactions
   */
  get defaultReactionEmoji(): DefaultReactionEntity | null | undefined {
    return this.data.default_reaction_emoji;
  }

  /**
   * The default slowmode for new threads in this forum channel
   */
  get defaultThreadRateLimitPerUser(): number | undefined {
    return this.data.default_thread_rate_limit_per_user;
  }

  /**
   * The default sort order for forum posts
   */
  get defaultSortOrder(): SortOrderType | null | undefined {
    return this.data.default_sort_order;
  }

  /**
   * The default forum layout view
   */
  get defaultForumLayout(): ForumLayoutType {
    return this.data.default_forum_layout as ForumLayoutType;
  }

  /**
   * Modifies this forum channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<ForumChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<ForumChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets a list of invites for this channel
   *
   * @returns Promise resolving to an array of invite objects
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getInvites(): Promise<InviteEntity[]> {
    return this.client.rest.channels.getChannelInvites(this.id);
  }

  /**
   * Creates a new invite for this channel
   *
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created invite
   * @remarks
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite(
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.client.rest.channels.createChannelInvite(
      this.id,
      options,
      reason,
    );
  }

  /**
   * Creates a new thread in this forum channel
   *
   * @param options - Thread and initial message configuration
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created thread channel
   * @remarks
   * - Fires Thread Create and Message Create Gateway events
   * - Requires the SEND_MESSAGES permission
   * - The type of the created thread is PUBLIC_THREAD
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel}
   */
  async createThread(
    options: StartThreadInForumOrMediaChannelSchema,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    const data =
      await this.client.rest.channels.startThreadInForumOrMediaChannel(
        this.id,
        options,
        reason,
      );
    return new PublicThreadChannel(
      this.client,
      data as unknown as PublicThreadChannelEntity,
    );
  }
}

/**
 * Represents a guild media channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export class MediaChannel extends Channel<GuildMediaChannelEntity> {
  /**
   * The type of this channel (always GuildMedia)
   */
  override get type(): ChannelType.GuildMedia {
    return this.data.type;
  }

  /**
   * The ID of the guild this channel belongs to, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The name of this channel, if applicable
   */
  get name(): string | null | undefined {
    return this.data.name;
  }

  /**
   * The position of this channel in the channel list, if applicable
   */
  get position(): number | undefined {
    return this.data.position;
  }

  /**
   * The permission overwrites for this channel, if applicable
   */
  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
  }

  /**
   * The ID of the parent category or text channel for threads, if applicable
   */
  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  /**
   * The topic of this media channel
   */
  get topic(): string | undefined {
    return this.data.topic;
  }

  /**
   * Whether this media channel is NSFW
   */
  get nsfw(): boolean | undefined {
    return this.data.nsfw;
  }

  /**
   * The set of tags that can be used in this media channel
   */
  get availableTags(): ForumTagEntity[] {
    return this.data.available_tags;
  }

  /**
   * The default emoji for media thread reactions
   */
  get defaultReactionEmoji(): DefaultReactionEntity | null | undefined {
    return this.data.default_reaction_emoji;
  }

  /**
   * The default slowmode for new threads in this media channel
   */
  get defaultThreadRateLimitPerUser(): number | undefined {
    return this.data.default_thread_rate_limit_per_user;
  }

  /**
   * The default sort order for media posts
   */
  get defaultSortOrder(): SortOrderType | null | undefined {
    return this.data.default_sort_order;
  }

  /**
   * Modifies this media channel's settings
   *
   * @param options - Settings to modify
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated channel
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel}
   */
  async modify(
    options: ModifyChannelGuildChannelSchema,
    reason?: string,
  ): Promise<MediaChannel> {
    const data = await this.client.rest.channels.modifyChannel(
      this.id,
      options,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Edits the permission overwrites for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param permissions - The permission overwrites to set
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the permissions are updated
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editPermissions(
    overwriteId: Snowflake,
    permissions: EditChannelPermissionsSchema,
    reason?: string,
  ): Promise<void> {
    return this.client.rest.channels.editChannelPermissions(
      this.id,
      overwriteId,
      permissions,
      reason,
    );
  }

  /**
   * Deletes a permission overwrite for a user or role in this channel
   *
   * @param overwriteId - ID of the user or role
   * @param reason - Optional audit log reason
   * @returns Promise that resolves to this channel
   * @remarks
   * - Requires the MANAGE_ROLES permission
   * - Fires a Channel Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  async deletePermission(
    overwriteId: Snowflake,
    reason?: string,
  ): Promise<MediaChannel> {
    const data = await this.client.rest.channels.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Gets a list of invites for this channel
   *
   * @returns Promise resolving to an array of invite objects
   * @remarks
   * - Requires the MANAGE_CHANNELS permission
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getInvites(): Promise<InviteEntity[]> {
    return this.client.rest.channels.getChannelInvites(this.id);
  }

  /**
   * Creates a new invite for this channel
   *
   * @param options - Settings for the invite
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created invite
   * @remarks
   * - Requires the CREATE_INSTANT_INVITE permission
   * - Fires an Invite Create Gateway event
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite(
    options: CreateChannelInviteSchema,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.client.rest.channels.createChannelInvite(
      this.id,
      options,
      reason,
    );
  }

  /**
   * Creates a new thread in this media channel
   *
   * @param options - Thread and initial message configuration
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the created thread channel
   * @remarks
   * - Fires Thread Create and Message Create Gateway events
   * - Requires the SEND_MESSAGES permission
   * - The type of the created thread is PUBLIC_THREAD
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel}
   */
  async createThread(
    options: StartThreadInForumOrMediaChannelSchema,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    const data =
      await this.client.rest.channels.startThreadInForumOrMediaChannel(
        this.id,
        options,
        reason,
      );
    return new PublicThreadChannel(
      this.client,
      data as unknown as PublicThreadChannelEntity,
    );
  }
}

/**
 * Represents any thread channel type in Discord.
 */
export type AnyThreadChannel =
  | PublicThreadChannel
  | PrivateThreadChannel
  | AnnouncementThreadChannel;

/**
 * Represents any channel type in Discord.
 */
export type AnyChannel =
  | TextChannel
  | DmChannel
  | GroupDmChannel
  | VoiceChannel
  | CategoryChannel
  | AnnouncementChannel
  | AnyThreadChannel
  | StageChannel
  | ForumChannel
  | MediaChannel;
