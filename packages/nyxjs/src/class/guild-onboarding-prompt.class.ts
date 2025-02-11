import {
  GuildOnboardingPromptEntity,
  type GuildOnboardingPromptType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildOnboardingPromptOption } from "./guild-onboarding-prompt-option.class.js";

export class GuildOnboardingPrompt extends BaseClass<GuildOnboardingPromptEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildOnboardingPromptEntity>> = {},
  ) {
    super(client, GuildOnboardingPromptEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): GuildOnboardingPromptType {
    return this.data.type;
  }

  get options(): GuildOnboardingPromptOption[] {
    return Array.isArray(this.data.options)
      ? this.data.options.map(
          (option) => new GuildOnboardingPromptOption(this.client, option),
        )
      : [];
  }

  get title(): string {
    return this.data.title;
  }

  get singleSelect(): boolean {
    return Boolean(this.data.single_select);
  }

  get required(): boolean {
    return Boolean(this.data.required);
  }

  get inOnboarding(): boolean {
    return Boolean(this.data.in_onboarding);
  }

  toJson(): GuildOnboardingPromptEntity {
    return { ...this.data };
  }
}

export const GuildOnboardingPromptSchema = z.instanceof(GuildOnboardingPrompt);
