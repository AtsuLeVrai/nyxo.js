import {
  ApplicationRoleConnectionMetadataEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import type { HttpResponse } from "../types/index.js";

export class ApplicationConnectionRouter {
  static readonly ROUTES = {
    base: (applicationId: Snowflake) =>
      `/applications/${applicationId}/role-connections/metadata` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
   */
  getApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
  ): Promise<HttpResponse<ApplicationRoleConnectionMetadataEntity[]>> {
    return this.#rest.get(
      ApplicationConnectionRouter.ROUTES.base(applicationId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
   */
  updateApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
    metadata: z.input<typeof ApplicationRoleConnectionMetadataEntity>[],
  ): Promise<HttpResponse<ApplicationRoleConnectionMetadataEntity[]>> {
    const result = z
      .array(ApplicationRoleConnectionMetadataEntity)
      .max(5)
      .safeParse(metadata);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.put(
      ApplicationConnectionRouter.ROUTES.base(applicationId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }
}
