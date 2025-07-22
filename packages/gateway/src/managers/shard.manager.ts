import { type Snowflake, sleep } from "@nyxojs/core";
import { z } from "zod";
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
 * @see {@link https://discord.com/developers/docs/topics/gateway#connections}
 */
export type ShardStatus = "disconnected" | "connecting" | "ready" | "resuming";

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
  /** Unique identifier for this shard (0-based index) */
  shardId: number;

  /** Total number of shards in the current configuration */
  totalShards: number;

  /** Number of guilds assigned to this shard */
  guildCount: number;

  /** Set of guild IDs managed by this shard */
  guilds: Set<Snowflake>;

  /** Current connection status */
  status: ShardStatus;

  /** Rate limit bucket ID (shardId % maxConcurrency) */
  bucket: number;

  /** Timestamp when this shard was last updated */
  lastUpdated: number;

  /** Number of consecutive reconnection attempts */
  reconnectAttempts: number;

  /** Timestamp when the shard became ready (null if never ready) */
  readyAt: number | null;
}

/**
 * Health metrics for a shard
 */
export interface ShardHealthMetrics {
  shardId: number;
  status: ShardStatus;
  uptime: number;
  guildCount: number;
  reconnectAttempts: number;
  isHealthy: boolean;
  lastSeen: number;
}

/**
 * Configuration options for Discord Gateway sharding
 *
 * Controls how shards are created, distributed, and managed.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 */
export const ShardOptions = z.object({
  /**
   * Total number of shards to use
   * - Number: Uses exactly that many shards
   * - "auto": Uses Discord's recommended shard count
   * - undefined: Auto-determines based on guild count
   */
  totalShards: z
    .union([z.number().int().positive(), z.literal("auto")])
    .optional(),

  /**
   * List of specific shard IDs to spawn
   * When provided, only spawns the specified shards
   */
  shardList: z.array(z.number().int().nonnegative()).optional(),

  /**
   * Delay between spawning each shard bucket in milliseconds
   * Prevents rate limiting during startup
   */
  spawnDelay: z.number().int().positive().default(5000),

  /**
   * Threshold for enabling sharding based on guild count
   */
  largeThreshold: z.number().int().positive().default(2500),

  /**
   * Whether to force sharding even if not recommended
   */
  force: z.boolean().default(false),

  /**
   * Whether to automatically reconnect failed shards
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Maximum reconnection attempts before giving up
   */
  maxReconnectAttempts: z.number().int().positive().default(5),

  /**
   * Base delay for exponential backoff (in milliseconds)
   */
  reconnectBaseDelay: z.number().int().positive().default(1000),
});

export type ShardOptions = z.infer<typeof ShardOptions>;

/**
 * ShardManager coordinates Discord Gateway connections across multiple shards
 *
 * Simplified and optimized implementation that focuses on core functionality:
 * - Creating and managing multiple Gateway connections (shards)
 * - Distributing guilds across shards using Discord's formula
 * - Handling shard health monitoring and reconnections
 * - Providing health metrics and status tracking
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 */
export class ShardManager {
  /**
   * Discord's max_concurrency value for identify operations
   * Determines how many shards can be started concurrently
   */
  maxConcurrency = 1;

  /** Internal map storing all shard instances by their shard ID */
  #shards = new Map<number, ShardData>();

  /** Reference to the parent Gateway instance */
  readonly #gateway: Gateway;

  /** Sharding configuration options */
  readonly #options: ShardOptions;

  /**
   * Creates a new ShardManager instance
   *
   * @param gateway - Parent Gateway instance that handles WebSocket connections
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
   * Gets all active shards as a read-only array
   */
  get shards(): ReadonlyArray<Readonly<ShardData>> {
    return Array.from(this.#shards.values());
  }

  /**
   * Gets health metrics for all shards
   *
   * @returns Array of health metrics for each shard
   */
  get shardHealthMetrics(): ShardHealthMetrics[] {
    const now = Date.now();

    return Array.from(this.#shards.values()).map((shard) => ({
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
   * Spawns the required number of shards based on Discord recommendations
   *
   * @param guildCount - Current number of guilds the bot is in
   * @param maxConcurrency - Discord's maximum concurrency parameter
   * @param recommendedShards - Discord's recommended number of shards
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

    // Validate shard list if provided
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
   * Gets the next available shard for connection
   * Returns the first shard that needs to connect
   *
   * @returns Promise resolving to [shardId, totalShards] tuple
   */
  async getAvailableShard(): Promise<[number, number]> {
    // Find first disconnected shard
    const availableShard = Array.from(this.#shards.values()).find(
      (shard) => shard.status === "disconnected",
    );

    if (!availableShard) {
      throw new Error("No available shards for connection");
    }

    // Update status and return shard info
    this.setShardStatus(availableShard.shardId, "connecting");
    return [availableShard.shardId, availableShard.totalShards];
  }

  /**
   * Destroys all shards and cleans up resources
   */
  destroy(): void {
    // Mark all shards as disconnected
    for (const [shardId] of this.#shards.entries()) {
      this.setShardStatus(shardId, "disconnected");
    }

    this.#shards.clear();
  }

  /**
   * Calculates which shard a guild belongs to using Discord's formula
   *
   * @param guildId - Discord guild ID
   * @returns The shard ID this guild belongs to
   */
  calculateShardId(guildId: string): number {
    if (this.#shards.size === 0) {
      return 0;
    }

    // Discord's sharding algorithm: (guild_id >> 22) % num_shards
    return Number(BigInt(guildId) >> BigInt(22)) % this.#shards.size;
  }

  /**
   * Adds a guild to its appropriate shard
   *
   * @param guildId - Discord guild ID to add
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
   * Adds multiple guilds to a shard at once (more efficient than individual adds)
   *
   * @param shardId - The shard ID to add guilds to
   * @param guildIds - Array of guild IDs to add
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
   * Checks if a shard handles direct messages (always shard 0)
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
   * Updates a shard's connection status and emits status change event
   *
   * @param shardId - The shard ID to update
   * @param status - The new status to set
   */
  setShardStatus(shardId: number, status: ShardStatus): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    const oldStatus = shard.status;
    if (status === oldStatus) {
      return; // No change
    }

    // Update shard state
    shard.status = status;
    shard.lastUpdated = Date.now();

    // Special handling for status transitions
    if (status === "ready") {
      shard.readyAt = Date.now();
      shard.reconnectAttempts = 0; // Reset on successful connection
    } else if (status === "disconnected") {
      shard.readyAt = null;
    }

    // Emit unified status change event
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
   * Attempts to reconnect a disconnected shard with exponential backoff
   *
   * @param shardId - The shard ID to reconnect
   */
  async reconnectShard(shardId: number): Promise<void> {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    // Don't reconnect if already connecting or if max attempts reached
    if (shard.status === "connecting" || shard.status === "resuming") {
      return;
    }

    if (shard.reconnectAttempts >= this.#options.maxReconnectAttempts) {
      return; // Give up after max attempts
    }

    // Calculate exponential backoff delay
    const delay = this.#calculateBackoffDelay(shard.reconnectAttempts);
    if (delay > 0) {
      await sleep(delay);
    }

    shard.reconnectAttempts++;

    // Prefer resuming if we have a session, otherwise connect fresh
    const sessionId = this.#gateway.sessionId;
    if (sessionId && this.#gateway.session.canResume) {
      this.setShardStatus(shardId, "resuming");
    } else {
      this.setShardStatus(shardId, "connecting");
    }
  }

  /**
   * Calculates rate limit bucket for a shard (shardId % maxConcurrency)
   *
   * @param shardId - The shard ID
   * @returns The rate limit bucket ID
   */
  getRateLimitKey(shardId: number): number {
    return shardId % this.maxConcurrency;
  }

  /**
   * Checks if sharding should be enabled based on configuration and guild count
   *
   * @param externalGuildCount - Current number of guilds (optional)
   * @returns True if sharding should be enabled
   */
  isEnabled(externalGuildCount?: number): boolean {
    const guildCount = externalGuildCount ?? this.#calculateTotalGuildCount();
    const isShardingRequired = guildCount >= this.#options.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;

    // Force option overrides everything
    if (this.#options.force && hasConfiguredShards) {
      return true;
    }

    // Don't enable sharding if not needed (security check)
    if (!isShardingRequired) {
      return false;
    }

    return isShardingRequired;
  }

  /**
   * Determines the optimal number of shards to use
   *
   * @param guildCount - Current guild count
   * @param recommendedShards - Discord's recommended shard count
   * @returns Number of shards to create
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

    // Calculate minimum required shards based on guild count
    const minimumShards = Math.ceil(guildCount / this.#options.largeThreshold);
    return Math.max(1, minimumShards);
  }

  /**
   * Creates and initializes all shards with proper bucket distribution
   *
   * @param totalShards - Total number of shards to create
   */
  async #spawnShards(totalShards: number): Promise<void> {
    const shardIds =
      this.#options.shardList ??
      Array.from({ length: totalShards }, (_, i) => i);

    // Group shards by rate limit bucket
    const buckets = new Map<number, number[]>();
    for (const shardId of shardIds) {
      const bucketId = this.getRateLimitKey(shardId);
      if (!buckets.has(bucketId)) {
        buckets.set(bucketId, []);
      }
      buckets.get(bucketId)?.push(shardId);
    }

    // Create shards in bucket order with delays between buckets
    const orderedBuckets = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );

    for (let i = 0; i < orderedBuckets.length; i++) {
      const [bucketId, bucketShardIds] = orderedBuckets[i] as [
        number,
        number[],
      ];

      // Create all shards in this bucket
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

      // Wait between buckets (except for the last one)
      if (i < orderedBuckets.length - 1) {
        await sleep(this.#options.spawnDelay);
      }
    }
  }

  /**
   * Calculates exponential backoff delay for reconnection attempts
   *
   * @param attempt - Current attempt number (0-based)
   * @returns Delay in milliseconds
   */
  #calculateBackoffDelay(attempt: number): number {
    const baseDelay = this.#options.reconnectBaseDelay;
    const maxDelay = 30000; // 30 seconds max

    // Exponential backoff: baseDelay * (2^attempt) with jitter
    const exponentialDelay = baseDelay * 2 ** attempt;
    const jitter = Math.random() * 0.1 * exponentialDelay; // ±10% jitter

    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Determines if a shard is considered healthy
   *
   * @param shard - The shard to check
   * @param now - Current timestamp
   * @returns True if the shard is healthy
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
   * Computes the total number of guilds managed across all shards
   *
   * @returns Combined guild count from all shards
   */
  #calculateTotalGuildCount(): number {
    return Array.from(this.#shards.values()).reduce(
      (acc, shard) => acc + shard.guildCount,
      0,
    );
  }
}
