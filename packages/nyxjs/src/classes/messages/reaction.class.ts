import type {
  EmojiEntity,
  ReactionCountDetailsEntity,
  ReactionEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { Emoji } from "../emojis/index.js";

export class Reaction
  extends BaseClass<ReactionEntity>
  implements EnforceCamelCase<ReactionEntity>
{
  get count(): number {
    return this.data.count;
  }

  get countDetails(): ReactionCountDetailsEntity {
    return this.data.count_details;
  }

  get me(): boolean {
    return Boolean(this.data.me);
  }

  get meBurst(): boolean {
    return Boolean(this.data.me_burst);
  }

  get emoji(): Emoji {
    return new Emoji(this.client, this.data.emoji as GuildBased<EmojiEntity>);
  }

  get burstColors(): string[] | undefined {
    return this.data.burst_colors;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
