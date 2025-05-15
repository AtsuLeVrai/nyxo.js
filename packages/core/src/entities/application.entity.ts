import type { OAuth2Scope } from "../enums/index.js";
import type { Snowflake } from "../utils/index.js";
import type { GuildEntity } from "./guild.entity.js";
import type { TeamEntity } from "./team.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the flags that can be applied to an application.
 * Each flag is a bitwise value that can be combined with others.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
 */
export enum ApplicationFlags {
  /**
   * Indicates if an app uses the Auto Moderation API.
   */
  ApplicationAutoModerationRuleCreateBadge = 1 << 6,

  /**
   * Intent required for bots in 100 or more servers to receive presence_update events.
   */
  GatewayPresence = 1 << 12,

  /**
   * Intent required for bots in under 100 servers to receive presence_update events,
   * found on the Bot page in your app's settings.
   */
  GatewayPresenceLimited = 1 << 13,

  /**
   * Intent required for bots in 100 or more servers to receive member-related events like guild_member_add.
   * See the list of member-related events under GUILD_MEMBERS.
   */
  GatewayGuildMembers = 1 << 14,

  /**
   * Intent required for bots in under 100 servers to receive member-related events like guild_member_add,
   * found on the Bot page in your app's settings.
   */
  GatewayGuildMembersLimited = 1 << 15,

  /**
   * Indicates unusual growth of an app that prevents verification.
   */
  VerificationPendingGuildLimit = 1 << 16,

  /**
   * Indicates if an app is embedded within the Discord client (currently unavailable publicly).
   */
  Embedded = 1 << 17,

  /**
   * Intent required for bots in 100 or more servers to receive message content.
   */
  GatewayMessageContent = 1 << 18,

  /**
   * Intent required for bots in under 100 servers to receive message content,
   * found on the Bot page in your app's settings.
   */
  GatewayMessageContentLimited = 1 << 19,

  /**
   * Indicates if an app has registered global application commands.
   */
  ApplicationCommandBadge = 1 << 23,
}

/**
 * Status indicating whether event webhooks are enabled or disabled for an application.
 * Used to determine the current webhook event status for an application.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
 */
export enum ApplicationEventWebhookStatus {
  /**
   * Webhook events are disabled by the developer.
   */
  Disabled = 1,

  /**
   * Webhook events are enabled by the developer.
   */
  Enabled = 2,

  /**
   * Webhook events are disabled by Discord, usually due to inactivity.
   */
  DisabledByDiscord = 3,
}

/**
 * Represents where an application can be installed, also called its supported installation contexts.
 * Defines whether an app can be installed to servers, users, or both.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export enum ApplicationIntegrationType {
  /**
   * App is installable to servers. Requires authorization by a server member with the MANAGE_GUILD permission.
   */
  GuildInstall = 0,

  /**
   * App is installable to users. Visible only to the authorizing user.
   */
  UserInstall = 1,
}

/**
 * Installation Parameters for an application.
 * Defines the scopes and permissions needed when installing an application.
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object}
 */
export interface InstallParamsEntity {
  /**
   * Scopes to add the application to the server with.
   * These define what resources and actions the application can access.
   */
  scopes: OAuth2Scope[];

  /**
   * Permissions to request for the bot role.
   * Defines what actions the bot can perform in the server.
   */
  permissions: string;
}

/**
 * Application Integration Type Configuration.
 * Contains settings for each supported installation context.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
 */
export interface ApplicationIntegrationTypeConfigurationEntity {
  /**
   * Install params for each installation context's default in-app authorization link.
   * Defines the default scopes and permissions for this integration type.
   */
  oauth2_install_params?: InstallParamsEntity;
}

/**
 * Represents a Discord Application object.
 * Applications (or "apps") are containers for Discord platform features,
 * and can be installed to Discord servers and/or user accounts.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object}
 */
export interface ApplicationEntity {
  /**
   * ID of the application.
   * Unique identifier for the application.
   */
  id: Snowflake;

  /**
   * Name of the application.
   * The display name visible to users.
   */
  name: string;

  /**
   * Icon hash of the application.
   * Used to display the application's icon.
   */
  icon: string | null;

  /**
   * Icon hash returned when in the template object.
   */
  icon_hash?: string | null;

  /**
   * Description of the application.
   * A brief explanation of what the application does.
   */
  description: string;

  /**
   * List of RPC origin URLs, if RPC is enabled.
   * Allows the application to use Discord's RPC protocol.
   */
  rpc_origins?: string[];

  /**
   * When false, only the app owner can add the app to guilds.
   * Controls who can install the application to servers.
   */
  bot_public: boolean;

  /**
   * When true, the app's bot will only join upon completion of the full OAuth2 code grant flow.
   * Adds an extra security step during bot installation.
   */
  bot_require_code_grant: boolean;

  /**
   * Partial user object for the bot user associated with the app.
   * Contains information about the application's bot user.
   */
  bot?: Partial<UserEntity>;

  /**
   * URL of the app's Terms of Service.
   */
  terms_of_service_url?: string;

  /**
   * URL of the app's Privacy Policy.
   */
  privacy_policy_url?: string;

  /**
   * Partial user object for the owner of the app.
   * Contains information about the application's owner.
   */
  owner?: Partial<UserEntity>;

  /**
   * Hex encoded key for verification in interactions and the GameSDK's GetTicket.
   * Used for security verification.
   */
  verify_key: string;

  /**
   * If the app belongs to a team, this will be a list of the members of that team.
   * Contains team member information if the application is owned by a team.
   */
  team: TeamEntity | null;

  /**
   * Guild associated with the app. For example, a developer support server.
   * ID of a guild linked to this application.
   */
  guild_id?: Snowflake;

  /**
   * Partial object of the associated guild.
   * Contains basic information about the guild linked to this application.
   */
  guild?: Partial<GuildEntity>;

  /**
   * ID of the "Game SKU" that is created, if exists.
   * Present if this app is a game sold on Discord.
   */
  primary_sku_id?: Snowflake;

  /**
   * URL slug that links to the store page, if the app is sold on Discord.
   * Present if this app is a game with a store page.
   */
  slug?: string;

  /**
   * App's default rich presence invite cover image hash.
   * Used as the image for rich presence invites.
   */
  cover_image?: string;

  /**
   * App's public flags.
   * Bitwise value of enabled flags for this application.
   */
  flags?: ApplicationFlags;

  /**
   * Approximate count of guilds the app has been added to.
   * Gives an estimate of how many servers are using this application.
   */
  approximate_guild_count?: number;

  /**
   * Approximate count of users that have installed the app.
   * Gives an estimate of how many users are using this application.
   */
  approximate_user_install_count?: number;

  /**
   * Array of redirect URIs for the app.
   * Used for OAuth2 authorization flows.
   */
  redirect_uris?: string[];

  /**
   * Interactions endpoint URL for the app.
   * Where Discord will send interaction payloads if using the HTTP interactions mode.
   */
  interactions_endpoint_url?: string | null;

  /**
   * Role connection verification URL for the app.
   * Used for linked roles feature.
   */
  role_connections_verification_url?: string | null;

  /**
   * Event webhooks URL for the app to receive webhook events.
   * Where Discord will send webhook event payloads.
   */
  event_webhooks_url?: string | null;

  /**
   * Status indicating if webhook events are enabled for the app.
   * Controls whether the app receives webhook events.
   */
  event_webhooks_status: ApplicationEventWebhookStatus;

  /**
   * List of webhook event types the app subscribes to.
   * Determines which event types the app will receive.
   */
  event_webhooks_types?: string[];

  /**
   * List of tags describing the content and functionality of the app.
   * Used for discovery and categorization.
   */
  tags?: string[];

  /**
   * Settings for the app's default in-app authorization link, if enabled.
   * Controls the default OAuth2 authorization parameters.
   */
  install_params?: InstallParamsEntity;

  /**
   * Default scopes and permissions for each supported installation context.
   * Maps integration types to their configuration.
   */
  integration_types_config: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /**
   * Default custom authorization URL for the app, if enabled.
   * Alternative to the Discord-provided authorization flow.
   */
  custom_install_url?: string;
}
