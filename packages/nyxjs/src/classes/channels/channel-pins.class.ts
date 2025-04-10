import type { Snowflake } from "@nyxjs/core";
import type { ChannelPinsUpdateEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class ChannelPins
  extends BaseClass<ChannelPinsUpdateEntity>
  implements EnforceCamelCase<ChannelPinsUpdateEntity, true>
{
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
