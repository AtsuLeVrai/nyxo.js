import type { SkuStructure, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

export class SkuRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/sku#list-skus|List SKUs}
     */
    public static listSkus(applicationId: Snowflake): RestRequestOptions<SkuStructure[]> {
        return this.get(`/applications/${applicationId}/skus`);
    }
}
