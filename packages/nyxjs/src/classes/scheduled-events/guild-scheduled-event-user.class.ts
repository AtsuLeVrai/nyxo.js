import type { Snowflake } from "@nyxjs/core";
import type { GuildScheduledEventUserAddRemoveEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

// export class GuildScheduledEventUser
//   extends BaseClass<GuildScheduledEventUserEntity>
//   implements EnforceCamelCase<GuildScheduledEventUserEntity>
// {
//   get guildScheduledEventId(): Snowflake {
//     return this.data.guild_scheduled_event_id;
//   }
//
//   get user(): User {
//     return User.from(this.client, this.data.user);
//   }
//
//   get member(): GuildMember | undefined {
//     if (!this.data.member) {
//       return undefined;
//     }
//
//     return GuildMember.from(
//       this.client,
//       this.data.member as GuildBased<GuildMemberEntity>,
//     );
//   }
//
//   protected override getCacheInfo(): CacheEntityInfo | null {
//     return null;
//   }
// }

export class GuildScheduledEventUser
  extends BaseClass<GuildScheduledEventUserAddRemoveEntity>
  implements EnforceCamelCase<GuildScheduledEventUserAddRemoveEntity>
{
  get guildScheduledEventId(): Snowflake {
    return this.data.guild_scheduled_event_id;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
