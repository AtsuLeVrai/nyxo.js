import type { Snowflake } from "@nyxjs/core";
import { Gateway, type UpdatePresenceEntity } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "../classes/index.js";
import {
  GatewayKeyofEventMappings,
  RestKeyofEventMappings,
} from "../data/index.js";
import { ClientEventHandler } from "../handlers/index.js";
import { CacheManager } from "../managers/index.js";
import { ClientOptions } from "../options/index.js";

/**
 * Main client class for interacting with the Discord API.
 *
 * The Client is the primary entry point to the Nyx.js framework. It manages:
 * - Discord API connections (REST and Gateway)
 * - Event handling and event middleware
 * - Caching strategies for various Discord entities
 * - High-level methods for common operations
 *
 * @example
 * ```typescript
 * import { Client, GatewayIntentsBits } from "nyx.js";
 *
 * const client = new Client({
 *   token: "YOUR_BOT_TOKEN",
 *   intents: [
 *     GatewayIntentsBits.Guilds,
 *     GatewayIntentsBits.GuildMessages,
 *     GatewayIntentsBits.MessageContent
 *   ],
 *   cache: {
 *     userLimit: 10000,
 *     ttl: 3600000 // 1 hour
 *   }
 * });
 *
 * client.on("ready", () => {
 *   console.log(`Logged in as ${client.user?.username}!`);
 * });
 *
 * client.on("messageCreate", async (message) => {
 *   if (message.content === "!ping") {
 *    await message.reply("Pong!");
 *   }
 * });
 *
 * client.connect().catch(console.error);
 * ```
 */
export class Client extends ClientEventHandler {
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
      throw new Error(`Invalid client options: ${fromError(error).message}`);
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
      this.handleGatewayDispatch(this, event, data);
    });

    // Listen for ready event to set the user
    this.on("ready", (ready) => {
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
   * Connects to the Discord Gateway
   *
   * @returns Promise that resolves when connected successfully
   * @throws If the connection fails
   *
   * @example
   * ```typescript
   * client.connect()
   *   .then(() => console.log('Connected to Discord!'))
   *   .catch(err => console.error('Failed to connect:', err));
   * ```
   */
  async connect(): Promise<void> {
    await this.#gateway.connect();
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
    this.#cache.dispose();

    // Remove event listeners from the client itself
    this.removeAllListeners();
  }

  /**
   * Updates the client's presence status on Discord
   *
   * @param presence - The presence data to set
   * @throws If the client is not connected
   *
   * @example
   * ```typescript
   * client.updatePresence({
   *   status: 'online',
   *   activities: [{
   *     name: 'with Discord.js',
   *     type: ActivityType.Playing
   *   }]
   * });
   * ```
   */
  updatePresence(presence: UpdatePresenceEntity): void {
    this.#gateway.updatePresence(presence);
  }

  /**
   * Fetches a user from Discord API or cache
   *
   * @param userId - The ID of the user to fetch
   * @param options - Fetch options
   * @returns Promise resolving to the user object
   * @throws If the user could not be fetched
   *
   * @example
   * ```typescript
   * // Fetch from cache if available, otherwise from API
   * const user = await client.fetchUser('123456789012345678');
   *
   * // Force fetch from API, ignore cache
   * const freshUser = await client.fetchUser('123456789012345678', { force: true });
   * ```
   */
  async fetchUser(
    userId: Snowflake,
    options: { force?: boolean } = {},
  ): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!options.force) {
      const cachedUser = this.#cache.users.get(userId);
      if (cachedUser) {
        return cachedUser;
      }
    }

    try {
      const data = await this.rest.users.getUser(userId);
      const user = new User(this, data);

      if (this.#options.cache.enabled) {
        this.#cache.users.set(userId, user);
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user ${userId}: ${error}`);
    }
  }

  /**
   * Fetches the current authenticated user (bot user)
   *
   * @param options - Fetch options
   * @returns Promise resolving to the user object
   */
  async fetchClientUser(options: { force?: boolean } = {}): Promise<User> {
    try {
      if (this.#user && !options.force) {
        return this.#user;
      }

      const data = await this.rest.users.getCurrentUser();
      this.#user = new User(this, data);
      return this.#user;
    } catch (error) {
      throw new Error(`Failed to fetch client user: ${error}`);
    }
  }
}
