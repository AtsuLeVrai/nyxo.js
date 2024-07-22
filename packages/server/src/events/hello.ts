import type { Integer } from "@lunajs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#hello-hello-structure}
 */
export type HelloEventFields = {
	heartbeat_interval: Integer;
};
