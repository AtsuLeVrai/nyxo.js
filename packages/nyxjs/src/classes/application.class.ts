import {
  type ApplicationEntity,
  type ApplicationEventWebhookStatus,
  type ApplicationFlags,
  type ApplicationIntegrationType,
  type ApplicationIntegrationTypeConfigurationEntity,
  BitField,
  type InstallParamsEntity,
  type Snowflake,
  type TeamEntity,
  type UserEntity,
} from "@nyxjs/core";
import type { GuildCreateEntity } from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";
import type { EnforceCamelCase } from "../types/index.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class Application
  extends BaseClass<ApplicationEntity>
  implements EnforceCamelCase<ApplicationEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon;
  }

  get iconHash(): string | null | undefined {
    return this.data.icon_hash;
  }

  get description(): string {
    return this.data.description;
  }

  get rpcOrigins(): string[] | undefined {
    return this.data.rpc_origins;
  }

  get botPublic(): boolean {
    return Boolean(this.data.bot_public);
  }

  get botRequireCodeGrant(): boolean {
    return Boolean(this.data.bot_require_code_grant);
  }

  get bot(): User | undefined {
    if (!this.data.bot) {
      return undefined;
    }

    return new User(this.client, this.data.bot as UserEntity);
  }

  get termsOfServiceUrl(): string | undefined {
    return this.data.terms_of_service_url;
  }

  get privacyPolicyUrl(): string | undefined {
    return this.data.privacy_policy_url;
  }

  get owner(): User | undefined {
    if (!this.data.owner) {
      return undefined;
    }

    return new User(this.client, this.data.owner as UserEntity);
  }

  get verifyKey(): string {
    return this.data.verify_key;
  }

  get team(): TeamEntity | null {
    return this.data.team;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get guild(): Guild | undefined {
    if (!this.data.guild) {
      return undefined;
    }

    return new Guild(this.client, this.data.guild as GuildCreateEntity);
  }

  get primarySkuId(): Snowflake | undefined {
    return this.data.primary_sku_id;
  }

  get slug(): string | undefined {
    return this.data.slug;
  }

  get coverImage(): string | undefined {
    return this.data.cover_image;
  }

  get flags(): BitField<ApplicationFlags> {
    return new BitField<ApplicationFlags>(this.data.flags ?? 0n);
  }

  get approximateGuildCount(): number | undefined {
    return this.data.approximate_guild_count;
  }

  get approximateUserInstallCount(): number | undefined {
    return this.data.approximate_user_install_count;
  }

  get redirectUris(): string[] | undefined {
    return this.data.redirect_uris;
  }

  get interactionsEndpointUrl(): string | null | undefined {
    return this.data.interactions_endpoint_url;
  }

  get roleConnectionsVerificationUrl(): string | null | undefined {
    return this.data.role_connections_verification_url;
  }

  get eventWebhooksUrl(): string | null | undefined {
    return this.data.event_webhooks_url;
  }

  get eventWebhooksStatus(): ApplicationEventWebhookStatus {
    return this.data.event_webhooks_status;
  }

  get eventWebhooksTypes(): string[] | undefined {
    return this.data.event_webhooks_types;
  }

  get tags(): string[] | undefined {
    return this.data.tags;
  }

  get installParams(): InstallParamsEntity | undefined {
    return this.data.install_params;
  }

  get integrationTypesConfig(): Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  > {
    return this.data.integration_types_config;
  }

  get customInstallUrl(): string | undefined {
    return this.data.custom_install_url;
  }
}
