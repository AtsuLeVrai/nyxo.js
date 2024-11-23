import type { EntitlementEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

export enum EntitlementOwnerType {
  Guild = 1,
  User = 2,
}

interface ListEntitlements {
  user_id?: Snowflake;
  sku_ids?: string;
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  guild_id?: Snowflake;
  exclude_ended?: boolean;
}

interface CreateTestEntitlement {
  sku_id: string;
  owner_id: string;
  owner_type: EntitlementOwnerType;
}

export class EntitlementRoutes {
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

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements}
   */
  list(
    applicationId: Snowflake,
    query?: ListEntitlements,
  ): Promise<EntitlementEntity[]> {
    return this.#rest.get(
      EntitlementRoutes.routes.entitlements(applicationId),
      {
        query,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement}
   */
  consume(applicationId: Snowflake, entitlementId: Snowflake): Promise<void> {
    return this.#rest.post(
      EntitlementRoutes.routes.consume(applicationId, entitlementId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
   */
  createTest(
    applicationId: Snowflake,
    test: CreateTestEntitlement,
  ): Promise<EntitlementEntity> {
    return this.#rest.post(
      EntitlementRoutes.routes.entitlements(applicationId),
      {
        body: JSON.stringify(test),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement}
   */
  deleteTest(
    applicationId: Snowflake,
    entitlementId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      EntitlementRoutes.routes.entitlement(applicationId, entitlementId),
    );
  }
}
