import type {
  ApplicationRoleConnectionMetadataEntity,
  Snowflake,
} from "@nyxjs/core";
import { Router } from "./router.js";

export class ApplicationConnectionRouter extends Router {
  static routes = {
    base: (
      applicationId: Snowflake,
    ): `/applications/${Snowflake}/role-connections/metadata` => {
      return `/applications/${applicationId}/role-connections/metadata` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
   */
  getApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.get(ApplicationConnectionRouter.routes.base(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
   */
  updateApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.put(ApplicationConnectionRouter.routes.base(applicationId), {
      body: JSON.stringify(metadata),
    });
  }
}
