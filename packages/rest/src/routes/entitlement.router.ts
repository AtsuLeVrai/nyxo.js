import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateTestEntitlementEntity,
  ListEntitlementQueryEntity,
} from "../schemas/index.js";

export class EntitlementRouter {
  static readonly ROUTES = {
    entitlements: (applicationId: Snowflake) =>
      `/applications/${applicationId}/entitlements` as const,
    entitlement: (applicationId: Snowflake, entitlementId: Snowflake) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,
    consume: (applicationId: Snowflake, entitlementId: Snowflake) =>
      `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  listEntitlements(
    applicationId: Snowflake,
    query: z.input<typeof ListEntitlementQueryEntity> = {},
  ): Promise<EntitlementEntity[]> {
    const result = ListEntitlementQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      EntitlementRouter.ROUTES.entitlements(applicationId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#get-entitlement}
   */
  getEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<EntitlementEntity> {
    return this.#rest.get(
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
    return this.#rest.post(
      EntitlementRouter.ROUTES.consume(applicationId, entitlementId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTestEntitlement(
    applicationId: Snowflake,
    test: z.input<typeof CreateTestEntitlementEntity>,
  ): Promise<EntitlementEntity> {
    const result = CreateTestEntitlementEntity.safeParse(test);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      EntitlementRouter.ROUTES.entitlements(applicationId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement}
   */
  deleteTestEntitlement(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      EntitlementRouter.ROUTES.entitlement(applicationId, entitlementId),
    );
  }
}
