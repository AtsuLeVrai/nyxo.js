import type { SkuEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";

export class SkuRouter extends BaseRouter {
  static readonly ROUTES = {
    applicationSkus: (
      applicationId: Snowflake,
    ): `/applications/${Snowflake}/skus` =>
      `/applications/${applicationId}/skus`,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  listSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.get(SkuRouter.ROUTES.applicationSkus(applicationId));
  }
}
