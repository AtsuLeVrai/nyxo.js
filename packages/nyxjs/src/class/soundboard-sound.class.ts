import { type Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class SoundboardSound extends BaseClass<SoundboardSoundEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof SoundboardSoundEntity>> = {},
  ) {
    super(client, SoundboardSoundEntity, entity);
  }

  get name(): string {
    return this.entity.name;
  }

  get soundId(): Snowflake {
    return this.entity.sound_id;
  }

  get volume(): number {
    return this.entity.volume;
  }

  get emojiId(): Snowflake | null {
    return this.entity.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.entity.emoji_name ?? null;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get available(): boolean {
    return Boolean(this.entity.available);
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  toJson(): SoundboardSoundEntity {
    return { ...this.entity };
  }
}

export const SoundboardSoundSchema = z.instanceof(SoundboardSound);
