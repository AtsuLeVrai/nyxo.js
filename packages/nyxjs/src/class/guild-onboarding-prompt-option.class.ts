import { GuildOnboardingPromptOptionEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Emoji } from "./emoji.class.js";

export class GuildOnboardingPromptOption {
  readonly #data: GuildOnboardingPromptOptionEntity;

  constructor(
    data: Partial<z.input<typeof GuildOnboardingPromptOptionEntity>> = {},
  ) {
    try {
      this.#data = GuildOnboardingPromptOptionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get channelIds(): Snowflake[] {
    return Array.isArray(this.#data.channel_ids)
      ? [...this.#data.channel_ids]
      : [];
  }

  get roleIds(): Snowflake[] {
    return Array.isArray(this.#data.role_ids) ? [...this.#data.role_ids] : [];
  }

  get emoji(): Emoji | null {
    return this.#data.emoji ? new Emoji(this.#data.emoji) : null;
  }

  get emojiId(): Snowflake | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  get emojiAnimated(): boolean {
    return Boolean(this.#data.emoji_animated);
  }

  get title(): string {
    return this.#data.title;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  toJson(): GuildOnboardingPromptOptionEntity {
    return { ...this.#data };
  }

  clone(): GuildOnboardingPromptOption {
    return new GuildOnboardingPromptOption(this.toJson());
  }

  validate(): boolean {
    try {
      GuildOnboardingPromptOptionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(
    other: Partial<GuildOnboardingPromptOptionEntity>,
  ): GuildOnboardingPromptOption {
    return new GuildOnboardingPromptOption({ ...this.toJson(), ...other });
  }

  equals(other: GuildOnboardingPromptOption): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildOnboardingPromptOptionSchema = z.instanceof(
  GuildOnboardingPromptOption,
);
