import {
  type ApplicationEntity,
  type ApplicationEventWebhookStatus,
  ApplicationFlags,
  type ApplicationIntegrationType,
  type ApplicationIntegrationTypeConfigurationEntity,
  BitField,
  type InstallParamsEntity,
  type Snowflake,
  type TeamEntity,
  type UserEntity,
} from "@nyxojs/core";
import type { GuildCreateEntity } from "@nyxojs/gateway";
import {
  type ActivityInstanceEntity,
  type ApplicationCoverUrl,
  type ApplicationIconUrl,
  Cdn,
  type EditCurrentApplicationSchema,
  type FileInput,
  type ImageOptions,
} from "@nyxojs/rest";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import type { z } from "zod";
import { BaseClass } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import {
  toCamelCasedPropertiesDeep,
  toSnakeCaseProperties,
} from "../utils/index.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Application object.
 *
 * The Application class serves as a comprehensive wrapper around Discord's application API, offering:
 * - Access to application metadata (name, description, flags, etc.)
 * - Methods to manage application settings and properties
 * - Tools for handling installation parameters and OAuth2 scopes
 * - Utilities for managing application activity instances
 * - Guild and team relationship management
 *
 * Applications are containers for Discord platform features that can be installed to
 * Discord servers and/or user accounts. They can include bots, slash commands,
 * integrations, and more.
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @example
 * ```typescript
 * // Fetching the current application
 * const application = await client.fetchCurrentApplication();
 * console.log(`App Name: ${application.name}`);
 *
 * // Updating application description
 * await application.update({
 *   description: "My awesome Discord bot"
 * });
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/application}
 */
export class Application
  extends BaseClass<ApplicationEntity>
  implements Enforce<CamelCasedProperties<ApplicationEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this application.
   *
   * This ID is permanent and will not change for the lifetime of the application.
   * It can be used for API operations, authorization URLs, and persistent references.
   *
   * @returns The application's ID as a Snowflake string
   *
   * @example
   * ```typescript
   * const appId = application.id;
   * console.log(`Application ID: ${appId}`);
   * ```
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Gets the name of the application.
   *
   * This is the display name that appears in the Discord UI and bot listings.
   *
   * @returns The application's name
   *
   * @example
   * ```typescript
   * console.log(`Application name: ${application.name}`);
   * ```
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * Gets the application's icon hash.
   *
   * This hash is used to construct the URL for the application's avatar image.
   * Use `getIconUrl()` method to get the full URL.
   *
   * @returns The application's icon hash, or null if no icon is set
   *
   * @example
   * ```typescript
   * if (application.icon) {
   *   console.log('Application has an icon');
   * } else {
   *   console.log('Application does not have an icon');
   * }
   * ```
   */
  get icon(): string | null {
    return this.data.icon;
  }

  /**
   * Gets the application's icon hash returned when in the template object.
   *
   * This is an alternative icon hash sometimes used in specific contexts.
   *
   * @returns The alternative icon hash, or null/undefined if not available
   *
   * @example
   * ```typescript
   * if (application.iconHash) {
   *   console.log(`Alternative icon hash: ${application.iconHash}`);
   * }
   * ```
   */
  get iconHash(): string | null | undefined {
    return this.data.icon_hash;
  }

  /**
   * Gets the description of the application.
   *
   * This is a brief explanation of what the application does, visible to users
   * in various Discord interfaces.
   *
   * @returns The application's description
   *
   * @example
   * ```typescript
   * console.log(`Description: ${application.description}`);
   * ```
   */
  get description(): string {
    return this.data.description;
  }

  /**
   * Gets the list of RPC origin URLs, if RPC is enabled for this application.
   *
   * These origins determine which domains can use Discord's RPC protocol
   * with this application.
   *
   * @returns An array of authorized RPC origin URLs, or undefined if RPC is not configured
   *
   * @example
   * ```typescript
   * const origins = application.rpcOrigins;
   * if (origins && origins.length > 0) {
   *   console.log('RPC origins:');
   *   origins.forEach(origin => console.log(`- ${origin}`));
   * }
   * ```
   */
  get rpcOrigins(): string[] | undefined {
    return this.data.rpc_origins;
  }

  /**
   * Indicates whether the app can be added to servers by users other than the owner.
   *
   * When false, only the application owner can add the bot to servers.
   *
   * @returns True if the bot is public, false if restricted to owner installation
   *
   * @example
   * ```typescript
   * if (application.botPublic) {
   *   console.log('This bot can be added to servers by anyone');
   * } else {
   *   console.log('Only the owner can add this bot to servers');
   * }
   * ```
   */
  get botPublic(): boolean {
    return Boolean(this.data.bot_public);
  }

  /**
   * Indicates whether the bot requires code grant for installation.
   *
   * When true, the bot will only join servers after completion of the full OAuth2 code grant flow,
   * adding an extra security step during installation.
   *
   * @returns True if code grant is required, false otherwise
   *
   * @example
   * ```typescript
   * if (application.botRequireCodeGrant) {
   *   console.log('This bot requires OAuth2 code grant for installation');
   * } else {
   *   console.log('This bot can be installed with a standard OAuth2 flow');
   * }
   * ```
   */
  get botRequireCodeGrant(): boolean {
    return Boolean(this.data.bot_require_code_grant);
  }

  /**
   * Gets the User object for the bot user associated with this application.
   *
   * This represents the actual bot account that will appear in Discord servers.
   * May be undefined if this application doesn't have an associated bot user.
   *
   * @returns The User object for the bot, or undefined if not available
   *
   * @example
   * ```typescript
   * const bot = application.bot;
   * if (bot) {
   *   console.log(`Bot username: ${bot.username}`);
   *   console.log(`Bot ID: ${bot.id}`);
   * }
   * ```
   */
  get bot(): User | undefined {
    if (!this.data.bot) {
      return undefined;
    }

    return new User(this.client, this.data.bot as UserEntity);
  }

  /**
   * Gets the URL to the application's Terms of Service.
   *
   * This link should lead to a document outlining the terms users must agree to
   * when using the application.
   *
   * @returns The Terms of Service URL, or undefined if not set
   *
   * @example
   * ```typescript
   * const tosUrl = application.termsOfServiceUrl;
   * if (tosUrl) {
   *   console.log(`Terms of Service: ${tosUrl}`);
   * }
   * ```
   */
  get termsOfServiceUrl(): string | undefined {
    return this.data.terms_of_service_url;
  }

  /**
   * Gets the URL to the application's Privacy Policy.
   *
   * This link should lead to a document explaining how the application handles user data.
   *
   * @returns The Privacy Policy URL, or undefined if not set
   *
   * @example
   * ```typescript
   * const privacyUrl = application.privacyPolicyUrl;
   * if (privacyUrl) {
   *   console.log(`Privacy Policy: ${privacyUrl}`);
   * }
   * ```
   */
  get privacyPolicyUrl(): string | undefined {
    return this.data.privacy_policy_url;
  }

  /**
   * Gets the User object for the owner of this application.
   *
   * For applications owned by individuals, this will be the user who created the application.
   * For team-owned applications, this may be null or a designated team owner.
   *
   * @returns The User object for the application owner, or undefined if not available
   *
   * @example
   * ```typescript
   * const owner = application.owner;
   * if (owner) {
   *   console.log(`Application owned by: ${owner.username}`);
   * } else if (application.team) {
   *   console.log('Application is owned by a team');
   * }
   * ```
   */
  get owner(): User | undefined {
    if (!this.data.owner) {
      return undefined;
    }

    return new User(this.client, this.data.owner as UserEntity);
  }

  /**
   * Gets the verification key used for interactions and the GameSDK's GetTicket.
   *
   * This is a hex-encoded key used for security verification of interactions.
   * It should be kept private and used to verify that requests come from Discord.
   *
   * @returns The hex-encoded verification key
   *
   * @example
   * ```typescript
   * console.log(`Verification key: ${application.verifyKey}`);
   * ```
   */
  get verifyKey(): string {
    return this.data.verify_key;
  }

  /**
   * Gets the team that owns this application, if applicable.
   *
   * Discord applications can be owned either by an individual user or by a team.
   * This property contains information about the team if team ownership is used.
   *
   * @returns The team information in camelCase format, or null if owned by an individual
   *
   * @example
   * ```typescript
   * const team = application.team;
   * if (team) {
   *   console.log(`Team name: ${team.name}`);
   *   console.log(`Team members: ${team.members.length}`);
   * } else {
   *   console.log('Application is owned by an individual, not a team');
   * }
   * ```
   */
  get team(): CamelCasedPropertiesDeep<TeamEntity> | null {
    if (!this.data.team) {
      return null;
    }

    return toCamelCasedPropertiesDeep(this.data.team);
  }

  /**
   * Gets the ID of the guild associated with this application.
   *
   * Some applications have a primary guild association, often used for support
   * or community servers.
   *
   * @returns The guild ID, or undefined if no guild is associated
   *
   * @example
   * ```typescript
   * const guildId = application.guildId;
   * if (guildId) {
   *   console.log(`Associated with guild ID: ${guildId}`);
   * }
   * ```
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * Gets the Guild object for the guild associated with this application.
   *
   * This provides detailed information about the associated guild, such as its name,
   * icon, and other properties.
   *
   * @returns The Guild object, or undefined if no guild is associated
   *
   * @example
   * ```typescript
   * const guild = application.guild;
   * if (guild) {
   *   console.log(`Associated guild: ${guild.name}`);
   *   console.log(`Member count: ${guild.memberCount}`);
   * }
   * ```
   */
  get guild(): Guild | undefined {
    if (!this.data.guild) {
      return undefined;
    }

    return new Guild(this.client, this.data.guild as GuildCreateEntity);
  }

  /**
   * Gets the primary SKU ID for this application.
   *
   * This is relevant for applications that are games sold on Discord, representing
   * the primary "Game SKU" that is created.
   *
   * @returns The primary SKU ID, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const skuId = application.primarySkuId;
   * if (skuId) {
   *   console.log(`Primary SKU ID: ${skuId}`);
   * }
   * ```
   */
  get primarySkuId(): Snowflake | undefined {
    return this.data.primary_sku_id;
  }

  /**
   * Gets the URL slug for this application's store page.
   *
   * This is used for applications sold on Discord to create the store page URL.
   *
   * @returns The URL slug, or undefined if not applicable
   *
   * @example
   * ```typescript
   * const slug = application.slug;
   * if (slug) {
   *   console.log(`Store page slug: ${slug}`);
   *   console.log(`Store URL: https://discord.com/store/applications/${application.id}/${slug}`);
   * }
   * ```
   */
  get slug(): string | undefined {
    return this.data.slug;
  }

  /**
   * Gets the cover image hash for this application.
   *
   * This image is used as the default rich presence invite cover and in the
   * Discord app store if applicable.
   *
   * @returns The cover image hash, or undefined if not set
   *
   * @example
   * ```typescript
   * const coverImage = application.coverImage;
   * if (coverImage) {
   *   console.log(`Has cover image: ${coverImage}`);
   * }
   * ```
   */
  get coverImage(): string | undefined {
    return this.data.cover_image;
  }

  /**
   * Gets the application's flags as a BitField.
   *
   * These flags represent various features and capabilities of the application,
   * including gateway intents, verification status, and badge eligibility.
   *
   * @returns A BitField of application flags
   *
   * @example
   * ```typescript
   * import { ApplicationFlags } from '@nyxojs/core';
   *
   * if (application.flags.has(ApplicationFlags.ApplicationCommandBadge)) {
   *   console.log('This application has registered slash commands');
   * }
   *
   * if (application.flags.has(ApplicationFlags.GatewayPresence)) {
   *   console.log('This application has the presence intent');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
   */
  get flags(): BitField<ApplicationFlags> {
    return new BitField<ApplicationFlags>(this.data.flags ?? 0n);
  }

  /**
   * Gets the approximate count of guilds this application has been added to.
   *
   * This provides an estimate of how many Discord servers are using this application.
   *
   * @returns The approximate guild count, or undefined if not available
   *
   * @example
   * ```typescript
   * const guildCount = application.approximateGuildCount;
   * if (guildCount !== undefined) {
   *   console.log(`Bot is in approximately ${guildCount} servers`);
   * }
   * ```
   */
  get approximateGuildCount(): number | undefined {
    return this.data.approximate_guild_count;
  }

  /**
   * Gets the approximate count of users that have installed this application.
   *
   * This provides an estimate of the total user reach of this application.
   *
   * @returns The approximate user install count, or undefined if not available
   *
   * @example
   * ```typescript
   * const userCount = application.approximateUserInstallCount;
   * if (userCount !== undefined) {
   *   console.log(`App has approximately ${userCount} user installations`);
   * }
   * ```
   */
  get approximateUserInstallCount(): number | undefined {
    return this.data.approximate_user_install_count;
  }

  /**
   * Gets the array of redirect URIs for this application's OAuth2 flow.
   *
   * These are the authorized redirect destinations used during the OAuth2
   * authorization process.
   *
   * @returns An array of redirect URIs, or undefined if none are configured
   *
   * @example
   * ```typescript
   * const redirects = application.redirectUris;
   * if (redirects && redirects.length > 0) {
   *   console.log('OAuth2 redirect URIs:');
   *   redirects.forEach(uri => console.log(`- ${uri}`));
   * }
   * ```
   */
  get redirectUris(): string[] | undefined {
    return this.data.redirect_uris;
  }

  /**
   * Gets the interactions endpoint URL for this application.
   *
   * This is the webhook URL where Discord will send interaction payloads when
   * using the HTTP interactions mode instead of the Gateway.
   *
   * @returns The interactions endpoint URL, or null/undefined if not configured
   *
   * @example
   * ```typescript
   * const endpoint = application.interactionsEndpointUrl;
   * if (endpoint) {
   *   console.log(`Interactions endpoint: ${endpoint}`);
   * } else {
   *   console.log('No interactions endpoint configured (using Gateway)');
   * }
   * ```
   */
  get interactionsEndpointUrl(): string | null | undefined {
    return this.data.interactions_endpoint_url;
  }

  /**
   * Gets the role connections verification URL for this application.
   *
   * This URL is used for the linked roles feature, allowing external services
   * to verify user information for role assignment.
   *
   * @returns The role connections verification URL, or null/undefined if not configured
   *
   * @example
   * ```typescript
   * const verificationUrl = application.roleConnectionsVerificationUrl;
   * if (verificationUrl) {
   *   console.log(`Role connections verification URL: ${verificationUrl}`);
   * }
   * ```
   */
  get roleConnectionsVerificationUrl(): string | null | undefined {
    return this.data.role_connections_verification_url;
  }

  /**
   * Gets the event webhooks URL for this application.
   *
   * This is where Discord will send webhook event payloads for subscribed events.
   *
   * @returns The event webhooks URL, or null/undefined if not configured
   *
   * @example
   * ```typescript
   * const webhooksUrl = application.eventWebhooksUrl;
   * if (webhooksUrl) {
   *   console.log(`Event webhooks URL: ${webhooksUrl}`);
   * }
   * ```
   */
  get eventWebhooksUrl(): string | null | undefined {
    return this.data.event_webhooks_url;
  }

  /**
   * Gets the status of event webhooks for this application.
   *
   * This indicates whether webhook events are enabled, disabled by the developer,
   * or disabled by Discord due to inactivity.
   *
   * @returns The event webhooks status
   *
   * @example
   * ```typescript
   * import { ApplicationEventWebhookStatus } from '@nyxojs/core';
   *
   * switch (application.eventWebhooksStatus) {
   *   case ApplicationEventWebhookStatus.Enabled:
   *     console.log('Event webhooks are enabled');
   *     break;
   *   case ApplicationEventWebhookStatus.Disabled:
   *     console.log('Event webhooks are disabled by the developer');
   *     break;
   *   case ApplicationEventWebhookStatus.DisabledByDiscord:
   *     console.log('Event webhooks are disabled by Discord (inactivity)');
   *     break;
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
   */
  get eventWebhooksStatus(): ApplicationEventWebhookStatus {
    return this.data.event_webhooks_status;
  }

  /**
   * Gets the list of event types this application subscribes to for webhooks.
   *
   * These determine which events will trigger notifications to the webhooks URL.
   *
   * @returns An array of event type strings, or undefined if none are configured
   *
   * @example
   * ```typescript
   * const eventTypes = application.eventWebhooksTypes;
   * if (eventTypes && eventTypes.length > 0) {
   *   console.log('Subscribed to these webhook events:');
   *   eventTypes.forEach(type => console.log(`- ${type}`));
   * }
   * ```
   */
  get eventWebhooksTypes(): string[] | undefined {
    return this.data.event_webhooks_types;
  }

  /**
   * Gets the tags associated with this application.
   *
   * Tags are used for discovery and categorization in the Discord app directory.
   *
   * @returns An array of tag strings, or undefined if none are set
   *
   * @example
   * ```typescript
   * const tags = application.tags;
   * if (tags && tags.length > 0) {
   *   console.log('Application tags:');
   *   tags.forEach(tag => console.log(`- ${tag}`));
   * }
   * ```
   */
  get tags(): string[] | undefined {
    return this.data.tags;
  }

  /**
   * Gets the install parameters for this application's default in-app authorization link.
   *
   * These parameters control the default OAuth2 scopes and permissions requested
   * when adding the application.
   *
   * @returns The install parameters in camelCase format, or undefined if not configured
   *
   * @example
   * ```typescript
   * const params = application.installParams;
   * if (params) {
   *   console.log('Default installation parameters:');
   *   console.log(`Scopes: ${params.scopes.join(', ')}`);
   *   console.log(`Permissions: ${params.permissions}`);
   * }
   * ```
   */
  get installParams():
    | CamelCasedPropertiesDeep<InstallParamsEntity>
    | undefined {
    if (!this.data.install_params) {
      return undefined;
    }

    return toCamelCasedPropertiesDeep(this.data.install_params);
  }

  /**
   * Gets the integration types configuration for this application.
   *
   * This maps each supported installation context (like guild or user installs)
   * to its specific configuration.
   *
   * @returns A record mapping integration types to their configurations
   *
   * @example
   * ```typescript
   * import { ApplicationIntegrationType } from '@nyxojs/core';
   *
   * const config = application.integrationTypesConfig;
   * const guildConfig = config[ApplicationIntegrationType.GuildInstall];
   * if (guildConfig?.oauth2_install_params) {
   *   console.log('Guild installation configuration:');
   *   console.log(`Scopes: ${guildConfig.oauth2_install_params.scopes.join(', ')}`);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
   */
  get integrationTypesConfig(): Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  > {
    return this.data.integration_types_config;
  }

  /**
   * Gets the custom installation URL for this application.
   *
   * This is an alternative to the Discord-provided authorization flow,
   * allowing developers to use their own onboarding process.
   *
   * @returns The custom install URL, or undefined if not configured
   *
   * @example
   * ```typescript
   * const customUrl = application.customInstallUrl;
   * if (customUrl) {
   *   console.log(`Custom installation URL: ${customUrl}`);
   * } else {
   *   console.log('Using standard Discord installation flow');
   * }
   * ```
   */
  get customInstallUrl(): string | undefined {
    return this.data.custom_install_url;
  }

  /**
   * Checks if this application has a custom icon set.
   *
   * @returns True if the application has an icon, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasIcon) {
   *   console.log('Application has a custom icon');
   *   console.log(`Icon URL: ${application.getIconUrl()}`);
   * } else {
   *   console.log('Application does not have a custom icon');
   * }
   * ```
   */
  get hasIcon(): boolean {
    return this.icon !== null;
  }

  /**
   * Checks if this application has a cover image set.
   *
   * @returns True if the application has a cover image, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasCoverImage) {
   *   console.log('Application has a cover image');
   *   console.log(`Cover image URL: ${application.getCoverImageUrl()}`);
   * } else {
   *   console.log('Application does not have a cover image');
   * }
   * ```
   */
  get hasCoverImage(): boolean {
    return this.coverImage !== undefined;
  }

  /**
   * Checks if this application is owned by a team rather than an individual.
   *
   * @returns True if the application is team-owned, false otherwise
   *
   * @example
   * ```typescript
   * if (application.isTeamOwned) {
   *   console.log(`Application is owned by team: ${application.team?.name}`);
   *   console.log(`Team has ${application.team?.members.length} members`);
   * } else {
   *   console.log('Application is owned by an individual user');
   * }
   * ```
   */
  get isTeamOwned(): boolean {
    return this.team !== null;
  }

  /**
   * Checks if this application has a bot user associated with it.
   *
   * @returns True if the application has a bot user, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasBot) {
   *   console.log(`Application has a bot named: ${application.bot?.username}`);
   * } else {
   *   console.log('Application does not have a bot user');
   * }
   * ```
   */
  get hasBot(): boolean {
    return this.bot !== undefined;
  }

  /**
   * Checks if this application is public (can be added by anyone).
   *
   * @returns True if the application is public, false if restricted
   *
   * @example
   * ```typescript
   * if (application.isPublic) {
   *   console.log('This application can be added by anyone');
   * } else {
   *   console.log('Only the owner can add this application');
   * }
   * ```
   */
  get isPublic(): boolean {
    return this.botPublic;
  }

  /**
   * Checks if this application is verified by Discord.
   *
   * Verified applications have undergone additional review by Discord
   * and receive special benefits like higher rate limits and better discoverability.
   *
   * @returns True if the application is verified, false otherwise
   *
   * @example
   * ```typescript
   * if (application.isVerified) {
   *   console.log('This is a verified application');
   * } else {
   *   console.log('This application is not verified');
   * }
   * ```
   */
  get isVerified(): boolean {
    return !this.flags.has(ApplicationFlags.VerificationPendingGuildLimit);
  }

  /**
   * Checks if this application has webhooks for events enabled.
   *
   * @returns True if event webhooks are enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasEventWebhooksEnabled) {
   *   console.log('Event webhooks are enabled');
   *   console.log(`Webhook URL: ${application.eventWebhooksUrl}`);
   * } else {
   *   console.log('Event webhooks are not enabled');
   * }
   * ```
   */
  get hasEventWebhooksEnabled(): boolean {
    return this.eventWebhooksStatus === 2; // ApplicationEventWebhookStatus.Enabled
  }

  /**
   * Checks if this application has the message content intent enabled.
   *
   * This intent is required for bots to access message content in messages.
   *
   * @returns True if the message content intent is enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasMessageContentIntent) {
   *   console.log('This bot can access message content');
   * } else {
   *   console.log('This bot cannot access message content');
   * }
   * ```
   */
  get hasMessageContentIntent(): boolean {
    return (
      this.flags.has(ApplicationFlags.GatewayMessageContent) ||
      this.flags.has(ApplicationFlags.GatewayMessageContentLimited)
    );
  }

  /**
   * Checks if this application has the guild members intent enabled.
   *
   * This intent is required for bots to receive member-related events.
   *
   * @returns True if the guild members intent is enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasGuildMembersIntent) {
   *   console.log('This bot can receive member events');
   * } else {
   *   console.log('This bot cannot receive member events');
   * }
   * ```
   */
  get hasGuildMembersIntent(): boolean {
    return (
      this.flags.has(ApplicationFlags.GatewayGuildMembers) ||
      this.flags.has(ApplicationFlags.GatewayGuildMembersLimited)
    );
  }

  /**
   * Checks if this application has the presence intent enabled.
   *
   * This intent is required for bots to receive presence updates.
   *
   * @returns True if the presence intent is enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (application.hasPresenceIntent) {
   *   console.log('This bot can receive presence updates');
   * } else {
   *   console.log('This bot cannot receive presence updates');
   * }
   * ```
   */
  get hasPresenceIntent(): boolean {
    return (
      this.flags.has(ApplicationFlags.GatewayPresence) ||
      this.flags.has(ApplicationFlags.GatewayPresenceLimited)
    );
  }

  /**
   * Creates a Date object representing when this application was created.
   *
   * This is calculated from the application's ID, which contains a timestamp.
   *
   * @returns The Date when this application was created
   *
   * @example
   * ```typescript
   * const creationDate = application.createdAt;
   * console.log(`Application created on: ${creationDate.toLocaleDateString()}`);
   * ```
   */
  get createdAt(): Date {
    return new Date(Number(BigInt(this.id) >> 22n) + 1420070400000);
  }

  /**
   * Gets the URL for the application's icon with specified options.
   *
   * @param options - Options for the icon image (size, format, etc.)
   * @returns The URL for the application's icon, or null if no icon is set
   *
   * @example
   * ```typescript
   * // Get a standard icon URL
   * const iconUrl = application.getIconUrl();
   *
   * // Get a larger icon in PNG format
   * const largeIcon = application.getIconUrl({ size: 256, format: 'png' });
   *
   * if (iconUrl) {
   *   console.log(`Icon URL: ${iconUrl}`);
   * }
   * ```
   */
  getIconUrl(
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationIconUrl | null {
    if (!this.icon) {
      return null;
    }

    return Cdn.applicationIcon(this.id, this.icon, options);
  }

  /**
   * Gets the URL for the application's cover image with specified options.
   *
   * @param options - Options for the cover image (size, format, etc.)
   * @returns The URL for the cover image, or null if none is set
   *
   * @example
   * ```typescript
   * const coverUrl = application.getCoverImageUrl();
   * if (coverUrl) {
   *   console.log(`Cover image URL: ${coverUrl}`);
   * }
   * ```
   */
  getCoverImageUrl(
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationCoverUrl | null {
    if (!this.coverImage) {
      return null;
    }

    return Cdn.applicationCover(this.id, this.coverImage, options);
  }

  /**
   * Updates this application with new information.
   *
   * This method allows modifying various aspects of the application, such as description,
   * icon, flags, and more.
   *
   * @param options - The properties to update
   * @returns A promise resolving to the updated Application
   * @throws Error if the application couldn't be updated
   *
   * @example
   * ```typescript
   * try {
   *   // Update application description
   *   const updated = await application.edit({
   *     description: "My awesome bot - now with new features!"
   *   });
   *
   *   console.log('Application updated successfully');
   *   console.log(`New description: ${updated.description}`);
   *
   *   // Update application icon
   *   const withNewIcon = await application.edit({
   *     icon: await FileHandler.fromFile('path/to/icon.png')
   *   });
   *
   *   console.log('Icon updated successfully');
   * } catch (error) {
   *   console.error('Failed to update application:', error);
   * }
   * ```
   */
  async edit(
    options: CamelCasedProperties<EditCurrentApplicationSchema>,
  ): Promise<Application> {
    const updatedData =
      await this.client.rest.applications.updateCurrentApplication(
        toSnakeCaseProperties(options),
      );
    return new Application(this.client, updatedData);
  }

  /**
   * Updates the application's icon.
   *
   * This is a convenience method for updating just the icon.
   *
   * @param icon - The new icon as a FileInput (file path, Buffer, etc.)
   * @returns A promise resolving to the updated Application
   * @throws Error if the icon couldn't be updated
   *
   * @example
   * ```typescript
   * try {
   *   // Update with file path
   *   await application.updateIcon('path/to/new_icon.png');
   *
   *   // Or with a buffer
   *   const buffer = await fs.promises.readFile('path/to/icon.png');
   *   await application.updateIcon(buffer);
   *
   *   console.log('Icon updated successfully');
   * } catch (error) {
   *   console.error('Failed to update icon:', error);
   * }
   * ```
   */
  updateIcon(icon: FileInput): Promise<Application> {
    return this.edit({ icon });
  }

  /**
   * Updates the application's description.
   *
   * This is a convenience method for updating just the description.
   *
   * @param description - The new description text
   * @returns A promise resolving to the updated Application
   * @throws Error if the description couldn't be updated
   *
   * @example
   * ```typescript
   * try {
   *   await application.updateDescription('My awesome bot - now with new features!');
   *   console.log('Description updated successfully');
   * } catch (error) {
   *   console.error('Failed to update description:', error);
   * }
   * ```
   */
  updateDescription(description: string): Promise<Application> {
    return this.edit({ description });
  }

  /**
   * Updates the application's tags.
   *
   * Tags are used for discovery and categorization in the Discord app directory.
   *
   * @param tags - Array of tag strings to set
   * @returns A promise resolving to the updated Application
   * @throws Error if the tags couldn't be updated
   *
   * @example
   * ```typescript
   * try {
   *   await application.updateTags(['utility', 'moderation', 'fun']);
   *   console.log('Tags updated successfully');
   * } catch (error) {
   *   console.error('Failed to update tags:', error);
   * }
   * ```
   */
  updateTags(tags: string[]): Promise<Application> {
    return this.edit({ tags });
  }

  /**
   * Refreshes this application's data from the API.
   *
   * This method fetches the latest application data to ensure all properties
   * are up to date.
   *
   * @returns A promise resolving to the refreshed Application
   * @throws Error if the application couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const refreshed = await application.refresh();
   *   console.log('Application data refreshed');
   *   console.log(`Current guild count: ${refreshed.approximateGuildCount}`);
   * } catch (error) {
   *   console.error('Failed to refresh application data:', error);
   * }
   * ```
   */
  async refresh(): Promise<Application> {
    const data = await this.client.rest.applications.fetchCurrentApplication();
    return new Application(this.client, data);
  }

  /**
   * Fetches information about a specific activity instance for this application.
   *
   * Activity instances represent ongoing interactive experiences within Discord,
   * such as voice channel activities or embedded applications.
   *
   * @param instanceId - Unique identifier for the specific activity instance
   * @returns A promise resolving to the activity instance information
   * @throws Error if the instance doesn't exist or couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const activityInstance = await application.fetchActivityInstance('abc123');
   *   console.log(`Activity in channel: ${activityInstance.location.channelId}`);
   *   console.log(`Participating users: ${activityInstance.users.length}`);
   * } catch (error) {
   *   console.error('Failed to fetch activity instance:', error);
   * }
   * ```
   */
  async fetchActivityInstance(
    instanceId: string,
  ): Promise<CamelCasedPropertiesDeep<ActivityInstanceEntity>> {
    const activityInstance =
      await this.client.rest.applications.fetchActivityInstance(
        this.id,
        instanceId,
      );
    return toCamelCasedPropertiesDeep(activityInstance);
  }

  /**
   * Checks if this application has a specific flag.
   *
   * @param flag - The flag to check for
   * @returns True if the application has the flag, false otherwise
   *
   * @example
   * ```typescript
   * import { ApplicationFlags } from '@nyxojs/core';
   *
   * if (application.hasFlag(ApplicationFlags.ApplicationCommandBadge)) {
   *   console.log('This application has slash commands');
   * }
   *
   * if (application.hasFlag(ApplicationFlags.GatewayPresence)) {
   *   console.log('This application has the presence intent');
   * }
   * ```
   */
  hasFlag(flag: ApplicationFlags): boolean {
    return this.flags.has(flag);
  }

  /**
   * Applies a set of flags to the application.
   *
   * Note that only certain flags can be modified through the API; others
   * are controlled by Discord or require special permissions.
   *
   * @param flags - The flags to apply
   * @returns A promise resolving to the updated Application
   * @throws Error if the flags couldn't be updated
   *
   * @example
   * ```typescript
   * import { ApplicationFlags } from '@nyxojs/core';
   *
   * // Request message content intent
   * try {
   *   await application.applyFlags(ApplicationFlags.GatewayMessageContent);
   *   console.log('Flags updated successfully');
   * } catch (error) {
   *   console.error('Failed to update flags:', error);
   * }
   * ```
   */
  applyFlags(flags: ApplicationFlags): Promise<Application> {
    const currentFlags = new BitField(this.flags.valueOf());
    const newFlags = currentFlags.add(BigInt(flags));

    return this.edit({ flags: Number(newFlags.valueOf()) });
  }

  /**
   * Removes a set of flags from the application.
   *
   * Note that only certain flags can be modified through the API; others
   * are controlled by Discord or require special permissions.
   *
   * @param flags - The flags to remove
   * @returns A promise resolving to the updated Application
   * @throws Error if the flags couldn't be updated
   *
   * @example
   * ```typescript
   * import { ApplicationFlags } from '@nyxojs/core';
   *
   * // Remove message content intent
   * try {
   *   await application.removeFlags(ApplicationFlags.GatewayMessageContent);
   *   console.log('Flags updated successfully');
   * } catch (error) {
   *   console.error('Failed to update flags:', error);
   * }
   * ```
   */
  removeFlags(flags: ApplicationFlags): Promise<Application> {
    const currentFlags = new BitField(this.flags.valueOf());
    const newFlags = currentFlags.remove(BigInt(flags));

    return this.edit({ flags: Number(newFlags) });
  }
}
