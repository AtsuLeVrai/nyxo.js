import type { SkuStructure, Snowflake } from "@nyxjs/core";
import type { RouteStructure } from "../types";
import { RestMethods } from "../types";

export class SkuRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/sku#list-skus|List SKUs}
     */
    public static listSkus(applicationId: Snowflake): RouteStructure<SkuStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/applications/${applicationId}/skus`,
        };
    }
}
