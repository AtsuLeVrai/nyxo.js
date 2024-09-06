import type { SkuStructure } from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

export const SkuRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/monetization/skus#list-skus}
     */
    listSkus: (applicationId: Snowflake): RestRequestOptions<SkuStructure[]> => ({
        method: "GET",
        path: `/applications/${applicationId}/skus`,
    }),
};
