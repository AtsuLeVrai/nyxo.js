import type {
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
} from "@nyxojs/core";
import type { ApplicationEntity, Snowflake } from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Defines the possible types of locations for Discord application activities.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-kind-enum}
 */
export type ActivityLocationType = "gc" | "pc";

/**
 * Represents a location where an application activity is taking place.
 * Defines the context within Discord where an activity is occurring.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object}
 */
export interface ActivityLocationEntity {
  /**
   * Unique identifier for the activity location.
   * Used to reference this specific location.
   */
  id: string;

  /**
   * Type of location (group call or private call).
   * Indicates the context where the activity is happening.
   */
  kind: ActivityLocationType;

  /**
   * ID of the channel where the activity is happening.
   * References the specific Discord channel hosting the activity.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild where the activity is happening.
   * May be null if the activity is not in a guild (e.g., DM).
   */
  guild_id?: Snowflake | null;
}

/**
 * Represents an instance of an application activity in Discord.
 * Contains details about an ongoing activity session including location and participants.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object}
 */
export interface ActivityInstanceEntity {
  /**
   * ID of the application that owns this activity instance.
   * Identifies which Discord application created the activity.
   */
  application_id: Snowflake;

  /**
   * Unique identifier for this specific activity instance.
   * Used to reference this particular session of the activity.
   */
  instance_id: string;

  /**
   * ID associated with the launch event.
   * References the event that initiated this activity instance.
   */
  launch_id: Snowflake;

  /**
   * Location information about where this activity is occurring.
   * Contains details about the channel and guild hosting the activity.
   */
  location: ActivityLocationEntity;

  /**
   * Array of user IDs representing participants.
   * Lists the Discord users currently engaged in the activity.
   */
  users: Snowflake[];
}

/**
 * Interface defining the editable properties of a Discord application.
 * Used to update various settings and configurations for an application.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export interface ApplicationUpdateOptions {
  /**
   * Custom URL for the application's authorization link.
   * Used for custom OAuth2 flows when installing the application.
   */
  custom_install_url?: string;

  /**
   * Description of the application (max 400 characters).
   * Displayed to users in various locations, including the app directory.
   */
  description?: string;

  /**
   * URL for role connection verification.
   * Used for validating linked third-party accounts for role assignments.
   */
  role_connections_verification_url?: string;

  /**
   * Parameters controlling how the application can be installed.
   * Defines scopes and permissions requested during authorization.
   */
  install_params?: InstallParamsEntity;

  /**
   * Configuration for different integration types.
   * Maps integration types to their specific configuration settings.
   */
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /**
   * Application flags that can be set.
   * Controls various behaviors and capabilities of the application.
   */
  flags?: ApplicationFlags;

  /**
   * Application icon image.
   * Displayed in Discord UI when referencing the application.
   */
  icon?: FileInput;

  /**
   * Application cover/splash image.
   * Displayed as background when viewing application details.
   */
  cover_image?: FileInput;

  /**
   * URL for the interactions endpoint.
   * Where Discord sends interaction payloads for this application.
   */
  interactions_endpoint_url?: string;

  /**
   * Application tags for discovery (max 5, each max 20 chars).
   * Used for categorization and search in the app directory.
   */
  tags?: string[];

  /**
   * URL for event webhook notifications.
   * Where Discord sends event-related webhooks for this application.
   */
  event_webhooks_url?: string;

  /**
   * Status for event webhooks.
   * Controls whether the application receives event webhooks.
   */
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;

  /**
   * Types of events to receive webhooks for.
   * Filters which events trigger webhook notifications.
   */
  event_webhooks_types?: string[];
}

/**
 * Router for Discord Application-related API endpoints.
 * Provides methods to interact with application resources.
 *
 * @see {@link https://discord.com/developers/docs/resources/application}
 */
export class ApplicationRouter extends BaseRouter {
  /**
   * API route constants for application-related endpoints.
   */
  static readonly APPLICATION_ROUTES = {
    /** Route for the current application endpoint */
    currentApplicationEndpoint: "/applications/@me" as const,

    /**
     * Route for fetching an application activity instance.
     * @param applicationId - Snowflake ID of the target application
     * @param instanceId - Unique identifier for the activity instance
     */
    getActivityInstanceEndpoint: (
      applicationId: Snowflake,
      instanceId: string,
    ) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  /**
   * Fetches the current application's information from Discord.
   * Provides details about the application associated with the token.
   *
   * @returns A promise that resolves to the application information
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  fetchCurrentApplication(): Promise<ApplicationEntity> {
    return this.get(
      ApplicationRouter.APPLICATION_ROUTES.currentApplicationEndpoint,
    );
  }

  /**
   * Updates the current application with the provided options.
   * Modifies application properties like description, icon, and settings.
   *
   * @param options - The application properties to update
   * @returns A promise that resolves to the updated application
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  async updateCurrentApplication(
    options: ApplicationUpdateOptions,
  ): Promise<ApplicationEntity> {
    const fileFields: (keyof ApplicationUpdateOptions)[] = [
      "icon",
      "cover_image",
    ];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.patch(
      ApplicationRouter.APPLICATION_ROUTES.currentApplicationEndpoint,
      processedOptions,
    );
  }

  /**
   * Fetches information about a specific application activity instance.
   * Retrieves details about an ongoing interactive experience.
   *
   * @param applicationId - ID of the application that owns the activity
   * @param instanceId - Unique identifier for the activity instance
   * @returns A promise that resolves to the activity instance information
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  fetchActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<ActivityInstanceEntity> {
    return this.get(
      ApplicationRouter.APPLICATION_ROUTES.getActivityInstanceEndpoint(
        applicationId,
        instanceId,
      ),
    );
  }
}
