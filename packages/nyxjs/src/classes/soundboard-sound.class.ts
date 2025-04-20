import type {
  Snowflake,
  SoundboardSoundEntity,
  UserEntity,
} from "@nyxojs/core";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import { User } from "./user.class.js";

@Cacheable("soundboards")
export class SoundboardSound
  extends BaseClass<SoundboardSoundEntity>
  implements Enforce<CamelCasedProperties<SoundboardSoundEntity>>
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
}
