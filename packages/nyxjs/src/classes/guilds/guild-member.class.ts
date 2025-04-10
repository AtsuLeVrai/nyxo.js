import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type GuildMemberEntity,
  type GuildMemberFlags,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { User } from "../users/index.js";

export class GuildMember
  extends BaseClass<GuildBased<GuildMemberEntity>>
  implements EnforceCamelCase<GuildBased<GuildMemberEntity>>
{
  get user(): User {
    return User.from(this.client, this.data.user);
  }

  get nick(): string | null | undefined {
    return this.data.nick;
  }

  get avatar(): string | null | undefined {
    return this.data.avatar;
  }

  get banner(): string | null | undefined {
    return this.data.banner;
  }

  get roles(): Snowflake[] {
    return this.data.roles;
  }

  get joinedAt(): string {
    return this.data.joined_at;
  }

  get premiumSince(): string | null | undefined {
    return this.data.premium_since;
  }

  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  get flags(): BitFieldManager<GuildMemberFlags> {
    return new BitFieldManager<GuildMemberFlags>(this.data.flags);
  }

  get pending(): boolean {
    return Boolean(this.data.pending);
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get communicationDisabledUntil(): string | null | undefined {
    return this.data.communication_disabled_until;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null | undefined {
    return this.data.avatar_decoration_data;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "members",
      id: `${this.guildId}:${this.user.id}`,
    };
  }
}
