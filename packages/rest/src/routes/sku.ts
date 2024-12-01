import type { SkuEntity, Snowflake } from "@nyxjs/core";
import { Router } from "./router.js";

export class SkuRouter extends Router {
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
