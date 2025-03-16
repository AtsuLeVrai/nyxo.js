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
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-kind-enum}
 */
export type ActivityLocationKind = "gc" | "pc";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object}
 */
export interface ActivityLocationEntity {
  id: string;
  kind: ActivityLocationKind;
  channel_id: Snowflake;
  guild_id?: Snowflake | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object}
 */
export interface ActivityInstanceEntity {
  application_id: Snowflake;
  instance_id: string;
  launch_id: Snowflake;
  location: ActivityLocationEntity;
  users: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export const EditCurrentApplicationSchema = z.object({
  custom_install_url: z.string().url().optional(),
  description: z.string().optional(),
  role_connections_verification_url: z.string().url().optional(),
  install_params: InstallParamsEntity.optional(),
  integration_types_config: z
    .record(
      z.nativeEnum(ApplicationIntegrationType),
      ApplicationIntegrationTypeConfigurationEntity,
    )
    .optional(),
  flags: z
    .union([
      z.literal(ApplicationFlags.GatewayPresenceLimited),
      z.literal(ApplicationFlags.GatewayGuildMembersLimited),
      z.literal(ApplicationFlags.GatewayMessageContentLimited),
    ])
    .optional(),
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),
  cover_image: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),
  interactions_endpoint_url: z.string().url().optional(),
  tags: z.string().max(20).array().max(5).optional(),
  event_webhooks_url: z.string().url().optional(),
  event_webhooks_status: z
    .union([
      z.literal(ApplicationEventWebhookStatus.Disabled),
      z.literal(ApplicationEventWebhookStatus.Enabled),
    ])
    .optional(),
  event_webhooks_types: z.string().array().optional(),
});

export type EditCurrentApplicationSchema = z.input<
  typeof EditCurrentApplicationSchema
>;
