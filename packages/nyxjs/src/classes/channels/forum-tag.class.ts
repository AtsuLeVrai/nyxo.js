import type { ForumTagEntity, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class ForumTag
  extends BaseClass<ForumTagEntity>
  implements EnforceCamelCase<ForumTagEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get moderated(): boolean {
    return Boolean(this.data.moderated);
  }

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
