import { type Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class SoundboardSound extends BaseClass<SoundboardSoundEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof SoundboardSoundEntity>> = {},
  ) {
    super(client, SoundboardSoundEntity, data);
  }

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
    return this.data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.data.emoji_name ?? null;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  toJson(): SoundboardSoundEntity {
    return { ...this.data };
  }
}

export const SoundboardSoundSchema = z.instanceof(SoundboardSound);
