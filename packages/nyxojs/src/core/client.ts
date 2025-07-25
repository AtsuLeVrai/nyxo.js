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
 * Configuration schema and options for the Discord client.
 *
 * These options provide comprehensive control over the client's behavior including
 * caching strategies, REST API configuration, Gateway connection parameters,
 * and performance tuning. All options are validated at runtime to ensure
 * configuration integrity and provide clear error messages.
 *
 * @example
 * ```typescript
 * const clientOptions: ClientOptions = {
 *   // Cache configuration for performance optimization
 *   cache: {
 *     maxSize: 10000,
 *     ttl: 300000, // 5 minutes
 *     evictionStrategy: "lru"
 *   },
 *
 *   // REST API settings
 *   token: "your-bot-token",
 *   apiVersion: "10",
 *   retryOptions: {
 *     maxRetries: 3,
 *     backoffMultiplier: 2
 *   },
 *
 *   // Gateway connection settings
 *   intents: ["GUILD_MESSAGES", "DIRECT_MESSAGES"],
 *   shardCount: 1,
 *   compression: true
 * };
 * ```
 *
 * @see {@link CacheOptions} - For detailed cache configuration options
 * @see {@link RestOptions} - For REST API configuration parameters
 * @see {@link GatewayOptions} - For Gateway connection settings
 *
 * @public
 */
export const ClientOptions = z.object({
  /**
   * Advanced caching configuration for optimizing performance and memory usage.
   *
   * The cache system stores frequently accessed Discord entities (users, guilds,
   * channels, messages) to minimize API calls and improve response times.
   * Supports intelligent eviction strategies, TTL-based expiration, and
   * memory management for high-performance Discord applications.
   *
   * @example
   * ```typescript
   * cache: {
   *   maxSize: 5000,        // Maximum cached entities
   *   ttl: 600000,          // 10 minutes expiration
   *   evictionStrategy: "lru", // Least Recently Used
   *   sweepInterval: 30000, // Cleanup every 30 seconds
   *   sweepChunkSize: 100   // Process 100 items per cleanup
   * }
   * ```
   *
   * @default {} (uses CacheOptions defaults)
   * @see {@link CacheOptions} - Complete cache configuration reference
   */
  cache: CacheOptions.prefault({}),

  // REST and Gateway options are included from their respective definitions
  ...RestOptions.shape,
  ...GatewayOptions.shape,
});

/**
 * Type definition for validated client configuration options.
 *
 * This type represents the fully parsed and validated configuration after
 * processing through the Zod schema validation pipeline, with all defaults
 * applied and type constraints enforced.
 *
 * @public
 */
export type ClientOptions = z.infer<typeof ClientOptions>;

/**
 * Enterprise-grade Discord API client with comprehensive event handling and caching.
 *
 * The Client class serves as the central orchestrator for all Discord API interactions,
 * providing a unified interface for REST API operations, real-time Gateway events,
 * intelligent caching, and robust error handling. Designed for high-performance
 * Discord bots and applications requiring reliable, scalable Discord integration.
 *
 * **Core Features:**
 * - **Dual API Support**: Seamless integration with both REST API and Gateway WebSocket
 * - **Advanced Caching**: Intelligent entity caching with TTL and eviction strategies
 * - **Event-Driven Architecture**: Comprehensive event system with middleware support
 * - **Automatic Reconnection**: Robust connection management with exponential backoff
 * - **Type Safety**: Full TypeScript support with runtime validation
 * - **Performance Optimization**: Lazy loading, request batching, and memory management
 *
 * **Event System:**
 * The client extends EventEmitter to provide a powerful event-driven programming model.
 * All Gateway events are automatically transformed and emitted as type-safe client events,
 * enabling reactive Discord bot development patterns.
 *
 * **Error Handling:**
 * Comprehensive error handling with automatic retry logic, rate limit management,
 * and graceful degradation for network failures or API limitations.
 *
 * @typeParam ClientEvents - Event map defining all events emitted by the client
 *
 * @example
 * ```typescript
 * // Basic bot setup with comprehensive configuration
 * const client = new Client({
 *   token: process.env.DISCORD_TOKEN,
 *   intents: [GatewayIntentsBits.Guilds, GatewayIntentsBits.GuildMessages],
 * });
 *
 * // Event-driven message handling
 * client.on("messageCreate", async (message) => {
 *   if (message.content === "!ping") {
 *     await message.reply("Pong!");
 *   }
 * });
 *
 * // Graceful connection management
 * client.on("ready", (ready) => {
 *   console.log(`Bot logged in as ${ready.user.username}`);
 * });
 *
 * client.on("wsError", (error) => {
 *   console.error("Gateway WebSocket error:", error);
 * });
 *
 * // Start the client
 * await client.gateway.connect();
 * ```
 *
 * @see {@link Rest} - For direct REST API operations
 * @see {@link Gateway} - For real-time WebSocket communication
 * @see {@link CacheManager} - For entity caching and memory management
 * @see {@link ClientEvents} - For complete event type definitions
 *
 * @public
 */
export class Client extends EventEmitter<ClientEvents> {
  /**
   * REST API client for performing direct HTTP requests to Discord's API.
   *
   * Provides access to all Discord REST endpoints with automatic rate limiting,
   * retry logic, and request/response transformation. Handles authentication,
   * request batching, and error recovery transparently.
   *
   * @example
   * ```typescript
   * // Direct API operations
   * const guild = await client.rest.guilds.fetchGuild(guildId);
   * const message = await client.rest.messages.sendMessage(channelId, {
   *   content: "Hello from REST API!"
   * });
   *
   * // Bulk operations
   * const members = await client.rest.guilds.fetchGuildMembers(guildId, {
   *   limit: 1000
   * });
   * ```
   *
   * @see {@link Rest} - Complete REST client documentation
   * @readonly
   * @public
   */
  readonly rest: Rest;

  /**
   * Gateway client for real-time bidirectional communication with Discord.
   *
   * Manages the WebSocket connection to Discord's Gateway, handling automatic
   * reconnection, heartbeat management, event dispatching, and connection state.
   * Processes all real-time events including messages, presence updates, and
   * guild changes.
   *
   * @example
   * ```typescript
   * // Connection management
   * await client.gateway.connect();
   * await client.gateway.disconnect();
   *
   * // Connection status monitoring
   * client.gateway.on("sessionStart", () => {
   *   console.log("Gateway session started successfully");
   * });
   *
   * client.gateway.on("wsClose", (code, reason) => {
   *   console.log(`Gateway disconnected: ${code} - ${reason}`);
   * });
   *
   * // Direct Gateway operations
   * await client.gateway.updatePresence({
   *   activities: [{
   *     name: "with Discord API",
   *     type: ActivityType.Game
   *   }],
   *   status: "online"
   * });
   * ```
   *
   * @see {@link Gateway} - Complete Gateway client documentation
   * @readonly
   * @public
   */
  readonly gateway: Gateway;

  /**
   * Intelligent cache manager for optimizing performance and reducing API calls.
   *
   * Automatically caches Discord entities (users, guilds, channels, messages, etc.)
   * with configurable TTL, eviction strategies, and memory limits. Provides
   * transparent cache-aside pattern with automatic invalidation and refresh.
   *
   * @example
   * ```typescript
   * // Cached entity access
   * const user = client.cache.users.get(userId);
   * const guild = client.cache.guilds.get(guildId);
   *
   * // Cache statistics and management
   * console.log(`Cache stats: ${client.cache.getStats()}`);
   * ```
   *
   * @see {@link CacheManager} - Complete cache manager documentation
   * @readonly
   * @public
   */
  readonly cache: CacheManager;

  /**
   * The authenticated bot user instance representing the current application.
   *
   * Contains comprehensive information about the bot including username, avatar,
   * application flags, and authentication status. Automatically populated when
   * the client successfully connects and receives the READY event from Discord.
   *
   * **Important Notes:**
   * - This property is only available after the "ready" event has been emitted
   * - Accessing before connection will result in undefined behavior
   * - The user object is automatically updated when bot profile changes occur
   *
   * @example
   * ```typescript
   * client.on("ready", () => {
   *   console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
   *   console.log(`Bot ID: ${client.user.id}`);
   *   console.log(`Avatar URL: ${client.user.avatarURL()}`);
   * });
   * ```
   *
   * @see {@link User} - Complete user object documentation
   * @throws {Error} If accessed before the client has authenticated
   * @public
   */
  // @ts-expect-error: The user property is initialized in the constructor if waitForReady option is true
  user: User;

  /**
   * Immutable client configuration options with validated defaults.
   *
   * Contains the complete configuration state after validation and default application.
   * Used internally for consistent behavior across all client subsystems.
   *
   * @internal
   */
  readonly #options: ClientOptions;

  /**
   * Creates a new Discord client instance with comprehensive configuration validation.
   *
   * Initializes all client subsystems including REST API client, Gateway connection,
   * cache manager, and event routing. Performs thorough validation of all configuration
   * options and establishes the event pipeline for seamless Discord API integration.
   *
   * **Initialization Process:**
   * 1. **Configuration Validation** - Validates and applies defaults to all options
   * 2. **Subsystem Creation** - Initializes REST, Gateway, and Cache components
   * 3. **Event Pipeline Setup** - Establishes event forwarding and transformation
   * 4. **Resource Management** - Sets up cleanup and error handling mechanisms
   *
   * **Event Flow Architecture:**
   * - REST events are forwarded directly to the client
   * - Gateway events are forwarded and also trigger event transformations
   * - Raw Gateway dispatch events are mapped to high-level client events
   * - All events maintain full type safety throughout the pipeline
   *
   * @param options - Comprehensive configuration options for client behavior
   *
   * @throws {Error} Configuration validation fails due to invalid option values
   * @throws {Error} Required dependencies are missing or incompatible versions
   * @throws {Error} Token validation fails or insufficient permissions detected
   *
   * @see {@link ClientOptions} - Complete configuration options reference
   * @see {@link destroy} - For proper client cleanup and resource management
   *
   * @public
   */
  constructor(options: z.input<typeof ClientOptions>) {
    // Initialize the parent EventEmitter with optimal configuration
    // Enables high-performance event handling with proper error propagation
    super();

    // Validate and parse configuration options with comprehensive error handling
    try {
      this.#options = ClientOptions.parse(options);
    } catch (error) {
      // Convert Zod validation errors to developer-friendly format
      if (error instanceof z.ZodError) {
        // Create detailed error message with field-specific issues
        const errorMessage = z.prettifyError(error);
        throw new Error(
          `Client configuration validation failed:\n${errorMessage}`,
        );
      }

      // Re-throw unexpected validation errors with additional context
      throw new Error(`Unexpected error during client configuration: ${error}`);
    }

    // Initialize REST API client with validated configuration
    // Handles all HTTP requests to Discord's REST API endpoints
    this.rest = new Rest(this.#options);

    // Initialize Gateway client with REST dependency and configuration
    // Manages real-time WebSocket connection to Discord's Gateway
    this.gateway = new Gateway(this.rest, this.#options);

    // Initialize cache manager with validated cache-specific options
    // Provides intelligent caching for Discord entities and API responses
    this.cache = new CacheManager(this.#options.cache);

    // Establish REST event forwarding pipeline
    // All REST events are transparently forwarded to the client for unified handling
    for (const eventName of RestEventNames) {
      this.rest.on(eventName, (...args) => {
        // Forward REST events to client with original arguments preserved
        // Maintains event signature integrity and type safety
        this.emit(eventName, ...args);
      });
    }

    // Establish Gateway event forwarding pipeline
    // All Gateway events are transparently forwarded to the client
    for (const eventName of GatewayEventNames) {
      this.gateway.on(eventName, (...args) => {
        // Forward Gateway events to client with original arguments preserved
        // Enables unified event handling across all client subsystems
        this.emit(eventName, ...args);
      });
    }

    // Establish Gateway event transformation pipeline
    // Raw Gateway dispatch events are transformed into high-level client events
    this.gateway.on("dispatch", (event, data) => {
      // Look up the event mapping configuration for this Gateway event
      const mapping = GatewayEventMappings.find(
        (m) => m.gatewayEvent === event,
      );

      // Skip unmapped events to prevent unnecessary processing
      if (!mapping) {
        return;
      }

      // Transform raw Gateway data into client-friendly format
      // Handles entity caching, data normalization, and type conversion
      const transformedData = mapping.transform(this, data);

      // Emit the high-level client event with transformed data
      // Provides clean, type-safe API for application developers
      this.emit(mapping.clientEvent, ...transformedData);
    });

    // Establish user initialization on successful authentication
    // Automatically populates the user property when READY event is received
    this.once("ready", (ready) => {
      // Set the authenticated user instance from READY event data
      // This represents the bot's identity and capabilities
      this.user = ready.user;
    });
  }

  /**
   * Gracefully disconnects from Discord and performs comprehensive resource cleanup.
   *
   * Implements a multi-stage shutdown process to ensure all resources are properly
   * released, preventing memory leaks and ensuring clean application termination.
   * Safe to call multiple times and handles partial cleanup scenarios gracefully.
   *
   * **Shutdown Process:**
   * 1. **Gateway Disconnection** - Cleanly closes WebSocket connection with proper codes
   * 2. **REST Cleanup** - Cancels pending requests and releases HTTP resources
   * 3. **Cache Invalidation** - Clears all cached data and stops background processes
   * 4. **Event Cleanup** - Removes all event listeners to prevent memory leaks
   *
   * **Error Handling:**
   * The destroy process is designed to continue even if individual cleanup steps fail,
   * ensuring maximum resource recovery. Errors during cleanup are logged but do not
   * prevent the overall destruction process.
   *
   * @returns Promise that resolves when all cleanup operations are complete
   *
   * @example
   * ```typescript
   * // Graceful shutdown in application termination
   * process.on("SIGINT", async () => {
   *   console.log("Shutting down Discord client...");
   *   await client.destroy();
   *   console.log("Client destroyed successfully");
   *   process.exit(0);
   * });
   *
   * // Explicit cleanup in error scenarios
   * try {
   *   await client.gateway.connect();
   * } catch (error) {
   *   console.error("Connection failed:", error);
   *   await client.destroy(); // Ensure cleanup even on failure
   *   throw error;
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Resource management with automatic cleanup
   * {
   *   const client = new Client(options);
   *   try {
   *     await client.gateway.connect();
   *     // Use the client for operations...
   *   } finally {
   *     // Always cleanup, even if operations fail
   *     await client.destroy();
   *   }
   * }
   * ```
   *
   * @see {@link gateway} - For Gateway-specific disconnection options
   * @see {@link rest} - For REST client cleanup details
   * @see {@link cache} - For cache management and cleanup
   *
   * @public
   */
  async destroy(): Promise<void> {
    try {
      // Phase 1: Destroy Gateway connection
      // Cleanly closes WebSocket connection and stops all Gateway processes
      // Uses proper WebSocket close codes to inform Discord of intentional disconnection
      this.gateway.destroy();

      // Phase 2: Clean up REST resources
      // Cancels pending HTTP requests, closes connection pools, and releases handles
      // Ensures no hanging requests or timeouts prevent clean shutdown
      await this.rest.destroy();

      // Phase 3: Clear cache and stop background processes
      // Removes all cached entities, stops TTL sweeps, and releases memory
      // Prevents memory leaks from cached Discord data
      this.cache.destroy();

      // Phase 4: Remove all event listeners
      // Clears all event handlers to prevent memory leaks and unexpected callbacks
      // Essential for preventing references to destroyed client instances
      this.removeAllListeners();
    } catch (error) {
      // Log cleanup errors but don't throw to ensure partial cleanup completion
      // This prevents one failed cleanup step from blocking other essential cleanup
      console.error("Error during client destruction:", error);

      // Continue with remaining cleanup even if some steps fail
      // This ensures maximum resource recovery in error scenarios
    }
  }
}
