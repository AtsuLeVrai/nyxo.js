import type { DefaultReactionEntity, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class DefaultReaction
  extends BaseClass<DefaultReactionEntity>
  implements EnforceCamelCase<DefaultReactionEntity>
{
  get emojiId(): Snowflake | null {
    return this.data.emoji_id;
  }

  get emojiName(): string | null {
    return this.data.emoji_name;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
