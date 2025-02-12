import { WelcomeScreenEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { WelcomeScreenChannel } from "./welcome-screen-channel.class.js";

export class WelcomeScreen extends BaseClass<WelcomeScreenEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof WelcomeScreenEntity>> = {},
  ) {
    super(client, WelcomeScreenEntity, entity);
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get welcomeChannels(): WelcomeScreenChannel[] {
    return Array.isArray(this.entity.welcome_channels)
      ? this.entity.welcome_channels.map(
          (channel) => new WelcomeScreenChannel(this.client, channel),
        )
      : [];
  }

  toJson(): WelcomeScreenEntity {
    return { ...this.entity };
  }
}

export const WelcomeScreenSchema = z.instanceof(WelcomeScreen);
