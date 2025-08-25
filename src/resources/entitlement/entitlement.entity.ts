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

export interface EntitlementEntity {
  id: string;
  sku_id: string;
  application_id: string;
  user_id?: string;
  type: EntitlementType;
  deleted: boolean;
  starts_at: string | null;
  ends_at: string | null;
  guild_id?: string;
  consumed?: boolean;
}
