import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface InstallParams {
  scopes: string[];
  permissions: string;
}

interface IntegrationTypeConfig {
  oauth2_install_params?: InstallParams;
}

interface ActivityLocation {
  id: string;
  kind: "gc" | "pc";
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

interface ActivityInstance {
  application_id: Snowflake;
  instance_id: string;
  launch_id: Snowflake;
  location: ActivityLocation;
  users: Snowflake[];
}

interface ModifyApplicationOptions {
  custom_install_url?: string;
  description?: string;
  role_connections_verification_url?: string;
  install_params?: InstallParams;
  integration_types_config?: Record<string, IntegrationTypeConfig>;
  flags?: number;
  icon?: string | null;
  cover_image?: string | null;
  interactions_endpoint_url?: string;
  tags?: string[];
  event_webhooks_url?: string;
  event_webhooks_status?: number;
  event_webhooks_types?: string[];
}

export class ApplicationRoutes {
  static routes = {
    currentApplication: "/applications/@me" as const,

    activityInstance: (
      applicationId: Snowflake,
      instanceId: string,
    ): `/applications/${Snowflake}/activity-instances/${string}` => {
      return `/applications/${applicationId}/activity-instances/${instanceId}` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(ApplicationRoutes.routes.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  modifyCurrentApplication(
    options: ModifyApplicationOptions,
  ): Promise<ApplicationEntity> {
    return this.#rest.patch(ApplicationRoutes.routes.currentApplication, {
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
    return this.#rest.get(
      ApplicationRoutes.routes.activityInstance(applicationId, instanceId),
    );
  }
}
