import { Gateway, GatewayOptions } from "@nyxojs/gateway";
import { Rest, RestOptions } from "@nyxojs/rest";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import type { User } from "../classes/index.js";
import { CacheManager, CacheOptions } from "../managers/index.js";
import type { ClientEvents } from "../types/index.js";
import {
  GatewayEventMappings,
  GatewayEventNames,
  RestEventNames,
} from "../utils/index.js";

/**
 * Configuration options for the Nyxo.js Discord client.
 *
 * These options control the client's behavior including caching strategy,
 * REST API settings, and gateway connection parameters.
 */
export const ClientOptions = z.object({
  /**
   * Settings to control the client's caching behavior.
   * Caching reduces API calls by storing frequently accessed entities.
   *
   * @see {@link CacheOptions} for detailed cache configuration.
   */
  cache: CacheOptions.prefault({}),

  // REST and Gateway options are included from their respective definitions
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

export type ClientOptions = z.infer<typeof ClientOptions>;

/**
 * Main client class for interacting with the Discord API.
 *
 * The Client is the primary entry point to the Nyxo.js framework. It manages:
 * - Discord API connections (REST and Gateway)
 * - Event handling and event middleware
 * - Caching strategies for various Discord entities
 * - High-level methods for common operations
 */
export class Client extends EventEmitter<ClientEvents> {
  /**
   * REST API client for making direct API requests
   */
  readonly rest: Rest;

  /**
   * Gateway client for real-time communication with Discord
   */
  readonly gateway: Gateway;

  /**
   * Cache store for better performance
   */
  readonly cache: CacheManager;

  /**
   * The current authenticated user (bot user)
   */
  // @ts-expect-error: The user property is initialized in the constructor if waitForReady option is true
  user: User;

  /**
   * Client configuration options
   * @internal
   */
  readonly #options: ClientOptions;

  /**
   * Creates a new Discord client instance.
   *
   * @param options - Configuration options for the client
   * @throws {Error} If the provided options are invalid
   */
  constructor(options: z.input<typeof ClientOptions>) {
    super();

    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod validation errors to more readable format
        throw new Error(z.prettifyError(error));
      }

      // If validation fails, rethrow the error with additional context
      throw error;
    }

    this.rest = new Rest(this.#options);
    this.gateway = new Gateway(this.rest, this.#options);
    this.cache = new CacheManager(this.#options.cache);

    // Listen for REST events
    for (const eventName of RestEventNames) {
      this.rest.on(eventName, (...args) => {
        this.emit(eventName, ...args);
      });
    }

    // Listen for gateway events
    for (const eventName of GatewayEventNames) {
      this.gateway.on(eventName, (...args) => {
        this.emit(eventName, ...args);
      });
    }

    // Listen for gateway events
    this.gateway.on("dispatch", (event, data) => {
      const mapping = GatewayEventMappings.find(
        (m) => m.gatewayEvent === event,
      );
      if (!mapping) {
        return;
      }

      // Transform data and emit the corresponding client event
      const transformedData = mapping.transform(this, data);
      this.emit(mapping.clientEvent, ...transformedData);
    });

    // Listen for ready event to set the user
    this.once("ready", (ready) => {
      this.user = ready.user;
    });
  }

  /**
   * Disconnects from the Discord Gateway and cleans up resources
   *
   * @returns Resolves when the client is fully destroyed
   */
  async destroy(): Promise<void> {
    // Destroy gateway connection
    this.gateway.destroy();

    // Clean up REST resources
    await this.rest.destroy();

    // Clear caches
    this.cache.destroy();

    // Remove event listeners from the client itself
    this.removeAllListeners();
  }
}
