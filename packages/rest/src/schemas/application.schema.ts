import {
  ApplicationEventWebhookStatus,
  ApplicationFlags,
  ApplicationIntegrationType,
  ApplicationIntegrationTypeConfigurationEntity,
  InstallParamsEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";

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
export const EditCurrentApplicationEntity = z
  .object({
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
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional(),
    cover_image: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional(),
    interactions_endpoint_url: z.string().url().optional(),
    tags: z.array(z.string().max(20)).max(5).optional(),
    event_webhooks_url: z.string().url().optional(),
    event_webhooks_status: z
      .union([
        z.literal(ApplicationEventWebhookStatus.Disabled),
        z.literal(ApplicationEventWebhookStatus.Enabled),
      ])
      .optional(),
    event_webhooks_types: z.array(z.string()).optional(),
  })
  .strict();

export type EditCurrentApplicationEntity = z.infer<
  typeof EditCurrentApplicationEntity
>;
