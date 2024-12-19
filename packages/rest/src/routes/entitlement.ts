import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import type {
  CreateTestEntitlementEntity,
  ListEntitlementQueryEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export interface EntitlementRoutes {
  readonly entitlements: (
    applicationId: Snowflake,
  ) => `/applications/${Snowflake}/entitlements`;
  readonly entitlement: (
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ) => `/applications/${Snowflake}/entitlements/${Snowflake}`;
  readonly consume: (
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ) => `/applications/${Snowflake}/entitlements/${Snowflake}/consume`;
}

export class EntitlementRouter extends BaseRouter {
  static readonly DEFAULT_LIST_LIMIT = 100;
  static readonly MIN_LIST_LIMIT = 1;
  static readonly MAX_LIST_LIMIT = 100;
  static readonly DEFAULT_EXCLUDE_ENDED = false;
  static readonly DEFAULT_EXCLUDE_DELETED = true;

  static readonly ROUTES: EntitlementRoutes = {
    entitlements: (applicationId) =>
      `/applications/${applicationId}/entitlements` as const,

    entitlement: (applicationId, entitlementId) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,

    consume: (applicationId, entitlementId) =>
      `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  listEntitlements(
    applicationId: Snowflake,
    query?: ListEntitlementQueryEntity,
  ): Promise<EntitlementEntity[]> {
    this.#validateListQuery(query);
    return this.get(EntitlementRouter.ROUTES.entitlements(applicationId), {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#get-entitlement}
   */
  getEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<EntitlementEntity> {
    return this.get(
      EntitlementRouter.ROUTES.entitlement(applicationId, entitlementId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement}
   */
  consumeEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.post(
      EntitlementRouter.ROUTES.consume(applicationId, entitlementId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTestEntitlement(
    applicationId: Snowflake,
    test: CreateTestEntitlementEntity,
  ): Promise<EntitlementEntity> {
    this.#validateTestEntitlement(test);
    return this.post(EntitlementRouter.ROUTES.entitlements(applicationId), {
      body: JSON.stringify(test),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement}
   */
  deleteTestEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.delete(
      EntitlementRouter.ROUTES.entitlement(applicationId, entitlementId),
    );
  }

  #validateListQuery(query?: ListEntitlementQueryEntity): void {
    if (!query) {
      return;
    }

    if (
      query.limit !== undefined &&
      (query.limit < EntitlementRouter.MIN_LIST_LIMIT ||
        query.limit > EntitlementRouter.MAX_LIST_LIMIT)
    ) {
      throw new Error(
        `Limit must be between ${EntitlementRouter.MIN_LIST_LIMIT} and ${EntitlementRouter.MAX_LIST_LIMIT}`,
      );
    }

    if (query.exclude_ended === undefined) {
      query.exclude_ended = EntitlementRouter.DEFAULT_EXCLUDE_ENDED;
    }

    if (query.exclude_deleted === undefined) {
      query.exclude_deleted = EntitlementRouter.DEFAULT_EXCLUDE_DELETED;
    }
  }

  #validateTestEntitlement(test: CreateTestEntitlementEntity): void {
    if (!test.sku_id) {
      throw new Error("sku_id is required");
    }
    if (!test.owner_id) {
      throw new Error("owner_id is required");
    }
    if (test.owner_type !== 1 && test.owner_type !== 2) {
      throw new Error("owner_type must be 1 (guild) or 2 (user)");
    }
  }
}
