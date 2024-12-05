import type { ApplicationEntity, Snowflake } from "@nyxjs/core";

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
export type ModifyApplicationOptionsEntity = Partial<
  Pick<
    ApplicationEntity,
    | "custom_install_url"
    | "description"
    | "role_connections_verification_url"
    | "install_params"
    | "integration_types_config"
    | "flags"
    | "icon"
    | "cover_image"
    | "interactions_endpoint_url"
    | "tags"
    | "event_webhooks_url"
    | "event_webhooks_types"
    | "event_webhooks_status"
  >
>;
