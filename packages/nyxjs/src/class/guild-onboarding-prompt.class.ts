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
    entity: Partial<z.input<typeof GuildOnboardingPromptEntity>> = {},
  ) {
    super(client, GuildOnboardingPromptEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): GuildOnboardingPromptType {
    return this.entity.type;
  }

  get options(): GuildOnboardingPromptOption[] {
    return Array.isArray(this.entity.options)
      ? this.entity.options.map(
          (option) => new GuildOnboardingPromptOption(this.client, option),
        )
      : [];
  }

  get title(): string {
    return this.entity.title;
  }

  get singleSelect(): boolean {
    return Boolean(this.entity.single_select);
  }

  get required(): boolean {
    return Boolean(this.entity.required);
  }

  get inOnboarding(): boolean {
    return Boolean(this.entity.in_onboarding);
  }

  toJson(): GuildOnboardingPromptEntity {
    return { ...this.entity };
  }
}

export const GuildOnboardingPromptSchema = z.instanceof(GuildOnboardingPrompt);
