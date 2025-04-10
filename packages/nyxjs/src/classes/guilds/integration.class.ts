import type {
  IntegrationAccountEntity,
  IntegrationEntity,
  IntegrationExpirationBehavior,
  OAuth2Scope,
  Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { User } from "../users/index.js";
import { IntegrationApplication } from "./integration-application.class.js";

export class Integration
  extends BaseClass<GuildBased<IntegrationEntity>>
  implements EnforceCamelCase<GuildBased<IntegrationEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string {
    return this.data.name;
  }

  get type(): string {
    return this.data.type;
  }

  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  get syncing(): boolean {
    return Boolean(this.data.syncing);
  }

  get roleId(): Snowflake | undefined {
    return this.data.role_id;
  }

  get enableEmoticons(): boolean {
    return Boolean(this.data.enable_emoticons);
  }

  get expireBehavior(): IntegrationExpirationBehavior | undefined {
    return this.data.expire_behavior;
  }

  get expireGracePeriod(): number | undefined {
    return this.data.expire_grace_period;
  }

  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return User.from(this.client, this.data.user);
  }

  get account(): IntegrationAccountEntity {
    return this.data.account;
  }

  get syncedAt(): string | undefined {
    return this.data.synced_at;
  }

  get subscriberCount(): number | undefined {
    return this.data.subscriber_count;
  }

  get revoked(): boolean {
    return Boolean(this.data.revoked);
  }

  get application(): IntegrationApplication | undefined {
    if (!this.data.application) {
      return undefined;
    }

    return IntegrationApplication.from(this.client, this.data.application);
  }

  get scopes(): OAuth2Scope[] | undefined {
    return this.data.scopes;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "integrations",
      id: this.id,
    };
  }
}
