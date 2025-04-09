import type { GuildMemberEntity, Snowflake } from "@nyxjs/core";
import type { TypingStartEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import type { GuildBased } from "../types/index.js";
import { GuildMember } from "./guild.class.js";

export class TypingStart extends BaseClass<TypingStartEntity> {
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get timestamp(): number {
    return this.data.timestamp;
  }

  get member(): GuildMember | null | undefined {
    if (!this.data.member) {
      return null;
    }

    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
