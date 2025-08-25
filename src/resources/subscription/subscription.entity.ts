export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

export const ISO3166_ALPHA2_REGEX = /^[A-Z]{2}$/;

export interface SubscriptionEntity {
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
