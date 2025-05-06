import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
  ChannelType,
  type DmChannelEntity,
  type GroupDmChannelEntity,
  type GuildAnnouncementChannelEntity,
  type GuildCategoryChannelEntity,
  type GuildDirectoryChannelEntity,
  type GuildForumChannelEntity,
  type GuildMediaChannelEntity,
  type GuildStageVoiceChannelEntity,
  type GuildTextChannelEntity,
  type GuildVoiceChannelEntity,
  type PrivateThreadChannelEntity,
  type PublicThreadChannelEntity,
} from "@nyxojs/core";
import {
  AnnouncementThreadChannel,
  type AnyChannel,
  DmChannel,
  GroupDmChannel,
  GuildAnnouncementChannel,
  GuildCategoryChannel,
  GuildDirectoryChannel,
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
 * Creates and returns the appropriate channel instance based on the provided channel data.
 *
 * This function acts as a factory for channel objects, analyzing the type property
 * of the provided data and instantiating the corresponding channel class.
 *
 * @param client - The client instance used to create the channel
 * @param data - The channel entity data received from Discord API
 * @returns An instance of the appropriate channel class that corresponds to the channel type
 *
 * @throws {Error} If the channel type is not recognized or supported
 */
export function channelFactory(
  client: Client,
  data: AnyChannelEntity,
): AnyChannel {
  // Determine which channel class to instantiate based on the channel type
  switch (data.type) {
    case ChannelType.Dm:
      return new DmChannel(client, data as DmChannelEntity);

    case ChannelType.GroupDm:
      return new GroupDmChannel(client, data as GroupDmChannelEntity);

    case ChannelType.GuildText:
      return new GuildTextChannel(client, data as GuildTextChannelEntity);

    case ChannelType.GuildVoice:
      return new GuildVoiceChannel(client, data as GuildVoiceChannelEntity);

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

    case ChannelType.PublicThread:
      return new PublicThreadChannel(client, data as PublicThreadChannelEntity);

    case ChannelType.PrivateThread:
      return new PrivateThreadChannel(
        client,
        data as PrivateThreadChannelEntity,
      );

    case ChannelType.AnnouncementThread:
      return new AnnouncementThreadChannel(
        client,
        data as AnnouncementThreadChannelEntity,
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

    case ChannelType.GuildDirectory:
      return new GuildDirectoryChannel(
        client,
        data as GuildDirectoryChannelEntity,
      );

    default:
      throw new Error(
        "Unknown channel. Please check the channel type and try again.",
      );
  }
}
