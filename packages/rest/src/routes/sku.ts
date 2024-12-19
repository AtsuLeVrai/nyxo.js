import { type SkuEntity, SkuType, type Snowflake } from "@nyxjs/core";
import { BaseRouter } from "./base.js";

export interface SkuRoutes {
  readonly applicationSkus: (
    applicationId: Snowflake,
  ) => `/applications/${Snowflake}/skus`;
}

export class SkuRouter extends BaseRouter {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_SLUG_LENGTH = 100;

  static readonly ROUTES: SkuRoutes = {
    applicationSkus: (applicationId) =>
      `/applications/${applicationId}/skus` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  async listSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    const skus = await this.get<SkuEntity[]>(
      SkuRouter.ROUTES.applicationSkus(applicationId),
    );
    return this.#sortSkus(skus);
  }

  async listSubscriptionSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    const skus = await this.listSkus(applicationId);
    return skus.filter((sku) => sku.type === SkuType.Subscription);
  }

  #sortSkus(skus: SkuEntity[]): SkuEntity[] {
    return skus.sort((a, b) => {
      if (
        a.type === SkuType.Subscription &&
        b.type === SkuType.SubscriptionGroup
      ) {
        return -1;
      }
      if (
        a.type === SkuType.SubscriptionGroup &&
        b.type === SkuType.Subscription
      ) {
        return 1;
      }
      return 0;
    });
  }
}
