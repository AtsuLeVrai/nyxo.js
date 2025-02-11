import {
  type Snowflake,
  SubscriptionEntity,
  type SubscriptionStatus,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class Subscription extends BaseClass<SubscriptionEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof SubscriptionEntity>> = {},
  ) {
    super(client, SubscriptionEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get skuIds(): Snowflake[] {
    return Array.isArray(this.data.sku_ids) ? [...this.data.sku_ids] : [];
  }

  get entitlementIds(): Snowflake[] {
    return Array.isArray(this.data.entitlement_ids)
      ? [...this.data.entitlement_ids]
      : [];
  }

  get renewalSkuIds(): Snowflake[] | null {
    return this.data.renewal_sku_ids ?? null;
  }

  get currentPeriodStart(): string {
    return this.data.current_period_start;
  }

  get currentPeriodEnd(): string {
    return this.data.current_period_end;
  }

  get status(): SubscriptionStatus {
    return this.data.status;
  }

  get canceledAt(): string | null {
    return this.data.canceled_at ?? null;
  }

  get country(): string | null {
    return this.data.country ?? null;
  }

  toJson(): SubscriptionEntity {
    return { ...this.data };
  }
}

export const SubscriptionSchema = z.instanceof(Subscription);
