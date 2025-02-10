import { type Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class SoundboardSound {
  readonly #data: SoundboardSoundEntity;

  constructor(data: Partial<z.input<typeof SoundboardSoundEntity>> = {}) {
    try {
      this.#data = SoundboardSoundEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get name(): string {
    return this.#data.name;
  }

  get soundId(): Snowflake {
    return this.#data.sound_id;
  }

  get volume(): number {
    return this.#data.volume;
  }

  get emojiId(): Snowflake | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get available(): boolean {
    return Boolean(this.#data.available);
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  toJson(): SoundboardSoundEntity {
    return { ...this.#data };
  }

  clone(): SoundboardSound {
    return new SoundboardSound(this.toJson());
  }

  validate(): boolean {
    try {
      SoundboardSoundSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<SoundboardSoundEntity>): SoundboardSound {
    return new SoundboardSound({ ...this.toJson(), ...other });
  }

  equals(other: SoundboardSound): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const SoundboardSoundSchema = z.instanceof(SoundboardSound);
