import type {
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
} from "@nyxjs/core";
import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";
import { FileHandler } from "../handlers/index.js";

/**
 * Types of locations where Discord application activities can occur.
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-kind-enum}
 */
export type ActivityLocationKind = "gc" | "pc";

/**
 * Represents a location within Discord where an application activity is taking place.
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object}
 */
export interface ActivityLocationEntity {
  /** Unique identifier for the activity location */
  id: string;
  /** Type of location: "gc" for group call or "pc" for private call */
  kind: ActivityLocationKind;
  /** ID of the channel where the activity is happening */
  channel_id: Snowflake;
  /** Optional ID of the guild where the activity is happening (if in a guild) */
  guild_id?: Snowflake | null;
}

/**
 * Represents an instance of an application activity in Discord.
 * Contains information about where the activity is occurring and who is participating.
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object}
 */
export interface ActivityInstanceEntity {
  /** ID of the application that this activity instance belongs to */
  application_id: Snowflake;
  /** Unique identifier for this activity instance */
  instance_id: string;
  /** ID associated with the launch of this activity instance */
  launch_id: Snowflake;
  /** Location information for where this activity is occurring */
  location: ActivityLocationEntity;
  /** Array of user IDs who are participating in this activity */
  users: Snowflake[];
}

/**
 * Interface for editing the current Discord application.
 * Defines the editable properties of an application.
 * Note: While this interface contains some of the same fields as ApplicationEntity,
 * it uses different validation rules and transformations for the edit operation.
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export interface EditCurrentApplicationSchema {
  /**
   * Custom URL for the application's authorization link
   */
  custom_install_url?: string;

  /**
   * Description of the application
   */
  description?: string;

  /**
   * URL for role connection verification
   */
  role_connections_verification_url?: string;

  /**
   * Parameters for application installation
   */
  install_params?: InstallParamsEntity;

  /**
   * Configuration for different integration types
   */
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /**
   * Application flags that can be set
   * Only limited gateway flags can be modified via the API
   */
  flags?: ApplicationFlags;

  /**
   * Application icon - will be converted to a data URI
   */
  icon?: FileInput;

  /**
   * Application cover image - will be converted to a data URI
   */
  cover_image?: FileInput;

  /**
   * URL for the interactions endpoint
   */
  interactions_endpoint_url?: string;

  /**
   * Application tags (max 5, each max 20 chars)
   */
  tags?: string[];

  /**
   * URL for event webhooks
   */
  event_webhooks_url?: string;

  /**
   * Status for event webhooks (can only set to Enabled or Disabled)
   */
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;

  /**
   * Types of event webhooks
   */
  event_webhooks_types?: string[];
}

/**
 * Router for Discord Application-related API endpoints.
 * Provides methods to interact with application resources such as fetching
 * application information, editing applications, and managing activity instances.
 */
export class ApplicationRouter {
  /**
   * API route constants for application-related endpoints.
   */
  static readonly ROUTES = {
    /** Route for current application endpoint */
    applicationsMe: "/applications/@me" as const,

    /**
     * Generates the route for an application activity instance
     * @param applicationId - ID of the application
     * @param instanceId - ID of the activity instance
     * @returns The formatted route string
     */
    applicationsActivityInstance: (
      applicationId: Snowflake,
      instanceId: string,
    ) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the current application's information.
   * Retrieves details about the authenticated application.
   * @returns A promise that resolves to the application information
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(ApplicationRouter.ROUTES.applicationsMe);
  }

  /**
   * Edits the current application with the provided options.
   * Updates various properties of the authenticated application.
   * @param options - The application properties to update
   * @returns A promise that resolves to the updated application information
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  async editCurrentApplication(
    options: EditCurrentApplicationSchema,
  ): Promise<ApplicationEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    if (options.cover_image) {
      options.cover_image = await FileHandler.toDataUri(options.cover_image);
    }

    return this.#rest.patch(ApplicationRouter.ROUTES.applicationsMe, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Fetches an application activity instance.
   * Retrieves details about a specific activity instance for an application.
   * @param applicationId - ID of the application
   * @param instanceId - ID of the activity instance
   * @returns A promise that resolves to the activity instance information
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  getApplicationActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<ActivityInstanceEntity> {
    return this.#rest.get(
      ApplicationRouter.ROUTES.applicationsActivityInstance(
        applicationId,
        instanceId,
      ),
    );
  }
}
