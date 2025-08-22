import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";

export enum EntitlementType {
  Purchase = 1,
  PremiumSubscription = 2,
  DeveloperGift = 3,
  TestModePurchase = 4,
  FreePurchase = 5,
  UserGift = 6,
  PremiumPurchase = 7,
  ApplicationSubscription = 8,
}

export enum EntitlementOwnerType {
  Guild = 1,
  User = 2,
}

export interface EntitlementObject {
  id: Snowflake;
  sku_id: Snowflake;
  application_id: Snowflake;
  user_id?: Snowflake;
  type: EntitlementType;
  deleted: boolean;
  starts_at: string | null;
  ends_at: string | null;
  guild_id?: Snowflake;
  consumed?: boolean;
}

// Request interfaces
export interface ListEntitlementsQuery {
  user_id?: Snowflake;
  sku_ids?: string; // comma-delimited
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  guild_id?: Snowflake;
  exclude_ended?: boolean;
  exclude_deleted?: boolean;
}

export interface CreateTestEntitlementRequest {
  sku_id: string;
  owner_id: string;
  owner_type: EntitlementOwnerType;
}

export const EntitlementRoutes = {
  // GET /applications/{application.id}/entitlements - List Entitlements
  listEntitlements: ((applicationId: Snowflake) =>
    `/applications/${applicationId}/entitlements`) as EndpointFactory<
    `/applications/${string}/entitlements`,
    ["GET", "POST"],
    EntitlementObject[],
    false,
    false,
    CreateTestEntitlementRequest,
    ListEntitlementsQuery
  >,

  // GET /applications/{application.id}/entitlements/{entitlement.id} - Get Entitlement
  getEntitlement: ((applicationId: Snowflake, entitlementId: Snowflake) =>
    `/applications/${applicationId}/entitlements/${entitlementId}`) as EndpointFactory<
    `/applications/${string}/entitlements/${string}`,
    ["GET", "DELETE"],
    EntitlementObject
  >,

  // POST /applications/{application.id}/entitlements/{entitlement.id}/consume - Consume an Entitlement
  consumeEntitlement: ((applicationId: Snowflake, entitlementId: Snowflake) =>
    `/applications/${applicationId}/entitlements/${entitlementId}/consume`) as EndpointFactory<
    `/applications/${string}/entitlements/${string}/consume`,
    ["POST"],
    void
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
