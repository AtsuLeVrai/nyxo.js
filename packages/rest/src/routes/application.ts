import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-kind-enum}
 */
export type ActivityLocationKind = "gc" | "pc";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object}
 */
export interface ActivityLocation {
  id: string;
  kind: ActivityLocationKind;
  channel_id: Snowflake;
  guild_id?: Snowflake | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object}
 */
export interface ActivityInstance {
  application_id: Snowflake;
  instance_id: string;
  launch_id: Snowflake;
  location: ActivityLocation;
  users: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
 */
export type ModifyApplicationOptions = Partial<
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

export class ApplicationRouter extends Router {
  static routes = {
    currentApplication: "/applications/@me" as const,

    activityInstance: (
      applicationId: Snowflake,
      instanceId: string,
    ): `/applications/${Snowflake}/activity-instances/${string}` => {
      return `/applications/${applicationId}/activity-instances/${instanceId}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.get(ApplicationRouter.routes.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  modifyCurrentApplication(
    options: ModifyApplicationOptions,
  ): Promise<ApplicationEntity> {
    return this.patch(ApplicationRouter.routes.currentApplication, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  getApplicationActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<ActivityInstance> {
    return this.get(
      ApplicationRouter.routes.activityInstance(applicationId, instanceId),
    );
  }
}
