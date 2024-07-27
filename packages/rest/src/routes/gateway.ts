import type { RESTMakeRequestOptions } from "../globals/rest";
import type { GetGatewayBotResponse } from "../pipes/gateway";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot}
 */
export function getGatewayBot(): RESTMakeRequestOptions<GetGatewayBotResponse> {
	return {
		method: "GET",
		path: "/gateway/bot",
	};
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway}
 */
export function getGateway(): RESTMakeRequestOptions<{ url: string; }> {
	return {
		method: "GET",
		path: "/gateway",
	};
}
