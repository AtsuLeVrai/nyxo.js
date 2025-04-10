import {
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  ChannelType,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { AnnouncementThreadChannel } from "./announcement-thread-channel.class.js";
import type { DmChannel } from "./dm-channel.class.js";
import type { GroupDmChannel } from "./group-dm-channel.class.js";
import type { GuildAnnouncementChannel } from "./guild-announcement-channel.class.js";
import type { GuildCategoryChannel } from "./guild-category-channel.class.js";
import type { GuildForumChannel } from "./guild-forum-channel.class.js";
import type { GuildMediaChannel } from "./guild-media-channel.class.js";
import type { GuildStageVoiceChannel } from "./guild-stage-voice-channel.class.js";
import type { GuildTextChannel } from "./guild-text-channel.class.js";
import type { GuildVoiceChannel } from "./guild-voice-channel.class.js";
import type { PrivateThreadChannel } from "./private-thread-channel.class.js";
import type { PublicThreadChannel } from "./public-thread-channel.class.js";
import type { ThreadChannel } from "./thread-channel.class.js";

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

  isThreadChannel(
    this: Channel<AnyChannelEntity>,
  ): this is ThreadChannel<AnyThreadChannelEntity> {
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
