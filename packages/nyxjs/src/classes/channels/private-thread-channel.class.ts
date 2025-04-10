import { ChannelType, type PrivateThreadChannelEntity } from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { ThreadChannel } from "./thread-channel.class.js";

export class PrivateThreadChannel
  extends ThreadChannel<PrivateThreadChannelEntity>
  implements EnforceCamelCase<PrivateThreadChannelEntity>
{
  declare readonly data: PrivateThreadChannelEntity;

  override get type(): ChannelType.PrivateThread {
    return ChannelType.PrivateThread;
  }

  get invitable(): boolean {
    return Boolean(this.data.invitable);
  }
}
