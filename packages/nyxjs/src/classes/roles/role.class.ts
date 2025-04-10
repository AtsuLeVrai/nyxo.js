import {
  BitFieldManager,
  type RoleEntity,
  type RoleFlags,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { RoleTags } from "./role-tags.class.js";

export class Role
  extends BaseClass<GuildBased<RoleEntity>>
  implements EnforceCamelCase<GuildBased<RoleEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string {
    return this.data.name;
  }

  get color(): number {
    return this.data.color;
  }

  get hoist(): boolean {
    return Boolean(this.data.hoist);
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get unicodeEmoji(): string | null | undefined {
    return this.data.unicode_emoji;
  }

  get position(): number {
    return this.data.position;
  }

  get permissions(): string {
    return this.data.permissions;
  }

  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  get mentionable(): boolean {
    return Boolean(this.data.mentionable);
  }

  get tags(): RoleTags | undefined {
    if (!this.data.tags) {
      return undefined;
    }

    return RoleTags.from(this.client, this.data.tags);
  }

  get flags(): BitFieldManager<RoleFlags> {
    return new BitFieldManager<RoleFlags>(this.data.flags);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "roles",
      id: this.id,
    };
  }
}
