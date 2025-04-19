import {
  BitField,
  type RoleEntity,
  type RoleFlags,
  type RoleTagsEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import { toCamelCasedDeep } from "../utils/index.js";

@Cacheable("roles")
export class Role
  extends BaseClass<GuildBased<RoleEntity>>
  implements Enforce<CamelCasedProperties<GuildBased<RoleEntity>>>
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

  get tags(): CamelCasedPropertiesDeep<RoleTagsEntity> | undefined {
    if (!this.data.tags) {
      return undefined;
    }

    return toCamelCasedDeep(this.data.tags);
  }

  get flags(): BitField<RoleFlags> {
    return new BitField<RoleFlags>(this.data.flags);
  }
}
