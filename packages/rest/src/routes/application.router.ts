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
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object}
 */
export interface ActivityLocationEntity {
  /** Unique identifier for the activity location */
  id: string;

  /** Type of location (group call or private call) */
  kind: ActivityLocationType;

  /** ID of the channel where the activity is happening */
  channel_id: Snowflake;

  /** ID of the guild where the activity is happening */
  guild_id?: Snowflake | null;
}

/**
 * Represents an instance of an application activity in Discord.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object}
 */
export interface ActivityInstanceEntity {
  /** ID of the application that owns this activity instance */
  application_id: Snowflake;

  /** Unique identifier for this specific activity instance */
  instance_id: string;

  /** ID associated with the launch event */
  launch_id: Snowflake;

  /** Location information about where this activity is occurring */
  location: ActivityLocationEntity;

  /** Array of user IDs representing participants */
  users: Snowflake[];
}

/**
 * Interface defining the editable properties of a Discord application.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export interface ApplicationUpdateOptions {
  /** Custom URL for the application's authorization link */
  custom_install_url?: string;

  /** Description of the application (max 400 characters) */
  description?: string;

  /** URL for role connection verification */
  role_connections_verification_url?: string;

  /** Parameters controlling how the application can be installed */
  install_params?: InstallParamsEntity;

  /** Configuration for different integration types */
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /** Application flags that can be set */
  flags?: ApplicationFlags;

  /** Application icon image */
  icon?: FileInput;

  /** Application cover/splash image */
  cover_image?: FileInput;

  /** URL for the interactions endpoint */
  interactions_endpoint_url?: string;

  /** Application tags for discovery (max 5, each max 20 chars) */
  tags?: string[];

  /** URL for event webhook notifications */
  event_webhooks_url?: string;

  /** Status for event webhooks */
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;

  /** Types of events to receive webhooks for */
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
