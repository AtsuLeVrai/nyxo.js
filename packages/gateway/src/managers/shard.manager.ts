import { type Snowflake, sleep } from "@nyxojs/core";
import { z } from "zod/v4";
import type { Gateway } from "../core/index.js";

/**
 * Possible states for a Discord Gateway shard connection
 *
 * Each state represents a specific phase in the shard lifecycle:
 * - "disconnected": Shard has no active connection to Discord Gateway
 * - "connecting": Shard is in the process of establishing a new connection (IDENTIFY)
 * - "ready": Shard is fully connected and operational, receiving events
 * - "resuming": Shard is attempting to recover a disconnected session (RESUME)
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#connections | Discord Gateway Connections}
 */
export type ShardStatus =
  | "disconnected" // Shard is not connected to Discord
  | "connecting" // Shard is establishing a new connection
  | "ready" // Shard is connected and operational
  | "resuming"; // Shard is resuming a previous session

/**
 * Core data structure representing a Discord Gateway shard
 *
 * Contains all status information, guild assignments, and operational
 * metrics for a single shard connection to Discord's Gateway. Each shard
 * manages a subset of guilds according to Discord's sharding formula:
 * `shard_id = (guild_id >> 22) % num_shards`
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 */
export interface ShardData {
  /**
   * Unique identifier for this shard (0-based index)
   *
   * For a system with N shards, valid IDs range from 0 to N-1.
   * Shard 0 always handles DMs in addition to its guild assignments.
   */
  shardId: number;

  /**
   * Total number of shards in the current configuration
   *
   * All shards in the same application should have the same totalShards value.
   */
  totalShards: number;

  /**
   * Number of guilds assigned to this shard
   *
   * Should equal guilds.size for consistency.
   */
  guildCount: number;

  /**
   * Set of guild IDs managed by this shard
   *
   * Guild assignment follows Discord's sharding formula:
   * shard_id = (guild_id >> 22) % num_shards
   */
  guilds: Set<Snowflake>;

  /**
   * Current connection status
   *
   * @see {@link ShardStatus}
   */
  status: ShardStatus;

  /**
   * Rate limit bucket ID (based on Discord's max_concurrency parameter)
   *
   * Calculated as: shardId % maxConcurrency
   * Shards in the same bucket share rate limit windows for IDENTIFY operations.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#sharding-max-concurrency}
   */
  bucket: number;

  /**
   * Timestamp when this shard was last updated (in milliseconds since epoch)
   */
  lastUpdated: number;

  /**
   * Heartbeat and connection health metrics
   */
  health: {
    /**
     * WebSocket round-trip latency in milliseconds
     *
     * Measured between heartbeat send and acknowledgement receipt.
     */
    latency: number;

    /**
     * Timestamp of the last successful heartbeat acknowledgement
     */
    lastHeartbeat: number;

    /**
     * Number of consecutive failed heartbeats
     *
     * Reset to 0 when a successful heartbeat is received.
     */
    failedHeartbeats: number;
  };

  /**
   * Rate limit tracking for identify operations
   */
  rateLimit: {
    /**
     * Number of identify requests remaining in the current window
     */
    remaining: number;

    /**
     * Timestamp when the rate limit window resets (in milliseconds since epoch)
     */
    reset: number;
  };
}

/**
 * Default rate limit values for Discord Gateway connections
 *
 * These values are used as fallbacks when specific rate limit
 * information is not provided by Discord's Gateway.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#rate-limiting}
 */
export const DEFAULT_RATE_LIMIT = {
  /**
   * Maximum identify operations allowed per minute across all buckets
   */
  MAX_IDENTIFIES_PER_MINUTE: 120,

  /**
   * Duration of the rate limit window in milliseconds
   */
  WINDOW_DURATION_MS: 60_000,
} as const;

/**
 * Configuration options for Discord Gateway sharding
 *
 * Controls how shards are created, distributed, and managed.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 */
export const ShardOptions = z
  .object({
    /**
     * Total number of shards to use
     *
     * - Number: Uses exactly that many shards
     * - "auto": Uses Discord's recommended shard count from Gateway Bot endpoint
     * - undefined: Auto-determines based on guild count and largeThreshold
     *
     * For larger bots (>2500 guilds), Discord requires sharding.
     */
    totalShards: z
      .union([z.number().int().positive(), z.literal("auto")])
      .optional(),

    /**
     * List of specific shard IDs to spawn
     *
     * When provided, only spawns the specified shards.
     * All shards must be within the range [0, totalShards-1].
     */
    shardList: z.array(z.number().int().positive()).optional(),

    /**
     * Delay between spawning each shard in milliseconds
     *
     * Prevents rate limiting during startup by spacing out identify operations.
     */
    spawnDelay: z.number().int().positive().default(5000),

    /**
     * Threshold for enabling sharding based on guild count
     *
     * If guild count exceeds this value and totalShards isn't specified,
     * sharding will be automatically enabled.
     */
    largeThreshold: z.number().int().positive().default(2500),

    /**
     * Whether to force sharding even if not recommended
     *
     * When true, enables sharding even if guild count is below threshold.
     */
    force: z.boolean().default(false),

    /**
     * Interval between health checks in milliseconds
     */
    interval: z.number().int().positive().default(30000),

    /**
     * Maximum time without heartbeat before reconnection (in milliseconds)
     *
     * Should be at least 2-3 times the expected heartbeat interval (typically 41.25s).
     */
    heartbeatTimeout: z.number().int().positive().default(45000),

    /**
     * Whether to automatically reconnect failed shards
     */
    autoReconnect: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (typeof data.totalShards === "number" && data.shardList) {
        return data.shardList.every(
          (shard) => shard < Number(data.totalShards),
        );
      }
      return true;
    },
    {
      message:
        "Shard list must contain only valid shard IDs for the total shards provided",
      path: ["shardList"],
    },
  );

export type ShardOptions = z.infer<typeof ShardOptions>;

/**
 * ShardManager coordinates Discord Gateway connections across multiple shards
 *
 * The ShardManager is responsible for:
 * - Creating and managing multiple Gateway connections (shards)
 * - Distributing guilds across shards according to Discord's sharding formula
 * - Handling rate limits for identify operations
 * - Monitoring shard health and handling reconnections
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 */
export class ShardManager {
  /**
   * Internal map storing all shard instances by their shard ID
   * Keys are shard IDs (0-based indices) and values are ShardData objects.
   * @private
   */
  #shards = new Map<number, ShardData>();

  /**
   * Maximum number of concurrent identify operations allowed by Discord
   * This value is provided by Discord's Gateway Bot endpoint and determines
   * how many shards can connect simultaneously within a rate limit window.
   * @private
   */
  #maxConcurrency = 1;

  /**
   * Timer reference for periodic shard health checks
   * @private
   */
  #healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Mapping between shard IDs and their most recent session IDs
   * Used for session resumption, which is preferred over creating new connections
   * when reconnecting shards.
   * @private
   */
  #sessionMap = new Map<number, string>();

  /**
   * Reference to the parent Gateway instance
   * @private
   */
  readonly #gateway: Gateway;

  /**
   * Sharding configuration options for this manager
   * @private
   */
  readonly #options: ShardOptions;

  /**
   * Creates a new ShardManager instance
   *
   * @param gateway - Parent Gateway instance that will handle the WebSocket connections
   * @param options - Configuration options for sharding behavior
   */
  constructor(gateway: Gateway, options: ShardOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Gets the total number of shards currently managed
   *
   * This is the number of active shards that have been spawned
   *
   * @returns The number of shards in the manager
   */
  get totalShards(): number {
    return this.#shards.size;
  }

  /**
   * Gets Discord's max_concurrency value for identify operations
   *
   * This determines how many shards can be started concurrently
   * within a rate limit window. Higher values allow faster startup
   * but require careful rate limit management.
   *
   * @returns The maximum number of concurrent identify operations allowed
   */
  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  /**
   * Gets all active shards as a read-only array
   * This is useful for iterating over all shards and accessing their data.
   *
   * @returns An array of all shard data objects
   */
  get shards(): readonly ShardData[] {
    return Array.from(this.#shards.values());
  }

  /**
   * Checks if sharding is enabled and required
   *
   * This is determined by:
   * - The total number of shards specified in options
   * - The total number of guilds the bot is in
   * - The largeThreshold option
   * - The force option
   *
   * If any of these conditions are met, sharding is enabled.
   *
   * @returns True if sharding is enabled
   */
  get isEnabled(): boolean {
    const totalGuildCount = this.#calculateTotalGuildCount();

    return (
      Boolean(this.#options.totalShards) ||
      totalGuildCount >= this.#options.largeThreshold ||
      this.#options.force
    );
  }

  /**
   * Spawns the required number of shards based on Discord recommendations
   *
   * @param guildCount - Current number of guilds the bot is in
   * @param maxConcurrency - Discord's maximum concurrency parameter
   * @param recommendedShards - Discord's recommended number of shards
   * @returns A promise that resolves when all shards have been spawned
   * @throws {Error} If the shard configuration is invalid
   */
  async spawn(
    guildCount: number,
    maxConcurrency: number,
    recommendedShards: number,
  ): Promise<void> {
    if (!this.#validateSpawnConditions(guildCount)) {
      return;
    }

    const totalShards = this.#calculateTotalShards(
      guildCount,
      recommendedShards,
    );
    this.#maxConcurrency = maxConcurrency;

    // Validate shard list if provided
    if (this.#options.shardList) {
      const maxShardId = Math.max(...this.#options.shardList);
      if (maxShardId >= totalShards) {
        throw new Error(
          `Shard list contains invalid shard IDs (max: ${maxShardId}, total: ${totalShards})`,
        );
      }
    }

    // Create buckets for sharding
    const buckets = this.#createShardBuckets(totalShards);

    // Spawn shards by bucket
    await this.#spawnShardBuckets(buckets, totalShards);

    // Start health checks after initial spawn
    this.startHealthChecks();
  }

  /**
   * Gets the next available shard for connection
   *
   * Handles rate limiting and returns the first available shard,
   * waiting for rate limits to reset if necessary. Used by the Gateway
   * when establishing new connections.
   *
   * This method also updates the shard's status to "connecting"
   * and decrements its remaining rate limit.
   *
   * @returns A promise that resolves to a tuple containing [shardId, totalShards]
   */
  async getAvailableShard(): Promise<[number, number]> {
    // Try to find a shard that isn't rate limited
    const availableShard = this.#findAvailableShard();
    if (availableShard !== null) {
      return availableShard;
    }

    // If all shards are rate limited, wait for a rate limit to reset
    await this.#waitForAvailableBucket();
    return this.getAvailableShard();
  }

  /**
   * Properly closes all shards and cleans up resources
   *
   * Should be called when shutting down the bot or when
   * a complete reconnection of all shards is required.
   *
   * This method:
   * - Stops the health check interval
   * - Marks all shards as disconnected
   * - Clears internal state and mapping data
   *
   * Note: This does not close the actual WebSocket connections -
   * that should be handled by the Gateway.
   */
  destroy(): void {
    // Stop health check interval
    if (this.#healthCheckInterval) {
      clearInterval(this.#healthCheckInterval);
      this.#healthCheckInterval = null;
    }

    // Mark all shards as disconnected
    for (const [shardId] of this.#shards.entries()) {
      this.setShardStatus(shardId, "disconnected");
    }

    // Clear all internal maps
    this.#shards.clear();
    this.#sessionMap.clear();
  }

  /**
   * Calculates which shard a guild belongs to
   *
   * Uses Discord's sharding formula: (guild_id >> 22) % num_shards
   *
   * This is a deterministic calculation, meaning the same guild will
   * always be assigned to the same shard ID for a given total shard count.
   * The bit shift operation extracts the high bits of the snowflake ID,
   * which ensures guilds are distributed evenly across shards.
   *
   * @param guildId - Discord guild (server) ID
   * @returns The shard ID this guild belongs to
   */
  calculateShardId(guildId: string): number {
    if (this.#shards.size === 0) {
      return 0;
    }

    // Discord's sharding algorithm
    // The right shift by 22 bits extracts the high bits of the snowflake
    // which ensures even distribution of guilds across shards
    return Number(BigInt(guildId) >> BigInt(22)) % this.#shards.size;
  }

  /**
   * Adds a guild to its appropriate shard
   *
   * This method calculates the appropriate shard for the guild
   * using Discord's sharding formula and updates the shard's
   * guild list and guild count.
   *
   * Should be called when the bot joins a new guild.
   *
   * @param guildId - Discord guild ID to add
   * @throws {Error} If the shard doesn't exist
   */
  addGuildToShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guilds.add(guildId);
    shard.guildCount = shard.guilds.size;
    shard.lastUpdated = Date.now();
  }

  /**
   * Removes a guild from its shard
   *
   * This method calculates the appropriate shard for the guild
   * using Discord's sharding formula and removes the guild from
   * the shard's guild list, updating the guild count.
   *
   * Should be called when the bot leaves or is removed from a guild.
   *
   * @param guildId - Discord guild ID to remove
   * @throws {Error} If the shard doesn't exist
   */
  removeGuildFromShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guilds.delete(guildId);
    shard.guildCount = shard.guilds.size;
    shard.lastUpdated = Date.now();
  }

  /**
   * Adds multiple guilds to a shard at once
   *
   * This is a more efficient way to add multiple guilds
   * to a shard at once, rather than calling addGuildToShard
   * repeatedly.
   *
   * Useful during initialization or when processing
   * shard guild assignments in bulk.
   *
   * @param shardId - The shard ID to add guilds to
   * @param guildIds - Array of guild IDs to add
   * @throws {Error} If the shard doesn't exist
   */
  addGuildsToShard(shardId: number, guildIds: Snowflake[]): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    // Add all guilds at once
    for (const guildId of guildIds) {
      shard.guilds.add(guildId);
    }

    // Update the count after all additions
    shard.guildCount = shard.guilds.size;
    shard.lastUpdated = Date.now();
  }

  /**
   * Checks if a shard handles direct messages
   *
   * Discord places all direct messages in shard 0, regardless of
   * how many shards are being used. This is important to consider
   * when routing events and commands in DM channels.
   *
   * @param shardId - The shard ID to check
   * @returns True if this shard handles DMs
   */
  isDmShard(shardId: number): boolean {
    return shardId === 0;
  }

  /**
   * Gets information about a specific shard
   *
   * Returns a read-only copy of the shard data for inspection.
   * To modify a shard, use the specific methods provided by
   * the ShardManager.
   *
   * @param shardId - The shard ID to get info for
   * @returns The shard data or undefined if not found
   */
  getShardInfo(shardId: number): Readonly<ShardData> | undefined {
    return this.#shards.get(shardId);
  }

  /**
   * Gets the shard responsible for a specific guild
   *
   * This method combines calculateShardId and getShardInfo
   * for convenience when looking up the shard for a specific guild.
   *
   * @param guildId - Discord guild ID
   * @returns The shard data or undefined if not found
   */
  getShardByGuildId(guildId: string): Readonly<ShardData> | undefined {
    const shardId = this.calculateShardId(guildId);
    return this.getShardInfo(shardId);
  }

  /**
   * Updates a shard's connection status
   *
   * Handles status transitions and emits appropriate events.
   * This is a key method for managing shard lifecycle events.
   *
   * Status transitions trigger side effects such as:
   * - "disconnected" → Emits shardDisconnect event
   * - "ready" → Updates health metrics, stores session ID, emits shardReady
   * - "resuming" → Emits shardResume event with session ID
   *
   * @param shardId - The shard ID to update
   * @param status - The new status to set
   * @throws {Error} If the shard doesn't exist
   */
  setShardStatus(shardId: number, status: ShardStatus): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    const oldStatus = shard.status;
    shard.status = status;
    shard.lastUpdated = Date.now();

    // Only emit events when the status actually changes
    if (status === oldStatus) {
      return;
    }

    this.#handleShardStatusChange(shardId, shard, oldStatus, status);
  }

  /**
   * Starts periodic health checks for shard connections
   *
   * Monitors heartbeat responses and reconnects failed shards if configured.
   * The frequency of health checks is controlled by the interval option.
   *
   * Health checks evaluate:
   * - Time since last heartbeat acknowledgement
   * - Number of consecutive failed heartbeats
   * - Connection latency
   *
   * Automatically reconnects shards after 3 consecutive failed heartbeats
   * if autoReconnect is enabled in options.
   */
  startHealthChecks(): void {
    // Stop existing interval if running
    if (this.#healthCheckInterval) {
      clearInterval(this.#healthCheckInterval);
    }

    // Start new health check interval
    this.#healthCheckInterval = setInterval(
      () => this.#runHealthChecks(),
      this.#options.interval,
    );
  }

  /**
   * Attempts to reconnect a disconnected shard
   *
   * Prefers session resumption if available, otherwise performs a new identify.
   * This method only changes the shard's status - the actual reconnection
   * logic should be handled by the Gateway.
   *
   * @param shardId - The shard ID to reconnect
   * @throws {Error} If the shard doesn't exist
   */
  reconnectShard(shardId: number): void {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    // Don't try to reconnect a shard that's already connecting
    if (shard.status === "connecting" || shard.status === "resuming") {
      return;
    }

    // Prefer resuming if we have a session ID
    const sessionId = this.#sessionMap.get(shardId);
    if (sessionId) {
      this.setShardStatus(shardId, "resuming");
    } else {
      this.setShardStatus(shardId, "connecting");
    }
  }

  /**
   * Calculates which rate limit bucket a shard belongs to
   *
   * Based on Discord documentation: rate_limit_key = shard_id % max_concurrency
   *
   * Shards in the same bucket share rate limit windows for IDENTIFY operations.
   * This is important for managing connection attempts and reconnections.
   *
   * @param shardId - The shard ID
   * @returns The rate limit bucket ID
   */
  getRateLimitKey(shardId: number): number {
    return shardId % this.#maxConcurrency;
  }

  /**
   * Validates if the current configuration requires sharding to be enabled
   *
   * This method evaluates three conditions:
   * 1. If the guild count exceeds the configured largeThreshold
   * 2. If totalShards is explicitly configured in options
   * 3. If sharding is forced via the force option
   *
   * @private
   */
  #validateSpawnConditions(guildCount: number): boolean {
    const isShardingRequired = guildCount >= this.#options.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;
    const isForced = this.#options.force;

    // Skip sharding if not required, not configured, and not forced
    return isShardingRequired || hasConfiguredShards || isForced;
  }

  /**
   * Determines the optimal number of shards to use
   *
   * Decision tree for determining shard count:
   * 1. If totalShards is "auto" → Use Discord's recommended count
   * 2. If totalShards is a number → Use that exact number
   * 3. If force option is true but no count specified → Use at least 1 shard
   * 4. Otherwise → Calculate based on guild count (1 shard per largeThreshold guilds)
   *
   * @private
   */
  #calculateTotalShards(guildCount: number, recommendedShards: number): number {
    // Use recommended count if auto-sharding is enabled
    if (this.#options.totalShards === "auto") {
      return recommendedShards;
    }

    // Use configured shard count if explicitly set
    if (typeof this.#options.totalShards === "number") {
      return this.#options.totalShards;
    }

    // If forcing sharding with no explicit count, use at least 1 shard
    if (this.#options.force) {
      return Math.max(1, recommendedShards);
    }

    // Calculate minimum required shards based on guild count
    const minimumShards = Math.ceil(guildCount / this.#options.largeThreshold);
    return Math.max(1, minimumShards);
  }

  /**
   * Organizes shards into rate limit buckets
   *
   * Rate limit buckets are calculated using: shardId % maxConcurrency
   * Shards in the same bucket share rate limits for IDENTIFY operations
   *
   * @private
   */
  #createShardBuckets(totalShards: number): Map<number, number[]> {
    const buckets = new Map<number, number[]>();

    // Use the provided shard list or generate a full range of shard IDs
    const shardIds =
      this.#options.shardList ??
      Array.from({ length: totalShards }, (_, i) => i);

    // Group shards by their bucket ID
    for (const shardId of shardIds) {
      const bucketId = this.getRateLimitKey(shardId);
      if (!buckets.has(bucketId)) {
        buckets.set(bucketId, []);
      }
      buckets.get(bucketId)?.push(shardId);
    }

    return buckets;
  }

  /**
   * Creates shard data structures and handles proper spawn sequencing
   *
   * Follows Discord's recommended practices for spawning shards:
   * 1. Orders buckets numerically for predictable spawning sequence
   * 2. Creates all shards within a bucket at once
   * 3. Waits for spawnDelay milliseconds between buckets
   *
   * @private
   */
  async #spawnShardBuckets(
    buckets: Map<number, number[]>,
    totalShards: number,
  ): Promise<void> {
    // Order buckets by ID for predictable spawning
    const orderedBuckets = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );

    // Spawn buckets one by one
    for (const [bucketId, bucketShardIds] of orderedBuckets) {
      // Initialize all shards in this bucket
      for (const shardId of bucketShardIds) {
        // Create the shard data structure with initial values
        this.#shards.set(shardId, {
          shardId,
          totalShards,
          guildCount: 0,
          guilds: new Set(),
          status: "disconnected",
          bucket: bucketId,
          lastUpdated: Date.now(),
          health: {
            latency: 0,
            lastHeartbeat: Date.now(),
            failedHeartbeats: 0,
          },
          rateLimit: {
            remaining: DEFAULT_RATE_LIMIT.MAX_IDENTIFIES_PER_MINUTE,
            reset: Date.now() + DEFAULT_RATE_LIMIT.WINDOW_DURATION_MS,
          },
        });
      }

      // Wait after each bucket except the last one
      const isLastBucket =
        orderedBuckets.findIndex(([id]) => id === bucketId) ===
        orderedBuckets.length - 1;

      if (!isLastBucket) {
        // Wait between buckets to prevent rate limiting
        await sleep(this.#options.spawnDelay);
      }
    }
  }

  /**
   * Processes shard status transitions and triggers appropriate lifecycle events
   *
   * Each status change emits different events and performs different operations
   * to maintain the shard lifecycle.
   *
   * @private
   */
  #handleShardStatusChange(
    shardId: number,
    shard: ShardData,
    oldStatus: ShardStatus,
    newStatus: ShardStatus,
  ): void {
    // Handle status-specific events
    switch (newStatus) {
      case "disconnected": {
        if (oldStatus !== "disconnected") {
          // Emit disconnect event with relevant information
          this.#gateway.emit("shardDisconnect", {
            timestamp: new Date().toISOString(),
            shardId,
            totalShards: shard.totalShards,
            closeCode: 1006, // Default WebSocket close code for abnormal closure
            reason: "Connection closed",
            willReconnect: this.#options.autoReconnect,
          });
        }
        break;
      }

      case "ready": {
        if (oldStatus !== "ready") {
          // Update health information
          shard.health.lastHeartbeat = Date.now();
          shard.health.failedHeartbeats = 0;

          // Store session ID for potential resumption later
          const sessionId = this.#gateway.sessionId;
          if (sessionId) {
            this.#sessionMap.set(shardId, sessionId);
          }

          // Emit ready event with relevant information
          this.#gateway.emit("shardReady", {
            timestamp: new Date().toISOString(),
            shardId,
            totalShards: shard.totalShards,
            guildCount: shard.guildCount,
          });
        }
        break;
      }

      case "resuming": {
        // Get session ID from either shard map or current gateway session
        const sessionId =
          this.#sessionMap.get(shardId) || this.#gateway.sessionId;

        if (!sessionId) {
          throw new Error(`Cannot resume shard ${shardId} without session ID`);
        }

        // Emit resume event with relevant information
        this.#gateway.emit("shardResume", {
          timestamp: new Date().toISOString(),
          shardId,
          totalShards: shard.totalShards,
          sessionId,
        });
        break;
      }

      // Other states like "connecting" don't need special handling
      default:
        break;
    }
  }

  /**
   * Performs periodic health assessment for all active shards
   *
   * Called by the health check interval to monitor all shards and
   * trigger reconnection for unhealthy shards.
   *
   * @private
   */
  #runHealthChecks(): void {
    const now = Date.now();

    for (const [shardId, shard] of this.#shards.entries()) {
      // Skip health checks for disconnected shards
      if (shard.status === "disconnected") {
        continue;
      }

      // Check for heartbeat timeouts
      const timeSinceHeartbeat = now - shard.health.lastHeartbeat;
      if (timeSinceHeartbeat > this.#options.heartbeatTimeout) {
        // Increment failed heartbeats counter
        shard.health.failedHeartbeats++;

        // If too many failed heartbeats and auto-reconnect enabled, reconnect
        if (shard.health.failedHeartbeats >= 3 && this.#options.autoReconnect) {
          this.reconnectShard(shardId);
        }
      }

      // Update latency for ready shards
      if (shard.status === "ready") {
        shard.health.latency = this.#gateway.heartbeat.latency;
      }
    }
  }

  /**
   * Searches for and returns the first shard that isn't rate-limited
   *
   * Used by getAvailableShard() to find a shard that can perform
   * an IDENTIFY operation without violating Discord's rate limits.
   *
   * @private
   */
  #findAvailableShard(): [number, number] | null {
    for (const [shardId, shard] of this.#shards.entries()) {
      // Check if this shard has available identifies
      if (shard.rateLimit.remaining > 0) {
        // Emit reconnect event if needed
        if (shard.status === "disconnected") {
          this.#gateway.emit("shardReconnect", {
            timestamp: new Date().toISOString(),
            shardId,
            totalShards: shard.totalShards,
          });
        }

        // Update rate limit and status
        shard.rateLimit.remaining--;
        this.setShardStatus(shardId, "connecting");
        shard.lastUpdated = Date.now();

        // Return the shard ID and total shards for IDENTIFY payload
        return [shardId, shard.totalShards];
      }
    }

    // No available shards found
    return null;
  }

  /**
   * Waits until any rate limit bucket becomes available for IDENTIFY operations
   *
   * Implements a smart waiting strategy:
   * 1. Finds the earliest reset time among all shards
   * 2. Calculates the delay until that reset time
   * 3. Waits for that amount of time
   * 4. Updates rate limit counters after waiting
   *
   * @private
   */
  async #waitForAvailableBucket(): Promise<void> {
    // Find the next rate limit reset time (earliest among all shards)
    const nextReset = Math.min(
      ...Array.from(this.#shards.values()).map(
        (shard) => shard.rateLimit.reset,
      ),
    );

    // Calculate delay until next reset
    const delay = Math.max(0, nextReset - Date.now());

    // Wait for the rate limit to reset
    if (delay > 0) {
      await sleep(delay);
    }

    // Reset expired rate limits after waiting
    this.#resetExpiredRateLimits();
  }

  /**
   * Updates rate limit counters for shards whose rate limits have expired
   *
   * After a rate limit window expires, the remaining count is reset to
   * the maximum value and a new reset time is set for the next window.
   *
   * @private
   */
  #resetExpiredRateLimits(): void {
    const now = Date.now();
    const newResetTime = now + DEFAULT_RATE_LIMIT.WINDOW_DURATION_MS;

    for (const shard of this.#shards.values()) {
      // Check if this shard's rate limit has expired
      if (shard.rateLimit.reset <= now) {
        // Reset the counter to maximum allowed identifies
        shard.rateLimit.remaining =
          DEFAULT_RATE_LIMIT.MAX_IDENTIFIES_PER_MINUTE;

        // Set next reset time
        shard.rateLimit.reset = newResetTime;
      }
    }
  }

  /**
   * Computes the total number of guilds managed across all shards
   *
   * @returns The combined guild count from all shards
   * @private
   */
  #calculateTotalGuildCount(): number {
    return Array.from(this.#shards.values()).reduce(
      (acc, shard) => acc + shard.guildCount,
      0,
    );
  }
}
