import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  type AnyThreadChannelEntity,
  ChannelType,
  type DmChannelEntity,
  type GroupDmChannelEntity,
  type GuildAnnouncementChannelEntity,
  type GuildCategoryChannelEntity,
  type GuildForumChannelEntity,
  type GuildMediaChannelEntity,
  type GuildStageVoiceChannelEntity,
  type GuildTextChannelEntity,
  type GuildVoiceChannelEntity,
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
} from "@nyxjs/core";
import {
  AnnouncementThreadChannel,
  type AnyChannel,
  type AnyThreadChannel,
  DmChannel,
  GroupDmChannel,
  GuildAnnouncementChannel,
  GuildCategoryChannel,
  GuildForumChannel,
  GuildMediaChannel,
  GuildStageVoiceChannel,
  GuildTextChannel,
  GuildVoiceChannel,
  PrivateThreadChannel,
  PublicThreadChannel,
} from "../classes/index.js";
import type { Client } from "../core/index.js";

/**
 * Factory class for creating channel instances based on their type.
 *
 * This factory handles the creation of appropriate channel class instances
 * by examining the channel type in the provided data.
 */
export const ChannelFactory = {
  /**
   * Creates a channel instance of the appropriate type based on the channel data.
   *
   * @param client - The client instance to pass to the channel
   * @param data - The channel data containing the type and other properties
   * @returns An instance of the appropriate channel class
   * @throws Error if the channel type is not supported
   */
  create(client: Client, data: AnyChannelEntity): AnyChannel {
    switch (data.type) {
      case ChannelType.GuildText:
        return new GuildTextChannel(client, data as GuildTextChannelEntity);

      case ChannelType.Dm:
        return new DmChannel(client, data as DmChannelEntity);

      case ChannelType.GuildVoice:
        return new GuildVoiceChannel(client, data as GuildVoiceChannelEntity);

      case ChannelType.GroupDm:
        return new GroupDmChannel(client, data as GroupDmChannelEntity);

      case ChannelType.GuildCategory:
        return new GuildCategoryChannel(
          client,
          data as GuildCategoryChannelEntity,
        );

      case ChannelType.GuildAnnouncement:
        return new GuildAnnouncementChannel(
          client,
          data as GuildAnnouncementChannelEntity,
        );

      case ChannelType.AnnouncementThread:
        return new AnnouncementThreadChannel(
          client,
          data as AnnouncementThreadChannelEntity,
        );

      case ChannelType.PublicThread:
        return new PublicThreadChannel(
          client,
          data as PublicThreadChannelEntity,
        );

      case ChannelType.PrivateThread:
        return new PrivateThreadChannel(
          client,
          data as PrivateThreadChannelEntity,
        );

      case ChannelType.GuildStageVoice:
        return new GuildStageVoiceChannel(
          client,
          data as GuildStageVoiceChannelEntity,
        );

      case ChannelType.GuildForum:
        return new GuildForumChannel(client, data as GuildForumChannelEntity);

      case ChannelType.GuildMedia:
        return new GuildMediaChannel(client, data as GuildMediaChannelEntity);

      default:
        throw new Error(
          "Unsupported channel type. Please check the channel data.",
        );
    }
  },

  createThread(client: Client, data: AnyThreadChannelEntity): AnyThreadChannel {
    switch (data.type) {
      case ChannelType.PublicThread:
        return new PublicThreadChannel(client, data);

      case ChannelType.PrivateThread:
        return new PrivateThreadChannel(client, data);

      case ChannelType.AnnouncementThread:
        return new AnnouncementThreadChannel(client, data);

      default:
        throw new Error(
          "Unsupported thread channel type. Please check the channel data.",
        );
    }
  },
} as const;
