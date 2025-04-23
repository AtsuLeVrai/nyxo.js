import type {
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
} from "@nyxojs/core";
import type { ApplicationEntity, Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";
import { FileHandler } from "../handlers/index.js";

/**
 * Defines the possible types of locations where Discord application activities can occur.
 * - 'gc' represents a group call location
 * - 'pc' represents a private call location
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-kind-enum}
 */
export type ActivityLocationType = "gc" | "pc";

/**
 * Represents a location within Discord where an application activity is taking place.
 * This object contains information about the channel, guild, and type of interaction
 * environment where users are engaging with an application activity.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object}
 */
export interface ActivityLocationEntity {
  /** Unique identifier for the activity location */
  id: string;

  /**
   * Type of location where the activity is happening:
   * - "gc" for group call
   * - "pc" for private call
   */
  kind: ActivityLocationType;

  /** ID of the channel where the activity is happening */
  channel_id: Snowflake;

  /**
   * ID of the guild where the activity is happening.
   * This field is only present for activities in guild channels.
   * Will be null for activities in DM channels.
   */
  guild_id?: Snowflake | null;
}

/**
 * Represents an instance of an application activity in Discord.
 * Contains comprehensive information about where the activity is occurring,
 * which application it belongs to, and which users are participating in it.
 *
 * Applications can be launched in different contexts (like voice channels or direct messages),
 * and this object tracks those active instances.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object}
 */
export interface ActivityInstanceEntity {
  /** ID of the application that owns this activity instance */
  application_id: Snowflake;

  /** Unique identifier for this specific activity instance */
  instance_id: string;

  /** ID associated with the launch event of this activity instance */
  launch_id: Snowflake;

  /** Detailed location information about where this activity is occurring */
  location: ActivityLocationEntity;

  /** Array of user IDs representing all users currently participating in this activity */
  users: Snowflake[];
}

/**
 * Interface defining the editable properties of a Discord application.
 * Used when updating an application through the Discord API.
 *
 * Note: While this interface contains some of the same fields as ApplicationEntity,
 * it uses different validation rules and transformations specifically for edit operations.
 * All fields are optional, allowing partial updates to the application.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export interface ApplicationUpdateOptions {
  /**
   * Custom URL for the application's authorization link.
   * Users will be redirected to this URL when installing the application.
   */
  custom_install_url?: string;

  /**
   * Description of the application.
   * This text appears in the Discord UI when users view the application.
   * Maximum 400 characters.
   */
  description?: string;

  /**
   * URL for role connection verification.
   * Used for linked roles functionality.
   */
  role_connections_verification_url?: string;

  /**
   * Parameters controlling how the application can be installed.
   * Defines the requested scopes and permissions.
   */
  install_params?: InstallParamsEntity;

  /**
   * Configuration for different integration types.
   * Controls how the application integrates with various Discord features.
   * Keys are integration types, values are their respective configurations.
   */
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /**
   * Application flags that can be set.
   * Note: Only certain gateway flags can be modified via the API.
   * Others are controlled by Discord or require special permissions.
   */
  flags?: ApplicationFlags;

  /**
   * Application icon image.
   * Will be automatically converted to a data URI format.
   * Recommended resolution: 512x512 pixels.
   */
  icon?: FileInput;

  /**
   * Application cover/splash image.
   * Will be automatically converted to a data URI format.
   * Shown in the Discord application directory.
   */
  cover_image?: FileInput;

  /**
   * URL for the interactions endpoint.
   * Discord will send interaction payloads to this URL.
   * Must be a valid HTTPS URL if specified.
   */
  interactions_endpoint_url?: string;

  /**
   * Application tags for discovery.
   * Maximum 5 tags, each maximum 20 characters.
   * Used to categorize the application in the Discord directory.
   */
  tags?: string[];

  /**
   * URL where Discord will send event webhook notifications.
   * Must be a valid HTTPS URL if specified.
   */
  event_webhooks_url?: string;

  /**
   * Status for event webhooks.
   * Can only be set to Enabled or Disabled states.
   * Controls whether Discord sends webhooks to the event_webhooks_url.
   */
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;

  /**
   * Types of events to receive webhooks for.
   * Array of event type strings.
   * Only events specified here will trigger webhooks.
   */
  event_webhooks_types?: string[];
}

/**
 * Router for Discord Application-related API endpoints.
 *
 * This class provides methods to interact with application resources in the Discord API,
 * including fetching application information, editing application properties, and
 * managing activity instances for the application.
 *
 * Applications in Discord represent the top-level entity for bots, integrations, and
 * interactive experiences. This router encapsulates all operations related to managing
 * these applications through the Discord API.
 */
export class ApplicationRouter {
  /**
   * API route constants for application-related endpoints.
   * These define the URL paths for various application operations.
   */
  static readonly APPLICATION_ROUTES = {
    /**
     * Route for the current application endpoint.
     * Used to retrieve or modify the application associated with the current auth token.
     */
    currentApplicationEndpoint: "/applications/@me",

    /**
     * Generates the route for fetching an application activity instance.
     *
     * @param applicationId - Snowflake ID of the target application
     * @param instanceId - Unique identifier for the specific activity instance
     * @returns The formatted API route string for the activity instance endpoint
     */
    getActivityInstanceEndpoint: (
      applicationId: Snowflake,
      instanceId: string,
    ) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Application Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the current application's information from Discord.
   *
   * This method retrieves detailed information about the application associated
   * with the authentication token being used. It provides access to all properties
   * of the application, including name, description, flags, and settings.
   *
   * @returns A promise that resolves to the complete application information object
   * @throws {Error} Will throw an error if the authentication fails or the request cannot be completed
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  fetchCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(
      ApplicationRouter.APPLICATION_ROUTES.currentApplicationEndpoint,
    );
  }

  /**
   * Updates the current application with the provided options.
   *
   * This method allows modification of various application properties such as description,
   * icon, integration settings, and more. Only the properties included in the options
   * parameter will be updated; all others will remain unchanged.
   *
   * File inputs (icon, cover_image) are automatically converted to the required data URI format.
   *
   * @param options - The application properties to update
   * @returns A promise that resolves to the updated application information
   * @throws {Error} Will throw an error if the provided options fail validation or the request cannot be completed
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  async updateCurrentApplication(
    options: ApplicationUpdateOptions,
  ): Promise<ApplicationEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    if (options.cover_image) {
      options.cover_image = await FileHandler.toDataUri(options.cover_image);
    }

    return this.#rest.patch(
      ApplicationRouter.APPLICATION_ROUTES.currentApplicationEndpoint,
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches information about a specific application activity instance.
   *
   * Activity instances represent ongoing interactive experiences within Discord,
   * such as voice channel activities or embedded applications. This method retrieves
   * detailed information about a specific activity instance, including its location
   * and participating users.
   *
   * @param applicationId - ID of the application that owns the activity instance
   * @param instanceId - Unique identifier for the specific activity instance to fetch
   * @returns A promise that resolves to the activity instance information
   * @throws {Error} Will throw an error if the instance doesn't exist or the request cannot be completed
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  fetchActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<ActivityInstanceEntity> {
    return this.#rest.get(
      ApplicationRouter.APPLICATION_ROUTES.getActivityInstanceEndpoint(
        applicationId,
        instanceId,
      ),
    );
  }
}
