import type { Snowflake } from "@nyxjs/core";
import type { SkuStructure } from "../structures/skus";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/monetization/skus#list-skus}
 */
function listSkus(applicationId: Snowflake): RestRequestOptions<SkuStructure[]> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/skus`,
	};
}

export const SkuRoutes = { listSkus };
