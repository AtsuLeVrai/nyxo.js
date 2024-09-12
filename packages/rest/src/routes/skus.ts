import type { SkuStructure, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

export class SkuRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/monetization/skus#list-skus}
     */
    public static listSkus(applicationId: Snowflake): RestRequestOptions<SkuStructure[]> {
        return {
            method: "GET",
            path: `/applications/${applicationId}/skus`,
        };
    }
}
