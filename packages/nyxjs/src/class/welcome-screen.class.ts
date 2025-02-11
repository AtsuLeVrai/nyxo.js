import { WelcomeScreenEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { WelcomeScreenChannel } from "./welcome-screen-channel.class.js";

export class WelcomeScreen extends BaseClass<WelcomeScreenEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof WelcomeScreenEntity>> = {},
  ) {
    super(client, WelcomeScreenEntity, data);
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get welcomeChannels(): WelcomeScreenChannel[] {
    return Array.isArray(this.data.welcome_channels)
      ? this.data.welcome_channels.map(
          (channel) => new WelcomeScreenChannel(this.client, channel),
        )
      : [];
  }

  toJson(): WelcomeScreenEntity {
    return { ...this.data };
  }
}

export const WelcomeScreenSchema = z.instanceof(WelcomeScreen);
