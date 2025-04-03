import type { GatewayEvents, GatewayReceiveEvents } from "@nyxjs/gateway";
import type { RestEvents } from "@nyxjs/rest";
import { Ready } from "../classes/index.js";
import type { Client } from "../core/index.js";
import type { GatewayEventMapping } from "../handlers/index.js";
import type { ClientEvents } from "../types/index.js";

/**
 * Typed utility function to define an event more easily
 *
 * @param gatewayEvent The name of the Discord Gateway event
 * @param clientEvent The name of the corresponding client event
 * @param transform Data transformation function
 * @returns A typed event configuration
 */
export function defineEvent<
  T extends keyof GatewayReceiveEvents,
  E extends keyof ClientEvents,
>(
  gatewayEvent: T,
  clientEvent: E,
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[E],
): GatewayEventMapping<T, E> {
  return {
    gatewayEvent,
    clientEvent,
    transform,
  };
}

/**
 * Standard mappings of Discord Gateway events to client events
 */
export const StandardGatewayDispatchEventMappings = [
  defineEvent("READY", "ready", (client, data) => [Ready.from(client, data)]),
  defineEvent("MESSAGE_CREATE", "messageCreate", (_client, data) => [data]),
  defineEvent("INTERACTION_CREATE", "interactionCreate", (_client, data) => [
    data,
  ]),
];

/**
 * Standard mappings of Discord REST events to client events
 */
export const RestKeyofEventMappings: (keyof RestEvents)[] = [
  "requestStart",
  "requestSuccess",
  "requestFailure",
  "rateLimitHit",
  "rateLimitUpdate",
  "rateLimitExpire",
  "queueComplete",
  "queueTimeout",
  "queueReject",
  "retry",
];

/**
 * Standard mappings of Discord Gateway events to client events
 */
export const GatewayKeyofEventMappings: (keyof GatewayEvents)[] = [
  "connectionAttempt",
  "connectionSuccess",
  "connectionFailure",
  "reconnectionScheduled",
  "heartbeatSent",
  "heartbeatAcknowledge",
  "heartbeatTimeout",
  "sessionStart",
  "sessionResume",
  "sessionInvalidate",
  "shardCreate",
  "shardReady",
  "shardDisconnect",
  "rateLimitDetected",
  "error",
  "dispatch",
];
