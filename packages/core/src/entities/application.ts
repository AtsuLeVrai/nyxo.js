import type { OAuth2Scope } from "../enums/index.js";
import type { Integer } from "../formatting/index.js";
import type { BitFieldResolvable, Snowflake } from "../utils/index.js";
import type { GuildEntity } from "./guild.js";
import type { TeamEntity } from "./team.js";
import type { UserEntity } from "./user.js";

/**
 * Represents parameters for installing an application.
 *
 * @remarks
 * These parameters define the OAuth2 scopes and permissions required when installing an application.
 *
 * @example
 * ```typescript
 * const installParams: InstallParamsEntity = {
 *   scopes: [OAuth2Scope.Bot, OAuth2Scope.ApplicationsCommands],
 *   permissions: "2048"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure}
 */
export interface InstallParamsEntity {
  /** Array of OAuth2 scopes to request during installation */
  scopes: OAuth2Scope[];
  /** Permissions string to request for the bot role */
  permissions: string;
}

/**
 * Represents the flags that can be applied to a Discord application.
 *
 * @remarks
 * These flags indicate various features and capabilities of the application,
 * such as gateway intents and verification status.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
 */
export enum ApplicationFlags {
  /** Indicates if an app uses the Auto Moderation API */
  ApplicationAutoModerationRuleCreateBadge = 1 << 6,
  /** Intent required for bots in 100+ servers to receive presence updates */
  GatewayPresence = 1 << 12,
  /** Intent required for bots in <100 servers to receive presence updates */
  GatewayPresenceLimited = 1 << 13,
  /** Intent required for bots in 100+ servers to receive member-related events */
  GatewayGuildMembers = 1 << 14,
  /** Intent required for bots in <100 servers to receive member-related events */
  GatewayGuildMembersLimited = 1 << 15,
  /** Indicates unusual growth of an app that prevents verification */
  VerificationPendingGuildLimit = 1 << 16,
  /** Indicates if an app is embedded within the Discord client */
  Embedded = 1 << 17,
  /** Intent required for bots in 100+ servers to receive message content */
  GatewayMessageContent = 1 << 18,
  /** Intent required for bots in <100 servers to receive message content */
  GatewayMessageContentLimited = 1 << 19,
  /** Indicates if an app has registered global application commands */
  ApplicationCommandBadge = 1 << 23,
}

/**
 * Represents the status of an application's event webhook.
 *
 * @remarks
 * Indicates whether webhook events are enabled, disabled, or disabled by Discord.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
 */
export enum ApplicationEventWebhookStatus {
  /** Webhook events are disabled by developer */
  Disabled = 1,
  /** Webhook events are enabled by developer */
  Enabled = 2,
  /** Webhook events are disabled by Discord, usually due to inactivity */
  DisabledByDiscord = 3,
}

/**
 * Represents the configuration for an application's integration type.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
 */
export interface ApplicationIntegrationTypeConfigurationEntity {
  /** Optional OAuth2 installation parameters */
  oauth2_install_params?: InstallParamsEntity;
}

/**
 * Represents where an application can be installed.
 *
 * @remarks
 * Defines the possible installation contexts for Discord applications.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export enum ApplicationIntegrationType {
  /** App can be installed to servers */
  GuildInstall = 0,
  /** App can be installed to users */
  UserInstall = 1,
}

/**
 * Represents a Discord application.
 *
 * @remarks
 * Contains all information about a Discord application including its basic information,
 * installation settings, and various configuration options.
 *
 * @example
 * ```typescript
 * const application: ApplicationEntity = {
 *   id: "123456789",
 *   name: "My Discord App",
 *   description: "A cool Discord app",
 *   bot_public: true,
 *   // ... other required fields
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-structure}
 */
export interface ApplicationEntity {
  /** Unique identifier for the application */
  id: Snowflake;
  /** Name of the application */
  name: string;
  /** Icon hash of the application */
  icon: string | null;
  /** Description of the application */
  description: string;
  /** RPC origin URLs, if RPC is enabled */
  rpc_origins?: string[];
  /** Whether the app's bot can be added by anyone */
  bot_public: boolean;
  /** Whether the app's bot requires OAuth2 code grant */
  bot_require_code_grant: boolean;
  /** Partial user object for the app's bot user */
  bot?: Partial<UserEntity>;
  /** URL of the app's terms of service */
  terms_of_service_url?: string;
  /** URL of the app's privacy policy */
  privacy_policy_url?: string;
  /** Partial user object for the owner of the app */
  owner?: Partial<UserEntity>;
  /** Hex encoded key for verification */
  verify_key: string;
  /** Team object if the app belongs to a team */
  team: TeamEntity | null;
  /** Guild ID the app is associated with */
  guild_id?: Snowflake;
  /** Partial guild object for the associated guild */
  guild?: Partial<GuildEntity>;
  /** Primary SKU ID, if this app is sold on Discord */
  primary_sku_id?: Snowflake;
  /** URL slug that links to the store page */
  slug?: string;
  /** Default rich presence invite cover image hash */
  cover_image?: string;
  /** Application's public flags */
  flags?: BitFieldResolvable<ApplicationFlags>;
  /** Approximate count of guilds the app is in */
  approximate_guild_count?: Integer;
  /** Approximate count of users who have installed the app */
  approximate_user_install_count?: Integer;
  /** Array of redirect URIs for the application */
  redirect_uris?: string[];
  /** URL for interactions endpoint */
  interactions_endpoint_url?: string | null;
  /** URL for role connection verification */
  role_connections_verification_url?: string | null;
  /** URL for receiving webhooks */
  event_webhooks_url?: string;
  /** Status of webhook events */
  event_webhooks_status: ApplicationEventWebhookStatus;
  /** List of webhook event types */
  event_webhooks_types?: string[];
  /** List of tags describing the app content and functionality */
  tags?: string[];
  /** Installation parameters for the app */
  install_params?: InstallParamsEntity;
  /** Configuration for different integration types */
  integration_types_config: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;
  /** Custom installation URL */
  custom_install_url?: string;
}
