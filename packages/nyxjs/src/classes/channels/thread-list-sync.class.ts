import type { Snowflake, ThreadMemberEntity } from "@nyxjs/core";
import type { ThreadListSyncEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import { ChannelFactory } from "../../factories/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import type { AnyThreadChannel } from "./channel.class.js";
import { ThreadMember } from "./thread-member.class.js";

export class ThreadListSync
  extends BaseClass<ThreadListSyncEntity>
  implements EnforceCamelCase<ThreadListSyncEntity>
{
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get channelIds(): Snowflake[] | undefined {
    return this.data.channel_ids;
  }

  get threads(): AnyThreadChannel[] {
    return this.data.threads.map((thread) =>
      ChannelFactory.create(this.client, thread),
    ) as AnyThreadChannel[];
  }

  get members(): ThreadMember[] {
    return this.data.members.map((member) =>
      ThreadMember.from(this.client, member as GuildBased<ThreadMemberEntity>),
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
