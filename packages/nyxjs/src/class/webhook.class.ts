import { WebhookEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Webhook {
  readonly #data: WebhookEntity;

  constructor(data: Partial<z.input<typeof WebhookEntity>> = {}) {
    try {
      this.#data = WebhookEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): unknown {
    return this.#data.id;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get channelId(): unknown | null {
    return this.#data.channel_id ?? null;
  }

  get user(): object | null {
    return this.#data.user ?? null;
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

  get sourceGuild(): object | null {
    return this.#data.source_guild ?? null;
  }

  get sourceChannel(): unknown | null {
    return this.#data.source_channel ?? null;
  }

  get url(): string | null {
    return this.#data.url ?? null;
  }

  static fromJson(json: WebhookEntity): Webhook {
    return new Webhook(json);
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
