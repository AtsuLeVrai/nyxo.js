import type { SkuEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

export class SkuRouter {
  static routes = {
    applicationSkus: (
      applicationId: Snowflake,
    ): `/applications/${Snowflake}/skus` => {
      return `/applications/${applicationId}/skus` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  listSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.#rest.get(SkuRouter.routes.applicationSkus(applicationId));
  }
}
