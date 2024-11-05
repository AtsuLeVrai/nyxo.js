import type { SkuStructure, Snowflake } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

export const SkuRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/sku#list-skus|List SKUs}
     */
    listSkus(applicationId: Snowflake): RouteStructure<SkuStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/applications/${applicationId}/skus`,
        };
    },
} as const;
