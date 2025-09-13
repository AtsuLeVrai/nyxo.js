import { BaseClass } from "../bases/index.js";
import type { CamelCaseKeys } from "../utils/index.js";

export enum SKUFlags {
  Available = 1 << 2,
  GuildSubscription = 1 << 7,
  UserSubscription = 1 << 8,
}

export enum SKUType {
  Durable = 2,
  Consumable = 3,
  Subscription = 5,
  SubscriptionGroup = 6,
}

export interface SKUEntity {
  id: string;
  type: SKUType;
  application_id: string;
  name: string;
  slug: string;
  flags: SKUFlags;
}

export const SKURoutes = {
  listSKUs: (applicationId: string) => `/applications/${applicationId}/skus` as const,
} as const satisfies RouteBuilder;

export class SKURouter extends BaseRouter {
  listSKUs(applicationId: string): Promise<SKUEntity[]> {
    return this.rest.get(SKURoutes.listSKUs(applicationId));
  }
}

export class SKU extends BaseClass<SKUEntity> implements CamelCaseKeys<SKUEntity> {
  readonly id = this.rawData.id;
  readonly type = this.rawData.type;
  readonly applicationId = this.rawData.application_id;
  readonly name = this.rawData.name;
  readonly slug = this.rawData.slug;
  readonly flags = this.rawData.flags;
}
