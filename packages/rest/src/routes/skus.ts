import type { Snowflake } from "@lunajs/core";
import type { RESTMakeRequestOptions } from "../globals/rest";
import type { SkuStructure } from "../structures/skus";

/**
 * @see {@link https://discord.com/developers/docs/monetization/skus#list-skus}
 */
export function listSkus(applicationId: Snowflake): RESTMakeRequestOptions<SkuStructure[]> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/skus`,
	};
}
