import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  CreateTestEntitlementSchema,
  ListEntitlementQuerySchema,
} from "../schemas/index.js";

/**
 * Router for Discord Entitlement-related API endpoints.
 * Provides methods to interact with entitlements, which represent access to premium offerings.
 *
 * @remarks
 * Entitlements are used for managing premium access in monetized apps.
 * They can be associated with either users or guilds, depending on the subscription type.
 */
export class EntitlementRouter {
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

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Creates a new EntitlementRouter instance.
   * @param rest - The REST client to use for making API requests
   */
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
    const result = ListEntitlementQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      EntitlementRouter.ROUTES.applicationEntitlements(applicationId),
      {
        query: result.data,
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
      EntitlementRouter.ROUTES.applicationEntitlement(
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
      EntitlementRouter.ROUTES.applicationEntitlementConsume(
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
    const result = CreateTestEntitlementSchema.safeParse(test);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      EntitlementRouter.ROUTES.applicationEntitlements(applicationId),
      {
        body: JSON.stringify(result.data),
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
      EntitlementRouter.ROUTES.applicationEntitlement(
        applicationId,
        entitlementId,
      ),
    );
  }
}
