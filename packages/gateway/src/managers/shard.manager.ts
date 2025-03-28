import { setTimeout } from "node:timers/promises";
import type { Snowflake } from "@nyxjs/core";
import type { Gateway } from "../core/index.js";
import type { ShardOptions } from "../options/index.js";

/**
 * Possible states for a shard connection
 */
export type ShardStatus =
  | "disconnected" // Shard is not connected
  | "connecting" // Shard is in the process of connecting
  | "ready" // Shard is connected and ready
  | "resuming" // Shard is resuming a previous session
  | "reconnecting" // Shard is attempting to reconnect
  | "unhealthy"; // Shard is connected but experiencing issues

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

  /** Rate limit bucket ID (based on max_concurrency from Discord) */
  bucket: number;

  /** Time when this shard was last updated */
  lastUpdated: number;

  /** Whether this shard is currently in a scaling operation */
  isScaling: boolean;

  /** Health metrics for this shard */
  health: {
    /** Latency in milliseconds */
    latency: number;

    /** Time when the last successful heartbeat was received */
    lastHeartbeat: number;

    /** Number of failed heartbeats */
    failedHeartbeats: number;
  };

  /** Rate limit information */
  rateLimit: {
    /** Number of identify requests remaining in this window */
    remaining: number;

    /** Timestamp when the rate limit resets */
    reset: number;
  };
}

/**
 * Default rate limit values for shard buckets
 * Based on Discord documentation at https://discord.com/developers/docs/events/gateway#rate-limiting
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
} as const;

/**
 * ShardManager is responsible for managing sharded Gateway connections
 *
 * This class handles shard creation, tracking, and management, including:
 * - Coordinating shard spawning according to Discord's max_concurrency parameter
 * - Assigning guilds to appropriate shards using Discord's sharding formula
 * - Managing rate limits for identify requests
 * - Tracking shard connection status and health
 * - Dynamic scaling of shards
 */
export class ShardManager {
  /** Map of shards by shard ID */
  #shards = new Map<number, ShardData>();

  /** Maximum number of concurrent identifies allowed (from Discord's Gateway Bot endpoint) */
  #maxConcurrency = 1;

  /** Interval for running health checks */
  #healthCheckInterval: NodeJS.Timeout | null = null;

  /** Map of shard IDs to session IDs for resumption */
  #sessionMap = new Map<number, string>();

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
   * It determines how many shards can be started concurrently within a rate limit window.
   */
  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  /**
   * Gets all active shards as an array
   */
  get shards(): readonly ShardData[] {
    return Array.from(this.#shards.values());
  }

  /**
   * Checks if sharding is enabled
   *
   * Sharding is enabled if either:
   * - totalShards is explicitly configured in the options
   * - The guild count exceeds the largeThreshold
   * - Force option is enabled
   */
  isEnabled(): boolean {
    const totalGuildCount = this.#calculateTotalGuildCount();
    return (
      Boolean(this.#options.totalShards) ||
      totalGuildCount >= this.#options.largeThreshold ||
      this.#options.force
    );
  }

  /**
   * Spawns the required number of shards based on guild count and Discord recommendations
   *
   * This method respects Discord's max_concurrency parameter, grouping shards into buckets
   * and spawning them according to rate limits.
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
    if (!this.#validateSpawnConditions(guildCount)) {
      return;
    }

    const totalShards = this.#calculateTotalShards(
      guildCount,
      recommendedShards,
    );
    this.#maxConcurrency = maxConcurrency;

    await this.#spawnShards(totalShards);

    // Start health checks after initial spawn
    this.startHealthChecks();
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
   * Destroys the shard manager and cleans up resources
   */
  destroy(): void {
    // Stop health check interval
    if (this.#healthCheckInterval) {
      clearInterval(this.#healthCheckInterval);
      this.#healthCheckInterval = null;
    }

    // Set all shards to disconnected
    for (const [shardId] of this.#shards.entries()) {
      this.setShardStatus(shardId, "disconnected");
    }

    this.#shards.clear();
    this.#sessionMap.clear();
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
    shard.lastUpdated = Date.now();

    // Only emit events when the status actually changes
    if (status === oldStatus) {
      return;
    }

    this.#handleShardStatusChange(shardId, shard, oldStatus, status);
  }

  /**
   * Configures and starts the health check system
   */
  startHealthChecks(): void {
    // Stop existing interval if running
    if (this.#healthCheckInterval) {
      clearInterval(this.#healthCheckInterval);
    }

    // Start new health check interval
    this.#healthCheckInterval = setInterval(
      () => this.#runHealthChecks(),
      this.#options.healthCheck.interval,
    );
  }

  /**
   * Attempts to revive an unhealthy or disconnected shard
   *
   * @param shardId - The shard ID to revive
   */
  reviveShard(shardId: number): void {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    // Don't try to revive a shard that's already recovering
    if (shard.status === "connecting" || shard.status === "resuming") {
      return;
    }

    // Prefer resuming if we have a session ID
    const sessionId = this.#sessionMap.get(shardId);
    if (sessionId) {
      this.setShardStatus(shardId, "resuming");
    } else {
      this.setShardStatus(shardId, "reconnecting");
    }
  }

  /**
   * Calculates the rate limit bucket for a shard
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
   * Dynamically scales the number of shards up or down
   *
   * @param newTotalShards - New total number of shards to scale to
   * @throws {Error} If scaling fails or times out
   */
  scaleShards(newTotalShards: number): void {
    const currentShardCount = this.#shards.size;

    if (newTotalShards === currentShardCount) {
      return;
    }

    if (newTotalShards > currentShardCount) {
      // Scaling up - spawn new shards
      this.#scaleUp(currentShardCount, newTotalShards);
    } else {
      // Scaling down - remove excess shards
      this.#scaleDown(currentShardCount, newTotalShards);
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
      // Skip shards that are currently in scaling operation
      if (shard.isScaling) {
        continue;
      }

      if (this.isShardBucketAvailable(shard.bucket)) {
        // Emit reconnect event if needed
        if (shard.status === "reconnecting" || shard.status === "unhealthy") {
          this.#gateway.emit("reconnectionScheduled", {
            timestamp: new Date().toISOString(),
            delayMs: this.#options.spawnDelay,
            reason:
              shard.status === "unhealthy"
                ? "heartbeat_timeout"
                : "connection_closed",
            previousAttempts: 0, // Could track this in shard data
          });
        }

        shard.rateLimit.remaining--;
        this.setShardStatus(shardId, "connecting");

        // Remember the time we last updated this shard
        shard.lastUpdated = Date.now();

        return [shardId, shard.totalShards];
      }
    }

    return null;
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
            willReconnect: this.#options.healthCheck.autoRevive,
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
            // Store session ID for this shard for potential resumption later
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

        this.#gateway.emit("reconnectionScheduled", {
          timestamp: new Date().toISOString(),
          delayMs: this.#options.spawnDelay,
          reason: "invalid_session",
          previousAttempts: 0, // Could track this in shard data
        });
        break;
      }

      case "unhealthy":
        if (this.#options.healthCheck.autoRevive) {
          this.reviveShard(shardId);
        }
        break;

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

      // Check for stalled shards (no heartbeat for too long)
      const timeSinceLastHeartbeat = now - shard.health.lastHeartbeat;
      if (
        timeSinceLastHeartbeat > this.#options.healthCheck.stalledThreshold &&
        shard.status !== "unhealthy"
      ) {
        this.#handleStalledShard(shardId, shard);
      }

      // Update latency if shard is ready
      if (shard.status === "ready") {
        shard.health.latency = this.#gateway.heartbeat.latency;
      }
    }
  }

  /**
   * Handles a stalled shard
   *
   * @param shardId - The shard ID
   * @param shard - The shard data
   * @private
   */
  #handleStalledShard(shardId: number, shard: ShardData): void {
    // Mark as unhealthy and increment failed heartbeats
    shard.health.failedHeartbeats++;

    // If too many failed heartbeats, mark as unhealthy
    if (shard.health.failedHeartbeats >= 3) {
      this.setShardStatus(shardId, "unhealthy");
    }
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
      await setTimeout(delay);
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
   * Scales up by adding more shards
   *
   * @param currentCount - Current shard count
   * @param newCount - New target shard count
   * @private
   */
  #scaleUp(currentCount: number, newCount: number): void {
    // First, mark all existing shards as being in a scaling operation
    for (const shard of this.#shards.values()) {
      shard.isScaling = true;
    }

    try {
      // Create new shards
      const newShardIds = Array.from(
        { length: newCount - currentCount },
        (_, i) => currentCount + i,
      );

      // Initialize all shards
      for (const shardId of newShardIds) {
        const bucketId = this.getRateLimitKey(shardId);
        this.#initializeShard(shardId, newCount, bucketId);
      }

      // Redistribute guilds to maintain balance
      this.#redistributeGuilds();
    } finally {
      // Mark scaling operation as complete
      for (const shard of this.#shards.values()) {
        shard.isScaling = false;
      }
    }
  }

  /**
   * Scales down by removing excess shards
   *
   * @param currentCount - Current shard count
   * @param newCount - New target shard count
   * @private
   */
  #scaleDown(currentCount: number, newCount: number): void {
    // Identify shards to remove
    const shardsToRemove = Array.from(
      { length: currentCount - newCount },
      (_, i) => currentCount - 1 - i,
    );

    // Redistribute guilds from shards being removed
    this.#redistributeGuildsFromShards(shardsToRemove, newCount);

    // Disconnect and remove the shards
    for (const shardId of shardsToRemove) {
      const shard = this.#shards.get(shardId);
      if (shard) {
        this.setShardStatus(shardId, "disconnected");
        this.#sessionMap.delete(shardId);
        this.#shards.delete(shardId);
      }
    }

    // Update remaining shards with new total count
    for (const shard of this.#shards.values()) {
      shard.totalShards = newCount;
    }
  }

  /**
   * Redistributes all guilds across all shards for better balance
   * Uses Discord's sharding formula to ensure consistent routing
   *
   * @private
   */
  #redistributeGuilds(): void {
    // Collect all guilds across all shards
    const allGuilds = new Set<string>();
    for (const shard of this.#shards.values()) {
      for (const guildId of shard.guilds) {
        allGuilds.add(guildId);
      }
    }

    // Clear all guild assignments
    for (const shard of this.#shards.values()) {
      shard.guilds.clear();
      shard.guildCount = 0;
    }

    // Reassign guilds to appropriate shards
    for (const guildId of allGuilds) {
      const shardId = this.calculateShardId(guildId);
      const shard = this.#shards.get(shardId);

      if (shard) {
        shard.guilds.add(guildId);
        shard.guildCount = shard.guilds.size;
      }
    }
  }

  /**
   * Redistributes guilds from specific shards being removed
   *
   * @param shardIds - Array of shard IDs being removed
   * @param newTotalShards - New total number of shards
   * @private
   */
  #redistributeGuildsFromShards(
    shardIds: number[],
    newTotalShards: number,
  ): void {
    // Process each shard being removed
    for (const shardId of shardIds) {
      const shard = this.#shards.get(shardId);
      if (!shard) {
        continue;
      }

      // Collect guilds from this shard
      const guildsToRedistribute = Array.from(shard.guilds);

      // Assign each guild to its new shard
      for (const guildId of guildsToRedistribute) {
        // Use calculateShardId with newTotalShards to determine the new shard
        const newShardId =
          Number(BigInt(guildId) >> BigInt(22)) % newTotalShards;

        // Skip if the new shard is also being removed
        if (shardIds.includes(newShardId)) {
          continue;
        }

        const targetShard = this.#shards.get(newShardId);
        if (targetShard) {
          targetShard.guilds.add(guildId);
          targetShard.guildCount = targetShard.guilds.size;
        }
      }

      // Clear the source shard's guilds
      shard.guilds.clear();
      shard.guildCount = 0;
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
   * @returns True if sharding should proceed
   * @private
   */
  #validateSpawnConditions(guildCount: number): boolean {
    const isShardingRequired = guildCount >= this.#options.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;
    const isForced = this.#options.force;

    // Skip sharding if not required, not configured, and not forced
    return (isShardingRequired || isForced) && hasConfiguredShards;
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

    // Spawn buckets one by one using for...of loop
    for (const [bucketId, bucketShardIds] of orderedBuckets) {
      // Initialize all shards in this bucket
      for (const shardId of bucketShardIds) {
        this.#initializeShard(shardId, totalShards, bucketId);
      }

      // Wait after each bucket except the last one
      const currentIndex = orderedBuckets.findIndex(([id]) => id === bucketId);

      if (currentIndex < orderedBuckets.length - 1) {
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
      lastUpdated: Date.now(),
      isScaling: false,
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

    // Emit creation event using the new event system
    this.#gateway.emit("shardCreate", {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards,
    });
  }
}
