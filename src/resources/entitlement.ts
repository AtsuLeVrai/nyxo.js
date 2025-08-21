import type { Snowflake } from "../common/index.js";

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
