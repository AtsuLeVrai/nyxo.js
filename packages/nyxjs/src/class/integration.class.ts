import type {
  IntegrationExpirationBehavior,
  OAuth2Scope,
  Snowflake,
} from "@nyxjs/core";
import { IntegrationUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Application } from "./application.class.js";
import { IntegrationAccount } from "./integration-account.class.js";
import { User } from "./user.class.js";

export class Integration extends BaseClass<IntegrationUpdateEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof IntegrationUpdateEntity>> = {},
  ) {
    super(client, IntegrationUpdateEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get type(): "twitch" | "youtube" | "discord" | "guild_subscription" {
    return this.entity.type;
  }

  get enabled(): boolean {
    return Boolean(this.entity.enabled);
  }

  get syncing(): boolean {
    return Boolean(this.entity.syncing);
  }

  get roleId(): Snowflake | null {
    return this.entity.role_id ?? null;
  }

  get enableEmoticons(): boolean {
    return Boolean(this.entity.enable_emoticons);
  }

  get expireBehavior(): IntegrationExpirationBehavior | null {
    return this.entity.expire_behavior ?? null;
  }

  get expireGracePeriod(): number | null {
    return this.entity.expire_grace_period ?? null;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get account(): IntegrationAccount | null {
    return this.entity.account
      ? new IntegrationAccount(this.client, this.entity.account)
      : null;
  }

  get syncedAt(): string | null {
    return this.entity.synced_at ?? null;
  }

  get subscriberCount(): number | null {
    return this.entity.subscriber_count ?? null;
  }

  get revoked(): boolean {
    return Boolean(this.entity.revoked);
  }

  get application(): Application | null {
    return this.entity.application
      ? new Application(this.client, this.entity.application)
      : null;
  }

  get scopes(): OAuth2Scope[] | null {
    return this.entity.scopes ?? null;
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  toJson(): IntegrationUpdateEntity {
    return { ...this.entity };
  }
}

export const IntegrationSchema = z.instanceof(Integration);
