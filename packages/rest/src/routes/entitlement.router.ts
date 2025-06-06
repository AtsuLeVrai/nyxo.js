import type { EntitlementEntity, Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for query parameters when listing entitlements.
 * These parameters allow filtering and pagination of entitlement results.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export interface EntitlementFetchParams {
  /**
   * User ID to look up entitlements for.
   * When specified, only entitlements for this user will be returned.
   */
  user_id?: Snowflake;

  /**
   * Optional comma-delimited list of SKU IDs to check entitlements for.
   * Filters results to only show entitlements for these specific SKUs.
   */
  sku_ids?: string;

  /**
   * Retrieve entitlements before this entitlement ID.
   * Used for pagination to get earlier entitlements.
   */
  before?: Snowflake;

  /**
   * Retrieve entitlements after this entitlement ID.
   * Used for pagination to get later entitlements.
   */
  after?: Snowflake;

  /**
   * Number of entitlements to return (1-100, default 100).
   * Controls the maximum number of entitlements returned.
   */
  limit?: number;

  /**
   * Guild ID to look up entitlements for.
   * When specified, only entitlements for this guild will be returned.
   */
  guild_id?: Snowflake;

  /**
   * Whether to exclude ended entitlements (defaults to false).
   * When true, only active entitlements will be returned.
   */
  exclude_ended?: boolean;

  /**
   * Whether to exclude deleted entitlements (defaults to true).
   * When false, both active and deleted entitlements will be returned.
   */
  exclude_deleted?: boolean;
}

/**
 * Enum specifying the owner type for test entitlements.
 * Used to indicate whether a test entitlement is for a guild or a user.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export enum EntitlementOwnerType {
  /** Test entitlement for a guild subscription */
  Guild = 1,

  /** Test entitlement for a user subscription */
  User = 2,
}

/**
 * Interface for creating a test entitlement.
 * Test entitlements allow developers to test premium features without making purchases.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export interface EntitlementTestCreateOptions {
  /**
   * ID of the SKU to grant the entitlement to.
   * The SKU represents a specific premium offering in your application.
   */
  sku_id: string;

  /**
   * ID of the guild or user to grant the entitlement to.
   * Should match the owner_type (guild ID for Guild, user ID for User).
   */
  owner_id: string;

  /**
   * Whether this is for a guild (1) or user (2) subscription.
   * Determines the type of entitlement being created.
   */
  owner_type: EntitlementOwnerType;
}

/**
 * Router for Discord Entitlement-related API endpoints.
 * Provides methods to manage premium access to application features.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement}
 */
export class EntitlementRouter {
  /**
   * API route constants for entitlement-related endpoints.
   */
  static readonly ENTITLEMENT_ROUTES = {
    /**
     * Endpoint for listing and creating entitlements for an application.
     * @param applicationId - ID of the application
     */
    applicationEntitlementsEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/entitlements` as const,

    /**
     * Endpoint for a specific entitlement.
     * @param applicationId - ID of the application
     * @param entitlementId - ID of the entitlement
     */
    applicationEntitlementByIdEndpoint: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,

    /**
     * Endpoint for consuming an entitlement.
     * @param applicationId - ID of the application
     * @param entitlementId - ID of the entitlement
     */
    consumeEntitlementEndpoint: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ) =>
      `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches entitlements for a given application with optional filtering.
   * Allows checking which users or guilds have access to premium offerings.
   *
   * @param applicationId - ID of the application
   * @param query - Query parameters to filter entitlements
   * @returns A promise that resolves to an array of entitlement objects
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  fetchEntitlements(
    applicationId: Snowflake,
    query?: EntitlementFetchParams,
  ): Promise<EntitlementEntity[]> {
    return this.#rest.get(
      EntitlementRouter.ENTITLEMENT_ROUTES.applicationEntitlementsEndpoint(
        applicationId,
      ),
      { query },
    );
  }

  /**
   * Fetches a specific entitlement by ID.
   * Retrieves detailed information about a single entitlement.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the entitlement to retrieve
   * @returns A promise that resolves to the entitlement object
   * @see {@link https://discord.com/developers/docs/resources/entitlement#get-entitlement}
   */
  fetchEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<EntitlementEntity> {
    return this.#rest.get(
      EntitlementRouter.ENTITLEMENT_ROUTES.applicationEntitlementByIdEndpoint(
        applicationId,
        entitlementId,
      ),
    );
  }

  /**
   * Marks a one-time purchase consumable entitlement as consumed.
   * Used for virtual items or purchases that should be used once.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the entitlement to consume
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement}
   */
  consumeEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.#rest.post(
      EntitlementRouter.ENTITLEMENT_ROUTES.consumeEntitlementEndpoint(
        applicationId,
        entitlementId,
      ),
    );
  }

  /**
   * Creates a test entitlement to a given SKU for a given guild or user.
   * Essential for testing premium features during development.
   *
   * @param applicationId - ID of the application
   * @param test - Configuration for the test entitlement
   * @returns A promise that resolves to a partial entitlement object
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTestEntitlement(
    applicationId: Snowflake,
    test: EntitlementTestCreateOptions,
  ): Promise<EntitlementEntity> {
    return this.#rest.post(
      EntitlementRouter.ENTITLEMENT_ROUTES.applicationEntitlementsEndpoint(
        applicationId,
      ),
      { body: JSON.stringify(test) },
    );
  }

  /**
   * Deletes a currently-active test entitlement.
   * Removes a test entitlement that was previously created for development.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the test entitlement to delete
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement}
   */
  deleteTestEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      EntitlementRouter.ENTITLEMENT_ROUTES.applicationEntitlementByIdEndpoint(
        applicationId,
        entitlementId,
      ),
    );
  }
}
