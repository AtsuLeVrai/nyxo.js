import type { SkuEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

export class SkuRouter {
  static readonly ROUTES = {
    applicationSkus: (applicationId: Snowflake) =>
      `/applications/${applicationId}/skus` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  listSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.#rest.get(SkuRouter.ROUTES.applicationSkus(applicationId));
  }
}
