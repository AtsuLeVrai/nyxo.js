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
    entity: Partial<z.input<typeof SubscriptionEntity>> = {},
  ) {
    super(client, SubscriptionEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get userId(): Snowflake {
    return this.entity.user_id;
  }

  get skuIds(): Snowflake[] {
    return Array.isArray(this.entity.sku_ids) ? [...this.entity.sku_ids] : [];
  }

  get entitlementIds(): Snowflake[] {
    return Array.isArray(this.entity.entitlement_ids)
      ? [...this.entity.entitlement_ids]
      : [];
  }

  get renewalSkuIds(): Snowflake[] | null {
    return this.entity.renewal_sku_ids ?? null;
  }

  get currentPeriodStart(): string {
    return this.entity.current_period_start;
  }

  get currentPeriodEnd(): string {
    return this.entity.current_period_end;
  }

  get status(): SubscriptionStatus {
    return this.entity.status;
  }

  get canceledAt(): string | null {
    return this.entity.canceled_at ?? null;
  }

  get country(): string | null {
    return this.entity.country ?? null;
  }

  toJson(): SubscriptionEntity {
    return { ...this.entity };
  }
}

export const SubscriptionSchema = z.instanceof(Subscription);
