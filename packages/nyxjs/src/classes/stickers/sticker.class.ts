import type {
  Snowflake,
  StickerEntity,
  StickerFormatType,
  StickerType,
  UserEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";

export class Sticker
  extends BaseClass<StickerEntity>
  implements EnforceCamelCase<StickerEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get packId(): Snowflake | undefined {
    return this.data.pack_id;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | null {
    return this.data.description;
  }

  get tags(): string {
    return this.data.tags;
  }

  get type(): StickerType {
    return this.data.type;
  }

  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return User.from(this.client, this.data.user as UserEntity);
  }

  get sortValue(): number | undefined {
    return this.data.sort_value;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "stickers",
      id: this.id,
    };
  }
}
