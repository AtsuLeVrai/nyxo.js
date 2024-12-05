import type { SkuEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "./base.js";

export class SkuRouter extends BaseRouter {
  static routes = {
    applicationSkus: (
      applicationId: Snowflake,
    ): `/applications/${Snowflake}/skus` => {
      return `/applications/${applicationId}/skus` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  listSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.get(SkuRouter.routes.applicationSkus(applicationId));
  }
}
