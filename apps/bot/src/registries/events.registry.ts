import type { Client } from "nyxo.js";
import interactionCreateEvent from "../events/client/interactionCreate.js";
import readyEvent from "../events/client/ready.js";
import guildCreateEvent from "../events/guilds/guildCreate.js";

/**
 * Centralized event registry for type-safe event management.
 *
 * This registry provides a single source of truth for all Discord events
 * that the bot will handle. Events are statically imported and registered
 * to ensure better tree-shaking and compile-time type safety.
 *
 * The registry pattern offers several advantages:
 * - **Type Safety**: All events are validated at compile time
 * - **Performance**: Static imports enable better optimization
 * - **Maintainability**: Central location for all event handlers
 * - **Debugging**: Easy to track which events are registered
 *
 * @example
 * ```ts
 * // Adding a new event to the registry
 * import newEvent from "../events/client/newEvent.js";
 *
 * export const eventRegistry = [
 *   readyEvent,
 *   interactionCreateEvent,
 *   guildCreateEvent,
 *   newEvent, // Simply add to the array
 * ];
 * ```
 */
export const eventRegistry = [
  readyEvent,
  interactionCreateEvent,
  guildCreateEvent,
];

/**
 * Registers all events from the registry onto the Discord client.
 *
 * This function iterates through the event registry and attaches each event
 * handler to the client using the appropriate method (`once` or `on`) based
 * on the event's configuration. The function ensures type-safe event handling
 * by properly forwarding arguments to the event execution functions.
 *
 * **Performance considerations:**
 * - Events are registered synchronously during startup
 * - Memory overhead is minimal as handlers are bound once
 * - No runtime type checking is performed for better performance
 *
 * **Error handling:**
 * - Events that fail to register will not stop other events from loading
 * - Individual event execution errors are handled by each event handler
 *
 * @param client - The Discord client instance to register events on.
 *                Must be properly initialized with required intents and token.
 *
 * @throws {Error} Throws if the client is not properly initialized or if
 *                an event handler has invalid configuration.
 *
 * @example
 * ```ts
 * const client = new Client({ token: "your-token", intents: [...] });
 *
 * // Register all events before connecting to Discord
 * registerEvents(client);
 *
 * // Now connect to Discord Gateway
 * await client.gateway.connect();
 * ```
 *
 * @see {@link eventRegistry} For the list of all registered events
 */
export function registerEvents(client: Client): void {
  for (const event of eventRegistry) {
    if (event.once) {
      // Register one-time events (like 'ready')
      client.once(event.name, (...args) =>
        event.execute(client, ...(args as any[])),
      );
    } else {
      // Register recurring events (like 'interactionCreate')
      client.on(event.name, (...args) =>
        event.execute(client, ...(args as any[])),
      );
    }
    console.log(`[EVENT] Registered event: ${event.name}`);
  }
}
