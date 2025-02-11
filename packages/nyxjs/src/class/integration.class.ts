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
    data: Partial<z.input<typeof IntegrationUpdateEntity>> = {},
  ) {
    super(client, IntegrationUpdateEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get type(): "twitch" | "youtube" | "discord" | "guild_subscription" {
    return this.data.type;
  }

  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  get syncing(): boolean {
    return Boolean(this.data.syncing);
  }

  get roleId(): Snowflake | null {
    return this.data.role_id ?? null;
  }

  get enableEmoticons(): boolean {
    return Boolean(this.data.enable_emoticons);
  }

  get expireBehavior(): IntegrationExpirationBehavior | null {
    return this.data.expire_behavior ?? null;
  }

  get expireGracePeriod(): number | null {
    return this.data.expire_grace_period ?? null;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get account(): IntegrationAccount | null {
    return this.data.account
      ? new IntegrationAccount(this.client, this.data.account)
      : null;
  }

  get syncedAt(): string | null {
    return this.data.synced_at ?? null;
  }

  get subscriberCount(): number | null {
    return this.data.subscriber_count ?? null;
  }

  get revoked(): boolean {
    return Boolean(this.data.revoked);
  }

  get application(): Application | null {
    return this.data.application
      ? new Application(this.client, this.data.application)
      : null;
  }

  get scopes(): OAuth2Scope[] | null {
    return this.data.scopes ?? null;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  toJson(): IntegrationUpdateEntity {
    return { ...this.data };
  }
}

export const IntegrationSchema = z.instanceof(Integration);
