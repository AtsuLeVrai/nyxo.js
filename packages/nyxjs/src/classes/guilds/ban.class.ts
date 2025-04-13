import type { BanEntity, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { User } from "../users/index.js";

export class Ban
  extends BaseClass<GuildBased<BanEntity>>
  implements EnforceCamelCase<GuildBased<BanEntity>>
{
  get reason(): string | null {
    return this.data.reason;
  }

  get user(): User {
    return new User(this.client, this.data.user);
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
