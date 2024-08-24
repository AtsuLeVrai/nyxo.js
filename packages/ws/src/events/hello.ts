import type { Integer } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#hello-hello-structure}
 */
export type HelloStructure = {
	/**
	 * Interval (in milliseconds) an app should heartbeat with
	 */
	heartbeat_interval: Integer;
};
