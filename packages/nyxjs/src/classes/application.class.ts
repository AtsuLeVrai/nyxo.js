import {
  type ApplicationEntity,
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  type ApplicationIntegrationTypeConfigurationEntity,
  BitFieldManager,
  type InstallParamsEntity,
  type OAuth2Scope,
  type Snowflake,
  type UserEntity,
} from "@nyxjs/core";
import type { GuildCreateEntity } from "@nyxjs/gateway";
import { Cdn, type ImageOptions } from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import { Guild } from "./guild.class.js";
import { Team } from "./team.class.js";
import { User } from "./user.class.js";

/**
 * Represents installation parameters for an application.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-structure}
 */
export class InstallParams extends BaseClass<InstallParamsEntity> {
  /**
   * Scopes to add the application to the server with
   */
  get scopes(): OAuth2Scope[] {
    return this.data.scopes;
  }

  /**
   * Permissions to request for the bot role
   */
  get permissions(): string {
    return this.data.permissions;
  }

  /**
   * Whether the bot requests administrator permissions
   */
  get requestsAdministrator(): boolean {
    // Administrator permission is 0x8
    return (BigInt(this.permissions) & BigInt(0x8)) === BigInt(0x8);
  }

  /**
   * The total number of scopes requested
   */
  get scopeCount(): number {
    return this.scopes.length;
  }

  /**
   * Whether the application requests the bot scope
   */
  get includesBot(): boolean {
    return this.scopes.includes("bot" as OAuth2Scope);
  }

  /**
   * Whether the application requests the applications.commands scope
   */
  get includesCommands(): boolean {
    return this.scopes.includes("applications.commands" as OAuth2Scope);
  }
}

/**
 * Represents a Discord Application.
 *
 * Applications in Discord represent a Discord application. They can be used to
 * create bots, slash commands, and other integrations.
 *
 * @see {@link https://discord.com/developers/docs/resources/application}
 */
export class Application extends BaseClass<ApplicationEntity> {
  /**
   * The unique ID of this application
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The name of the application
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The icon hash of the application
   */
  get icon(): string | null {
    return this.data.icon;
  }

  /**
   * Icon hash returned when in the template object
   */
  get iconHash(): string | null | undefined {
    return this.data.icon_hash;
  }

  /**
   * The description of the application
   */
  get description(): string {
    return this.data.description;
  }

  /**
   * List of RPC origin URLs, if RPC is enabled
   */
  get rpcOrigins(): string[] | undefined {
    return this.data.rpc_origins;
  }

  /**
   * When false, only the app owner can add the app to guilds
   */
  get botPublic(): boolean {
    return this.data.bot_public;
  }

  /**
   * When true, the app's bot will only join upon completion of the full OAuth2 code grant flow
   */
  get botRequireCodeGrant(): boolean {
    return this.data.bot_require_code_grant;
  }

  /**
   * Partial user object for the bot user associated with the app
   */
  get bot(): User | undefined {
    if (!this.data.bot) {
      return undefined;
    }

    return new User(this.client, this.data.bot as UserEntity);
  }

  /**
   * URL of the app's Terms of Service
   */
  get termsOfServiceUrl(): string | undefined {
    return this.data.terms_of_service_url;
  }

  /**
   * URL of the app's Privacy Policy
   */
  get privacyPolicyUrl(): string | undefined {
    return this.data.privacy_policy_url;
  }

  /**
   * Partial user object for the owner of the app
   */
  get owner(): User | undefined {
    if (!this.data.owner) {
      return undefined;
    }

    return new User(this.client, this.data.owner as UserEntity);
  }

  /**
   * Hex encoded key for verification in interactions and the GameSDK's GetTicket
   */
  get verifyKey(): string {
    return this.data.verify_key;
  }

  /**
   * If the app belongs to a team, this will be the team object
   */
  get team(): Team | null {
    if (!this.data.team) {
      return null;
    }

    return new Team(this.client, this.data.team);
  }

  /**
   * Guild ID associated with the app. For example, a developer support server
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * Partial object of the associated guild
   */
  get guild(): Guild | undefined {
    if (!this.data.guild) {
      return undefined;
    }

    return new Guild(this.client, this.data.guild as GuildCreateEntity);
  }

  /**
   * ID of the "Game SKU" that is created, if exists
   */
  get primarySkuId(): Snowflake | undefined {
    return this.data.primary_sku_id;
  }

  /**
   * URL slug that links to the store page, if the app is sold on Discord
   */
  get slug(): string | undefined {
    return this.data.slug;
  }

  /**
   * App's default rich presence invite cover image hash
   */
  get coverImage(): string | undefined {
    return this.data.cover_image;
  }

  /**
   * App's public flags as a BitFieldManager
   */
  get flags(): BitFieldManager<ApplicationFlags> | undefined {
    if (this.data.flags === undefined) {
      return undefined;
    }

    return new BitFieldManager<ApplicationFlags>(this.data.flags);
  }

  /**
   * Approximate count of guilds the app has been added to
   */
  get approximateGuildCount(): number | undefined {
    return this.data.approximate_guild_count;
  }

  /**
   * Approximate count of users that have installed the app
   */
  get approximateUserInstallCount(): number | undefined {
    return this.data.approximate_user_install_count;
  }

  /**
   * Array of redirect URIs for the app
   */
  get redirectUris(): string[] | undefined {
    return this.data.redirect_uris;
  }

  /**
   * Interactions endpoint URL for the app
   */
  get interactionsEndpointUrl(): string | null | undefined {
    return this.data.interactions_endpoint_url;
  }

  /**
   * Role connection verification URL for the app
   */
  get roleConnectionsVerificationUrl(): string | null | undefined {
    return this.data.role_connections_verification_url;
  }

  /**
   * Event webhooks URL for the app to receive webhook events
   */
  get eventWebhooksUrl(): string | null | undefined {
    return this.data.event_webhooks_url;
  }

  /**
   * Status indicating if webhook events are enabled for the app
   */
  get eventWebhooksStatus(): ApplicationEventWebhookStatus {
    return this.data.event_webhooks_status;
  }

  /**
   * List of webhook event types the app subscribes to
   */
  get eventWebhooksTypes(): string[] | undefined {
    return this.data.event_webhooks_types;
  }

  /**
   * List of tags describing the content and functionality of the app
   */
  get tags(): string[] | undefined {
    return this.data.tags;
  }

  /**
   * Settings for the app's default in-app authorization link, if enabled
   */
  get installParams(): InstallParams | undefined {
    if (!this.data.install_params) {
      return undefined;
    }

    return new InstallParams(this.client, this.data.install_params);
  }

  /**
   * Default scopes and permissions for each supported installation context
   */
  get integrationTypesConfig(): Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  > {
    return this.data.integration_types_config;
  }

  /**
   * Default custom authorization URL for the app, if enabled
   */
  get customInstallUrl(): string | undefined {
    return this.data.custom_install_url;
  }

  /**
   * Whether the application has a bot user
   */
  get hasBot(): boolean {
    return Boolean(this.data.bot);
  }

  /**
   * Whether the application is owned by a team
   */
  get hasTeam(): boolean {
    return Boolean(this.data.team);
  }

  /**
   * Whether the application has a guild associated with it
   */
  get hasGuild(): boolean {
    return Boolean(this.data.guild_id || this.data.guild);
  }

  /**
   * Whether the application has RPC origins defined
   */
  get hasRpc(): boolean {
    return Boolean(this.data.rpc_origins && this.data.rpc_origins.length > 0);
  }

  /**
   * Whether the application has a cover image
   */
  get hasCoverImage(): boolean {
    return Boolean(this.data.cover_image);
  }

  /**
   * Whether the application has a terms of service URL
   */
  get hasTermsOfService(): boolean {
    return Boolean(this.data.terms_of_service_url);
  }

  /**
   * Whether the application has a privacy policy URL
   */
  get hasPrivacyPolicy(): boolean {
    return Boolean(this.data.privacy_policy_url);
  }

  /**
   * Whether webhook events are enabled for the app
   */
  get webhooksEnabled(): boolean {
    return (
      this.data.event_webhooks_status === ApplicationEventWebhookStatus.Enabled
    );
  }

  /**
   * Gets the configuration for guild installations
   */
  get guildInstallConfig():
    | ApplicationIntegrationTypeConfigurationEntity
    | undefined {
    return this.integrationTypesConfig[ApplicationIntegrationType.GuildInstall];
  }

  /**
   * Gets the configuration for user installations
   */
  get userInstallConfig():
    | ApplicationIntegrationTypeConfigurationEntity
    | undefined {
    return this.integrationTypesConfig[ApplicationIntegrationType.UserInstall];
  }

  /**
   * Checks if the application has the Auto Moderation API flag
   */
  get usesAutoModeration(): boolean {
    return this.hasFlag(
      ApplicationFlags.ApplicationAutoModerationRuleCreateBadge,
    );
  }

  /**
   * Checks if the application has the Application Command Badge flag
   */
  get hasApplicationCommands(): boolean {
    return this.hasFlag(ApplicationFlags.ApplicationCommandBadge);
  }

  /**
   * Checks if the application is embedded within the Discord client
   */
  get isEmbedded(): boolean {
    return this.hasFlag(ApplicationFlags.Embedded);
  }

  /**
   * Gets the URL for this application's icon
   */
  iconUrl(options: Partial<ImageOptions>): string | null {
    if (!this.icon) {
      return null;
    }

    return Cdn.applicationIcon(this.id, this.icon, options);
  }

  /**
   * Gets the URL for this application's cover image
   */
  coverImageUrl(options: Partial<ImageOptions>): string | null {
    if (!this.coverImage) {
      return null;
    }

    return Cdn.applicationCover(this.id, this.coverImage, options);
  }

  /**
   * Checks if the application has a specific flag
   */
  hasFlag(flag: ApplicationFlags): boolean {
    return this.flags?.has(flag) ?? false;
  }
}
