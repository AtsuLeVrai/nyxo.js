import { IntegrationUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class Integration {
  readonly #data: IntegrationUpdateEntity;

  constructor(data: IntegrationUpdateEntity) {
    this.#data = IntegrationUpdateEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get type(): "twitch" | "youtube" | "discord" | "guild_subscription" {
    return this.#data.type;
  }

  get enabled(): boolean {
    return Boolean(this.#data.enabled);
  }

  get syncing(): boolean | null {
    return this.#data.syncing ?? null;
  }

  get roleId(): unknown | null {
    return this.#data.role_id ?? null;
  }

  get enableEmoticons(): boolean | null {
    return this.#data.enable_emoticons ?? null;
  }

  get expireBehavior(): unknown | null {
    return this.#data.expire_behavior ?? null;
  }

  get expireGracePeriod(): number | null {
    return this.#data.expire_grace_period ?? null;
  }

  get user(): unknown | null {
    return this.#data.user ?? null;
  }

  get account(): object | null {
    return this.#data.account ? { ...this.#data.account } : null;
  }

  get syncedAt(): string | null {
    return this.#data.synced_at ?? null;
  }

  get subscriberCount(): number | null {
    return this.#data.subscriber_count ?? null;
  }

  get revoked(): boolean | null {
    return this.#data.revoked ?? null;
  }

  get application(): object | null {
    return this.#data.application ?? null;
  }

  get scopes(): unknown | null {
    return this.#data.scopes ?? null;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  static fromJson(json: IntegrationUpdateEntity): Integration {
    return new Integration(json);
  }

  toJson(): IntegrationUpdateEntity {
    return { ...this.#data };
  }

  clone(): Integration {
    return new Integration(this.toJson());
  }

  validate(): boolean {
    try {
      IntegrationSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<IntegrationUpdateEntity>): Integration {
    return new Integration({ ...this.toJson(), ...other });
  }

  equals(other: Integration): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const IntegrationSchema = z.instanceof(Integration);
