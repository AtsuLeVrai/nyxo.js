export enum SKUFlags {
  Available = 1 << 2,
  GuildSubscription = 1 << 7,
  UserSubscription = 1 << 8,
}

export enum SKUTypes {
  Durable = 2,
  Consumable = 3,
  Subscription = 5,
  SubscriptionGroup = 6,
}

export interface SKUObject {
  id: string;
  type: SKUTypes;
  application_id: string;
  name: string;
  slug: string;
  flags: SKUFlags;
}

/**
 * Checks if an SKU is available for purchase
 * @param sku The SKU to check
 * @returns true if the SKU is available
 */
export function isSKUAvailable(sku: SKUObject): boolean {
  return (sku.flags & SKUFlags.Available) === SKUFlags.Available;
}

/**
 * Checks if an SKU is a guild subscription
 * @param sku The SKU to check
 * @returns true if it's a guild subscription
 */
export function isGuildSubscription(sku: SKUObject): boolean {
  return (sku.flags & SKUFlags.GuildSubscription) === SKUFlags.GuildSubscription;
}

/**
 * Checks if an SKU is a user subscription
 * @param sku The SKU to check
 * @returns true if it's a user subscription
 */
export function isUserSubscription(sku: SKUObject): boolean {
  return (sku.flags & SKUFlags.UserSubscription) === SKUFlags.UserSubscription;
}

/**
 * Checks if an SKU is a subscription type
 * @param sku The SKU to check
 * @returns true if the SKU is any kind of subscription
 */
export function isSubscriptionSKU(sku: SKUObject): boolean {
  return sku.type === SKUTypes.Subscription || sku.type === SKUTypes.SubscriptionGroup;
}

/**
 * Checks if an SKU is a one-time purchase
 * @param sku The SKU to check
 * @returns true if the SKU is durable or consumable
 */
export function isOneTimePurchase(sku: SKUObject): boolean {
  return sku.type === SKUTypes.Durable || sku.type === SKUTypes.Consumable;
}
