import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  type AutoArchiveDuration,
  BitField,
  type ChannelFlags,
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
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
  type Snowflake,
  type SortOrderType,
  type ThreadMemberEntity,
  type ThreadMetadataEntity,
  type VideoQualityMode,
} from "@nyxojs/core";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import { GuildMember } from "./guild.class.js";
import { User } from "./user.class.js";

@Cacheable("channels")
export abstract class Channel<T extends AnyChannelEntity> extends BaseClass<T> {
  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType {
    return this.data.type;
  }

  isGuildTextChannel(): this is GuildTextChannel {
    return this.type === ChannelType.GuildText;
  }

  isDmChannel(): this is DmChannel {
    return this.type === ChannelType.Dm;
  }

  isGuildVoiceChannel(): this is GuildVoiceChannel {
    return this.type === ChannelType.GuildVoice;
  }

  isGroupDmChannel(): this is GroupDmChannel {
    return this.type === ChannelType.GroupDm;
  }

  isGuildCategoryChannel(): this is GuildCategoryChannel {
    return this.type === ChannelType.GuildCategory;
  }

  isGuildAnnouncementChannel(): this is GuildAnnouncementChannel {
    return this.type === ChannelType.GuildAnnouncement;
  }

  isAnnouncementThreadChannel(): this is AnnouncementThreadChannel {
    return this.type === ChannelType.AnnouncementThread;
  }

  isPublicThreadChannel(): this is PublicThreadChannel {
    return this.type === ChannelType.PublicThread;
  }

  isPrivateThreadChannel(): this is PrivateThreadChannel {
    return this.type === ChannelType.PrivateThread;
  }

  isThreadChannel(): this is ThreadChannel<AnyThreadChannelEntity> {
    return (
      this.isPublicThreadChannel() ||
      this.isPrivateThreadChannel() ||
      this.isAnnouncementThreadChannel()
    );
  }

  isGuildStageVoiceChannel(): this is GuildStageVoiceChannel {
    return this.type === ChannelType.GuildStageVoice;
  }

  isGuildForumChannel(): this is GuildForumChannel {
    return this.type === ChannelType.GuildForum;
  }

  isGuildMediaChannel(): this is GuildMediaChannel {
    return this.type === ChannelType.GuildMedia;
  }
}
+
export class DmChannel extends Channel<DmChannelEntity> {
  // implements Enforce<CamelCasedProperties<DmChannelEntity>>
  override get type(): ChannelType.Dm {
    return ChannelType.Dm;
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get recipients(): User[] {
    return this.data.recipients.map((user) => new User(this.client, user));
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }

  get flags(): BitField<ChannelFlags> {
    return new BitField(this.data.flags ?? 0n);
  }
}

export class GroupDmChannel extends Channel<GroupDmChannelEntity> {
  // implements Enforce<CamelCasedProperties<GroupDmChannelEntity>>
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
    return this.data.recipients.map((user) => new User(this.client, user));
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }

  get flags(): BitField<ChannelFlags> {
    return new BitField(this.data.flags ?? 0n);
  }
}

export class GuildAnnouncementChannel extends Channel<GuildAnnouncementChannelEntity> {
  // implements Enforce<CamelCasedProperties<GuildAnnouncementChannelEntity>>
  override get type(): ChannelType.GuildAnnouncement {
    return ChannelType.GuildAnnouncement;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

export class GuildCategoryChannel extends Channel<GuildCategoryChannelEntity> {
  // implements Enforce<CamelCasedProperties<GuildCategoryChannelEntity>>
  override get type(): ChannelType.GuildCategory {
    return ChannelType.GuildCategory;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

export class GuildForumChannel extends Channel<GuildForumChannelEntity> {
  // implements Enforce<CamelCasedProperties<GuildForumChannelEntity>>
  override get type(): ChannelType.GuildForum {
    return ChannelType.GuildForum;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

  get availableTags(): ForumTagEntity[] {
    return this.data.available_tags;
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }

  get defaultReactionEmoji(): DefaultReactionEntity | null | undefined {
    return this.data.default_reaction_emoji;
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
  // implements Enforce<CamelCasedProperties<GuildMediaChannelEntity>>
  override get type(): ChannelType.GuildMedia {
    return ChannelType.GuildMedia;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

  get availableTags(): ForumTagEntity[] {
    return this.data.available_tags;
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }

  get defaultReactionEmoji(): DefaultReactionEntity | null | undefined {
    return this.data.default_reaction_emoji;
  }

  get defaultThreadRateLimitPerUser(): number | undefined {
    return this.data.default_thread_rate_limit_per_user;
  }

  get defaultSortOrder(): SortOrderType | null | undefined {
    return this.data.default_sort_order;
  }
}

export class GuildStageVoiceChannel extends Channel<GuildStageVoiceChannelEntity> {
  // implements Enforce<CamelCasedProperties<GuildStageVoiceChannelEntity>>
  override get type(): ChannelType.GuildStageVoice {
    return ChannelType.GuildStageVoice;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

export class GuildTextChannel extends Channel<GuildTextChannelEntity> {
  // implements Enforce<CamelCasedProperties<GuildTextChannelEntity>>
  override get type(): ChannelType.GuildText {
    return ChannelType.GuildText;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

export class GuildVoiceChannel extends Channel<GuildVoiceChannelEntity> {
  // implements Enforce<CamelCasedProperties<GuildVoiceChannelEntity>>
  override get type(): ChannelType.GuildVoice {
    return ChannelType.GuildVoice;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): OverwriteEntity[] | undefined {
    return this.data.permission_overwrites;
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

@Cacheable("threadMembers")
export class ThreadMember
  extends BaseClass<GuildBased<ThreadMemberEntity>>
  implements Enforce<CamelCasedProperties<GuildBased<ThreadMemberEntity>>>
{
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

    return new GuildMember(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }
}

export abstract class ThreadChannel<
  T extends AnyThreadChannelEntity,
> extends Channel<T> {
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

    return new ThreadMember(
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

export class AnnouncementThreadChannel extends ThreadChannel<AnnouncementThreadChannelEntity> {
  // implements Enforce<CamelCasedProperties<AnnouncementThreadChannelEntity>>
  declare readonly data: AnnouncementThreadChannelEntity;

  override get type(): ChannelType.AnnouncementThread {
    return ChannelType.AnnouncementThread;
  }
}

export class PrivateThreadChannel extends ThreadChannel<PrivateThreadChannelEntity> {
  // implements Enforce<CamelCasedProperties<PrivateThreadChannelEntity>>
  declare readonly data: PrivateThreadChannelEntity;

  override get type(): ChannelType.PrivateThread {
    return ChannelType.PrivateThread;
  }

  get invitable(): boolean {
    return Boolean(this.data.invitable);
  }
}

export class PublicThreadChannel extends ThreadChannel<PublicThreadChannelEntity> {
  // implements Enforce<CamelCasedProperties<PublicThreadChannelEntity>>
  declare readonly data: PublicThreadChannelEntity;

  override get type(): ChannelType.PublicThread {
    return ChannelType.PublicThread;
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
