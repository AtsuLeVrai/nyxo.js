import type { Snowflake, SoundboardSoundEntity, UserEntity } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";

export class SoundboardSound
  extends BaseClass<SoundboardSoundEntity>
  implements EnforceCamelCase<SoundboardSoundEntity>
{
  get name(): string {
    return this.data.name;
  }

  get soundId(): Snowflake {
    return this.data.sound_id;
  }

  get volume(): number {
    return this.data.volume;
  }

  get emojiId(): Snowflake | null {
    return this.data.emoji_id;
  }

  get emojiName(): string | null {
    return this.data.emoji_name;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user as UserEntity);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "soundboards",
      id: this.soundId,
    };
  }
}
