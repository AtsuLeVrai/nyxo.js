import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  type ActivityInstanceEntity,
  EditCurrentApplicationSchema,
} from "../schemas/index.js";

export class ApplicationRouter {
  static readonly ROUTES = {
    applicationsMe: "/applications/@me" as const,
    applicationsActivityInstance: (
      applicationId: Snowflake,
      instanceId: string,
    ) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(ApplicationRouter.ROUTES.applicationsMe);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  async editCurrentApplication(
    options: EditCurrentApplicationSchema,
  ): Promise<ApplicationEntity> {
    const result = await EditCurrentApplicationSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(ApplicationRouter.ROUTES.applicationsMe, {
      body: JSON.stringify(result.data),
    });
  }

  /**
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
