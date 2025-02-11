import { type Snowflake, WebhookEntity, type WebhookType } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Channel } from "./channel.class.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class Webhook extends BaseClass<WebhookEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof WebhookEntity>> = {},
  ) {
    super(client, WebhookEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): WebhookType {
    return this.data.type;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get channelId(): Snowflake | null {
    return this.data.channel_id ?? null;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get avatar(): string | null {
    return this.data.avatar ?? null;
  }

  get token(): string | null {
    return this.data.token ?? null;
  }

  get applicationId(): unknown | null {
    return this.data.application_id ?? null;
  }

  get sourceGuild(): Guild | null {
    return this.data.source_guild
      ? new Guild(this.client, this.data.source_guild)
      : null;
  }

  get sourceChannel(): Channel | null {
    return this.data.source_channel
      ? new Channel(this.client, this.data.source_channel)
      : null;
  }

  get url(): string | null {
    return this.data.url ?? null;
  }

  toJson(): WebhookEntity {
    return { ...this.data };
  }
}

export const WebhookSchema = z.instanceof(Webhook);
