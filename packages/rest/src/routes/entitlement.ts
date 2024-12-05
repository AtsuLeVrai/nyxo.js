import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import type {
  CreateTestEntitlementEntity,
  ListEntitlementQueryEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class EntitlementRouter extends BaseRouter {
  static routes = {
    entitlements: (
      applicationId: Snowflake,
    ): `/applications/${Snowflake}/entitlements` => {
      return `/applications/${applicationId}/entitlements` as const;
    },
    entitlement: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ): `/applications/${Snowflake}/entitlements/${Snowflake}` => {
      return `/applications/${applicationId}/entitlements/${entitlementId}` as const;
    },
    consume: (
      applicationId: Snowflake,
      entitlementId: Snowflake,
    ): `/applications/${Snowflake}/entitlements/${Snowflake}/consume` => {
      return `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  list(
    applicationId: Snowflake,
    query?: ListEntitlementQueryEntity,
  ): Promise<EntitlementEntity[]> {
    return this.get(EntitlementRouter.routes.entitlements(applicationId), {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement}
   */
  consume(applicationId: Snowflake, entitlementId: Snowflake): Promise<void> {
    return this.post(
      EntitlementRouter.routes.consume(applicationId, entitlementId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTest(
    applicationId: Snowflake,
    test: CreateTestEntitlementEntity,
  ): Promise<EntitlementEntity> {
    return this.post(EntitlementRouter.routes.entitlements(applicationId), {
      body: JSON.stringify(test),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement}
   */
  deleteTest(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.delete(
      EntitlementRouter.routes.entitlement(applicationId, entitlementId),
    );
  }
}
