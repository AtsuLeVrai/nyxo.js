import { SubscriptionEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Subscription {
  readonly #data: SubscriptionEntity;

  constructor(data: Partial<z.input<typeof SubscriptionEntity>> = {}) {
    try {
      this.#data = SubscriptionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): unknown {
    return this.#data.id;
  }

  get userId(): unknown {
    return this.#data.user_id;
  }

  get skuIds(): unknown[] {
    return Array.isArray(this.#data.sku_ids) ? [...this.#data.sku_ids] : [];
  }

  get entitlementIds(): unknown[] {
    return Array.isArray(this.#data.entitlement_ids)
      ? [...this.#data.entitlement_ids]
      : [];
  }

  get renewalSkuIds(): unknown[] | null {
    return this.#data.renewal_sku_ids ?? null;
  }

  get currentPeriodStart(): string {
    return this.#data.current_period_start;
  }

  get currentPeriodEnd(): string {
    return this.#data.current_period_end;
  }

  get status(): unknown {
    return this.#data.status;
  }

  get canceledAt(): string | null {
    return this.#data.canceled_at ?? null;
  }

  get country(): string | null {
    return this.#data.country ?? null;
  }

  static fromJson(json: SubscriptionEntity): Subscription {
    return new Subscription(json);
  }

  toJson(): SubscriptionEntity {
    return { ...this.#data };
  }

  clone(): Subscription {
    return new Subscription(this.toJson());
  }

  validate(): boolean {
    try {
      SubscriptionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<SubscriptionEntity>): Subscription {
    return new Subscription({ ...this.toJson(), ...other });
  }

  equals(other: Subscription): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const SubscriptionSchema = z.instanceof(Subscription);
