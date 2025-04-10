import type {
  GuildMemberEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { GuildMember } from "../guilds/index.js";

export class ThreadMember
  extends BaseClass<GuildBased<ThreadMemberEntity>>
  implements EnforceCamelCase<GuildBased<ThreadMemberEntity>>
{
  get id(): Snowflake | undefined {
    return this.data.id;
  }

  get userId(): Snowflake | undefined {
    return this.data.user_id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get joinTimestamp(): string {
    return this.data.join_timestamp;
  }

  get flags(): number {
    return this.data.flags;
  }

  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "threadMembers",
      id: `${this.guildId}:${this.id}:${this.userId}`,
    };
  }
}
