export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

export interface SubscriptionObject {
  id: string;
  user_id: string;
  sku_ids: string[];
  entitlement_ids: string[];
  renewal_sku_ids: string[] | null;
  current_period_start: string;
  current_period_end: string;
  status: SubscriptionStatus;
  canceled_at: string | null;
  country?: string;
}

export interface ListSKUSubscriptionsQueryStringParams
  extends Partial<Pick<SubscriptionObject, "user_id">> {
  before?: string;
  after?: string;
  limit?: number;
}

/**
 * Checks if a subscription is currently active
 * @param subscription The subscription to check
 * @returns true if the subscription is active
 */
export function isActiveSubscription(subscription: SubscriptionObject): boolean {
  return subscription.status === SubscriptionStatus.Active;
}

/**
 * Checks if a subscription is ending (active but won't renew)
 * @param subscription The subscription to check
 * @returns true if the subscription is ending
 */
export function isEndingSubscription(subscription: SubscriptionObject): boolean {
  return subscription.status === SubscriptionStatus.Ending;
}

/**
 * Checks if a subscription has been canceled
 * @param subscription The subscription to check
 * @returns true if the subscription has been canceled
 */
export function isCanceledSubscription(subscription: SubscriptionObject): boolean {
  return subscription.canceled_at !== null;
}

/**
 * Checks if a subscription is currently in its active period
 * @param subscription The subscription to check
 * @returns true if the current date is within the subscription period
 */
export function isInCurrentPeriod(subscription: SubscriptionObject): boolean {
  const now = new Date();
  const start = new Date(subscription.current_period_start);
  const end = new Date(subscription.current_period_end);
  return now >= start && now <= end;
}
