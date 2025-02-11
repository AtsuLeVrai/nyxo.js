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
    data: Partial<z.input<typeof GuildOnboardingEntity>> = {},
  ) {
    super(client, GuildOnboardingEntity, data);
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get prompts(): GuildOnboardingPrompt[] {
    return Array.isArray(this.data.prompts)
      ? this.data.prompts.map(
          (prompt) => new GuildOnboardingPrompt(this.client, prompt),
        )
      : [];
  }

  get defaultChannelIds(): Snowflake[] {
    return Array.isArray(this.data.default_channel_ids)
      ? [...this.data.default_channel_ids]
      : [];
  }

  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  get mode(): GuildOnboardingMode {
    return this.data.mode;
  }

  toJson(): GuildOnboardingEntity {
    return { ...this.data };
  }
}

export const GuildOnboardingSchema = z.instanceof(GuildOnboarding);
