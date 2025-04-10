import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { User } from "../users/index.js";

export class Emoji
  extends BaseClass<GuildBased<EmojiEntity>>
  implements EnforceCamelCase<GuildBased<EmojiEntity>>
{
  get id(): Snowflake | null {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string | null {
    return this.data.name;
  }

  get roles(): Snowflake[] | undefined {
    return this.data.roles;
  }

  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return User.from(this.client, this.data.user);
  }

  get requireColons(): boolean {
    return Boolean(this.data.require_colons);
  }

  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  get animated(): boolean {
    return Boolean(this.data.animated);
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "emojis",
      id: this.id,
    };
  }
}
