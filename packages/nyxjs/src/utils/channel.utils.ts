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
import type { Client } from "../core/index.js";

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
  client: Client,
  data: Partial<ChannelEntity>,
): AnyThreadChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  switch (data.type) {
    case ChannelType.AnnouncementThread:
      return new AnnouncementThreadChannel(
        client,
        data as z.input<typeof AnnouncementThreadChannelEntity>,
      );
    case ChannelType.PublicThread:
      return new PublicThreadChannel(
        client,
        data as z.input<typeof PublicThreadChannelEntity>,
      );
    case ChannelType.PrivateThread:
      return new PrivateThreadChannel(
        client,
        data as z.input<typeof PrivateThreadChannelEntity>,
      );
    default:
      throw new Error(`Invalid thread type: ${data.type}`);
  }
}

export function resolveDmChannel(
  client: Client,
  data: Partial<ChannelEntity>,
): AnyDmChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  switch (data.type) {
    case ChannelType.Dm:
      return new DmChannel(client, data as z.input<typeof DmChannelEntity>);
    case ChannelType.GroupDm:
      return new GroupDmChannel(
        client,
        data as z.input<typeof GroupDmChannelEntity>,
      );
    default:
      throw new Error(`Invalid DM type: ${data.type}`);
  }
}

export function resolveGuildChannel(
  client: Client,
  data: Partial<z.input<typeof ChannelEntity>>,
): AnyGuildChannel {
  if (!data.type) {
    throw new Error("Channel type is required");
  }

  switch (data.type) {
    // @ts-expect-error
    case ChannelType.GuildText:
      return new GuildTextChannel(
        client,
        data as z.input<typeof GuildTextChannelEntity>,
      );
    case ChannelType.GuildAnnouncement:
      return new GuildAnnouncementChannel(
        client,
        data as z.input<typeof GuildAnnouncementChannelEntity>,
      );
    case ChannelType.GuildCategory:
      return new GuildCategoryChannel(
        client,
        data as z.input<typeof GuildCategoryChannelEntity>,
      );
    case ChannelType.GuildForum:
      return new GuildForumChannel(
        client,
        data as z.input<typeof GuildForumChannelEntity>,
      );
    case ChannelType.GuildMedia:
      return new GuildMediaChannel(
        client,
        data as z.input<typeof GuildMediaChannelEntity>,
      );
    case ChannelType.GuildStageVoice:
      return new GuildStageVoiceChannel(
        client,
        data as z.input<typeof GuildStageVoiceChannelEntity>,
      );
    case ChannelType.GuildVoice:
      return new GuildVoiceChannel(
        client,
        data as z.input<typeof GuildVoiceChannelEntity>,
      );
    default:
      throw new Error(`Invalid guild type: ${data.type}`);
  }
}

export function resolveChannel(
  client: Client,
  data: Partial<ChannelEntity>,
): AnyChannel {
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
    return resolveThreadChannel(client, data);
  }

  if ([ChannelType.Dm, ChannelType.GroupDm].includes(data.type)) {
    return resolveDmChannel(client, data);
  }

  return resolveGuildChannel(client, data);
}
