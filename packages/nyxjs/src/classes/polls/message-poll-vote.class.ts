import type { Snowflake } from "@nyxjs/core";
import type { MessagePollVoteEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class MessagePollVote
  extends BaseClass<MessagePollVoteEntity>
  implements EnforceCamelCase<MessagePollVoteEntity>
{
  get userId(): string {
    return this.data.user_id;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get messageId(): Snowflake {
    return this.data.message_id;
  }

  get answerId(): number {
    return this.data.answer_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
