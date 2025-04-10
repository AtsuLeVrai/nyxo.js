import type {
  GuildMemberEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { GuildMember } from "../guilds/index.js";
import { User } from "../users/index.js";

export class GuildScheduledEventUser
  extends BaseClass<GuildScheduledEventUserEntity>
  implements EnforceCamelCase<GuildScheduledEventUserEntity>
{
  get guildScheduledEventId(): Snowflake {
    return this.data.guild_scheduled_event_id;
  }

  get user(): User {
    return User.from(this.client, this.data.user);
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
    return null;
  }
}
