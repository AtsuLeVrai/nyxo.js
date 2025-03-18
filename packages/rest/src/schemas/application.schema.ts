import {
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

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
 * Schema for editing the current Discord application.
 * Defines the editable properties of an application.
 * Note: While this schema contains some of the same fields as ApplicationEntity,
 * it uses different validation rules and transformations for the edit operation.
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export const EditCurrentApplicationSchema = z.object({
  /** Custom URL for the application's authorization link */
  custom_install_url: z.string().url().optional(),

  /** Description of the application */
  description: z.string().optional(),

  /** URL for role connection verification */
  role_connections_verification_url: z.string().url().optional(),

  /** Parameters for application installation */
  install_params: InstallParamsEntity.optional(),

  /** Configuration for different integration types */
  integration_types_config: z
    .record(
      z.nativeEnum(ApplicationIntegrationType),
      ApplicationIntegrationTypeConfigurationEntity,
    )
    .optional(),

  /**
   * Application flags that can be set
   * Only limited gateway flags can be modified via the API
   */
  flags: z
    .union([
      z.literal(ApplicationFlags.GatewayPresenceLimited),
      z.literal(ApplicationFlags.GatewayGuildMembersLimited),
      z.literal(ApplicationFlags.GatewayMessageContentLimited),
    ])
    .optional(),

  /** Application icon - will be converted to a data URI */
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),

  /** Application cover image - will be converted to a data URI */
  cover_image: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),

  /** URL for the interactions endpoint */
  interactions_endpoint_url: z.string().url().optional(),

  /** Application tags (max 5, each max 20 chars) */
  tags: z.string().max(20).array().max(5).optional(),

  /** URL for event webhooks */
  event_webhooks_url: z.string().url().optional(),

  /** Status for event webhooks (can only set to Enabled or Disabled) */
  event_webhooks_status: z
    .union([
      z.literal(ApplicationEventWebhookStatus.Disabled),
      z.literal(ApplicationEventWebhookStatus.Enabled),
    ])
    .optional(),

  /** Types of event webhooks */
  event_webhooks_types: z.string().array().optional(),
});

export type EditCurrentApplicationSchema = z.input<
  typeof EditCurrentApplicationSchema
>;
