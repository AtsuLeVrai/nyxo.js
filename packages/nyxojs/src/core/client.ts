import { Gateway, GatewayOptions } from "@nyxojs/gateway";
import { Rest, RestOptions } from "@nyxojs/rest";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import type { User } from "../classes/index.js";
import { CacheManager, CacheOptions } from "../managers/index.js";
import type { ClientEvents } from "../types/index.js";
import {
  GatewayDispatchEventMap,
  GatewayKeyofEventMappings,
  RestKeyofEventMappings,
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
  cache: CacheOptions.default({}),

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
   * @private
   */
  readonly #rest: Rest;

  /**
   * Gateway client for real-time communication with Discord
   * @private
   */
  readonly #gateway: Gateway;

  /**
   * Client configuration options
   * @private
   */
  readonly #options: ClientOptions;

  /**
   * Cache store for better performance
   * @private
   */
  readonly #cache: CacheManager;

  /**
   * The current authenticated user (bot user)
   * @private
   */
  // @ts-expect-error: The user property is initialized in the constructor
  #user: User;

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
      throw new Error(fromError(error).message);
    }

    this.#rest = new Rest(this.#options);
    this.#gateway = new Gateway(this.#rest, this.#options);
    this.#cache = new CacheManager(this.#options.cache);

    // Listen for REST events
    for (const eventName of RestKeyofEventMappings) {
      this.#rest.on(eventName, (...args) => {
        this.emit(eventName, ...args);
      });
    }

    // Listen for gateway events
    for (const eventName of GatewayKeyofEventMappings) {
      this.#gateway.on(eventName, (...args) => {
        this.emit(eventName, ...args);
      });
    }

    // Listen for gateway events
    this.#gateway.on("dispatch", (event, data) => {
      const mapping = GatewayDispatchEventMap.get(event);
      if (!mapping) {
        return;
      }

      // Transform data and emit the corresponding client event
      const transformedData = mapping.transform(this, data as never);
      this.emit(mapping.clientEvent, ...transformedData);
    });

    // Listen for ready event to set the user
    this.once("ready", (ready) => {
      this.#user = ready.user;
    });
  }

  /**
   * REST API client for making direct API requests
   */
  get rest(): Rest {
    return this.#rest;
  }

  /**
   * Gateway client for real-time communication with Discord
   */
  get gateway(): Gateway {
    return this.#gateway;
  }

  /**
   * Client configuration options
   */
  get options(): ClientOptions {
    return this.#options;
  }

  /**
   * Cache store for better performance
   */
  get cache(): CacheManager {
    return this.#cache;
  }

  /**
   * The current authenticated user (bot user)
   */
  get user(): User {
    return this.#user;
  }

  /**
   * Disconnects from the Discord Gateway and cleans up resources
   *
   * @returns Promise that resolves when disconnected successfully
   */
  async destroy(): Promise<void> {
    // Destroy gateway connection
    this.#gateway.destroy();

    // Clean up REST resources
    await this.#rest.destroy();

    // Clear caches
    this.#cache.destroy();

    // Remove event listeners from the client itself
    this.removeAllListeners();
  }
}
