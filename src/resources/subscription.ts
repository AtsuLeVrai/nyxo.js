export enum SubscriptionStatus {
  Active = 0,

  Ending = 1,

  Inactive = 2,
}

export interface SubscriptionObject {
  readonly id: string;

  readonly user_id: string;

  readonly sku_ids: string[];

  readonly entitlement_ids: string[];

  readonly renewal_sku_ids: string[] | null;

  readonly current_period_start: string;

  readonly current_period_end: string;

  readonly status: SubscriptionStatus;

  readonly canceled_at: string | null;

  readonly country?: string;
}

export interface ListSKUSubscriptionsQueryStringParams
  extends Partial<Pick<SubscriptionObject, "user_id">> {
  readonly before?: string;

  readonly after?: string;

  readonly limit?: number;
}
