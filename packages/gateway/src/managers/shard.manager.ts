import { setTimeout } from "node:timers/promises";
import { Store } from "@nyxjs/store";
import type { Gateway } from "../core/index.js";
import type { ShardOptions } from "../options/index.js";
import type {
  SessionLimitUpdateEvent,
  ShardCreateEvent,
  ShardDisconnectEvent,
  ShardGuildAddEvent,
  ShardGuildRemoveEvent,
  ShardRateLimitEvent,
  ShardReadyEvent,
  ShardReconnectEvent,
} from "../types/index.js";

/**
 * Possible states for a shard connection
 */
export type ShardStatus =
  | "disconnected" // Shard is not connected
  | "connecting" // Shard is in the process of connecting
  | "ready" // Shard is connected and ready
  | "resuming" // Shard is resuming a previous session
  | "reconnecting"; // Shard is attempting to reconnect

/**
 * Default rate limit values for shard buckets
 */
const DEFAULT_RATE_LIMIT = {
  /**
   * Default number of identify requests allowed per minute
   */
  MAX_IDENTIFIES_PER_MINUTE: 120,

  /**
   * Duration in milliseconds for rate limit window
   */
  WINDOW_DURATION_MS: 60_000,
};

/**
 * Data structure representing a shard
 */
export interface ShardData {
  /** Unique identifier for this shard */
  shardId: number;

  /** Total number of shards being used */
  totalShards: number;

  /** Number of guilds in this shard */
  guildCount: number;

  /** Set of guild IDs in this shard */
  guilds: Set<string>;

  /** Current connection status */
  status: ShardStatus;

  /** Rate limit bucket ID */
  bucket: number;

  /** Rate limit information */
  rateLimit: {
    /** Number of identify requests remaining in this window */
    remaining: number;

    /** Timestamp when the rate limit resets */
    reset: number;
  };
}

/**
 * ShardManager is responsible for managing sharded Gateway connections
 *
 * This class handles shard creation, tracking, and management, including:
 * - Coordinating shard spawning
 * - Assigning guilds to appropriate shards
 * - Managing rate limits for identify requests
 * - Tracking shard connection status
 */
export class ShardManager {
  /** Map of shards by shard ID */
  #shards = new Store<number, ShardData>();

  /** Maximum number of concurrent identifies allowed */
  #maxConcurrency = 1;

  /** Reference to the parent Gateway */
  readonly #gateway: Gateway;

  /** Sharding configuration options */
  readonly #options: ShardOptions;

  /**
   * Creates a new ShardManager
   *
   * @param gateway - The parent Gateway instance
   * @param options - Sharding configuration options
   */
  constructor(gateway: Gateway, options: ShardOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Gets the total number of shards
   */
  get totalShards(): number {
    return this.#shards.size;
  }

  /**
   * Gets the maximum concurrency for identify requests
   *
   * This value is provided by Discord during the Gateway bot info request.
   */
  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  /**
   * Checks if sharding is enabled
   *
   * Sharding is enabled if either:
   * - totalShards is explicitly configured in the options
   * - The guild count exceeds the largeThreshold
   */
  isEnabled(): boolean {
    const totalGuildCount = this.#calculateTotalGuildCount();
    return (
      Boolean(this.#options.totalShards) ||
      totalGuildCount >= this.#options.largeThreshold ||
      this.#options.force === true
    );
  }

  /**
   * Spawns the required number of shards based on guild count and Discord recommendations
   *
   * @param guildCount - Current number of guilds the bot is in
   * @param maxConcurrency - Maximum concurrency value from Discord
   * @param recommendedShards - Discord's recommended number of shards
   * @throws {Error} If the shard configuration is invalid
   */
  async spawn(
    guildCount: number,
    maxConcurrency: number,
    recommendedShards: number,
  ): Promise<void> {
    if (!this.#validateSpawnConditions(guildCount, recommendedShards)) {
      return;
    }

    const totalShards = this.#calculateTotalShards(
      guildCount,
      recommendedShards,
    );
    this.#maxConcurrency = maxConcurrency;

    this.#handleLargeBotRequirements(
      guildCount,
      totalShards,
      recommendedShards,
    );
    await this.#spawnShards(totalShards);
  }

  /**
   * Gets the next available shard for connection
   *
   * This method handles rate limits and returns the first available shard,
   * waiting for rate limits to reset if necessary.
   *
   * @returns A tuple of [shardId, totalShards]
   */
  async getAvailableShard(): Promise<[number, number]> {
    let attempts = 0;

    for (const [shardId, shard] of this.#shards.entries()) {
      if (this.isShardBucketAvailable(shard.bucket)) {
        if (shard.status === "reconnecting") {
          const reconnectEvent: ShardReconnectEvent = {
            timestamp: new Date().toISOString(),
            shardId,
            totalShards: shard.totalShards,
            attemptNumber: ++attempts,
            delayMs: this.#options.spawnDelay,
          };
          this.#gateway.emit("shardReconnect", reconnectEvent);
        }

        shard.rateLimit.remaining--;
        this.setShardStatus(shardId, "connecting");
        return [shardId, shard.totalShards];
      }
    }

    await this.#waitForAvailableBucket();
    return this.getAvailableShard();
  }

  /**
   * Adds a guild to the appropriate shard
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
    const newGuildCount = shard.guilds.size;
    shard.guildCount = newGuildCount;

    const guildAddEvent: ShardGuildAddEvent = {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards: shard.totalShards,
      guildId,
      newGuildCount,
    };
    this.#gateway.emit("shardGuildAdd", guildAddEvent);
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
    const newGuildCount = shard.guilds.size;
    shard.guildCount = newGuildCount;

    const guildRemoveEvent: ShardGuildRemoveEvent = {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards: shard.totalShards,
      guildId,
      newGuildCount,
    };
    this.#gateway.emit("shardGuildRemove", guildRemoveEvent);
  }

  /**
   * Adds multiple guilds to a shard at once
   *
   * @param shardId - The shard ID to add guilds to
   * @param guildIds - Array of guild IDs to add
   * @throws {Error} If the shard doesn't exist
   */
  addGuildsToShard(shardId: number, guildIds: string[]): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    // Use Set operations for better performance with large guild counts
    const existingSize = shard.guilds.size;

    // Add all guilds at once
    for (const guildId of guildIds) {
      shard.guilds.add(guildId);
    }

    // Update the count after all additions
    const newGuildCount = shard.guilds.size;
    shard.guildCount = newGuildCount;

    // Only emit an event if guilds were actually added
    const addedCount = newGuildCount - existingSize;
    if (addedCount > 0 && addedCount < 100) {
      for (const guildId of guildIds) {
        if (!shard.guilds.has(guildId)) {
          continue;
        }

        const guildAddEvent: ShardGuildAddEvent = {
          timestamp: new Date().toISOString(),
          shardId,
          totalShards: shard.totalShards,
          guildId,
          newGuildCount,
        };
        this.#gateway.emit("shardGuildAdd", guildAddEvent);
      }
    }
  }

  /**
   * Calculates which shard a guild belongs to
   *
   * Uses Discord's sharding formula: (guild_id >> 22) % num_shards
   *
   * @param guildId - Discord guild ID
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
   * Calculates the rate limit bucket for a shard
   *
   * @param shardId - The shard ID
   * @returns The rate limit bucket ID
   */
  getRateLimitKey(shardId: number): number {
    return shardId % this.#maxConcurrency;
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

    // Only emit events when the status actually changes
    if (status === oldStatus) {
      return;
    }

    // Handle status-specific events
    if (status === "disconnected" && oldStatus !== "disconnected") {
      const disconnectEvent: ShardDisconnectEvent = {
        timestamp: new Date().toISOString(),
        shardId,
        totalShards: shard.totalShards,
        code: 1006, // Default WebSocket close code for abnormal closure
        reason: "Connection closed",
        wasClean: false,
      };
      this.#gateway.emit("shardDisconnect", disconnectEvent);
    }

    if (status === "resuming") {
      const sessionId = this.#gateway.sessionId;
      if (!sessionId) {
        throw new Error(`Cannot resume shard ${shardId} without session ID`);
      }

      const resumeEvent: ShardReadyEvent = {
        timestamp: new Date().toISOString(),
        shardId,
        totalShards: shard.totalShards,
        sessionId,
        latency: this.#gateway.heartbeat.latency,
        guildCount: shard.guildCount,
      };
      this.#gateway.emit("shardReady", resumeEvent);
    }
  }

  /**
   * Checks if a shard handles DM messages
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
   * Cleans up all shards and resources
   *
   * Should be called when shutting down the connection.
   */
  destroy(): void {
    for (const [shardId] of this.#shards.entries()) {
      this.setShardStatus(shardId, "disconnected");
    }

    this.#shards.clear();
  }

  /**
   * Checks if a specific rate limit bucket has available capacity
   *
   * @param bucket - The rate limit bucket ID
   * @returns True if identifies are available in this bucket
   */
  isShardBucketAvailable(bucket: number): boolean {
    const shardsInBucket = Array.from(this.#shards.values()).filter(
      (shard) => shard.bucket === bucket,
    );

    return shardsInBucket.some((shard) => shard.rateLimit.remaining > 0);
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

    // Emit rate limit events for shards that are rate limited
    for (const shard of this.#shards.values()) {
      if (shard.rateLimit.remaining === 0) {
        const rateLimitEvent: ShardRateLimitEvent = {
          timestamp: new Date().toISOString(),
          shardId: shard.shardId,
          totalShards: shard.totalShards,
          bucket: shard.bucket,
          timeout: nextReset - Date.now(),
          remaining: 0,
          reset: nextReset,
        };
        this.#gateway.emit("shardRateLimit", rateLimitEvent);
      }
    }

    // Calculate delay until next reset
    const delay = Math.max(0, nextReset - Date.now());

    // Wait for the rate limit to reset
    if (delay > 0) {
      await setTimeout(delay);
    }

    // Reset rate limits for all shards that have reached their reset time
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

  /**
   * Validates that sharding conditions are correct before spawning
   *
   * @param guildCount - Current number of guilds
   * @param recommendedShards - Discord's recommended shard count
   * @returns True if sharding should proceed
   * @throws {Error} If the recommended shard count is too low
   * @private
   */
  #validateSpawnConditions(
    guildCount: number,
    recommendedShards: number,
  ): boolean {
    const isShardingRequired = guildCount >= this.#options.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;
    const isForced = this.#options.force === true;

    // Skip sharding if not required, not configured, and not forced
    if (!(isShardingRequired || hasConfiguredShards || isForced)) {
      return false;
    }

    // Ensure the recommended shard count is sufficient for our guild count
    const minShards = Math.ceil(guildCount / this.#options.largeThreshold);
    if (
      guildCount >= this.#options.largeThreshold &&
      recommendedShards < minShards
    ) {
      throw new Error(
        `Recommended shard count too low (minimum ${minShards} shards required for ${guildCount} guilds)`,
      );
    }

    return true;
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
    if (this.#options.force === true) {
      return Math.max(1, recommendedShards);
    }

    // Calculate minimum required shards based on guild count
    const minimumShards = Math.ceil(guildCount / this.#options.largeThreshold);
    return Math.max(1, minimumShards);
  }

  /**
   * Applies special requirements for very large bots
   *
   * @param guildCount - Current number of guilds
   * @param totalShards - Total shards being spawned
   * @param recommendedShards - Discord's recommended shard count
   * @throws {Error} If the shard configuration is invalid for a large bot
   * @private
   */
  #handleLargeBotRequirements(
    guildCount: number,
    totalShards: number,
    recommendedShards: number,
  ): void {
    const isLargeBot = guildCount >= this.#options.veryLargeThreshold;

    if (!isLargeBot) {
      return;
    }

    // Large bots require the total shards to be a multiple of the recommended count
    if (totalShards % recommendedShards !== 0) {
      throw new Error(
        `Total shards (${totalShards}) must be a multiple of recommended shards (${recommendedShards}) for large bots with ${guildCount} guilds`,
      );
    }

    // Calculate a higher session limit for large bots
    const oldLimit = this.#options.minSessionLimit;
    const newLimit = Math.max(
      oldLimit,
      Math.ceil((guildCount / 1000) * this.#options.sessionsPerGuilds),
    );

    // Emit the session limit update event
    const sessionLimitEvent: SessionLimitUpdateEvent = {
      timestamp: new Date().toISOString(),
      oldLimit,
      newLimit,
      guildCount,
      totalShards,
      reason: "very_large_bot",
    };

    this.#gateway.emit("sessionLimitUpdate", sessionLimitEvent);
  }

  /**
   * Spawns all required shards
   *
   * @param totalShards - Total number of shards to spawn
   * @private
   */
  async #spawnShards(totalShards: number): Promise<void> {
    if (this.#options.shardList) {
      this.#validateShardList(totalShards);
    }

    const buckets = this.#createShardBuckets(totalShards);
    await this.#spawnShardBuckets(buckets, totalShards);
  }

  /**
   * Validates that the shard list is valid
   *
   * @param totalShards - Total number of shards
   * @throws {Error} If the shard list contains invalid shard IDs
   * @private
   */
  #validateShardList(totalShards: number): void {
    if (!this.#options.shardList) {
      return;
    }

    const maxShardId = Math.max(...this.#options.shardList);
    if (maxShardId >= totalShards) {
      throw new Error(
        `Shard list contains invalid shard IDs (max: ${maxShardId}, total: ${totalShards})`,
      );
    }
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
   * Respects rate limits by spawning in chunks.
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

    // Spawn buckets in chunks of maxConcurrency
    const chunkSize = this.#maxConcurrency;
    for (let i = 0; i < orderedBuckets.length; i += chunkSize) {
      const chunk = orderedBuckets.slice(i, i + chunkSize);

      // Spawn all buckets in this chunk concurrently
      await Promise.all(
        chunk.map(async ([bucketId, bucketShardIds]) => {
          // Initialize all shards in this bucket concurrently
          await Promise.all(
            bucketShardIds.map((shardId) =>
              this.#initializeShard(shardId, totalShards, bucketId),
            ),
          );
        }),
      );

      // Wait between chunks to respect rate limits
      if (i + chunkSize < orderedBuckets.length) {
        await setTimeout(this.#options.spawnDelay);
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
      rateLimit: {
        remaining: DEFAULT_RATE_LIMIT.MAX_IDENTIFIES_PER_MINUTE,
        reset: Date.now() + DEFAULT_RATE_LIMIT.WINDOW_DURATION_MS,
      },
    });

    // Emit creation event
    const createEvent: ShardCreateEvent = {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards,
      bucket: bucketId,
    };
    this.#gateway.emit("shardCreate", createEvent);
  }
}
