import {
  GuildOnboardingEntity,
  type GuildOnboardingMode,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildOnboardingPrompt } from "./guild-onboarding-prompt.class.js";

export class GuildOnboarding extends BaseClass<GuildOnboardingEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildOnboardingEntity>> = {},
  ) {
    super(client, GuildOnboardingEntity, entity);
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get prompts(): GuildOnboardingPrompt[] {
    return Array.isArray(this.entity.prompts)
      ? this.entity.prompts.map(
          (prompt) => new GuildOnboardingPrompt(this.client, prompt),
        )
      : [];
  }

  get defaultChannelIds(): Snowflake[] {
    return Array.isArray(this.entity.default_channel_ids)
      ? [...this.entity.default_channel_ids]
      : [];
  }

  get enabled(): boolean {
    return Boolean(this.entity.enabled);
  }

  get mode(): GuildOnboardingMode {
    return this.entity.mode;
  }

  toJson(): GuildOnboardingEntity {
    return { ...this.entity };
  }
}

export const GuildOnboardingSchema = z.instanceof(GuildOnboarding);
