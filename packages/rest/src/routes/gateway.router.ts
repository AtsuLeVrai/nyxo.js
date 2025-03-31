import { BaseRouter } from "../bases/index.js";
import type {
  GatewayBotResponseEntity,
  GatewayResponseEntity,
} from "../schemas/index.js";

/**
 * Router for Discord Gateway-related API endpoints.
 * Provides methods to get information about connecting to Discord's real-time gateway.
 *
 * @remarks
 * The gateway is Discord's real-time WebSocket API that allows applications
 * to receive events about various actions and state changes.
 * These methods provide the necessary information to establish and maintain gateway connections.
 */
export class GatewayRouter extends BaseRouter {
  /**
   * API route constants for gateway-related endpoints.
   */
  static readonly ROUTES = {
    /** Endpoint for getting basic gateway information */
    gatewayDefault: "/gateway" as const,

    /** Endpoint for getting gateway information for bots, including sharding requirements */
    gatewayBot: "/gateway/bot" as const,
  } as const;

  /**
   * Gets the gateway WebSocket URL.
   *
   * @returns A promise that resolves to a gateway response containing the WebSocket URL
   * @remarks
   * This endpoint returns the WebSocket URL that clients can use to connect to Discord's gateway.
   * This method does not require authentication.
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway}
   */
  getGateway(): Promise<GatewayResponseEntity> {
    return this.rest.get(GatewayRouter.ROUTES.gatewayDefault);
  }

  /**
   * Gets the gateway WebSocket URL and additional information for bots.
   *
   * @returns A promise that resolves to a gateway bot response containing connection information
   * @remarks
   * This endpoint returns:
   * - The WebSocket URL for connecting to the gateway
   * - The recommended number of shards to use
   * - Session start limit information
   *
   * Bots should use this method instead of getGateway() to get information about:
   * - Sharding requirements based on the bot's guild count
   * - Rate limits on session starts
   * - Maximum concurrent sessions
   *
   * This method requires authentication with a bot token.
   * @see {@link https://discord.com/developers/docs/events/gateway#get-gateway-bot}
   */
  getGatewayBot(): Promise<GatewayBotResponseEntity> {
    return this.rest.get(GatewayRouter.ROUTES.gatewayBot);
  }
}
