import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { EntitlementEntity } from "./entitlement.entity.js";

export enum EntitlementOwnerType {
  Guild = 1,
  User = 2,
}

export interface RESTListEntitlementsQueryStringParams
  extends Partial<Pick<EntitlementEntity, "user_id" | "guild_id">> {
  sku_ids?: string;
  before?: string;
  after?: string;
  limit?: number;
  exclude_ended?: boolean;
  exclude_deleted?: boolean;
}

export interface RESTCreateTestEntitlementJSONParams extends Pick<EntitlementEntity, "sku_id"> {
  owner_id: string;
  owner_type: EntitlementOwnerType;
}

export const EntitlementRoutes = {
  listEntitlements: (applicationId: string) =>
    `/applications/${applicationId}/entitlements` as const,
  getEntitlement: (applicationId: string, entitlementId: string) =>
    `/applications/${applicationId}/entitlements/${entitlementId}` as const,
  consumeEntitlement: (applicationId: string, entitlementId: string) =>
    `/applications/${applicationId}/entitlements/${entitlementId}/consume` as const,
} as const satisfies RouteBuilder;

export class EntitlementRouter extends BaseRouter {
  listEntitlements(
    applicationId: string,
    query?: RESTListEntitlementsQueryStringParams,
  ): Promise<EntitlementEntity[]> {
    return this.rest.get(EntitlementRoutes.listEntitlements(applicationId), {
      query,
    });
  }

  getEntitlement(applicationId: string, entitlementId: string): Promise<EntitlementEntity> {
    return this.rest.get(EntitlementRoutes.getEntitlement(applicationId, entitlementId));
  }

  consumeEntitlement(applicationId: string, entitlementId: string): Promise<void> {
    return this.rest.post(EntitlementRoutes.consumeEntitlement(applicationId, entitlementId));
  }

  createTestEntitlement(
    applicationId: string,
    test: RESTCreateTestEntitlementJSONParams,
  ): Promise<EntitlementEntity> {
    return this.rest.post(EntitlementRoutes.listEntitlements(applicationId), {
      body: JSON.stringify(test),
    });
  }

  deleteTestEntitlement(applicationId: string, entitlementId: string): Promise<void> {
    return this.rest.delete(EntitlementRoutes.getEntitlement(applicationId, entitlementId));
  }
}
