import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  type AutoArchiveDuration,
  BitField,
  type BitwisePermissionFlags,
  type ChannelEntity,
  ChannelFlags,
  ChannelType,
  type DefaultReactionEntity,
  type DmChannelEntity,
  type FollowedChannelEntity,
  type FormattedChannel,
  type FormattedUser,
  type ForumLayoutType,
  type ForumTagEntity,
  formatChannel,
  formatUser,
  type GroupDmChannelEntity,
  type GuildAnnouncementChannelEntity,
  type GuildCategoryChannelEntity,
  type GuildDirectoryChannelEntity,
  type GuildForumChannelEntity,
  type GuildMediaChannelEntity,
  type GuildStageVoiceChannelEntity,
  type GuildTextChannelEntity,
  type GuildVoiceChannelEntity,
  type InviteEntity,
  type OverwriteEntity,
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
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
import { channelFactory, Omit } from "../utils/index.js";
import { Guild, GuildMember } from "./guild.class.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";
import { Webhook } from "./webhook.class.js";

@Cacheable<GuildBased<ThreadMemberEntity>>(
  "threadMembers",
  (entity) => `${entity.guild_id}:${entity.id}:${entity.user_id}`,
)
export class ThreadMember
  extends BaseClass<GuildBased<ThreadMemberEntity>>
  implements Enforce<PropsToCamel<GuildBased<ThreadMemberEntity>>>
{
  readonly id = this.rawData.id;
  readonly guildId = this.rawData.guild_id;
  readonly userId = this.rawData.user_id;
  readonly joinTimestamp = this.rawData.join_timestamp;
  readonly flags = new BitField<number>(this.rawData.flags);
  readonly member = this.rawData.member
    ? new GuildMember(this.client, {
        ...this.rawData.member,
        guild_id: this.guildId,
      })
    : undefined;

  get joinedAt(): Date {
    return new Date(this.joinTimestamp);
  }

  get joinedTimestamp(): number {
    return this.joinedAt.getTime();
  }

  get user(): User | undefined {
    if (!this.member?.user) {
      return undefined;
    }
    return this.member.user;
  }

  get joinedDaysAgo(): number {
    return Math.floor(
      (Date.now() - this.joinedTimestamp) / (1000 * 60 * 60 * 24),
    );
  }

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

  override toString(): FormattedUser | `Unknown User` {
    return this.userId ? formatUser(this.userId) : "Unknown User";
  }
}

@Cacheable<ChannelEntity>("channels", (entity) => entity.id)
export class Channel
  extends BaseClass<ChannelEntity>
  implements Enforce<PropsToCamel<ChannelEntity>>
{
  readonly id = this.rawData.id;
  readonly type = this.rawData.type;
  readonly guildId = this.rawData.guild_id;
  readonly position = this.rawData.position;
  readonly permissionOverwrites = this.rawData.permission_overwrites;
  readonly name = this.rawData.name;
  readonly topic = this.rawData.topic;
  readonly nsfw = Boolean(this.rawData.nsfw);
  readonly lastMessageId = this.rawData.last_message_id;
  readonly bitrate = this.rawData.bitrate;
  readonly userLimit = this.rawData.user_limit;
  readonly rateLimitPerUser = this.rawData.rate_limit_per_user;
  readonly recipients = this.rawData.recipients?.map(
    (user) => new User(this.client, user),
  );
  readonly icon = this.rawData.icon;
  readonly ownerId = this.rawData.owner_id;
  readonly applicationId = this.rawData.application_id;
  readonly managed = Boolean(this.rawData.managed);
  readonly parentId = this.rawData.parent_id;
  readonly lastPinTimestamp = this.rawData.last_pin_timestamp;
  readonly rtcRegion = this.rawData.rtc_region;
  readonly videoQualityMode = this.rawData.video_quality_mode;
  readonly messageCount = this.rawData.message_count;
  readonly memberCount = this.rawData.member_count;
  readonly threadMetadata = this.rawData.thread_metadata;
  readonly member = this.rawData.member
    ? new ThreadMember(this.client, {
        ...this.rawData.member,
        guild_id: this.guildId as string,
      })
    : undefined;
  readonly defaultAutoArchiveDuration =
    this.rawData.default_auto_archive_duration;
  readonly permissions = new BitField<BitwisePermissionFlags>(
    this.rawData.permissions ?? 0n,
  );
  readonly flags = new BitField<ChannelFlags>(this.rawData.flags);
  readonly totalMessageSent = this.rawData.total_message_sent;
  readonly availableTags = this.rawData.available_tags;
  readonly appliedTags = this.rawData.applied_tags;
  readonly defaultReactionEmoji = this.rawData.default_reaction_emoji;
  readonly defaultThreadRateLimitPerUser =
    this.rawData.default_thread_rate_limit_per_user;
  readonly defaultSortOrder = this.rawData.default_sort_order;
  readonly defaultForumLayout = this.rawData.default_forum_layout;

  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  get isGuildChannel(): boolean {
    return this.guildId !== undefined;
  }

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

  get isVoiceBased(): boolean {
    return [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(
      this.type,
    );
  }

  get isThread(): boolean {
    return [
      ChannelType.AnnouncementThread,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
    ].includes(this.type);
  }

  get isForum(): boolean {
    return this.type === ChannelType.GuildForum;
  }

  get isMedia(): boolean {
    return this.type === ChannelType.GuildMedia;
  }

  get isCategory(): boolean {
    return this.type === ChannelType.GuildCategory;
  }

  get isViewable(): boolean {
    if (!this.isGuildChannel) {
      return true;
    }
    return true;
  }

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

  async pinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    if (!this.isTextBased) {
      throw new Error("Cannot pin messages in a non-text channel");
    }

    try {
      await this.client.rest.messages.pinMessage(this.id, messageId, reason);
    } catch (error) {
      throw new Error(`Failed to pin message: ${error}`);
    }
  }

  async unpinMessage(messageId: Snowflake, reason?: string): Promise<void> {
    if (!this.isTextBased) {
      throw new Error("Cannot unpin messages in a non-text channel");
    }

    try {
      await this.client.rest.messages.unpinMessage(this.id, messageId, reason);
    } catch (error) {
      throw new Error(`Failed to unpin message: ${error}`);
    }
  }

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

  override toString(): FormattedChannel {
    return formatChannel(this.id);
  }

  isTextChannel(): this is GuildTextChannel {
    return this.type === ChannelType.GuildText;
  }

  isDmChannel(): this is DmChannel {
    return this.type === ChannelType.Dm;
  }

  isVoiceChannel(): this is GuildVoiceChannel {
    return this.type === ChannelType.GuildVoice;
  }

  isGroupDmChannel(): this is GroupDmChannel {
    return this.type === ChannelType.GroupDm;
  }

  isCategoryChannel(): this is GuildCategoryChannel {
    return this.type === ChannelType.GuildCategory;
  }

  isAnnouncementChannel(): this is GuildAnnouncementChannel {
    return this.type === ChannelType.GuildAnnouncement;
  }

  isStageChannel(): this is GuildStageVoiceChannel {
    return this.type === ChannelType.GuildStageVoice;
  }

  isForumChannel(): this is GuildForumChannel {
    return this.type === ChannelType.GuildForum;
  }

  isMediaChannel(): this is GuildMediaChannel {
    return this.type === ChannelType.GuildMedia;
  }

  isThreadChannel(): this is AnyThreadChannel {
    return this.isThread;
  }

  isGuildBasedChannel(): this is GuildChannel {
    return this.isGuildChannel;
  }

  isPrivateChannel(): this is PrivateChannel {
    return !this.isGuildChannel;
  }

  isDirectoryChannel(): this is GuildDirectoryChannel {
    return this.type === ChannelType.GuildDirectory;
  }
}

export interface GuildChannel extends Channel {
  readonly guildId: Snowflake;
  readonly position: number;
  readonly permissionOverwrites: OverwriteEntity[];
}

export interface PrivateChannel extends Channel {
  readonly recipients: User[];
}

export interface TextBasedChannel extends Channel {
  readonly lastMessageId: Snowflake | null;
  readonly rateLimitPerUser: number;
  send(content: string | CreateMessageSchema): Promise<Message>;
  fetchMessages(query?: MessagesFetchParams): Promise<Message[]>;
  fetchMessage(messageId: Snowflake): Promise<Message>;
}

export interface VoiceBasedChannel extends Channel {
  readonly bitrate: number;
  readonly userLimit: number;
  readonly rtcRegion: string | null;
}

export interface ThreadChannel extends TextBasedChannel {
  readonly threadMetadata: ThreadMetadataEntity;
  readonly parentId: Snowflake;
  readonly messageCount: number;
  readonly memberCount: number;
  readonly member: ThreadMemberEntity;
  readonly totalMessageSent: number;
  join(): Promise<void>;
  leave(): Promise<void>;
  addMember(userId: Snowflake): Promise<void>;
  removeMember(userId: Snowflake): Promise<void>;
}

export class GuildTextChannel
  extends Omit(
    Channel,
    "bitrate",
    "userLimit",
    "recipients",
    "icon",
    "ownerId",
    "applicationId",
    "managed",
    "rtcRegion",
    "videoQualityMode",
    "messageCount",
    "memberCount",
    "threadMetadata",
    "member",
    "availableTags",
  )
  implements Enforce<PropsToCamel<GuildTextChannelEntity>>
{
  override type = ChannelType.GuildText;

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

  async setNsfw(nsfw: boolean, reason?: string): Promise<GuildTextChannel> {
    try {
      const updatedChannel = await this.edit({ nsfw }, reason);
      return updatedChannel as GuildTextChannel;
    } catch (error) {
      throw new Error(`Failed to set NSFW status: ${error}`);
    }
  }
}

export class DmChannel
  extends Omit(
    Channel,
    "guild_id",
    "position",
    "permission_overwrites",
    "name",
    "topic",
    "nsfw",
    "bitrate",
    "user_limit",
    "parent_id",
    "rtc_region",
    "video_quality_mode",
    "thread_metadata",
    "default_auto_archive_duration",
    "available_tags",
  )
  implements Enforce<PropsToCamel<DmChannelEntity>>
{
  override get type(): ChannelType.Dm {
    return ChannelType.Dm;
  }

  get recipient(): User | undefined {
    if (!this.recipients || this.recipients.length === 0) {
      return undefined;
    }
    return this.recipients[0];
  }

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

export class GuildVoiceChannel
  extends Omit(
    Channel,
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "thread_metadata",
    "member",
    "message_count",
    "available_tags",
    "applied_tags",
    "default_reaction_emoji",
    "default_thread_rate_limit_per_user",
    "default_sort_order",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<GuildVoiceChannelEntity>>
{
  override get type(): ChannelType.GuildVoice {
    return ChannelType.GuildVoice;
  }

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

export class GroupDmChannel
  extends Omit(
    Channel,
    "guild_id",
    "position",
    "permission_overwrites",
    "nsfw",
    "bitrate",
    "user_limit",
    "parent_id",
    "rate_limit_per_user",
    "rtc_region",
    "video_quality_mode",
    "thread_metadata",
    "default_auto_archive_duration",
    "available_tags",
  )
  implements Enforce<PropsToCamel<GroupDmChannelEntity>>
{
  override get type(): ChannelType.GroupDm {
    return ChannelType.GroupDm;
  }

  get users(): User[] {
    if (!this.recipients) {
      return [];
    }
    return this.recipients;
  }

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

  async removeUser(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeGroupDmRecipient(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove user from group DM: ${error}`);
    }
  }

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

export class GuildCategoryChannel
  extends Omit(
    Channel,
    "topic",
    "last_message_id",
    "bitrate",
    "user_limit",
    "rate_limit_per_user",
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "parent_id",
    "last_pin_timestamp",
    "rtc_region",
    "video_quality_mode",
    "message_count",
    "member_count",
    "thread_metadata",
    "member",
    "default_auto_archive_duration",
    "available_tags",
  )
  implements Enforce<PropsToCamel<GuildCategoryChannelEntity>>
{
  override get type(): ChannelType.GuildCategory {
    return ChannelType.GuildCategory;
  }

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

export class GuildAnnouncementChannel
  extends Omit(
    Channel,
    "bitrate",
    "user_limit",
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "message_count",
    "member_count",
    "thread_metadata",
    "member",
    "available_tags",
    "applied_tags",
    "default_reaction_emoji",
    "default_thread_rate_limit_per_user",
    "default_sort_order",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<GuildAnnouncementChannelEntity>>
{
  override get type(): ChannelType.GuildAnnouncement {
    return ChannelType.GuildAnnouncement;
  }

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

export class AnnouncementThreadChannel
  extends Omit(
    Channel,
    "permission_overwrites",
    "topic",
    "bitrate",
    "user_limit",
    "recipients",
    "icon",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "default_auto_archive_duration",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<AnnouncementThreadChannelEntity>>
{
  override get type(): ChannelType.AnnouncementThread {
    return ChannelType.AnnouncementThread;
  }

  async join(): Promise<void> {
    try {
      await this.client.rest.channels.joinThread(this.id);
    } catch (error) {
      throw new Error(`Failed to join thread: ${error}`);
    }
  }

  async leave(): Promise<void> {
    try {
      await this.client.rest.channels.leaveThread(this.id);
    } catch (error) {
      throw new Error(`Failed to leave thread: ${error}`);
    }
  }

  async addMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.addThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to add member to thread: ${error}`);
    }
  }

  async removeMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove member from thread: ${error}`);
    }
  }

  async fetchMembers(): Promise<ThreadMemberEntity[]> {
    try {
      return await this.client.rest.channels.fetchThreadMembers(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch thread members: ${error}`);
    }
  }

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

  setArchived(
    archived: boolean,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    return this.edit({ archived }, reason);
  }

  setAutoArchiveDuration(
    duration: AutoArchiveDuration,
    reason?: string,
  ): Promise<AnnouncementThreadChannel> {
    return this.edit({ auto_archive_duration: duration }, reason);
  }
}

export class PublicThreadChannel
  extends Omit(
    Channel,
    "permission_overwrites",
    "topic",
    "bitrate",
    "user_limit",
    "recipients",
    "icon",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "default_auto_archive_duration",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<PublicThreadChannelEntity>>
{
  override get type(): ChannelType.PublicThread {
    return ChannelType.PublicThread;
  }

  async join(): Promise<void> {
    try {
      await this.client.rest.channels.joinThread(this.id);
    } catch (error) {
      throw new Error(`Failed to join thread: ${error}`);
    }
  }

  async leave(): Promise<void> {
    try {
      await this.client.rest.channels.leaveThread(this.id);
    } catch (error) {
      throw new Error(`Failed to leave thread: ${error}`);
    }
  }

  async addMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.addThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to add member to thread: ${error}`);
    }
  }

  async removeMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove member from thread: ${error}`);
    }
  }

  async fetchMembers(): Promise<ThreadMemberEntity[]> {
    try {
      return await this.client.rest.channels.fetchThreadMembers(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch thread members: ${error}`);
    }
  }

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

  setArchived(
    archived: boolean,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    return this.edit({ archived }, reason);
  }

  setAutoArchiveDuration(
    duration: AutoArchiveDuration,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    return this.edit({ auto_archive_duration: duration }, reason);
  }

  setRateLimitPerUser(
    seconds: number,
    reason?: string,
  ): Promise<PublicThreadChannel> {
    return this.edit({ rate_limit_per_user: seconds }, reason);
  }
}

export class PrivateThreadChannel
  extends Omit(
    Channel,
    "permission_overwrites",
    "topic",
    "bitrate",
    "user_limit",
    "recipients",
    "icon",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "default_auto_archive_duration",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<PrivateThreadChannelEntity>>
{
  override get type(): ChannelType.PrivateThread {
    return ChannelType.PrivateThread;
  }

  async join(): Promise<void> {
    try {
      await this.client.rest.channels.joinThread(this.id);
    } catch (error) {
      throw new Error(`Failed to join thread: ${error}`);
    }
  }

  async leave(): Promise<void> {
    try {
      await this.client.rest.channels.leaveThread(this.id);
    } catch (error) {
      throw new Error(`Failed to leave thread: ${error}`);
    }
  }

  async addMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.addThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to add member to thread: ${error}`);
    }
  }

  async removeMember(userId: Snowflake): Promise<void> {
    try {
      await this.client.rest.channels.removeThreadMember(this.id, userId);
    } catch (error) {
      throw new Error(`Failed to remove member from thread: ${error}`);
    }
  }

  async fetchMembers(): Promise<ThreadMemberEntity[]> {
    try {
      return await this.client.rest.channels.fetchThreadMembers(this.id);
    } catch (error) {
      throw new Error(`Failed to fetch thread members: ${error}`);
    }
  }

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

  setArchived(
    archived: boolean,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ archived }, reason);
  }

  setAutoArchiveDuration(
    duration: AutoArchiveDuration,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ auto_archive_duration: duration }, reason);
  }

  setRateLimitPerUser(
    seconds: number,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ rate_limit_per_user: seconds }, reason);
  }

  setInvitable(
    invitable: boolean,
    reason?: string,
  ): Promise<PrivateThreadChannel> {
    return this.edit({ invitable }, reason);
  }
}

export class GuildStageVoiceChannel
  extends Omit(
    Channel,
    "last_message_id",
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "thread_metadata",
    "member",
    "message_count",
    "member_count",
    "default_auto_archive_duration",
    "available_tags",
    "applied_tags",
    "default_reaction_emoji",
    "default_thread_rate_limit_per_user",
    "default_sort_order",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<GuildStageVoiceChannelEntity>>
{
  override get type(): ChannelType.GuildStageVoice {
    return ChannelType.GuildStageVoice;
  }

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

export class GuildForumChannel
  extends Omit(
    Channel,
    "bitrate",
    "user_limit",
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "message_count",
    "member_count",
    "thread_metadata",
    "member",
    "last_message_id",
  )
  implements Enforce<PropsToCamel<GuildForumChannelEntity>>
{
  override get type(): ChannelType.GuildForum {
    return ChannelType.GuildForum;
  }

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

  setAvailableTags(
    tags: ForumTagEntity[],
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ available_tags: tags }, reason);
  }

  setDefaultReactionEmoji(
    emoji: DefaultReactionEntity | null,
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ default_reaction_emoji: emoji }, reason);
  }

  setDefaultSortOrder(
    sortOrder: SortOrderType | null,
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ default_sort_order: sortOrder }, reason);
  }

  setDefaultForumLayout(
    layout: ForumLayoutType,
    reason?: string,
  ): Promise<GuildForumChannel> {
    return this.edit({ default_forum_layout: layout }, reason);
  }
}

export class GuildMediaChannel
  extends Omit(
    Channel,
    "bitrate",
    "user_limit",
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "message_count",
    "member_count",
    "thread_metadata",
    "member",
    "last_message_id",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<GuildMediaChannelEntity>>
{
  override get type(): ChannelType.GuildMedia {
    return ChannelType.GuildMedia;
  }

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

  setAvailableTags(
    tags: ForumTagEntity[],
    reason?: string,
  ): Promise<GuildMediaChannel> {
    return this.edit({ available_tags: tags }, reason);
  }

  setDefaultReactionEmoji(
    emoji: DefaultReactionEntity | null,
    reason?: string,
  ): Promise<GuildMediaChannel> {
    return this.edit({ default_reaction_emoji: emoji }, reason);
  }

  setDefaultSortOrder(
    sortOrder: SortOrderType | null,
    reason?: string,
  ): Promise<GuildMediaChannel> {
    return this.edit({ default_sort_order: sortOrder }, reason);
  }

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

export class GuildDirectoryChannel
  extends Omit(
    Channel,
    "topic",
    "nsfw",
    "last_message_id",
    "bitrate",
    "user_limit",
    "rate_limit_per_user",
    "recipients",
    "icon",
    "owner_id",
    "application_id",
    "managed",
    "rtc_region",
    "video_quality_mode",
    "message_count",
    "member_count",
    "thread_metadata",
    "member",
    "default_auto_archive_duration",
    "available_tags",
    "applied_tags",
    "default_reaction_emoji",
    "default_thread_rate_limit_per_user",
    "default_sort_order",
    "default_forum_layout",
  )
  implements Enforce<PropsToCamel<GuildDirectoryChannelEntity>>
{
  override get type(): ChannelType.GuildDirectory {
    return ChannelType.GuildDirectory;
  }
}

export type AnyThreadChannel =
  | AnnouncementThreadChannel
  | PublicThreadChannel
  | PrivateThreadChannel;

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
