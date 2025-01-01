import {
  type ApplicationRoleConnectionMetadataEntity,
  ApplicationRoleConnectionMetadataSchema,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseRouter } from "../base/index.js";

export class ApplicationConnectionRouter extends BaseRouter {
  static readonly ROUTES = {
    base: (applicationId: Snowflake) =>
      `/applications/${applicationId}/role-connections/metadata` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
   */
  getApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.get(ApplicationConnectionRouter.ROUTES.base(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
   */
  updateApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    const result = z
      .array(ApplicationRoleConnectionMetadataSchema)
      .max(5)
      .safeParse(metadata);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.put(ApplicationConnectionRouter.ROUTES.base(applicationId), {
      body: JSON.stringify(result.data),
    });
  }
}
