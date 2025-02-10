import type {
  IntegrationExpirationBehavior,
  OAuth2Scope,
  Snowflake,
} from "@nyxjs/core";
import { IntegrationUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Application } from "./application.class.js";
import { IntegrationAccount } from "./integration-account.class.js";
import { User } from "./user.class.js";

export class Integration {
  readonly #data: IntegrationUpdateEntity;

  constructor(data: Partial<z.input<typeof IntegrationUpdateEntity>> = {}) {
    try {
      this.#data = IntegrationUpdateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
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

  get syncing(): boolean {
    return Boolean(this.#data.syncing);
  }

  get roleId(): Snowflake | null {
    return this.#data.role_id ?? null;
  }

  get enableEmoticons(): boolean {
    return Boolean(this.#data.enable_emoticons);
  }

  get expireBehavior(): IntegrationExpirationBehavior | null {
    return this.#data.expire_behavior ?? null;
  }

  get expireGracePeriod(): number | null {
    return this.#data.expire_grace_period ?? null;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get account(): IntegrationAccount | null {
    return this.#data.account
      ? new IntegrationAccount(this.#data.account)
      : null;
  }

  get syncedAt(): string | null {
    return this.#data.synced_at ?? null;
  }

  get subscriberCount(): number | null {
    return this.#data.subscriber_count ?? null;
  }

  get revoked(): boolean {
    return Boolean(this.#data.revoked);
  }

  get application(): Application | null {
    return this.#data.application
      ? new Application(this.#data.application)
      : null;
  }

  get scopes(): OAuth2Scope[] | null {
    return this.#data.scopes ?? null;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
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
