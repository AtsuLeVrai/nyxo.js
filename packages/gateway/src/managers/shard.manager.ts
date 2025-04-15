import { type Snowflake, sleep } from "@nyxjs/core";
import { z } from "zod";
import type { Gateway } from "../core/index.js";

/**
 * Possible states for a Discord Gateway shard connection
 *
 * Represents the lifecycle of a shard from disconnected to ready state.
 * Each state determines how the shard is handled by the manager.
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
 *
 * @example
 * ```ts
 * const shard: ShardData = {
 *   shardId: 0,
 *   totalShards: 2,
 *   guildCount: 120,
 *   guilds: new Set(["123456789", "987654321"]),
 *   status: "ready",
 *   bucket: 0,
 *   lastUpdated: Date.now(),
 *   health: {
 *     latency: 42,
 *     lastHeartbeat: Date.now(),
 *     failedHeartbeats: 0
 *   },
 *   rateLimit: {
 *     remaining: 115,
 *     reset: Date.now() + 60_000
 *   }
 * };
 * ```
 */
export interface ShardData {
  /**
   * Unique identifier for this shard (0-based index)
   * For a system with N shards, valid IDs range from 0 to N-1
   */
  shardId: number;

  /**
   * Total number of shards in the current configuration
   * All shards in the same application should have the same totalShards value
   */
  totalShards: number;

  /**
   * Number of guilds assigned to this shard
   * Should equal guilds.size for consistency
   */
  guildCount: number;

  /**
   * Set of guild IDs managed by this shard
   * Guild assignment follows Discord's sharding formula
   */
  guilds: Set<Snowflake>;

  /**
   * Current connection status
   * Determines what operations can be performed on this shard
   */
  status: ShardStatus;

  /**
   * Rate limit bucket ID (based on Discord's max_concurrency parameter)
   * Calculated as: shardId % maxConcurrency
   */
  bucket: number;

  /**
   * Timestamp when this shard was last updated (in milliseconds since epoch)
   * Used to track shard age and activity
   */
  lastUpdated: number;

  /**
   * Heartbeat and connection health metrics
   * Used to monitor shard stability and performance
   */
  health: {
    /**
     * WebSocket round-trip latency in milliseconds
     * Measured between heartbeat send and acknowledgement receipt
     */
    latency: number;

    /**
     * Timestamp of the last successful heartbeat acknowledgement (in milliseconds since epoch)
     * Used to detect stalled connections
     */
    lastHeartbeat: number;

    /**
     * Number of consecutive failed heartbeats
     * Reset to 0 when a successful heartbeat is received
     */
    failedHeartbeats: number;
  };

  /**
   * Rate limit tracking for identify operations
   * Each shard tracks its own rate limit usage
   */
  rateLimit: {
    /**
     * Number of identify requests remaining in the current window
     * When this reaches 0, no more identifies can be performed until reset
     */
    remaining: number;

    /**
     * Timestamp when the rate limit window resets (in milliseconds since epoch)
     * After this time, the remaining count will be restored to the maximum
     */
    reset: number;
  };
}

/**
 * Default rate limit values for Discord Gateway connections
 *
 * These values are used as fallbacks when specific rate limit
 * information is not provided by Discord's Gateway. For production
 * applications, always use the actual values from the Gateway Bot endpoint.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#rate-limiting}
 */
export const DEFAULT_RATE_LIMIT = {
  /**
   * Maximum identify operations allowed per minute across all buckets
   * The actual per-bucket limit depends on the max_concurrency value
   */
  MAX_IDENTIFIES_PER_MINUTE: 120,

  /**
   * Duration of the rate limit window in milliseconds
   * Rate limits reset after this duration has passed
   */
  WINDOW_DURATION_MS: 60_000,
} as const;

/**
 * Configuration options for Discord Gateway sharding
 *
 * Controls how shards are created, distributed, and managed.
 * Proper sharding configuration is essential for bots in many guilds.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 *
 * @example
 * ```ts
 * // Auto-sharding based on Discord recommendations
 * const autoShardOptions: ShardOptions = {
 *   totalShards: "auto",
 *   spawnDelay: 5000
 * };
 *
 * // Fixed number of shards
 * const fixedShardOptions: ShardOptions = {
 *   totalShards: 10,
 *   spawnDelay: 5000
 * };
 *
 * // Distributed sharding across multiple processes
 * const processOneOptions: ShardOptions = {
 *   totalShards: 10,
 *   shardList: [0, 1, 2, 3, 4],
 *   spawnDelay: 5000
 * };
 *
 * const processTwoOptions: ShardOptions = {
 *   totalShards: 10,
 *   shardList: [5, 6, 7, 8, 9],
 *   spawnDelay: 5000
 * };
 * ```
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
     *
     * Used for distributing shards across multiple processes or servers.
     */
    shardList: z.array(z.number().int().positive()).optional(),

    /**
     * Delay between spawning each shard in milliseconds
     *
     * Prevents rate limiting during startup by spacing out identify operations.
     * Should be tuned based on Discord's max_concurrency value.
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
     * Useful for testing sharding configurations.
     */
    force: z.boolean().default(false),

    /**
     * Interval between health checks in milliseconds (default: 30000)
     * Lower values provide more responsive recovery but increase CPU usage
     */
    interval: z.number().int().positive().default(30000),

    /**
     * Maximum time without heartbeat before reconnection (default: 45000)
     * Should be at least 2-3 times the expected heartbeat interval (typically 41.25s)
     */
    heartbeatTimeout: z.number().int().positive().default(45000),

    /**
     * Whether to automatically reconnect failed shards (default: true)
     * If false, shards will remain disconnected until manually reconnected
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
 * Responsible for:
 * - Creating and managing multiple Gateway connections (shards)
 * - Distributing guilds across shards according to Discord's sharding formula
 * - Handling rate limits for identify operations
 * - Monitoring shard health and handling reconnections
 *
 * @example
 * ```ts
 * const manager = new ShardManager(gateway, {
 *   totalShards: "auto",
 *   spawnDelay: 5000
 * });
 *
 * await manager.spawn(100, 16, 2); // guildCount, concurrency, recommendedShards
 * ```
 */
export class ShardManager {
  /** Map of shards by shard ID */
  #shards = new Map<number, ShardData>();

  /** Maximum concurrent identifies allowed by Discord */
  #maxConcurrency = 1;

  /** Interval for health checks */
  #healthCheckInterval: NodeJS.Timeout | null = null;

  /** Map of shard IDs to session IDs for resumption */
  #sessionMap = new Map<number, string>();

  /** Reference to the parent Gateway */
  readonly #gateway: Gateway;

  /** Sharding configuration options */
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
   */
  get totalShards(): number {
    return this.#shards.size;
  }

  /**
   * Gets Discord's max_concurrency value for identify operations
   *
   * This determines how many shards can be started concurrently
   * within a rate limit window.
   */
  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  /**
   * Gets all active shards as a read-only array
   */
  get shards(): readonly ShardData[] {
    return Array.from(this.#shards.values());
  }

  /**
   * Checks if sharding is enabled and required
   *
   * Sharding is considered enabled if any of these conditions are met:
   * - totalShards is explicitly configured
   * - Guild count exceeds the largeThreshold
   * - Force option is enabled
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
   * Respects Discord's max_concurrency parameter by grouping shards into buckets
   * and spawning them with appropriate delays to prevent rate limiting.
   *
   * @param guildCount - Current number of guilds the bot is in
   * @param maxConcurrency - Discord's maximum concurrency parameter
   * @param recommendedShards - Discord's recommended number of shards
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
   * waiting for rate limits to reset if necessary.
   *
   * @returns A tuple containing [shardId, totalShards]
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
   * @param guildId - Discord guild (server) ID
   * @returns The shard ID this guild belongs to
   */
  calculateShardId(guildId: string): number {
    if (this.#shards.size === 0) {
      return 0;
    }

    // Discord's sharding algorithm
    return Number(BigInt(guildId) >> BigInt(22)) % this.#shards.size;
  }

  /**
   * Adds a guild to its appropriate shard
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
   * Discord places all DMs in shard 0
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
   * @param shardId - The shard ID to get info for
   * @returns The shard data or undefined if not found
   */
  getShardInfo(shardId: number): Readonly<ShardData> | undefined {
    return this.#shards.get(shardId);
  }

  /**
   * Gets the shard responsible for a specific guild
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
   * Handles status transitions and emits appropriate events based
   * on the new status.
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
   * @param shardId - The shard ID
   * @returns The rate limit bucket ID
   */
  getRateLimitKey(shardId: number): number {
    return shardId % this.#maxConcurrency;
  }

  /**
   * Validates that sharding conditions are correct before spawning
   *
   * @param guildCount - Current number of guilds
   * @returns True if sharding should proceed
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
   * Calculates the total number of shards to use
   *
   * @param guildCount - Current number of guilds
   * @param recommendedShards - Discord's recommended shard count
   * @returns The number of shards to spawn
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
   * Groups shards into rate limit buckets
   *
   * @param totalShards - Total number of shards
   * @returns Map of bucket IDs to arrays of shard IDs
   * @private
   */
  #createShardBuckets(totalShards: number): Map<number, number[]> {
    const buckets = new Map<number, number[]>();
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
   * Spawns shards in their rate limit buckets
   *
   * Respects rate limits by spawning in chunks according to Discord's guidelines.
   * Buckets are spawned in order as recommended by Discord documentation.
   *
   * @param buckets - Map of bucket IDs to arrays of shard IDs
   * @param totalShards - Total number of shards
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
        this.#initializeShard(shardId, totalShards, bucketId);
      }

      // Wait after each bucket except the last one
      const isLastBucket =
        orderedBuckets.findIndex(([id]) => id === bucketId) ===
        orderedBuckets.length - 1;

      if (!isLastBucket) {
        await sleep(this.#options.spawnDelay);
      }
    }
  }

  /**
   * Initializes a single shard
   *
   * @param shardId - The shard ID to initialize
   * @param totalShards - Total number of shards
   * @param bucketId - The rate limit bucket ID
   * @private
   */
  #initializeShard(
    shardId: number,
    totalShards: number,
    bucketId: number,
  ): void {
    // Create the shard data structure
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

  /**
   * Handles events and actions when a shard's status changes
   *
   * @param shardId - The shard ID
   * @param shard - The shard data
   * @param oldStatus - Previous status
   * @param newStatus - New status
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

          const sessionId = this.#gateway.sessionId;
          if (sessionId) {
            // Store session ID for potential resumption
            this.#sessionMap.set(shardId, sessionId);
          }

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
        const sessionId =
          this.#sessionMap.get(shardId) || this.#gateway.sessionId;
        if (!sessionId) {
          throw new Error(`Cannot resume shard ${shardId} without session ID`);
        }

        this.#gateway.emit("shardResume", {
          timestamp: new Date().toISOString(),
          shardId,
          totalShards: shard.totalShards,
          sessionId,
        });
        break;
      }

      default:
        // Handle other statuses if needed
        break;
    }
  }

  /**
   * Runs health checks on all shards
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
   * Attempts to find a shard that isn't rate limited
   *
   * @returns A tuple of [shardId, totalShards] or null if none available
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

        return [shardId, shard.totalShards];
      }
    }

    return null;
  }

  /**
   * Waits for any rate limit bucket to become available
   *
   * @private
   */
  async #waitForAvailableBucket(): Promise<void> {
    // Find the next rate limit reset time
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

    this.#resetExpiredRateLimits();
  }

  /**
   * Resets rate limits for buckets that have reached their reset time
   *
   * @private
   */
  #resetExpiredRateLimits(): void {
    const now = Date.now();
    const newResetTime = now + DEFAULT_RATE_LIMIT.WINDOW_DURATION_MS;

    for (const shard of this.#shards.values()) {
      if (shard.rateLimit.reset <= now) {
        shard.rateLimit.remaining =
          DEFAULT_RATE_LIMIT.MAX_IDENTIFIES_PER_MINUTE;
        shard.rateLimit.reset = newResetTime;
      }
    }
  }

  /**
   * Calculates the total number of guilds across all shards
   *
   * @private
   */
  #calculateTotalGuildCount(): number {
    return Array.from(this.#shards.values()).reduce(
      (acc, shard) => acc + shard.guildCount,
      0,
    );
  }
}
