import { GuildOnboardingPromptOptionEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildOnboardingPromptOption {
  readonly #data: GuildOnboardingPromptOptionEntity;

  constructor(data: GuildOnboardingPromptOptionEntity) {
    this.#data = GuildOnboardingPromptOptionEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get channelIds(): unknown[] {
    return Array.isArray(this.#data.channel_ids)
      ? [...this.#data.channel_ids]
      : [];
  }

  get roleIds(): unknown[] {
    return Array.isArray(this.#data.role_ids) ? [...this.#data.role_ids] : [];
  }

  get emoji(): unknown | null {
    return this.#data.emoji ?? null;
  }

  get emojiId(): unknown | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  get emojiAnimated(): boolean | null {
    return this.#data.emoji_animated ?? null;
  }

  get title(): string {
    return this.#data.title;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  static fromJson(
    json: GuildOnboardingPromptOptionEntity,
  ): GuildOnboardingPromptOption {
    return new GuildOnboardingPromptOption(json);
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
