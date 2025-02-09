import { GuildOnboardingPromptEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildOnboardingPrompt {
  readonly #data: GuildOnboardingPromptEntity;

  constructor(data: GuildOnboardingPromptEntity) {
    this.#data = GuildOnboardingPromptEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get options(): object[] {
    return Array.isArray(this.#data.options) ? [...this.#data.options] : [];
  }

  get title(): string {
    return this.#data.title;
  }

  get singleSelect(): boolean {
    return Boolean(this.#data.single_select);
  }

  get required(): boolean {
    return Boolean(this.#data.required);
  }

  get inOnboarding(): boolean {
    return Boolean(this.#data.in_onboarding);
  }

  static fromJson(json: GuildOnboardingPromptEntity): GuildOnboardingPrompt {
    return new GuildOnboardingPrompt(json);
  }

  toJson(): GuildOnboardingPromptEntity {
    return { ...this.#data };
  }

  clone(): GuildOnboardingPrompt {
    return new GuildOnboardingPrompt(this.toJson());
  }

  validate(): boolean {
    try {
      GuildOnboardingPromptSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildOnboardingPromptEntity>): GuildOnboardingPrompt {
    return new GuildOnboardingPrompt({ ...this.toJson(), ...other });
  }

  equals(other: GuildOnboardingPrompt): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildOnboardingPromptSchema = z.instanceof(GuildOnboardingPrompt);
