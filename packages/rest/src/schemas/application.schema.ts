import type {
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
  Snowflake,
} from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

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
   *
   * @format url
   * @optional
   */
  custom_install_url?: string;

  /**
   * Description of the application
   *
   * @optional
   */
  description?: string;

  /**
   * URL for role connection verification
   *
   * @format url
   * @optional
   */
  role_connections_verification_url?: string;

  /**
   * Parameters for application installation
   *
   * @optional
   */
  install_params?: InstallParamsEntity;

  /**
   * Configuration for different integration types
   *
   * @optional
   */
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;

  /**
   * Application flags that can be set
   * Only limited gateway flags can be modified via the API
   *
   * @optional
   */
  flags?:
    | ApplicationFlags.GatewayPresenceLimited
    | ApplicationFlags.GatewayGuildMembersLimited
    | ApplicationFlags.GatewayMessageContentLimited;

  /**
   * Application icon - will be converted to a data URI
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @optional
   */
  icon?: FileInput;

  /**
   * Application cover image - will be converted to a data URI
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @optional
   */
  cover_image?: FileInput;

  /**
   * URL for the interactions endpoint
   *
   * @format url
   * @optional
   */
  interactions_endpoint_url?: string;

  /**
   * Application tags (max 5, each max 20 chars)
   *
   * @maxLength 20
   * @maxItems 5
   * @optional
   */
  tags?: string[];

  /**
   * URL for event webhooks
   *
   * @format url
   * @optional
   */
  event_webhooks_url?: string;

  /**
   * Status for event webhooks (can only set to Enabled or Disabled)
   *
   * @optional
   */
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;

  /**
   * Types of event webhooks
   *
   * @optional
   */
  event_webhooks_types?: string[];
}
