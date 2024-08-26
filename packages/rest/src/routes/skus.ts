import type { Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../globals/types";
import type { SkuStructure } from "../structures/skus";

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
