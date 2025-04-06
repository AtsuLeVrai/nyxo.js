import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  type AutoArchiveDuration,
  BitFieldManager,
  type BitwisePermissionFlags,
  ChannelType,
  type DefaultReactionEntity,
  type DmChannelEntity,
  type ForumLayoutType,
  type ForumTagEntity,
  type GroupDmChannelEntity,
  type GuildAnnouncementChannelEntity,
  type GuildCategoryChannelEntity,
  type GuildForumChannelEntity,
  type GuildMediaChannelEntity,
  type GuildMemberEntity,
  type GuildStageVoiceChannelEntity,
  type GuildTextChannelEntity,
  type GuildVoiceChannelEntity,
  type OverwriteEntity,
  type OverwriteType,
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
  type Snowflake,
  type SortOrderType,
  type ThreadMemberEntity,
  type ThreadMetadataEntity,
  type VideoQualityMode,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import type { GuildBased } from "../types/index.js";
import { GuildMember } from "./guild.class.js";
import { User } from "./user.class.js";

export class ForumTag extends BaseClass<ForumTagEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get moderated(): boolean {
    return Boolean(this.data.moderated);
  }

  get emojiId(): Snowflake | null {
    return this.data.emoji_id;
  }

  get emojiName(): string | null {
    return this.data.emoji_name;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class DefaultReaction extends BaseClass<DefaultReactionEntity> {
  get emojiId(): Snowflake | null {
    return this.data.emoji_id;
  }

  get emojiName(): string | null {
    return this.data.emoji_name;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Overwrite extends BaseClass<OverwriteEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get type(): OverwriteType {
    return this.data.type;
  }

  get allow(): BitFieldManager<BitwisePermissionFlags> {
    return new BitFieldManager<BitwisePermissionFlags>(this.data.allow);
  }

  get deny(): BitFieldManager<BitwisePermissionFlags> {
    return new BitFieldManager<BitwisePermissionFlags>(this.data.allow);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export abstract class Channel<T extends AnyChannelEntity> extends BaseClass<T> {
  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType {
    return this.data.type;
  }

  isGuildTextChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildTextChannel {
    return this.type === ChannelType.GuildText;
  }

  isDmChannel(this: Channel<AnyChannelEntity>): this is DmChannel {
    return this.type === ChannelType.Dm;
  }

  isGuildVoiceChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildVoiceChannel {
    return this.type === ChannelType.GuildVoice;
  }

  isGroupDmChannel(this: Channel<AnyChannelEntity>): this is GroupDmChannel {
    return this.type === ChannelType.GroupDm;
  }

  isGuildCategoryChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildCategoryChannel {
    return this.type === ChannelType.GuildCategory;
  }

  isGuildAnnouncementChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildAnnouncementChannel {
    return this.type === ChannelType.GuildAnnouncement;
  }

  isAnnouncementThreadChannel(
    this: Channel<AnyChannelEntity>,
  ): this is AnnouncementThreadChannel {
    return this.type === ChannelType.AnnouncementThread;
  }

  isPublicThreadChannel(
    this: Channel<AnyChannelEntity>,
  ): this is PublicThreadChannel {
    return this.type === ChannelType.PublicThread;
  }

  isPrivateThreadChannel(
    this: Channel<AnyChannelEntity>,
  ): this is PrivateThreadChannel {
    return this.type === ChannelType.PrivateThread;
  }

  isThreadChannel(this: Channel<AnyChannelEntity>): this is ThreadChannel {
    return (
      this.isPublicThreadChannel() ||
      this.isPrivateThreadChannel() ||
      this.isAnnouncementThreadChannel()
    );
  }

  isGuildStageVoiceChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildStageVoiceChannel {
    return this.type === ChannelType.GuildStageVoice;
  }

  isGuildForumChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildForumChannel {
    return this.type === ChannelType.GuildForum;
  }

  isGuildMediaChannel(
    this: Channel<AnyChannelEntity>,
  ): this is GuildMediaChannel {
    return this.type === ChannelType.GuildMedia;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "channels",
      id: this.id,
    };
  }
}

export class GuildTextChannel extends Channel<GuildTextChannelEntity> {
  override get type(): ChannelType.GuildText {
    return ChannelType.GuildText;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get topic(): string | undefined {
    return this.data.topic;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }

  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}

export class DmChannel extends Channel<DmChannelEntity> {
  override get type(): ChannelType.Dm {
    return ChannelType.Dm;
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get recipients(): User[] {
    return this.data.recipients.map((user) => User.from(this.client, user));
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }
}

export class GuildVoiceChannel extends Channel<GuildVoiceChannelEntity> {
  override get type(): ChannelType.GuildVoice {
    return ChannelType.GuildVoice;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get bitrate(): number {
    return this.data.bitrate;
  }

  get userLimit(): number {
    return this.data.user_limit;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get rtcRegion(): string | null | undefined {
    return this.data.rtc_region;
  }

  get videoQualityMode(): VideoQualityMode | undefined {
    return this.data.video_quality_mode;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}

export class GroupDmChannel extends Channel<GroupDmChannelEntity> {
  override get type(): ChannelType.GroupDm {
    return ChannelType.GroupDm;
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  get recipients(): User[] {
    return this.data.recipients.map((user) => User.from(this.client, user));
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }
}

export class GuildCategoryChannel extends Channel<GuildCategoryChannelEntity> {
  override get type(): ChannelType.GuildCategory {
    return ChannelType.GuildCategory;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}

export class GuildAnnouncementChannel extends Channel<GuildAnnouncementChannelEntity> {
  override get type(): ChannelType.GuildAnnouncement {
    return ChannelType.GuildAnnouncement;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get topic(): string | undefined {
    return this.data.topic;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }

  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}

export class ThreadMember extends BaseClass<GuildBased<ThreadMemberEntity>> {
  get id(): Snowflake | undefined {
    return this.data.id;
  }

  get userId(): Snowflake | undefined {
    return this.data.user_id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get joinTimestamp(): string {
    return this.data.join_timestamp;
  }

  get flags(): number {
    return this.data.flags;
  }

  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export abstract class ThreadChannel extends Channel<AnyThreadChannelEntity> {
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  get ownerId(): Snowflake | undefined {
    return this.data.owner_id;
  }

  get parentId(): Snowflake {
    return this.data.parent_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }

  get messageCount(): number | undefined {
    return this.data.message_count;
  }

  get memberCount(): number | undefined {
    return this.data.member_count;
  }

  get threadMetadata(): ThreadMetadataEntity {
    return this.data.thread_metadata;
  }

  get member(): ThreadMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return ThreadMember.from(
      this.client,
      this.data.member as GuildBased<ThreadMemberEntity>,
    );
  }

  get flags(): number {
    return this.data.flags;
  }

  get totalMessageSent(): number | undefined {
    return this.data.total_message_sent;
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }
}

export class PublicThreadChannel extends ThreadChannel {
  declare readonly data: PublicThreadChannelEntity;

  override get type(): ChannelType.PublicThread {
    return ChannelType.PublicThread;
  }
}

export class PrivateThreadChannel extends ThreadChannel {
  declare readonly data: PrivateThreadChannelEntity;

  override get type(): ChannelType.PrivateThread {
    return ChannelType.PrivateThread;
  }

  get invitable(): boolean {
    return Boolean(this.data.invitable);
  }
}

export class AnnouncementThreadChannel extends ThreadChannel {
  declare readonly data: AnnouncementThreadChannelEntity;

  override get type(): ChannelType.AnnouncementThread {
    return ChannelType.AnnouncementThread;
  }
}

export class GuildStageVoiceChannel extends Channel<GuildStageVoiceChannelEntity> {
  override get type(): ChannelType.GuildStageVoice {
    return ChannelType.GuildStageVoice;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get bitrate(): number {
    return this.data.bitrate;
  }

  get userLimit(): number {
    return this.data.user_limit;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get rtcRegion(): string | null | undefined {
    return this.data.rtc_region;
  }

  get videoQualityMode(): VideoQualityMode | undefined {
    return this.data.video_quality_mode;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}

export class GuildForumChannel extends Channel<GuildForumChannelEntity> {
  override get type(): ChannelType.GuildForum {
    return ChannelType.GuildForum;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get topic(): string | undefined {
    return this.data.topic;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }

  get availableTags(): ForumTag[] {
    return this.data.available_tags.map((tag) =>
      ForumTag.from(this.client, tag),
    );
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }

  get defaultReactionEmoji(): DefaultReaction | null | undefined {
    if (!this.data.default_reaction_emoji) {
      return null;
    }

    return DefaultReaction.from(this.client, this.data.default_reaction_emoji);
  }

  get defaultThreadRateLimitPerUser(): number | undefined {
    return this.data.default_thread_rate_limit_per_user;
  }

  get defaultSortOrder(): SortOrderType | null | undefined {
    return this.data.default_sort_order;
  }

  get defaultForumLayout(): ForumLayoutType | undefined {
    return this.data.default_forum_layout;
  }
}

export class GuildMediaChannel extends Channel<GuildMediaChannelEntity> {
  override get type(): ChannelType.GuildMedia {
    return ChannelType.GuildMedia;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get topic(): string | undefined {
    return this.data.topic;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }

  get availableTags(): ForumTag[] {
    return this.data.available_tags.map((tag) =>
      ForumTag.from(this.client, tag),
    );
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }

  get defaultReactionEmoji(): DefaultReaction | null | undefined {
    if (!this.data.default_reaction_emoji) {
      return null;
    }

    return DefaultReaction.from(this.client, this.data.default_reaction_emoji);
  }

  get defaultThreadRateLimitPerUser(): number | undefined {
    return this.data.default_thread_rate_limit_per_user;
  }

  get defaultSortOrder(): SortOrderType | null | undefined {
    return this.data.default_sort_order;
  }
}

/**
 * Represents any text-based channel type in Discord.
 */
export type AnyThreadChannel =
  | PublicThreadChannel
  | PrivateThreadChannel
  | AnnouncementThreadChannel;

/**
 * Represents any channel type in Discord.
 */
export type AnyChannel =
  | GuildTextChannel
  | DmChannel
  | GuildVoiceChannel
  | GroupDmChannel
  | GuildCategoryChannel
  | GuildAnnouncementChannel
  | AnyThreadChannel
  | GuildStageVoiceChannel
  | GuildForumChannel
  | GuildMediaChannel;
