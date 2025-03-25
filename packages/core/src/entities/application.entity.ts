import type { OAuth2Scope } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
import type { GuildEntity } from "./guild.entity.js";
import type { TeamEntity } from "./team.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the flags that can be applied to an application.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application.md#application-flags}
 */
export enum ApplicationFlags {
  /** Indicates if an app uses the Auto Moderation API */
  ApplicationAutoModerationRuleCreateBadge = 1 << 6,

  /** Intent required for bots in 100+ servers to receive presence_update events */
  GatewayPresence = 1 << 12,

  /** Intent required for bots in under 100 servers to receive presence_update events */
  GatewayPresenceLimited = 1 << 13,

  /** Intent required for bots in 100+ servers to receive member-related events */
  GatewayGuildMembers = 1 << 14,

  /** Intent required for bots in under 100 servers to receive member-related events */
  GatewayGuildMembersLimited = 1 << 15,

  /** Indicates unusual growth of an app that prevents verification */
  VerificationPendingGuildLimit = 1 << 16,

  /** Indicates if an app is embedded within the Discord client */
  Embedded = 1 << 17,

  /** Intent required for bots in 100+ servers to receive message content */
  GatewayMessageContent = 1 << 18,

  /** Intent required for bots in under 100 servers to receive message content */
  GatewayMessageContentLimited = 1 << 19,

  /** Indicates if an app has registered global application commands */
  ApplicationCommandBadge = 1 << 23,
}

/**
 * Status indicating whether event webhooks are enabled or disabled for an application.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application.md#application-event-webhook-status}
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
 * Represents where an application can be installed, also called its supported installation contexts.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application.md#application-integration-types}
 */
export enum ApplicationIntegrationType {
  /** App is installable to servers */
  GuildInstall = 0,

  /** App is installable to users */
  UserInstall = 1,
}

/**
 * Installation Parameters
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application.md#install-params-structure}
 */
export interface InstallParamsEntity {
  /** Scopes to add the application to the server with */
  scopes: OAuth2Scope[];

  /** Permissions to request for the bot role */
  permissions: string;
}

/**
 * Application Integration Type Configuration
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application.md#application-integration-type-configuration-object}
 */
export interface ApplicationIntegrationTypeConfigurationEntity {
  /** Install params for each installation context's default in-app authorization link */
  oauth2_install_params?: InstallParamsEntity;
}

/**
 * Application
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application.md#application-structure}
 */
export interface ApplicationEntity {
  /** ID of the app */
  id: Snowflake;

  /** Name of the app */
  name: string;

  /** Icon hash of the app */
  icon: string | null;

  /** Icon hash returned when in the template object */
  icon_hash?: string | null;

  /** Description of the app */
  description: string;

  /**
   * List of RPC origin URLs, if RPC is enabled
   * @format url
   */
  rpc_origins?: string[];

  /** When false, only the app owner can add the app to guilds */
  bot_public: boolean;

  /** When true, the app's bot will only join upon completion of the full OAuth2 code grant flow */
  bot_require_code_grant: boolean;

  /** Partial user object for the bot user associated with the app */
  bot?: Partial<UserEntity>;

  /**
   * URL of the app's Terms of Service
   * @format url
   */
  terms_of_service_url?: string;

  /**
   * URL of the app's Privacy Policy
   * @format url
   */
  privacy_policy_url?: string;

  /** Partial user object for the owner of the app */
  owner?: Partial<UserEntity>;

  /** Hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verify_key: string;

  /** If the app belongs to a team, this will be a list of the members of that team */
  team: TeamEntity | null;

  /** Guild associated with the app. For example, a developer support server */
  guild_id?: Snowflake;

  /** Partial object of the associated guild */
  guild?: Partial<GuildEntity>;

  /** ID of the "Game SKU" that is created, if exists */
  primary_sku_id?: Snowflake;

  /** URL slug that links to the store page, if the app is sold on Discord */
  slug?: string;

  /** App's default rich presence invite cover image hash */
  cover_image?: string;

  /** App's public flags */
  flags?: ApplicationFlags;

  /**
   * Approximate count of guilds the app has been added to
   * @minimum 0
   */
  approximate_guild_count?: number;

  /**
   * Approximate count of users that have installed the app
   * @minimum 0
   */
  approximate_user_install_count?: number;

  /**
   * Array of redirect URIs for the app
   * @format url
   */
  redirect_uris?: string[];

  /**
   * Interactions endpoint URL for the app
   * @format url
   */
  interactions_endpoint_url?: string | null;

  /**
   * Role connection verification URL for the app
   * @format url
   */
  role_connections_verification_url?: string | null;

  /**
   * Event webhooks URL for the app to receive webhook events
   * @format url
   */
  event_webhooks_url?: string | null;

  /** Status indicating if webhook events are enabled for the app */
  event_webhooks_status: ApplicationEventWebhookStatus;

  /** List of webhook event types the app subscribes to */
  event_webhooks_types?: string[];

  /**
   * List of tags describing the content and functionality of the app (max 5 tags)
   * @maxLength 20
   * @maxItems 5
   */
  tags?: string[];

  /** Settings for the app's default in-app authorization link, if enabled */
  install_params?: InstallParamsEntity;

  /** Default scopes and permissions for each supported installation context */
  integration_types_config: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /**
   * Default custom authorization URL for the app, if enabled
   * @format url
   */
  custom_install_url?: string;
}
