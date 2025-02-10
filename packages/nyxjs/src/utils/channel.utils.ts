import {
  type AnnouncementThreadChannelEntity,
  type ChannelEntity,
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
import type { z } from "zod";
import {
  AnnouncementThreadChannel,
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
} from "../class/index.js";

export type AnyThreadChannel =
  | AnnouncementThreadChannel
  | PrivateThreadChannel
  | PublicThreadChannel;

export type AnyDmChannel = DmChannel | GroupDmChannel;

export type AnyGuildChannel =
  | GuildAnnouncementChannel
  | GuildCategoryChannel
  | GuildForumChannel
  | GuildMediaChannel
  | GuildStageVoiceChannel
  | GuildTextChannel
  | GuildVoiceChannel;

export type AnyChannel = AnyThreadChannel | AnyDmChannel | AnyGuildChannel;

export const isThreadChannel = (
  channel: AnyChannel,
): channel is AnyThreadChannel => {
  return [
    ChannelType.AnnouncementThread,
    ChannelType.PrivateThread,
    ChannelType.PublicThread,
  ].includes(channel.type);
};

export const isDmChannel = (channel: AnyChannel): channel is AnyDmChannel => {
  return [ChannelType.Dm, ChannelType.GroupDm].includes(channel.type);
};

export const isGuildChannel = (
  channel: AnyChannel,
): channel is AnyGuildChannel => {
  return [
    ChannelType.GuildAnnouncement,
    ChannelType.GuildCategory,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.GuildStageVoice,
    ChannelType.GuildText,
    ChannelType.GuildVoice,
  ].includes(channel.type);
};

export function resolveThreadChannel(
  data: Partial<ChannelEntity>,
): AnyThreadChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  switch (data.type) {
    case ChannelType.AnnouncementThread:
      return new AnnouncementThreadChannel(
        data as z.input<typeof AnnouncementThreadChannelEntity>,
      );
    case ChannelType.PublicThread:
      return new PublicThreadChannel(
        data as z.input<typeof PublicThreadChannelEntity>,
      );
    case ChannelType.PrivateThread:
      return new PrivateThreadChannel(
        data as z.input<typeof PrivateThreadChannelEntity>,
      );
    default:
      throw new Error(`Invalid thread type: ${data.type}`);
  }
}

export function resolveDmChannel(data: Partial<ChannelEntity>): AnyDmChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  switch (data.type) {
    case ChannelType.Dm:
      return new DmChannel(data as z.input<typeof DmChannelEntity>);
    case ChannelType.GroupDm:
      return new GroupDmChannel(data as z.input<typeof GroupDmChannelEntity>);
    default:
      throw new Error(`Invalid DM type: ${data.type}`);
  }
}

export function resolveGuildChannel(
  data: Partial<z.input<typeof ChannelEntity>>,
): AnyGuildChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  switch (data.type) {
    // @ts-expect-error
    case ChannelType.GuildText:
      return new GuildTextChannel(
        data as z.input<typeof GuildTextChannelEntity>,
      );
    case ChannelType.GuildAnnouncement:
      return new GuildAnnouncementChannel(
        data as z.input<typeof GuildAnnouncementChannelEntity>,
      );
    case ChannelType.GuildCategory:
      return new GuildCategoryChannel(
        data as z.input<typeof GuildCategoryChannelEntity>,
      );
    case ChannelType.GuildForum:
      return new GuildForumChannel(
        data as z.input<typeof GuildForumChannelEntity>,
      );
    case ChannelType.GuildMedia:
      return new GuildMediaChannel(
        data as z.input<typeof GuildMediaChannelEntity>,
      );
    case ChannelType.GuildStageVoice:
      return new GuildStageVoiceChannel(
        data as z.input<typeof GuildStageVoiceChannelEntity>,
      );
    case ChannelType.GuildVoice:
      return new GuildVoiceChannel(
        data as z.input<typeof GuildVoiceChannelEntity>,
      );
    default:
      throw new Error(`Invalid guild type: ${data.type}`);
  }
}

export function resolveChannel(data: Partial<ChannelEntity>): AnyChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  if (
    [
      ChannelType.AnnouncementThread,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
    ].includes(data.type)
  ) {
    return resolveThreadChannel(data);
  }

  if ([ChannelType.Dm, ChannelType.GroupDm].includes(data.type)) {
    return resolveDmChannel(data);
  }

  return resolveGuildChannel(data);
}

export function validateChannel(channel: unknown): boolean {
  if (!channel) {
    return false;
  }
  const channelInstance = channel as AnyChannel;
  return channelInstance.validate?.() ?? false;
}
