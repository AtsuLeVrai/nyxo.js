import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateTestEntitlementEntity,
  CreateTestEntitlementSchema,
  type ListEntitlementQueryEntity,
  ListEntitlementsQuerySchema,
} from "../schemas/index.js";

export class EntitlementRouter extends BaseRouter {
  static readonly ROUTES = {
    entitlements: (applicationId: Snowflake) =>
      `/applications/${applicationId}/entitlements` as const,
    entitlement: (applicationId: Snowflake, entitlementId: Snowflake) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,
    consume: (applicationId: Snowflake, entitlementId: Snowflake) =>
      `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  listEntitlements(
    applicationId: Snowflake,
    query: ListEntitlementQueryEntity = {},
  ): Promise<EntitlementEntity[]> {
    const result = ListEntitlementsQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(EntitlementRouter.ROUTES.entitlements(applicationId), {
      query: result.data,
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
    const result = CreateTestEntitlementSchema.safeParse(test);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(EntitlementRouter.ROUTES.entitlements(applicationId), {
      body: JSON.stringify(result.data),
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
}
