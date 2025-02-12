import {
  ApplicationEntity,
  type ApplicationEventWebhookStatus,
  type ApplicationFlags,
  type ApplicationIntegrationType,
  type ApplicationIntegrationTypeConfigurationEntity,
  BitFieldManager,
  type InstallParamsEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Guild } from "./guild.class.js";
import { Team } from "./team.class.js";
import { User } from "./user.class.js";

export class Application extends BaseClass<ApplicationEntity> {
  readonly #flags: BitFieldManager<ApplicationFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof ApplicationEntity>> = {},
  ) {
    super(client, ApplicationEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get description(): string {
    return this.entity.description;
  }

  get rpcOrigins(): string[] | null {
    return this.entity.rpc_origins ?? null;
  }

  get botPublic(): boolean {
    return Boolean(this.entity.bot_public);
  }

  get botRequireCodeGrant(): boolean {
    return Boolean(this.entity.bot_require_code_grant);
  }

  get bot(): User | null {
    return this.entity.bot ? new User(this.client, this.entity.bot) : null;
  }

  get termsOfServiceUrl(): string | null {
    return this.entity.terms_of_service_url ?? null;
  }

  get privacyPolicyUrl(): string | null {
    return this.entity.privacy_policy_url ?? null;
  }

  get owner(): User | null {
    return this.entity.owner ? new User(this.client, this.entity.owner) : null;
  }

  get verifyKey(): string {
    return this.entity.verify_key;
  }

  get team(): Team | null {
    return this.entity.team ? new Team(this.client, this.entity.team) : null;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get guild(): Guild | null {
    return this.entity.guild ? new Guild(this.client, this.entity.guild) : null;
  }

  get primarySkuId(): Snowflake | null {
    return this.entity.primary_sku_id ?? null;
  }

  get slug(): string | null {
    return this.entity.slug ?? null;
  }

  get coverImage(): string | null {
    return this.entity.cover_image ?? null;
  }

  get flags(): BitFieldManager<ApplicationFlags> {
    return this.#flags;
  }

  get approximateGuildCount(): number | null {
    return this.entity.approximate_guild_count ?? null;
  }

  get approximateUserInstallCount(): number | null {
    return this.entity.approximate_user_install_count ?? null;
  }

  get redirectUris(): string[] | null {
    return this.entity.redirect_uris ?? null;
  }

  get interactionsEndpointUrl(): string | null {
    return this.entity.interactions_endpoint_url ?? null;
  }

  get roleConnectionsVerificationUrl(): string | null {
    return this.entity.role_connections_verification_url ?? null;
  }

  get eventWebhooksUrl(): string {
    return this.entity.event_webhooks_url;
  }

  get eventWebhooksStatus(): ApplicationEventWebhookStatus {
    return this.entity.event_webhooks_status;
  }

  get eventWebhooksTypes(): string[] | null {
    return this.entity.event_webhooks_types ?? null;
  }

  get tags(): string[] | null {
    return this.entity.tags ?? null;
  }

  get installParams(): InstallParamsEntity | null {
    return this.entity.install_params ?? null;
  }

  get integrationTypesConfig(): Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  > {
    return this.entity.integration_types_config;
  }

  get customInstallUrl(): string | null {
    return this.entity.custom_install_url ?? null;
  }

  toJson(): ApplicationEntity {
    return { ...this.entity };
  }
}

export const ApplicationSchema = z.instanceof(Application);
