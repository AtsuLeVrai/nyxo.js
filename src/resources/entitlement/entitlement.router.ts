import type { Rest } from "../../core/index.js";
import type { EntitlementEntity } from "./entitlement.entity.js";

export interface EntitlementFetchParams {
  user_id?: string;
  sku_ids?: string;
  before?: string;
  after?: string;
  limit?: number;
  guild_id?: string;
  exclude_ended?: boolean;
  exclude_deleted?: boolean;
}

export enum EntitlementOwnerType {
  Guild = 1,
  User = 2,
}

export interface EntitlementTestCreateOptions {
  sku_id: string;
  owner_id: string;
  owner_type: EntitlementOwnerType;
}

export class EntitlementRouter {
  static readonly Routes = {
    applicationEntitlementsEndpoint: (applicationId: string) =>
      `/applications/${applicationId}/entitlements` as const,
    applicationEntitlementByIdEndpoint: (applicationId: string, entitlementId: string) =>
      `/applications/${applicationId}/entitlements/${entitlementId}` as const,
    consumeEntitlementEndpoint: (applicationId: string, entitlementId: string) =>
      `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchEntitlements(
    applicationId: string,
    query?: EntitlementFetchParams,
  ): Promise<EntitlementEntity[]> {
    return this.#rest.get(EntitlementRouter.Routes.applicationEntitlementsEndpoint(applicationId), {
      query,
    });
  }
  fetchEntitlement(applicationId: string, entitlementId: string): Promise<EntitlementEntity> {
    return this.#rest.get(
      EntitlementRouter.Routes.applicationEntitlementByIdEndpoint(applicationId, entitlementId),
    );
  }
  consumeEntitlement(applicationId: string, entitlementId: string): Promise<void> {
    return this.#rest.post(
      EntitlementRouter.Routes.consumeEntitlementEndpoint(applicationId, entitlementId),
    );
  }
  createTestEntitlement(
    applicationId: string,
    test: EntitlementTestCreateOptions,
  ): Promise<EntitlementEntity> {
    return this.#rest.post(
      EntitlementRouter.Routes.applicationEntitlementsEndpoint(applicationId),
      { body: JSON.stringify(test) },
    );
  }
  deleteTestEntitlement(applicationId: string, entitlementId: string): Promise<void> {
    return this.#rest.delete(
      EntitlementRouter.Routes.applicationEntitlementByIdEndpoint(applicationId, entitlementId),
    );
  }
}
