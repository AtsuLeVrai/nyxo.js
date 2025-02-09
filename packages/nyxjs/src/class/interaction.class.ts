import { InteractionEntity } from "@nyxjs/core";
import { z } from "zod";

export class Interaction {
  readonly #data: InteractionEntity;

  constructor(data: InteractionEntity) {
    this.#data = InteractionEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get applicationId(): unknown {
    return this.#data.application_id;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get data(): unknown | null {
    return this.#data.data ?? null;
  }

  get guild(): object | null {
    return this.#data.guild ?? null;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get channel(): object | null {
    return this.#data.channel ?? null;
  }

  get channelId(): unknown | null {
    return this.#data.channel_id ?? null;
  }

  get member(): object | null {
    return this.#data.member ?? null;
  }

  get user(): object | null {
    return this.#data.user ?? null;
  }

  get token(): string {
    return this.#data.token;
  }

  get version(): unknown {
    return this.#data.version;
  }

  get message(): object | null {
    return this.#data.message ?? null;
  }

  get appPermissions(): unknown {
    return this.#data.app_permissions;
  }

  get locale(): unknown | null {
    return this.#data.locale ?? null;
  }

  get guildLocale(): unknown | null {
    return this.#data.guild_locale ?? null;
  }

  get entitlements(): object[] {
    return Array.isArray(this.#data.entitlements)
      ? [...this.#data.entitlements]
      : [];
  }

  get authorizingIntegrationOwners(): unknown {
    return this.#data.authorizing_integration_owners;
  }

  get context(): unknown | null {
    return this.#data.context ?? null;
  }

  static fromJson(json: InteractionEntity): Interaction {
    return new Interaction(json);
  }

  toJson(): InteractionEntity {
    return { ...this.#data };
  }

  clone(): Interaction {
    return new Interaction(this.toJson());
  }

  validate(): boolean {
    try {
      InteractionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<InteractionEntity>): Interaction {
    return new Interaction({ ...this.toJson(), ...other });
  }

  equals(other: Interaction): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const InteractionSchema = z.instanceof(Interaction);
