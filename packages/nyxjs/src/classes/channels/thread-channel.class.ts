import type {
  AnyThreadChannelEntity,
  Snowflake,
  ThreadMemberEntity,
  ThreadMetadataEntity,
} from "@nyxjs/core";
import type { GuildBased } from "../../types/index.js";
import { Channel } from "./channel.class.js";
import { ThreadMember } from "./thread-member.class.js";

export abstract class ThreadChannel<
  T extends AnyThreadChannelEntity,
> extends Channel<T> {
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  get ownerId(): Snowflake | undefined {
    return this.data.owner_id;
  }

  get parentId(): Snowflake {
    return this.data.parent_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
  }

  get messageCount(): number | undefined {
    return this.data.message_count;
  }

  get memberCount(): number | undefined {
    return this.data.member_count;
  }

  get threadMetadata(): ThreadMetadataEntity {
    return this.data.thread_metadata;
  }

  get member(): ThreadMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return ThreadMember.from(
      this.client,
      this.data.member as GuildBased<ThreadMemberEntity>,
    );
  }

  get flags(): number {
    return this.data.flags;
  }

  get totalMessageSent(): number | undefined {
    return this.data.total_message_sent;
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }
}
