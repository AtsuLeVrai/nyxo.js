export enum EntitlementTypes {
  Purchase = 1,

  PremiumSubscription = 2,

  DeveloperGift = 3,

  TestModePurchase = 4,

  FreePurchase = 5,

  UserGift = 6,

  PremiumPurchase = 7,

  ApplicationSubscription = 8,
}

export enum EntitlementOwnerTypes {
  Guild = 1,

  User = 2,
}

export interface EntitlementObject {
  readonly id: string;

  readonly sku_id: string;

  readonly application_id: string;

  readonly user_id?: string;

  readonly type: EntitlementTypes;

  readonly deleted: boolean;

  readonly starts_at: string | null;

  readonly ends_at: string | null;

  readonly guild_id?: string;

  readonly consumed?: boolean;
}

export interface ListEntitlementsQueryStringParams
  extends Pick<EntitlementObject, "user_id" | "guild_id"> {
  readonly sku_ids?: string;

  readonly before?: string;

  readonly after?: string;

  readonly limit?: number;

  readonly exclude_ended?: boolean;

  readonly exclude_deleted?: boolean;
}

export interface CreateTestEntitlementJSONParams extends Pick<EntitlementObject, "sku_id"> {
  readonly owner_id: string;

  readonly owner_type: EntitlementOwnerTypes;
}
