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
    entity: Partial<z.input<typeof WebhookEntity>> = {},
  ) {
    super(client, WebhookEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): WebhookType {
    return this.entity.type;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get channelId(): Snowflake | null {
    return this.entity.channel_id ?? null;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get name(): string | null {
    return this.entity.name ?? null;
  }

  get avatar(): string | null {
    return this.entity.avatar ?? null;
  }

  get token(): string | null {
    return this.entity.token ?? null;
  }

  get applicationId(): unknown | null {
    return this.entity.application_id ?? null;
  }

  get sourceGuild(): Guild | null {
    return this.entity.source_guild
      ? new Guild(this.client, this.entity.source_guild)
      : null;
  }

  get sourceChannel(): Channel | null {
    return this.entity.source_channel
      ? new Channel(this.client, this.entity.source_channel)
      : null;
  }

  get url(): string | null {
    return this.entity.url ?? null;
  }

  toJson(): WebhookEntity {
    return { ...this.entity };
  }
}

export const WebhookSchema = z.instanceof(Webhook);
