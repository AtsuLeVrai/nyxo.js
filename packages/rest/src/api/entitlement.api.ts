import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for query parameters when listing entitlements.
 * These parameters allow filtering and pagination of entitlement results.
 *
 * @remarks
 * Entitlements represent a user or guild's access to premium offerings in an application.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export interface ListEntitlementQuerySchema {
  /**
   * User ID to look up entitlements for
   */
  user_id?: Snowflake;

  /**
   * Optional comma-delimited list of SKU IDs to check entitlements for
   */
  sku_ids?: string;

  /**
   * Retrieve entitlements before this entitlement ID
   */
  before?: Snowflake;

  /**
   * Retrieve entitlements after this entitlement ID
   */
  after?: Snowflake;

  /**
   * Number of entitlements to return (1-100, default 100)
   */
  limit?: number;

  /**
   * Guild ID to look up entitlements for
   */
  guild_id?: Snowflake;

  /**
   * Whether to exclude ended entitlements (defaults to false)
   */
  exclude_ended?: boolean;

  /**
   * Whether to exclude deleted entitlements (defaults to true)
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
 * Test entitlements allow developers to test premium offerings without making actual purchases.
 *
 * @remarks
 * After creating a test entitlement, you'll need to reload your Discord client
 * for the premium access to be visible.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export interface CreateTestEntitlementSchema {
  /** ID of the SKU to grant the entitlement to */
  sku_id: string;

  /** ID of the guild or user to grant the entitlement to */
  owner_id: string;

  /** Whether this is for a guild (1) or user (2) subscription */
  owner_type: EntitlementOwnerType;
}

/**
 * Router for Discord Entitlement-related API endpoints.
 * Provides methods to interact with entitlements, which represent access to premium offerings.
 *
 * @remarks
 * Entitlements are used for managing premium access in monetized apps.
 * They can be associated with either users or guilds, depending on the subscription type.
 */
export class EntitlementApi {
  /**
   * API route constants for entitlement-related endpoints.
   */
  static readonly ROUTES = {
    /** Endpoint for listing and creating entitlements for an application */
    applicationEntitlements: (applicationId: Snowflake) =>
      `/applications/${applicationId}/entitlements` as const,

    /** Endpoint for a specific entitlement */
    applicationEntitlement: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,

    /** Endpoint for consuming an entitlement */
    applicationEntitlementConsume: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ) =>
      `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Lists all entitlements for a given application, both active and expired.
   *
   * @param applicationId - ID of the application
   * @param query - Query parameters to filter entitlements
   * @returns A promise that resolves to an array of entitlement objects
   * @remarks
   * This method can filter entitlements by user ID, SKU IDs, guild ID,
   * and can exclude ended or deleted entitlements.
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  listEntitlements(
    applicationId: Snowflake,
    query: ListEntitlementQuerySchema = {},
  ): Promise<EntitlementEntity[]> {
    return this.#rest.get(
      EntitlementApi.ROUTES.applicationEntitlements(applicationId),
      {
        query,
      },
    );
  }

  /**
   * Gets a specific entitlement by ID.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the entitlement to retrieve
   * @returns A promise that resolves to the entitlement object
   * @see {@link https://discord.com/developers/docs/resources/entitlement#get-entitlement}
   */
  getEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<EntitlementEntity> {
    return this.#rest.get(
      EntitlementApi.ROUTES.applicationEntitlement(
        applicationId,
        entitlementId,
      ),
    );
  }

  /**
   * Marks a one-time purchase consumable entitlement as consumed.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the entitlement to consume
   * @returns A promise that resolves to void on success
   * @remarks
   * This is only applicable for one-time purchase consumable SKUs.
   * After consumption, the entitlement will have `consumed: true`.
   * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement}
   */
  consumeEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.#rest.post(
      EntitlementApi.ROUTES.applicationEntitlementConsume(
        applicationId,
        entitlementId,
      ),
    );
  }

  /**
   * Creates a test entitlement to a given SKU for a given guild or user.
   *
   * @param applicationId - ID of the application
   * @param test - Configuration for the test entitlement
   * @returns A promise that resolves to a partial entitlement object
   * @remarks
   * - Discord will act as though the specified user or guild has entitlement to your premium offering
   * - The returned entitlement will not contain subscription_id, starts_at, or ends_at fields
   * - After creating a test entitlement, you'll need to reload your Discord client to see the effects
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTestEntitlement(
    applicationId: Snowflake,
    test: CreateTestEntitlementSchema,
  ): Promise<EntitlementEntity> {
    return this.#rest.post(
      EntitlementApi.ROUTES.applicationEntitlements(applicationId),
      {
        body: JSON.stringify(test),
      },
    );
  }

  /**
   * Deletes a currently-active test entitlement.
   *
   * @param applicationId - ID of the application
   * @param entitlementId - ID of the test entitlement to delete
   * @returns A promise that resolves to void on success
   * @remarks
   * After deletion, Discord will act as though the user or guild no longer has
   * entitlement to your premium offering.
   * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement}
   */
  deleteTestEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      EntitlementApi.ROUTES.applicationEntitlement(
        applicationId,
        entitlementId,
      ),
    );
  }
}
