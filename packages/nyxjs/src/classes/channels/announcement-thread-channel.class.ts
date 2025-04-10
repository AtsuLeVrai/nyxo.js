import { type AnnouncementThreadChannelEntity, ChannelType } from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { ThreadChannel } from "./thread-channel.class.js";

export class AnnouncementThreadChannel
  extends ThreadChannel<AnnouncementThreadChannelEntity>
  implements EnforceCamelCase<AnnouncementThreadChannelEntity>
{
  declare readonly data: AnnouncementThreadChannelEntity;

  override get type(): ChannelType.AnnouncementThread {
    return ChannelType.AnnouncementThread;
  }
}
