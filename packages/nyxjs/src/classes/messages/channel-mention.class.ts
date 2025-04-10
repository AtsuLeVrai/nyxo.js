import type { ChannelMentionEntity, ChannelType, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class ChannelMention
  extends BaseClass<ChannelMentionEntity>
  implements EnforceCamelCase<ChannelMentionEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get type(): ChannelType {
    return this.data.type;
  }

  get name(): string {
    return this.data.name;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
