import {
  type AnnouncementThreadChannelEntity,
  type AnyChannelEntity,
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
  AnnouncementChannel,
  AnnouncementThreadChannel,
  type AnyChannel,
  CategoryChannel,
  DmChannel,
  ForumChannel,
  GroupDmChannel,
  MediaChannel,
  PrivateThreadChannel,
  PublicThreadChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
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
        return new TextChannel(client, data as GuildTextChannelEntity);

      case ChannelType.Dm:
        return new DmChannel(client, data as DmChannelEntity);

      case ChannelType.GuildVoice:
        return new VoiceChannel(client, data as GuildVoiceChannelEntity);

      case ChannelType.GroupDm:
        return new GroupDmChannel(client, data as GroupDmChannelEntity);

      case ChannelType.GuildCategory:
        return new CategoryChannel(client, data as GuildCategoryChannelEntity);

      case ChannelType.GuildAnnouncement:
        return new AnnouncementChannel(
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
        return new StageChannel(client, data as GuildStageVoiceChannelEntity);

      case ChannelType.GuildForum:
        return new ForumChannel(client, data as GuildForumChannelEntity);

      case ChannelType.GuildMedia:
        return new MediaChannel(client, data as GuildMediaChannelEntity);

      default:
        throw new Error("Unsupported channel type");
    }
  },
} as const;
