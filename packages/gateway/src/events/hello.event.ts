import type { Integer } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#hello-hello-structure}
 */
export interface HelloEntity {
  heartbeat_interval: Integer;
}
