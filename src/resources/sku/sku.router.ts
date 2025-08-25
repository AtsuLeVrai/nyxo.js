import type { Rest } from "../../core/index.js";
import type { SkuEntity } from "./sku.entity.js";

export class SkuRouter {
  static readonly Routes = {
    applicationSkusEndpoint: (applicationId: string) =>
      `/applications/${applicationId}/skus` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchApplicationSkus(applicationId: string): Promise<SkuEntity[]> {
    return this.#rest.get(SkuRouter.Routes.applicationSkusEndpoint(applicationId));
  }
}
