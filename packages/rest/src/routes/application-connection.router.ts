import type {
  ApplicationRoleConnectionMetadataEntity,
  Snowflake,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Router for Discord Application Connection-related API endpoints.
 * Provides methods to interact with role connection verification features.
 *
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata}
 */
export class ApplicationConnectionRouter {
  /**
   * API route constants for application connection-related endpoints.
   */
  static readonly CONNECTION_ROUTES = {
    /**
     * Route for application role connection metadata endpoint.
     * @param applicationId - Snowflake ID of the target application
     */
    roleConnectionsMetadataEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/role-connections/metadata` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Application Connection Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the role connection metadata records for an application.
   * Retrieves metadata fields used for role connection verification.
   *
   * @param applicationId - ID of the application to fetch metadata for
   * @returns A promise that resolves to an array of application role connection metadata records
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records}
   */
  fetchRoleConnectionMetadata(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.#rest.get(
      ApplicationConnectionRouter.CONNECTION_ROUTES.roleConnectionsMetadataEndpoint(
        applicationId,
      ),
    );
  }

  /**
   * Updates the role connection metadata records for an application.
   * Defines how your application can be used for role connection verification.
   *
   * @param applicationId - ID of the application to update metadata for
   * @param metadata - Array of metadata records to update (maximum of 5 records)
   * @returns A promise that resolves to the updated array of application role connection metadata records
   * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records}
   */
  updateRoleConnectionMetadata(
    applicationId: Snowflake,
    metadata: ApplicationRoleConnectionMetadataEntity[],
  ): Promise<ApplicationRoleConnectionMetadataEntity[]> {
    return this.#rest.put(
      ApplicationConnectionRouter.CONNECTION_ROUTES.roleConnectionsMetadataEndpoint(
        applicationId,
      ),
      {
        body: JSON.stringify(metadata),
      },
    );
  }
}
