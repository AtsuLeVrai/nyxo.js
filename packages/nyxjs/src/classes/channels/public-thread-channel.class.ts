import { ChannelType, type PublicThreadChannelEntity } from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { ThreadChannel } from "./thread-channel.class.js";

export class PublicThreadChannel
  extends ThreadChannel<PublicThreadChannelEntity>
  implements EnforceCamelCase<PublicThreadChannelEntity>
{
  declare readonly data: PublicThreadChannelEntity;

  override get type(): ChannelType.PublicThread {
    return ChannelType.PublicThread;
  }
}
