import type { EmojiEntity, GuildMemberEntity, Snowflake } from "@nyxjs/core";
import type { MessageReactionAddEntity } from "@nyxjs/gateway";
import type { ReactionTypeFlag } from "@nyxjs/rest";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { Emoji } from "../emojis/index.js";
import { GuildMember } from "../guilds/index.js";

export class MessageReaction
  extends BaseClass<MessageReactionAddEntity>
  implements EnforceCamelCase<MessageReactionAddEntity>
{
  get userId(): Snowflake {
    return this.data.user_id;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get messageId(): Snowflake {
    return this.data.message_id;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
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

  get emoji(): Emoji {
    return Emoji.from(this.client, this.data.emoji as GuildBased<EmojiEntity>);
  }

  get messageAuthorId(): Snowflake | undefined {
    return this.data.message_author_id;
  }

  get burst(): boolean {
    return this.data.burst;
  }

  get burstColors(): string[] | undefined {
    return this.data.burst_colors;
  }

  get type(): ReactionTypeFlag {
    return this.data.type;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
