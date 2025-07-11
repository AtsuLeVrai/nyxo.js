import {
  type ApplicationEntity,
  ApplicationFlags,
  BitField,
  SnowflakeUtil,
  type UserEntity,
} from "@nyxojs/core";
import type { GuildCreateEntity } from "@nyxojs/gateway";
import {
  type ActivityInstanceEntity,
  type ApplicationCoverUrl,
  type ApplicationIconUrl,
  type ApplicationUpdateOptions,
  Cdn,
  type FileInput,
  type ImageOptions,
} from "@nyxojs/rest";
import type { z } from "zod/v4";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
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
 * @see {@link https://discord.com/developers/docs/resources/application}
 */
@Cacheable<ApplicationEntity>("applications", (data) => data.id)
export class Application
  extends BaseClass<ApplicationEntity>
  implements Enforce<PropsToCamel<ApplicationEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this application.
   *
   * This ID is permanent and will not change for the lifetime of the application.
   * It can be used for API operations, authorization URLs, and persistent references.
   *
   * @returns The application's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the name of the application.
   *
   * This is the display name that appears in the Discord UI and bot listings.
   *
   * @returns The application's name
   */
  readonly name = this.rawData.name;

  /**
   * Gets the application's icon hash.
   *
   * This hash is used to construct the URL for the application's avatar image.
   * Use `getIconUrl()` method to get the full URL.
   *
   * @returns The application's icon hash, or null if no icon is set
   */
  readonly icon = this.rawData.icon;

  /**
   * Gets the application's icon hash returned when in the template object.
   *
   * This is an alternative icon hash sometimes used in specific contexts.
   *
   * @returns The alternative icon hash, or null/undefined if not available
   */
  readonly iconHash = this.rawData.icon_hash;

  /**
   * Gets the description of the application.
   *
   * This is a brief explanation of what the application does, visible to users
   * in various Discord interfaces.
   *
   * @returns The application's description
   */
  readonly description = this.rawData.description;

  /**
   * Gets the list of RPC origin URLs, if RPC is enabled for this application.
   *
   * These origins determine which domains can use Discord's RPC protocol
   * with this application.
   *
   * @returns An array of authorized RPC origin URLs, or undefined if RPC is not configured
   */
  readonly rpcOrigins = this.rawData.rpc_origins;

  /**
   * Indicates whether the app can be added to servers by users other than the owner.
   *
   * When false, only the application owner can add the bot to servers.
   *
   * @returns True if the bot is public, false if restricted to owner installation
   */
  readonly botPublic = Boolean(this.rawData.bot_public);

  /**
   * Indicates whether the bot requires code grant for installation.
   *
   * When true, the bot will only join servers after completion of the full OAuth2 code grant flow,
   * adding an extra security step during installation.
   *
   * @returns True if code grant is required, false otherwise
   */
  readonly botRequireCodeGrant = Boolean(this.rawData.bot_require_code_grant);

  /**
   * Gets the User object for the bot user associated with this application.
   *
   * This represents the actual bot account that will appear in Discord servers.
   * May be undefined if this application doesn't have an associated bot user.
   *
   * @returns The User object for the bot, or undefined if not available
   */
  readonly bot = this.rawData.bot
    ? new User(this.client, this.rawData.bot as UserEntity)
    : undefined;

  /**
   * Gets the URL to the application's Terms of Service.
   *
   * This link should lead to a document outlining the terms users must agree to
   * when using the application.
   *
   * @returns The Terms of Service URL, or undefined if not set
   */
  readonly termsOfServiceUrl = this.rawData.terms_of_service_url;

  /**
   * Gets the URL to the application's Privacy Policy.
   *
   * This link should lead to a document explaining how the application handles user data.
   *
   * @returns The Privacy Policy URL, or undefined if not set
   */
  readonly privacyPolicyUrl = this.rawData.privacy_policy_url;

  /**
   * Gets the User object for the owner of this application.
   *
   * For applications owned by individuals, this will be the user who created the application.
   * For team-owned applications, this may be null or a designated team owner.
   *
   * @returns The User object for the application owner, or undefined if not available
   */
  readonly owner = this.rawData.owner
    ? new User(this.client, this.rawData.owner as UserEntity)
    : undefined;

  /**
   * Gets the verification key used for interactions and the GameSDK's GetTicket.
   *
   * This is a hex-encoded key used for security verification of interactions.
   * It should be kept private and used to verify that requests come from Discord.
   *
   * @returns The hex-encoded verification key
   */
  readonly verifyKey = this.rawData.verify_key;

  /**
   * Gets the team that owns this application, if applicable.
   *
   * Discord applications can be owned either by an individual user or by a team.
   * This property contains information about the team if team ownership is used.
   *
   * @returns The team information in camelCase format, or null if owned by an individual
   */
  readonly team = this.rawData.team;

  /**
   * Gets the ID of the guild associated with this application.
   *
   * Some applications have a primary guild association, often used for support
   * or community servers.
   *
   * @returns The guild ID, or undefined if no guild is associated
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the Guild object for the guild associated with this application.
   *
   * This provides detailed information about the associated guild, such as its name,
   * icon, and other properties.
   *
   * @returns The Guild object, or undefined if no guild is associated
   */
  readonly guild = this.rawData.guild
    ? new Guild(this.client, this.rawData.guild as GuildCreateEntity)
    : undefined;

  /**
   * Gets the primary SKU ID for this application.
   *
   * This is relevant for applications that are games sold on Discord, representing
   * the primary "Game SKU" that is created.
   *
   * @returns The primary SKU ID, or undefined if not applicable
   */
  readonly primarySkuId = this.rawData.primary_sku_id;

  /**
   * Gets the URL slug for this application's store page.
   *
   * This is used for applications sold on Discord to create the store page URL.
   *
   * @returns The URL slug, or undefined if not applicable
   */
  readonly slug = this.rawData.slug;

  /**
   * Gets the cover image hash for this application.
   *
   * This image is used as the default rich presence invite cover and in the
   * Discord app store if applicable.
   *
   * @returns The cover image hash, or undefined if not set
   */
  readonly coverImage = this.rawData.cover_image;

  /**
   * Gets the application's flags as a BitField.
   *
   * These flags represent various features and capabilities of the application,
   * including gateway intents, verification status, and badge eligibility.
   *
   * @returns A BitField of application flags
   * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
   */
  readonly flags = new BitField<ApplicationFlags>(this.rawData.flags ?? 0n);

  /**
   * Gets the approximate count of guilds this application has been added to.
   *
   * This provides an estimate of how many Discord servers are using this application.
   *
   * @returns The approximate guild count, or undefined if not available
   */
  readonly approximateGuildCount = this.rawData.approximate_guild_count;

  /**
   * Gets the approximate count of users that have installed this application.
   *
   * This provides an estimate of the total user reach of this application.
   *
   * @returns The approximate user install count, or undefined if not available
   */
  readonly approximateUserInstallCount =
    this.rawData.approximate_user_install_count;

  /**
   * Gets the array of redirect URIs for this application's OAuth2 flow.
   *
   * These are the authorized redirect destinations used during the OAuth2
   * authorization process.
   *
   * @returns An array of redirect URIs, or undefined if none are configured
   */
  readonly redirectUris = this.rawData.redirect_uris;

  /**
   * Gets the interactions endpoint URL for this application.
   *
   * This is the webhook URL where Discord will send interaction payloads when
   * using the HTTP interactions mode instead of the Gateway.
   *
   * @returns The interactions endpoint URL, or null/undefined if not configured
   */
  readonly interactionsEndpointUrl = this.rawData.interactions_endpoint_url;

  /**
   * Gets the role connections verification URL for this application.
   *
   * This URL is used for the linked roles feature, allowing external services
   * to verify user information for role assignment.
   *
   * @returns The role connections verification URL, or null/undefined if not configured
   */
  readonly roleConnectionsVerificationUrl =
    this.rawData.role_connections_verification_url;

  /**
   * Gets the event webhooks URL for this application.
   *
   * This is where Discord will send webhook event payloads for subscribed events.
   *
   * @returns The event webhooks URL, or null/undefined if not configured
   */
  readonly eventWebhooksUrl = this.rawData.event_webhooks_url;

  /**
   * Gets the status of event webhooks for this application.
   *
   * This indicates whether webhook events are enabled, disabled by the developer,
   * or disabled by Discord due to inactivity.
   *
   * @returns The event webhooks status
   * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
   */
  readonly eventWebhooksStatus = this.rawData.event_webhooks_status;

  /**
   * Gets the list of event types this application subscribes to for webhooks.
   *
   * These determine which events will trigger notifications to the webhooks URL.
   *
   * @returns An array of event type strings, or undefined if none are configured
   */
  readonly eventWebhooksTypes = this.rawData.event_webhooks_types;

  /**
   * Gets the tags associated with this application.
   *
   * Tags are used for discovery and categorization in the Discord app directory.
   *
   * @returns An array of tag strings, or undefined if none are set
   */
  readonly tags = this.rawData.tags;

  /**
   * Gets the install parameters for this application's default in-app authorization link.
   *
   * These parameters control the default OAuth2 scopes and permissions requested
   * when adding the application.
   *
   * @returns The install parameters in camelCase format, or undefined if not configured
   */
  readonly installParams = this.rawData.install_params;

  /**
   * Gets the integration types configuration for this application.
   *
   * This maps each supported installation context (like guild or user installs)
   * to its specific configuration.
   *
   * @returns A record mapping integration types to their configurations
   * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
   */
  readonly integrationTypesConfig = this.rawData.integration_types_config;

  /**
   * Gets the custom installation URL for this application.
   *
   * This is an alternative to the Discord-provided authorization flow,
   * allowing developers to use their own onboarding process.
   *
   * @returns The custom install URL, or undefined if not configured
   */
  readonly customInstallUrl = this.rawData.custom_install_url;

  /**
   * Checks if this application is verified by Discord.
   *
   * Verified applications have undergone additional review by Discord
   * and receive special benefits like higher rate limits and better discoverability.
   *
   * @returns True if the application is verified, false otherwise
   */
  get isVerified(): boolean {
    return !this.flags.has(ApplicationFlags.VerificationPendingGuildLimit);
  }

  /**
   * Checks if this application has webhooks for events enabled.
   *
   * @returns True if event webhooks are enabled, false otherwise
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
   */
  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  /**
   * Gets the URL for the application's icon with specified options.
   *
   * @param options - Options for the icon image (size, format, etc.)
   * @returns The URL for the application's icon, or null if no icon is set
   */
  getIconUrl(
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationIconUrl | null {
    return this.icon ? Cdn.applicationIcon(this.id, this.icon, options) : null;
  }

  /**
   * Gets the URL for the application's cover image with specified options.
   *
   * @param options - Options for the cover image (size, format, etc.)
   * @returns The URL for the cover image, or null if none is set
   */
  getCoverImageUrl(
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationCoverUrl | null {
    return this.coverImage
      ? Cdn.applicationCover(this.id, this.coverImage, options)
      : null;
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
   */
  async edit(options: ApplicationUpdateOptions): Promise<Application> {
    const updatedData =
      await this.client.rest.applications.updateCurrentApplication(options);
    this.patch(updatedData);
    return this;
  }

  /**
   * Updates the application's icon.
   *
   * This is a convenience method for updating just the icon.
   *
   * @param icon - The new icon as a FileInput (file path, Buffer, etc.)
   * @returns A promise resolving to the updated Application
   * @throws Error if the icon couldn't be updated
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
   */
  async refresh(): Promise<Application> {
    const data = await this.client.rest.applications.fetchCurrentApplication();
    this.patch(data);
    return this;
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
   */
  fetchActivityInstance(instanceId: string): Promise<ActivityInstanceEntity> {
    return this.client.rest.applications.fetchActivityInstance(
      this.id,
      instanceId,
    );
  }

  /**
   * Checks if this application has a specific flag.
   *
   * @param flag - The flag to check for
   * @returns True if the application has the flag, false otherwise
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
   */
  removeFlags(flags: ApplicationFlags): Promise<Application> {
    const currentFlags = new BitField(this.flags.valueOf());
    const newFlags = currentFlags.remove(BigInt(flags));

    return this.edit({ flags: Number(newFlags) });
  }
}
