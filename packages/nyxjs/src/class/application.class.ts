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
import { fromError } from "zod-validation-error";
import { Guild } from "./guild.class.js";
import { Team } from "./team.class.js";
import { User } from "./user.class.js";

export class Application {
  readonly #data: ApplicationEntity;
  readonly #flags: BitFieldManager<ApplicationFlags>;

  constructor(data: Partial<z.input<typeof ApplicationEntity>> = {}) {
    try {
      this.#data = ApplicationEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get description(): string {
    return this.#data.description;
  }

  get rpcOrigins(): string[] | null {
    return this.#data.rpc_origins ?? null;
  }

  get botPublic(): boolean {
    return Boolean(this.#data.bot_public);
  }

  get botRequireCodeGrant(): boolean {
    return Boolean(this.#data.bot_require_code_grant);
  }

  get bot(): User | null {
    return this.#data.bot ? new User(this.#data.bot) : null;
  }

  get termsOfServiceUrl(): string | null {
    return this.#data.terms_of_service_url ?? null;
  }

  get privacyPolicyUrl(): string | null {
    return this.#data.privacy_policy_url ?? null;
  }

  get owner(): User | null {
    return this.#data.owner ? new User(this.#data.owner) : null;
  }

  get verifyKey(): string {
    return this.#data.verify_key;
  }

  get team(): Team | null {
    return this.#data.team ? new Team(this.#data.team) : null;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get guild(): Guild | null {
    return this.#data.guild ? new Guild(this.#data.guild) : null;
  }

  get primarySkuId(): Snowflake | null {
    return this.#data.primary_sku_id ?? null;
  }

  get slug(): string | null {
    return this.#data.slug ?? null;
  }

  get coverImage(): string | null {
    return this.#data.cover_image ?? null;
  }

  get flags(): BitFieldManager<ApplicationFlags> {
    return this.#flags;
  }

  get approximateGuildCount(): number | null {
    return this.#data.approximate_guild_count ?? null;
  }

  get approximateUserInstallCount(): number | null {
    return this.#data.approximate_user_install_count ?? null;
  }

  get redirectUris(): string[] | null {
    return this.#data.redirect_uris ?? null;
  }

  get interactionsEndpointUrl(): string | null {
    return this.#data.interactions_endpoint_url ?? null;
  }

  get roleConnectionsVerificationUrl(): string | null {
    return this.#data.role_connections_verification_url ?? null;
  }

  get eventWebhooksUrl(): string {
    return this.#data.event_webhooks_url;
  }

  get eventWebhooksStatus(): ApplicationEventWebhookStatus {
    return this.#data.event_webhooks_status;
  }

  get eventWebhooksTypes(): string[] | null {
    return this.#data.event_webhooks_types ?? null;
  }

  get tags(): string[] | null {
    return this.#data.tags ?? null;
  }

  get installParams(): InstallParamsEntity | null {
    return this.#data.install_params ?? null;
  }

  get integrationTypesConfig(): Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  > {
    return this.#data.integration_types_config;
  }

  get customInstallUrl(): string | null {
    return this.#data.custom_install_url ?? null;
  }

  toJson(): ApplicationEntity {
    return { ...this.#data };
  }

  clone(): Application {
    return new Application(this.toJson());
  }

  validate(): boolean {
    try {
      ApplicationSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ApplicationEntity>): Application {
    return new Application({ ...this.toJson(), ...other });
  }

  equals(other: Application): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ApplicationSchema = z.instanceof(Application);
