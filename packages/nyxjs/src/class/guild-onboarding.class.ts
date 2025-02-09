import { GuildOnboardingEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildOnboarding {
  readonly #data: GuildOnboardingEntity;

  constructor(data: GuildOnboardingEntity) {
    this.#data = GuildOnboardingEntity.parse(data);
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get prompts(): object[] {
    return Array.isArray(this.#data.prompts) ? [...this.#data.prompts] : [];
  }

  get defaultChannelIds(): unknown[] {
    return Array.isArray(this.#data.default_channel_ids)
      ? [...this.#data.default_channel_ids]
      : [];
  }

  get enabled(): boolean {
    return Boolean(this.#data.enabled);
  }

  get mode(): unknown {
    return this.#data.mode;
  }

  static fromJson(json: GuildOnboardingEntity): GuildOnboarding {
    return new GuildOnboarding(json);
  }

  toJson(): GuildOnboardingEntity {
    return { ...this.#data };
  }

  clone(): GuildOnboarding {
    return new GuildOnboarding(this.toJson());
  }

  validate(): boolean {
    try {
      GuildOnboardingSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildOnboardingEntity>): GuildOnboarding {
    return new GuildOnboarding({ ...this.toJson(), ...other });
  }

  equals(other: GuildOnboarding): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildOnboardingSchema = z.instanceof(GuildOnboarding);
