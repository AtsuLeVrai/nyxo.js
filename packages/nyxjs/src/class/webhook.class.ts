import { type Snowflake, WebhookEntity, type WebhookType } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Channel } from "./channel.class.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class Webhook {
  readonly #data: WebhookEntity;

  constructor(data: Partial<z.input<typeof WebhookEntity>> = {}) {
    try {
      this.#data = WebhookEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): WebhookType {
    return this.#data.type;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get channelId(): Snowflake | null {
    return this.#data.channel_id ?? null;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get avatar(): string | null {
    return this.#data.avatar ?? null;
  }

  get token(): string | null {
    return this.#data.token ?? null;
  }

  get applicationId(): unknown | null {
    return this.#data.application_id ?? null;
  }

  get sourceGuild(): Guild | null {
    return this.#data.source_guild ? new Guild(this.#data.source_guild) : null;
  }

  get sourceChannel(): Channel | null {
    return this.#data.source_channel
      ? new Channel(this.#data.source_channel)
      : null;
  }

  get url(): string | null {
    return this.#data.url ?? null;
  }

  toJson(): WebhookEntity {
    return { ...this.#data };
  }

  clone(): Webhook {
    return new Webhook(this.toJson());
  }

  validate(): boolean {
    try {
      WebhookSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<WebhookEntity>): Webhook {
    return new Webhook({ ...this.toJson(), ...other });
  }

  equals(other: Webhook): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const WebhookSchema = z.instanceof(Webhook);
