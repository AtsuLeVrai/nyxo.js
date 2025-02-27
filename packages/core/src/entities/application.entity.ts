import { z } from "zod";
import { OAuth2Scope } from "../enums/index.js";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import { GuildEntity } from "./guild.entity.js";
import { TeamEntity } from "./team.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * Represents the flags that can be applied to an application.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
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
 * Represents where an application can be installed, also called its supported installation contexts.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export enum ApplicationIntegrationType {
  /** App is installable to servers */
  GuildInstall = 0,
  /** App is installable to users */
  UserInstall = 1,
}

/**
 * Represents the settings for an application's default in-app authorization link.
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure}
 */
export const InstallParamsEntity = z.object({
  /** Scopes to add the application to the server with */
  scopes: z.array(z.nativeEnum(OAuth2Scope)),
  /** Permissions to request for the bot role */
  permissions: z.string(),
});

export type InstallParamsEntity = z.infer<typeof InstallParamsEntity>;

/**
 * Configuration for default scopes and permissions for each supported installation context.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
 */
export const ApplicationIntegrationTypeConfigurationEntity = z.object({
  /** Install params for each installation context's default in-app authorization link */
  oauth2_install_params: InstallParamsEntity.optional(),
});

export type ApplicationIntegrationTypeConfigurationEntity = z.infer<
  typeof ApplicationIntegrationTypeConfigurationEntity
>;

/**
 * Represents a Discord application, which are containers for developer platform features.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object}
 */
export const ApplicationEntity = z.object({
  /** ID of the app */
  id: Snowflake,
  /** Name of the app */
  name: z.string(),
  /** Icon hash of the app */
  icon: z.string().nullable(),
  /** Icon hash returned when in the template object */
  icon_hash: z.string().nullish(),
  /** Description of the app */
  description: z.string(),
  /** List of RPC origin URLs, if RPC is enabled */
  rpc_origins: z.array(z.string()).optional(),
  /** When false, only the app owner can add the app to guilds */
  bot_public: z.boolean(),
  /** When true, the app's bot will only join upon completion of the full OAuth2 code grant flow */
  bot_require_code_grant: z.boolean(),
  /** Partial user object for the bot user associated with the app */
  bot: UserEntity.optional(),
  /** URL of the app's Terms of Service */
  terms_of_service_url: z.string().url().optional(),
  /** URL of the app's Privacy Policy */
  privacy_policy_url: z.string().url().optional(),
  /** Partial user object for the owner of the app */
  owner: UserEntity.optional(),
  /** Hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verify_key: z.string().regex(/^[0-9a-f]+$/i),
  /** If the app belongs to a team, this will be a list of the members of that team */
  team: TeamEntity.nullable(),
  /** Guild associated with the app. For example, a developer support server */
  guild_id: Snowflake.optional(),
  /** Partial object of the associated guild */
  guild: GuildEntity.partial().optional(),
  /** ID of the "Game SKU" that is created, if exists */
  primary_sku_id: Snowflake.optional(),
  /** URL slug that links to the store page, if the app is sold on Discord */
  slug: z.string().optional(),
  /** App's default rich presence invite cover image hash */
  cover_image: z.string().optional(),
  /** App's public flags */
  flags: z.custom<ApplicationFlags>(BitFieldManager.isValidBitField).optional(),
  /** Approximate count of guilds the app has been added to */
  approximate_guild_count: z.number().int().optional(),
  /** Approximate count of users that have installed the app */
  approximate_user_install_count: z.number().int().optional(),
  /** Array of redirect URIs for the app */
  redirect_uris: z.array(z.string().url()).optional(),
  /** Interactions endpoint URL for the app */
  interactions_endpoint_url: z.string().url().nullish(),
  /** Role connection verification URL for the app */
  role_connections_verification_url: z.string().url().nullish(),
  /** Event webhooks URL for the app to receive webhook events */
  event_webhooks_url: z.string().url().nullish(),
  /** Status indicating if webhook events are enabled for the app */
  event_webhooks_status: z.nativeEnum(ApplicationEventWebhookStatus),
  /** List of webhook event types the app subscribes to */
  event_webhooks_types: z.array(z.string()).optional(),
  /** List of tags describing the content and functionality of the app (max 5 tags) */
  tags: z.array(z.string().max(20)).max(5).optional(),
  /** Settings for the app's default in-app authorization link, if enabled */
  install_params: InstallParamsEntity.optional(),
  /** Default scopes and permissions for each supported installation context */
  integration_types_config: z.record(
    z.nativeEnum(ApplicationIntegrationType),
    ApplicationIntegrationTypeConfigurationEntity,
  ),
  /** Default custom authorization URL for the app, if enabled */
  custom_install_url: z.string().url().optional(),
});

export type ApplicationEntity = z.infer<typeof ApplicationEntity>;
