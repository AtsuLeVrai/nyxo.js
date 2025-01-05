import type { SkuEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import type { HttpResponse } from "../types/index.js";

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
  listSkus(applicationId: Snowflake): Promise<HttpResponse<SkuEntity[]>> {
    return this.#rest.get(SkuRouter.ROUTES.applicationSkus(applicationId));
  }
}
