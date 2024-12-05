import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import type {
  ActivityInstanceEntity,
  ModifyApplicationOptionsEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class ApplicationRouter extends BaseRouter {
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
    options: ModifyApplicationOptionsEntity,
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
  ): Promise<ActivityInstanceEntity> {
    return this.get(
      ApplicationRouter.routes.activityInstance(applicationId, instanceId),
    );
  }
}
