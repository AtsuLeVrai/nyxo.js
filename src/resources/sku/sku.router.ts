import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { SKUEntity } from "./sku.entity.js";

export const SKURoutes = {
  listSKUs: (applicationId: string) => `/applications/${applicationId}/skus` as const,
} as const satisfies RouteBuilder;

export class SKURouter extends BaseRouter {
  listSKUs(applicationId: string): Promise<SKUEntity[]> {
    return this.rest.get(SKURoutes.listSKUs(applicationId));
  }
}
