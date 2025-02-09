import { SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";

export class SoundboardSound {
  readonly #data: SoundboardSoundEntity;

  constructor(data: SoundboardSoundEntity) {
    this.#data = SoundboardSoundEntity.parse(data);
  }

  get name(): string {
    return this.#data.name;
  }

  get soundId(): unknown {
    return this.#data.sound_id;
  }

  get volume(): number {
    return this.#data.volume;
  }

  get emojiId(): unknown | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get available(): boolean {
    return Boolean(this.#data.available);
  }

  get user(): object | null {
    return this.#data.user ?? null;
  }

  static fromJson(json: SoundboardSoundEntity): SoundboardSound {
    return new SoundboardSound(json);
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
