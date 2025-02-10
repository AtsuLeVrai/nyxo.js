import {
  GuildOnboardingEntity,
  type GuildOnboardingMode,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { GuildOnboardingPrompt } from "./guild-onboarding-prompt.class.js";

export class GuildOnboarding {
  readonly #data: GuildOnboardingEntity;

  constructor(data: Partial<z.input<typeof GuildOnboardingEntity>> = {}) {
    try {
      this.#data = GuildOnboardingEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get prompts(): GuildOnboardingPrompt[] {
    return Array.isArray(this.#data.prompts)
      ? this.#data.prompts.map((prompt) => new GuildOnboardingPrompt(prompt))
      : [];
  }

  get defaultChannelIds(): Snowflake[] {
    return Array.isArray(this.#data.default_channel_ids)
      ? [...this.#data.default_channel_ids]
      : [];
  }

  get enabled(): boolean {
    return Boolean(this.#data.enabled);
  }

  get mode(): GuildOnboardingMode {
    return this.#data.mode;
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
