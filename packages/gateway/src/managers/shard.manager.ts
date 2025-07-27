import { type Snowflake, sleep } from "@nyxojs/core";
import { z } from "zod";
import type { Gateway } from "../core/index.js";

/**
 * Possible states for a Discord Gateway shard connection.
 * Each state represents a specific phase in the shard lifecycle.
 *
 * @public
 */
export type ShardStatus = "disconnected" | "connecting" | "ready" | "resuming";

/**
 * Core data structure representing a Discord Gateway shard.
 * Contains status information, guild assignments, and operational metrics.
 *
 * @public
 */
export interface ShardData {
  /**
   * Unique identifier for this shard.
   * Zero-based index in the shard configuration.
   */
  shardId: number;

  /**
   * Total number of shards in current configuration.
   * Used for Discord's sharding formula calculations.
   */
  totalShards: number;

  /**
   * Number of guilds assigned to this shard.
   * Updated as guilds are added or removed.
   */
  guildCount: number;

  /**
   * Set of guild IDs managed by this shard.
   * Contains all guilds assigned using Discord's sharding formula.
   */
  guilds: Set<Snowflake>;

  /**
   * Current connection status.
   * Reflects the shard's position in connection lifecycle.
   */
  status: ShardStatus;

  /**
   * Rate limit bucket ID for this shard.
   * Calculated as shardId % maxConcurrency.
   */
  bucket: number;

  /**
   * Timestamp when this shard was last updated.
   * Used for health monitoring and staleness detection.
   */
  lastUpdated: number;

  /**
   * Number of consecutive reconnection attempts.
   * Reset to zero on successful connection.
   */
  reconnectAttempts: number;

  /**
   * Timestamp when shard became ready.
   * Null if shard has never been ready.
   */
  readyAt: number | null;
}

/**
 * Health metrics for a shard.
 * Provides comprehensive status information for monitoring.
 *
 * @public
 */
export interface ShardHealthMetrics {
  /**
   * Unique shard identifier.
   */
  shardId: number;

  /**
   * Current connection status.
   */
  status: ShardStatus;

  /**
   * Uptime in milliseconds since last ready state.
   */
  uptime: number;

  /**
   * Number of guilds currently managed by this shard.
   */
  guildCount: number;

  /**
   * Number of consecutive reconnection attempts.
   */
  reconnectAttempts: number;

  /**
   * Whether shard is considered healthy.
   */
  isHealthy: boolean;

  /**
   * Timestamp of last activity or update.
   */
  lastSeen: number;
}

/**
 * Configuration options for Discord Gateway sharding.
 * Controls how shards are created, distributed, and managed.
 *
 * @public
 */
export const ShardOptions = z.object({
  /**
   * Total number of shards to use.
   * Can be a number, "auto", or undefined for auto-determination.
   */
  totalShards: z
    .union([z.number().int().positive(), z.literal("auto")])
    .optional(),

  /**
   * List of specific shard IDs to spawn.
   * When provided, only spawns the specified shards.
   */
  shardList: z.array(z.number().int().nonnegative()).optional(),

  /**
   * Delay between spawning each shard bucket in milliseconds.
   * Prevents rate limiting during startup.
   *
   * @default 5000
   */
  spawnDelay: z.number().int().positive().default(5000),

  /**
   * Threshold for enabling sharding based on guild count.
   * Sharding is enabled when guild count exceeds this value.
   *
   * @default 2500
   */
  largeThreshold: z.number().int().positive().default(2500),

  /**
   * Whether to force sharding even if not recommended.
   * Overrides automatic sharding decisions.
   *
   * @default false
   */
  force: z.boolean().default(false),

  /**
   * Whether to automatically reconnect failed shards.
   * When false, manual reconnection is required.
   *
   * @default true
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Maximum reconnection attempts before giving up.
   * Prevents infinite reconnection loops.
   *
   * @default 5
   */
  maxReconnectAttempts: z.number().int().positive().default(5),

  /**
   * Base delay for exponential backoff in milliseconds.
   * Starting point for reconnection delay calculations.
   *
   * @default 1000
   */
  reconnectBaseDelay: z.number().int().positive().default(1000),
});

export type ShardOptions = z.infer<typeof ShardOptions>;

/**
 * Coordinates Discord Gateway connections across multiple shards.
 * Manages shard creation, guild distribution, and health monitoring.
 *
 * @example
 * ```typescript
 * const shardManager = new ShardManager(gateway, {
 *   totalShards: "auto",
 *   autoReconnect: true
 * });
 *
 * await shardManager.spawn(3000, 1, 4);
 * console.log(`Managing ${shardManager.totalShards} shards`);
 * ```
 *
 * @public
 */
export class ShardManager {
  /**
   * Discord's max_concurrency value for identify operations.
   * Determines concurrent shard startup limit.
   *
   * @public
   */
  maxConcurrency = 1;

  /**
   * Internal map storing all shard instances by ID.
   *
   * @internal
   */
  #shards = new Map<number, ShardData>();

  /**
   * Reference to parent Gateway instance.
   *
   * @readonly
   * @internal
   */
  readonly #gateway: Gateway;

  /**
   * Sharding configuration options.
   *
   * @readonly
   * @internal
   */
  readonly #options: ShardOptions;

  /**
   * Creates a new ShardManager instance.
   * Initializes shard management with specified configuration.
   *
   * @param gateway - Parent Gateway instance handling WebSocket connections
   * @param options - Configuration options for sharding behavior
   *
   * @example
   * ```typescript
   * const shardManager = new ShardManager(gateway, {
   *   totalShards: 4,
   *   spawnDelay: 5000,
   *   autoReconnect: true
   * });
   * ```
   *
   * @public
   */
  constructor(gateway: Gateway, options: ShardOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Total number of shards currently managed.
   * Returns count of active shard instances.
   *
   * @returns Number of managed shards
   *
   * @public
   */
  get totalShards(): number {
    return this.#shards.size;
  }

  /**
   * All active shards as read-only array.
   * Provides safe access to shard data.
   *
   * @returns Read-only array of shard data
   *
   * @public
   */
  get shards(): ShardData[] {
    return [...this.#shards.values()];
  }

  /**
   * Health metrics for all shards.
   * Provides comprehensive status information for monitoring.
   *
   * @returns Array of health metrics for each shard
   *
   * @public
   */
  get shardHealthMetrics(): ShardHealthMetrics[] {
    const now = Date.now();

    return this.shards.map((shard) => ({
      shardId: shard.shardId,
      status: shard.status,
      uptime: shard.readyAt ? now - shard.readyAt : 0,
      guildCount: shard.guildCount,
      reconnectAttempts: shard.reconnectAttempts,
      isHealthy: this.#isShardHealthy(shard, now),
      lastSeen: shard.lastUpdated,
    }));
  }

  /**
   * Spawns required number of shards based on Discord recommendations.
   * Creates and initializes shards with proper rate limiting.
   *
   * @param guildCount - Current number of guilds the bot is in
   * @param maxConcurrency - Discord's maximum concurrency parameter
   * @param recommendedShards - Discord's recommended number of shards
   *
   * @throws {Error} If shard list contains invalid shard IDs
   *
   * @example
   * ```typescript
   * await shardManager.spawn(3000, 1, 4);
   * console.log("Shards spawned successfully");
   * ```
   *
   * @public
   */
  async spawn(
    guildCount: number,
    maxConcurrency: number,
    recommendedShards: number,
  ): Promise<void> {
    if (!this.isEnabled(guildCount)) {
      return;
    }

    const totalShards = this.#calculateTotalShards(
      guildCount,
      recommendedShards,
    );
    this.maxConcurrency = maxConcurrency;

    if (this.#options.shardList) {
      const maxShardId = Math.max(...this.#options.shardList);
      if (maxShardId >= totalShards) {
        throw new Error(
          `Shard list contains invalid shard IDs (max: ${maxShardId}, total: ${totalShards})`,
        );
      }
    }

    await this.#spawnShards(totalShards);
  }

  /**
   * Gets the next available shard for connection.
   * Returns first shard that needs to connect.
   *
   * @returns Promise resolving to [shardId, totalShards] tuple
   *
   * @throws {Error} If no available shards for connection
   *
   * @example
   * ```typescript
   * const [shardId, totalShards] = await shardManager.getAvailableShard();
   * console.log(`Connecting shard ${shardId}/${totalShards}`);
   * ```
   *
   * @public
   */
  async getAvailableShard(): Promise<[number, number]> {
    const availableShard = this.shards.find(
      (shard) => shard.status === "disconnected",
    );

    if (!availableShard) {
      throw new Error("No available shards for connection");
    }

    this.setShardStatus(availableShard.shardId, "connecting");
    return [availableShard.shardId, availableShard.totalShards];
  }

  /**
   * Destroys all shards and cleans up resources.
   * Marks all shards as disconnected and clears state.
   *
   * @example
   * ```typescript
   * shardManager.destroy();
   * console.log("All shards destroyed");
   * ```
   *
   * @public
   */
  destroy(): void {
    for (const [shardId] of this.#shards.entries()) {
      this.setShardStatus(shardId, "disconnected");
    }

    this.#shards.clear();
  }

  /**
   * Calculates which shard a guild belongs to using Discord's formula.
   * Uses Discord's algorithm: (guild_id >> 22) % num_shards.
   *
   * @param guildId - Discord guild ID
   * @returns The shard ID this guild belongs to
   *
   * @example
   * ```typescript
   * const shardId = shardManager.calculateShardId("123456789012345678");
   * console.log(`Guild belongs to shard ${shardId}`);
   * ```
   *
   * @public
   */
  calculateShardId(guildId: string): number {
    if (this.totalShards === 0) {
      return 0;
    }

    return Number(BigInt(guildId) >> BigInt(22)) % this.totalShards;
  }

  /**
   * Adds a guild to its appropriate shard.
   * Calculates shard assignment and updates guild tracking.
   *
   * @param guildId - Discord guild ID to add
   *
   * @throws {Error} If target shard is not found
   *
   * @example
   * ```typescript
   * shardManager.addGuildToShard("123456789012345678");
   * ```
   *
   * @public
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
   * Removes a guild from its shard.
   * Updates guild tracking and shard statistics.
   *
   * @param guildId - Discord guild ID to remove
   *
   * @throws {Error} If target shard is not found
   *
   * @example
   * ```typescript
   * shardManager.removeGuildFromShard("123456789012345678");
   * ```
   *
   * @public
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
   * Adds multiple guilds to a shard at once.
   * More efficient than individual adds for bulk operations.
   *
   * @param shardId - The shard ID to add guilds to
   * @param guildIds - Array of guild IDs to add
   *
   * @throws {Error} If target shard is not found
   *
   * @example
   * ```typescript
   * shardManager.addGuildsToShard(0, ["123456", "789012", "345678"]);
   * ```
   *
   * @public
   */
  addGuildsToShard(shardId: number, guildIds: Snowflake[]): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    for (const guildId of guildIds) {
      shard.guilds.add(guildId);
    }

    shard.guildCount = shard.guilds.size;
    shard.lastUpdated = Date.now();
  }

  /**
   * Checks if a shard handles direct messages.
   * Direct messages are always handled by shard 0.
   *
   * @param shardId - The shard ID to check
   * @returns True if this shard handles DMs
   *
   * @example
   * ```typescript
   * if (shardManager.isDmShard(0)) {
   *   console.log("Shard 0 handles DMs");
   * }
   * ```
   *
   * @public
   */
  isDmShard(shardId: number): boolean {
    return shardId === 0;
  }

  /**
   * Gets information about a specific shard.
   * Returns complete shard data for monitoring and debugging.
   *
   * @param shardId - The shard ID to get info for
   * @returns The shard data or undefined if not found
   *
   * @example
   * ```typescript
   * const shard = shardManager.getShardInfo(0);
   * if (shard) {
   *   console.log(`Shard 0 has ${shard.guildCount} guilds`);
   * }
   * ```
   *
   * @public
   */
  getShardInfo(shardId: number): Readonly<ShardData> | undefined {
    return this.#shards.get(shardId);
  }

  /**
   * Gets the shard responsible for a specific guild.
   * Calculates shard assignment and returns shard data.
   *
   * @param guildId - Discord guild ID
   * @returns The shard data or undefined if not found
   *
   * @example
   * ```typescript
   * const shard = shardManager.getShardByGuildId("123456789012345678");
   * console.log(`Guild is on shard ${shard?.shardId}`);
   * ```
   *
   * @public
   */
  getShardByGuildId(guildId: string): Readonly<ShardData> | undefined {
    const shardId = this.calculateShardId(guildId);
    return this.getShardInfo(shardId);
  }

  /**
   * Updates a shard's connection status and emits status change event.
   * Handles status transitions and maintains shard state.
   *
   * @param shardId - The shard ID to update
   * @param status - The new status to set
   *
   * @throws {Error} If target shard is not found
   *
   * @example
   * ```typescript
   * shardManager.setShardStatus(0, "ready");
   * ```
   *
   * @public
   */
  setShardStatus(shardId: number, status: ShardStatus): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    const oldStatus = shard.status;
    if (status === oldStatus) {
      return;
    }

    shard.status = status;
    shard.lastUpdated = Date.now();

    if (status === "ready") {
      shard.readyAt = Date.now();
      shard.reconnectAttempts = 0;
    } else if (status === "disconnected") {
      shard.readyAt = null;
    }

    this.#gateway.emit("shardStatusChange", {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards: shard.totalShards,
      oldStatus,
      newStatus: status,
      guildCount: shard.guildCount,
      reconnectAttempts: shard.reconnectAttempts,
    });
  }

  /**
   * Attempts to reconnect a disconnected shard with exponential backoff.
   * Implements intelligent reconnection strategy with retry limits.
   *
   * @param shardId - The shard ID to reconnect
   *
   * @throws {Error} If target shard is not found
   *
   * @example
   * ```typescript
   * await shardManager.reconnectShard(0);
   * ```
   *
   * @public
   */
  async reconnectShard(shardId: number): Promise<void> {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    if (shard.status === "connecting" || shard.status === "resuming") {
      return;
    }

    if (shard.reconnectAttempts >= this.#options.maxReconnectAttempts) {
      return;
    }

    const delay = this.#calculateBackoffDelay(shard.reconnectAttempts);
    if (delay > 0) {
      await sleep(delay);
    }

    shard.reconnectAttempts++;

    const sessionId = this.#gateway.sessionId;
    if (sessionId && this.#gateway.session.canResume) {
      this.setShardStatus(shardId, "resuming");
    } else {
      this.setShardStatus(shardId, "connecting");
    }
  }

  /**
   * Calculates rate limit bucket for a shard.
   * Returns bucket ID using shardId % maxConcurrency formula.
   *
   * @param shardId - The shard ID
   * @returns The rate limit bucket ID
   *
   * @example
   * ```typescript
   * const bucket = shardManager.getRateLimitKey(5);
   * console.log(`Shard 5 uses bucket ${bucket}`);
   * ```
   *
   * @public
   */
  getRateLimitKey(shardId: number): number {
    return shardId % this.maxConcurrency;
  }

  /**
   * Checks if sharding should be enabled based on configuration and guild count.
   * Evaluates sharding requirements and configuration options.
   *
   * @param externalGuildCount - Current number of guilds (optional)
   * @returns True if sharding should be enabled
   *
   * @example
   * ```typescript
   * if (shardManager.isEnabled(3000)) {
   *   console.log("Sharding is required");
   * }
   * ```
   *
   * @public
   */
  isEnabled(externalGuildCount?: number): boolean {
    const guildCount = externalGuildCount ?? this.#calculateTotalGuildCount();
    const isShardingRequired = guildCount >= this.#options.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;

    if (this.#options.force && hasConfiguredShards) {
      return true;
    }

    if (!isShardingRequired) {
      return false;
    }

    return isShardingRequired;
  }

  /**
   * Determines optimal number of shards to use.
   * Considers configuration options and Discord recommendations.
   *
   * @param guildCount - Current guild count
   * @param recommendedShards - Discord's recommended shard count
   * @returns Number of shards to create
   *
   * @internal
   */
  #calculateTotalShards(guildCount: number, recommendedShards: number): number {
    if (this.#options.totalShards === "auto") {
      return recommendedShards;
    }

    if (typeof this.#options.totalShards === "number") {
      return this.#options.totalShards;
    }

    if (this.#options.force) {
      return Math.max(1, recommendedShards);
    }

    const minimumShards = Math.ceil(guildCount / this.#options.largeThreshold);
    return Math.max(1, minimumShards);
  }

  /**
   * Creates and initializes all shards with proper bucket distribution.
   * Implements rate limiting by grouping shards into buckets.
   *
   * @param totalShards - Total number of shards to create
   *
   * @internal
   */
  async #spawnShards(totalShards: number): Promise<void> {
    const shardIds =
      this.#options.shardList ??
      Array.from({ length: totalShards }, (_, i) => i);

    const buckets = new Map<number, number[]>();
    for (const shardId of shardIds) {
      const bucketId = this.getRateLimitKey(shardId);
      if (!buckets.has(bucketId)) {
        buckets.set(bucketId, []);
      }
      buckets.get(bucketId)?.push(shardId);
    }

    const orderedBuckets = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );

    for (let i = 0; i < orderedBuckets.length; i++) {
      const [bucketId, bucketShardIds] = orderedBuckets[i] as [
        number,
        number[],
      ];

      for (const shardId of bucketShardIds) {
        this.#shards.set(shardId, {
          shardId,
          totalShards,
          guildCount: 0,
          guilds: new Set(),
          status: "disconnected",
          bucket: bucketId,
          lastUpdated: Date.now(),
          reconnectAttempts: 0,
          readyAt: null,
        });
      }

      if (i < orderedBuckets.length - 1) {
        await sleep(this.#options.spawnDelay);
      }
    }
  }

  /**
   * Calculates exponential backoff delay for reconnection attempts.
   * Implements jitter to prevent thundering herd effects.
   *
   * @param attempt - Current attempt number (0-based)
   * @returns Delay in milliseconds
   *
   * @internal
   */
  #calculateBackoffDelay(attempt: number): number {
    const baseDelay = this.#options.reconnectBaseDelay;
    const maxDelay = 30000;

    const exponentialDelay = baseDelay * 2 ** attempt;
    const jitter = Math.random() * 0.1 * exponentialDelay;

    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Determines if a shard is considered healthy.
   * Evaluates shard status, reconnection attempts, and activity.
   *
   * @param shard - The shard to check
   * @param now - Current timestamp
   * @returns True if the shard is healthy
   *
   * @internal
   */
  #isShardHealthy(shard: ShardData, now: number): boolean {
    const maxIdleTime = 300000; // 5 minutes
    const maxReconnectAttempts = 3;

    return (
      shard.status === "ready" &&
      shard.reconnectAttempts < maxReconnectAttempts &&
      now - shard.lastUpdated < maxIdleTime
    );
  }

  /**
   * Computes total number of guilds managed across all shards.
   * Aggregates guild counts from all active shards.
   *
   * @returns Combined guild count from all shards
   *
   * @internal
   */
  #calculateTotalGuildCount(): number {
    return this.shards.reduce((acc, shard) => acc + shard.guildCount, 0);
  }
}
