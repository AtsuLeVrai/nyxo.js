import type { EntitlementEntity, Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for query parameters when listing entitlements.
 *
 * These parameters allow filtering and pagination of entitlement results
 * when retrieving entitlements for an application. The parameters can be combined
 * to create specific queries for different scenarios.
 *
 * @remarks
 * Entitlements represent a user or guild's access to premium offerings in an application.
 * They are created when users purchase SKUs (stock keeping units) through Discord's
 * monetization features, or when developers create test entitlements for development purposes.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export interface ListEntitlementQuerySchema {
  /**
   * User ID to look up entitlements for.
   *
   * When specified, only entitlements associated with this specific user will be returned.
   * Useful for checking what premium offerings a particular user has access to.
   */
  user_id?: Snowflake;

  /**
   * Optional comma-delimited list of SKU IDs to check entitlements for.
   *
   * When specified, only entitlements for these specific SKUs will be returned.
   * This allows filtering for particular premium offerings across users/guilds.
   *
   * Example: "1234567890123456,2345678901234567"
   */
  sku_ids?: string;

  /**
   * Retrieve entitlements before this entitlement ID.
   *
   * Used for pagination to get earlier entitlements than a specific reference point.
   * When specified, results are ordered by ID in descending order (newer first).
   */
  before?: Snowflake;

  /**
   * Retrieve entitlements after this entitlement ID.
   *
   * Used for pagination to get later entitlements than a specific reference point.
   * When specified, results are ordered by ID in ascending order (older first).
   */
  after?: Snowflake;

  /**
   * Number of entitlements to return (1-100, default 100).
   *
   * Controls the maximum number of entitlements returned in a single request.
   * Use in combination with before/after for efficient pagination.
   */
  limit?: number;

  /**
   * Guild ID to look up entitlements for.
   *
   * When specified, only entitlements associated with this specific guild will be returned.
   * Useful for checking what premium offerings a particular guild has access to.
   */
  guild_id?: Snowflake;

  /**
   * Whether to exclude ended entitlements (defaults to false).
   *
   * When true, only active entitlements will be returned.
   * When false, both active and expired entitlements will be returned.
   */
  exclude_ended?: boolean;

  /**
   * Whether to exclude deleted entitlements (defaults to true).
   *
   * When true, deleted entitlements are excluded from results.
   * When false, both active and deleted entitlements will be returned.
   */
  exclude_deleted?: boolean;
}

/**
 * Enum specifying the owner type for test entitlements.
 *
 * Used to indicate whether a test entitlement is for a guild or a user
 * when creating test entitlements for development purposes.
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
 *
 * Test entitlements allow developers to test premium offerings without making actual purchases.
 * They are essential for verifying premium feature functionality during development.
 *
 * @remarks
 * After creating a test entitlement, you'll need to reload your Discord client
 * for the premium access to be visible. Test entitlements are for development
 * purposes only and are not meant for production use.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export interface CreateTestEntitlementSchema {
  /**
   * ID of the SKU to grant the entitlement to.
   *
   * The SKU (stock keeping unit) represents a specific premium offering
   * defined in the Discord Developer Portal.
   */
  sku_id: string;

  /**
   * ID of the guild or user to grant the entitlement to.
   *
   * This should be a guild ID if owner_type is Guild (1),
   * or a user ID if owner_type is User (2).
   */
  owner_id: string;

  /**
   * Whether this is for a guild (1) or user (2) subscription.
   *
   * Determines the type of entitlement being created and how
   * it will behave in the Discord ecosystem.
   *
   * @see EntitlementOwnerType enum
   */
  owner_type: EntitlementOwnerType;
}

/**
 * Router for Discord Entitlement-related API endpoints.
 *
 * This class provides methods to interact with Discord's monetization system,
 * managing entitlements which represent access to premium offerings in applications.
 * It supports listing entitlements, checking specific entitlements, consuming
 * one-time purchases, and managing test entitlements for development.
 *
 * @remarks
 * Entitlements are a key part of Discord's monetization features, allowing developers
 * to offer premium services and content through their applications. Entitlements can be
 * associated with either users or guilds, depending on the subscription type.
 *
 * There are several types of entitlements:
 * - Subscriptions (recurring payments)
 * - One-time purchases (permanent access)
 * - Consumable purchases (can be consumed once)
 * - Test entitlements (for development purposes)
 */
export class EntitlementRouter {
  /**
   * API route constants for entitlement-related endpoints.
   */
  static readonly ENTITLEMENT_ROUTES = {
    /**
     * Endpoint for listing and creating entitlements for an application.
     *
     * @param applicationId - ID of the application
     * @returns The formatted API route string
     */
    applicationEntitlementsEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/entitlements` as const,

    /**
     * Endpoint for a specific entitlement.
     *
     * @param applicationId - ID of the application
     * @param entitlementId - ID of the entitlement
     * @returns The formatted API route string
     */
    applicationEntitlementByIdEndpoint: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,

    /**
     * Endpoint for consuming an entitlement.
     *
     * @param applicationId - ID of the application
     * @param entitlementId - ID of the entitlement
     * @returns The formatted API route string
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
   * Creates a new Entitlement Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches entitlements for a given application with optional filtering.
   *
   * This method retrieves entitlements based on the provided query parameters,
   * allowing you to check which users or guilds have access to your premium offerings.
   *
   * @param applicationId - ID of the application
   * @param query - Query parameters to filter entitlements
   * @returns A promise that resolves to an array of entitlement objects
   *
   * @remarks
   * This method can filter entitlements by user ID, SKU IDs, guild ID,
   * and can exclude ended or deleted entitlements. It supports pagination
   * through the before/after/limit parameters.
   *
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  fetchEntitlements(
    applicationId: Snowflake,
    query?: ListEntitlementQuerySchema,
  ): Promise<EntitlementEntity[]> {
    return this.#rest.get(
      EntitlementRouter.ENTITLEMENT_ROUTES.applicationEntitlementsEndpoint(
        applicationId,
      ),
      {
        query,
      },
    );
  }

  /**
   * Fetches a specific entitlement by ID.
   *
   * This method retrieves detailed information about a single entitlement,
   * such as its owner, associated SKU, and status.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the entitlement to retrieve
   * @returns A promise that resolves to the entitlement object
   *
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
   *
   * This method is specifically for consumable SKUs that should be used once,
   * such as virtual items or in-app purchases that are meant to be depleted.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the entitlement to consume
   * @returns A promise that resolves to void on success
   *
   * @remarks
   * This is only applicable for one-time purchase consumable SKUs.
   * After consumption, the entitlement will have `consumed: true`.
   * The entitlement will still exist but will no longer grant access
   * to the premium offering.
   *
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
   *
   * This method is essential for testing premium features during development
   * without requiring actual purchases through Discord's payment system.
   *
   * @param applicationId - ID of the application
   * @param test - Configuration for the test entitlement
   * @returns A promise that resolves to a partial entitlement object
   *
   * @remarks
   * - Discord will act as though the specified user or guild has entitlement to your premium offering
   * - The returned entitlement will not contain subscription_id, starts_at, or ends_at fields
   * - After creating a test entitlement, you'll need to reload your Discord client to see the effects
   * - Test entitlements are only for development purposes and won't work in production
   * - Limited to 250 test entitlements per application
   *
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTestEntitlement(
    applicationId: Snowflake,
    test: CreateTestEntitlementSchema,
  ): Promise<EntitlementEntity> {
    return this.#rest.post(
      EntitlementRouter.ENTITLEMENT_ROUTES.applicationEntitlementsEndpoint(
        applicationId,
      ),
      {
        body: JSON.stringify(test),
      },
    );
  }

  /**
   * Deletes a currently-active test entitlement.
   *
   * This method removes a test entitlement that was previously created
   * for development purposes.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the test entitlement to delete
   * @returns A promise that resolves to void on success
   *
   * @remarks
   * After deletion, Discord will act as though the user or guild no longer has
   * entitlement to your premium offering. You'll need to reload your Discord
   * client to see the effects of this change.
   *
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
