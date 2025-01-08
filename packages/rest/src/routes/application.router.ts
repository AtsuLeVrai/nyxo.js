import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import {
  type ActivityInstanceEntity,
  EditCurrentApplicationEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class ApplicationRouter {
  static ROUTES = {
    currentApplication: "/applications/@me" as const,
    activityInstance: (applicationId: Snowflake, instanceId: string) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<HttpResponse<ApplicationEntity>> {
    return this.#rest.get(ApplicationRouter.ROUTES.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  editCurrentApplication(
    options: EditCurrentApplicationEntity,
  ): Promise<HttpResponse<ApplicationEntity>> {
    const result = EditCurrentApplicationEntity.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.patch(ApplicationRouter.ROUTES.currentApplication, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  getApplicationActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<HttpResponse<ActivityInstanceEntity>> {
    return this.#rest.get(
      ApplicationRouter.ROUTES.activityInstance(applicationId, instanceId),
    );
  }
}
