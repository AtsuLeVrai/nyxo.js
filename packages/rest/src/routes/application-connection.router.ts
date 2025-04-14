import type {
  ApplicationRoleConnectionMetadataEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Router for Discord Application Connection-related API endpoints.
 * Provides methods to interact with application role connection metadata,
 * which is used for integration with Discord's role connection verification feature.
 */
export class ApplicationConnectionRouter {
  /**
   * API route constants for application connection-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for application role connection metadata endpoint
     * @param applicationId - ID of the application
     * @returns The formatted route string
     */
    applicationsRoleConnectionsMetadata: (applicationId: Snowflake) =>
      `/applications/${applicationId}/role-connections/metadata` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the role connection metadata records for an application.
   * These records define the metadata fields that can be used for role connection verification.
   *
   * @param applicationId - ID of the application to fetch metadata for
   * @returns A promise that resolves to an array of application role connection metadata records
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
   */
  getApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.#rest.get(
      ApplicationConnectionRouter.ROUTES.applicationsRoleConnectionsMetadata(
        applicationId,
      ),
    );
  }

  /**
   * Updates the role connection metadata records for an application.
   * These records define how the application can be used for role connection verification.
   *
   * @param applicationId - ID of the application to update metadata for
   * @param metadata - Array of metadata records to update (maximum of 5 records)
   * @returns A promise that resolves to the updated array of application role connection metadata records
   * @throws Error if the provided metadata fails validation
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
   */
  updateApplicationRoleConnectionMetadata(
    applicationId: Snowflake,
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.#rest.put(
      ApplicationConnectionRouter.ROUTES.applicationsRoleConnectionsMetadata(
        applicationId,
      ),
      {
        body: JSON.stringify(metadata),
      },
    );
  }
}
