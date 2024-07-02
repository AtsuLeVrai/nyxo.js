import type { SkuStructure, Snowflake } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/monetization/skus#list-skus}
 */
export function listSkus(applicationId: Snowflake): RestRequestOptions<SkuStructure[]> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/skus`,
	};
}
