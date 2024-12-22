import type { Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types}
 */
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

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-structure}
 */
export interface EntitlementEntity {
  id: Snowflake;
  sku_id: Snowflake;
  application_id: Snowflake;
  user_id?: Snowflake;
  type: EntitlementType;
  deleted: boolean;
  starts_at: Iso8601 | null;
  ends_at: Iso8601 | null;
  guild_id?: Snowflake;
  consumed?: boolean;
}
