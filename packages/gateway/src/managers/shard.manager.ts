import { setTimeout } from "node:timers/promises";
import type { Gateway } from "../core/index.js";
import type { ShardOptions } from "../options/index.js";
import type {
  SessionLimitUpdateEvent,
  ShardCreateEvent,
  ShardDisconnectEvent,
  ShardGuildAddEvent,
  ShardGuildRemoveEvent,
  ShardHealthCheckEvent,
  ShardRateLimitEvent,
  ShardReadyEvent,
  ShardReconnectEvent,
  ShardScalingEvent,
} from "../types/index.js";

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
} as const;

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

  /** Time when this shard was last updated */
  lastUpdated: number;

  /** Whether this shard is currently in a scaling operation */
  isScaling: boolean;

  /** Process ID if running in a multi-process environment */
  processId?: string;

  /** Health metrics for this shard */
  health: {
    /** Latency in milliseconds */
    latency: number;

    /** Average latency over time */
    averageLatency: number;

    /** Number of successful heartbeats */
    successfulHeartbeats: number;

    /** Number of failed heartbeats */
    failedHeartbeats: number;

    /** Time when the last successful heartbeat was received */
    lastHeartbeat: number;

    /** Number of reconnections */
    reconnectCount: number;

    /** Number of session resumptions */
    resumeCount: number;

    /** Score between 0-100 indicating shard health */
    score: number;
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
 * Inter-process communication adapter interface for coordinating shards across processes
 */
export interface IpcAdapter {
  /** Initialize the adapter */
  initialize(): Promise<void>;

  /** Send a message to other processes */
  sendMessage(channel: string, data: unknown): Promise<void>;

  /** Register a message handler */
  onMessage(channel: string, handler: (data: unknown) => void): void;

  /** Close the adapter */
  close(): Promise<void>;

  /** Get the unique identifier for this process */
  getProcessId(): string;
}

/**
 * ShardManager is responsible for managing sharded Gateway connections
 *
 * This class handles shard creation, tracking, and management, including:
 * - Coordinating shard spawning
 * - Assigning guilds to appropriate shards
 * - Managing rate limits for identify requests
 * - Tracking shard connection status
 * - Dynamic scaling of shards
 * - Health monitoring and auto-recovery
 * - Inter-process coordination
 */
export class ShardManager {
  /** Map of shards by shard ID */
  #shards = new Map<number, ShardData>();

  /** Maximum number of concurrent identifies allowed */
  #maxConcurrency = 1;

  /** Interval for running health checks */
  #healthCheckInterval: NodeJS.Timeout | null = null;

  /** IPC adapter for multi-process coordination */
  #ipcAdapter: IpcAdapter | null = null;

  /** Process ID in multi-process environments */
  #processId = "main";

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
   */
  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  /**
   * Gets the current process ID
   */
  get processId(): string {
    return this.#processId;
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
   * Initializes the IPC adapter for multi-process coordination
   *
   * @param adapter - IPC adapter implementation
   */
  async initializeIpc(adapter: IpcAdapter): Promise<void> {
    this.#ipcAdapter = adapter;
    await this.#ipcAdapter.initialize();

    this.#processId = this.#ipcAdapter.getProcessId();

    // Set up message handlers for inter-process communication
    this.#ipcAdapter.onMessage(
      "shard:status",
      this.#handleRemoteShardStatus.bind(this),
    );
    this.#ipcAdapter.onMessage(
      "shard:scaling",
      this.#handleRemoteScalingRequest.bind(this),
    );
    this.#ipcAdapter.onMessage(
      "shard:health",
      this.#handleRemoteHealthUpdate.bind(this),
    );
    this.#ipcAdapter.onMessage(
      "shard:guild:add",
      this.#handleRemoteGuildAdd.bind(this),
    );
    this.#ipcAdapter.onMessage(
      "shard:guild:remove",
      this.#handleRemoteGuildRemove.bind(this),
    );
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

    // Start health checks after initial spawn
    this.startHealthChecks();
  }

  /**
   * Dynamically scales the number of shards up or down
   *
   * @param newTotalShards - New total number of shards to scale to
   * @returns Promise that resolves when scaling is complete
   * @throws {Error} If scaling fails or times out
   */
  async scaleShards(newTotalShards: number): Promise<void> {
    const currentShardCount = this.#shards.size;

    if (newTotalShards === currentShardCount) {
      return;
    }

    const scalingEvent: ShardScalingEvent = {
      timestamp: new Date().toISOString(),
      oldShardCount: currentShardCount,
      newShardCount: newTotalShards,
      initiator: this.#processId,
      strategy: this.#options.scaling.strategy,
      reason: newTotalShards > currentShardCount ? "scale_up" : "scale_down",
    };

    this.#gateway.emit("shardScaling", scalingEvent);

    // If using IPC, notify other processes about scaling
    if (this.#ipcAdapter) {
      await this.#ipcAdapter.sendMessage("shard:scaling", scalingEvent);
    }

    try {
      if (newTotalShards > currentShardCount) {
        // Scaling up - spawn new shards
        await this.#scaleUp(currentShardCount, newTotalShards);
      } else {
        // Scaling down - remove excess shards
        await this.#scaleDown(currentShardCount, newTotalShards);
      }

      // Emit completion event
      this.#gateway.emit("shardScalingComplete", {
        timestamp: new Date().toISOString(),
        oldShardCount: currentShardCount,
        newShardCount: newTotalShards,
        successful: true,
        duration: Date.now() - new Date(scalingEvent.timestamp).getTime(),
      });
    } catch (error) {
      // Emit failure event
      this.#gateway.emit("shardScalingFailed", {
        timestamp: new Date().toISOString(),
        oldShardCount: currentShardCount,
        newShardCount: newTotalShards,
        error,
        reason: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
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
      // Skip shards that are currently in scaling operation
      if (shard.isScaling) {
        continue;
      }

      if (this.isShardBucketAvailable(shard.bucket)) {
        if (shard.status === "reconnecting" || shard.status === "unhealthy") {
          const reconnectEvent: ShardReconnectEvent = {
            timestamp: new Date().toISOString(),
            shardId,
            totalShards: shard.totalShards,
            attemptNumber: ++attempts,
            delayMs: this.#options.spawnDelay,
            previousStatus: shard.status,
          };
          this.#gateway.emit("shardReconnect", reconnectEvent);
        }

        shard.rateLimit.remaining--;
        await this.setShardStatus(shardId, "connecting");

        // Remember the time we last updated this shard
        shard.lastUpdated = Date.now();

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
  async addGuildToShard(guildId: string): Promise<void> {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guilds.add(guildId);
    const newGuildCount = shard.guilds.size;
    shard.guildCount = newGuildCount;
    shard.lastUpdated = Date.now();

    const guildAddEvent: ShardGuildAddEvent = {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards: shard.totalShards,
      guildId,
      newGuildCount,
      processId: this.#processId,
    };
    this.#gateway.emit("shardGuildAdd", guildAddEvent);

    // Sync with other processes if IPC is enabled
    if (this.#ipcAdapter) {
      await this.#ipcAdapter.sendMessage("shard:guild:add", guildAddEvent);
    }
  }

  /**
   * Removes a guild from its shard
   *
   * @param guildId - Discord guild ID to remove
   * @throws {Error} If the shard doesn't exist
   */
  async removeGuildFromShard(guildId: string): Promise<void> {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guilds.delete(guildId);
    const newGuildCount = shard.guilds.size;
    shard.guildCount = newGuildCount;
    shard.lastUpdated = Date.now();

    const guildRemoveEvent: ShardGuildRemoveEvent = {
      timestamp: new Date().toISOString(),
      shardId,
      totalShards: shard.totalShards,
      guildId,
      newGuildCount,
      processId: this.#processId,
    };
    this.#gateway.emit("shardGuildRemove", guildRemoveEvent);

    // Sync with other processes if IPC is enabled
    if (this.#ipcAdapter) {
      await this.#ipcAdapter.sendMessage(
        "shard:guild:remove",
        guildRemoveEvent,
      );
    }
  }

  /**
   * Adds multiple guilds to a shard at once
   *
   * @param shardId - The shard ID to add guilds to
   * @param guildIds - Array of guild IDs to add
   * @throws {Error} If the shard doesn't exist
   */
  async addGuildsToShard(shardId: number, guildIds: string[]): Promise<void> {
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
    shard.lastUpdated = Date.now();

    // Only emit an event if guilds were actually added
    const addedCount = newGuildCount - existingSize;
    if (addedCount > 0) {
      // Send a single bulk event for better performance
      const bulkAddEvent = {
        timestamp: new Date().toISOString(),
        shardId,
        totalShards: shard.totalShards,
        guildIds: guildIds.filter((id) => shard.guilds.has(id)),
        addedCount,
        newGuildCount,
        processId: this.#processId,
      };

      this.#gateway.emit("shardGuildBulkAdd", bulkAddEvent);

      // Sync with other processes if IPC is enabled
      if (this.#ipcAdapter) {
        await this.#ipcAdapter.sendMessage("shard:guild:bulkAdd", bulkAddEvent);
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
  async setShardStatus(shardId: number, status: ShardStatus): Promise<void> {
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

    // Sync with other processes if IPC is enabled
    if (this.#ipcAdapter) {
      await this.#ipcAdapter.sendMessage("shard:status", {
        shardId,
        oldStatus,
        newStatus: status,
        processId: this.#processId,
        timestamp: new Date().toISOString(),
      });
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
        processId: this.#processId,
      };
      this.#gateway.emit("shardDisconnect", disconnectEvent);
    }

    if (status === "ready" && oldStatus !== "ready") {
      // Update health information
      shard.health.successfulHeartbeats++;
      shard.health.lastHeartbeat = Date.now();
      shard.health.score = 100; // Reset health score to 100% when becoming ready

      const sessionId = this.#gateway.sessionId;
      if (sessionId) {
        // Store session ID for this shard for potential resumption later
        this.#sessionMap.set(shardId, sessionId);
      }

      const readyEvent: ShardReadyEvent = {
        timestamp: new Date().toISOString(),
        shardId,
        totalShards: shard.totalShards,
        sessionId: sessionId ?? "",
        latency: this.#gateway.heartbeat.latency,
        guildCount: shard.guildCount,
        processId: this.#processId,
      };
      this.#gateway.emit("shardReady", readyEvent);
    }

    if (status === "resuming") {
      // Update health metrics for resumption
      shard.health.resumeCount++;

      const sessionId =
        this.#sessionMap.get(shardId) || this.#gateway.sessionId;
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
        processId: this.#processId,
      };
      this.#gateway.emit("shardResuming", resumeEvent);
    }

    if (status === "unhealthy" && this.#options.healthCheck.autoRevive) {
      await this.reviveShard(shardId);
    }
  }

  /**
   * Updates a shard's health metrics
   *
   * @param shardId - The shard ID to update
   * @param metrics - Health metrics to update
   */
  async updateShardHealth(
    shardId: number,
    metrics: Partial<ShardData["health"]>,
  ): Promise<void> {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      return;
    }

    // Update health metrics
    shard.health = {
      ...shard.health,
      ...metrics,
    };

    // Calculate health score based on various metrics
    const latencyScore = Math.max(
      0,
      100 -
        (shard.health.latency / this.#options.healthCheck.latencyThreshold) *
          50,
    );
    const heartbeatScore = Math.max(
      0,
      100 - shard.health.failedHeartbeats * 25,
    );
    const timeScore = Math.max(
      0,
      100 -
        ((Date.now() - shard.health.lastHeartbeat) /
          this.#options.healthCheck.stalledThreshold) *
          100,
    );

    // Weighted average (latency 30%, heartbeats 40%, time since last heartbeat 30%)
    const newScore = Math.round(
      latencyScore * 0.3 + heartbeatScore * 0.4 + timeScore * 0.3,
    );
    shard.health.score = newScore;

    // Emit health update event for monitoring
    const healthEvent: ShardHealthCheckEvent = {
      timestamp: new Date().toISOString(),
      shardId,
      metrics: { ...shard.health },
      status: shard.status,
      score: newScore,
      processId: this.#processId,
    };

    this.#gateway.emit("shardHealthUpdate", healthEvent);

    // Share health data with other processes if IPC is enabled
    if (this.#ipcAdapter) {
      await this.#ipcAdapter.sendMessage("shard:health", healthEvent);
    }

    // If health score is too low, mark shard as unhealthy
    if (
      newScore < 40 &&
      shard.status !== "unhealthy" &&
      shard.status !== "disconnected"
    ) {
      await this.setShardStatus(shardId, "unhealthy");
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
  async destroy(): Promise<void> {
    // Stop health check interval
    if (this.#healthCheckInterval) {
      clearInterval(this.#healthCheckInterval);
      this.#healthCheckInterval = null;
    }

    // Set all shards to disconnected
    for (const [shardId] of this.#shards.entries()) {
      await this.setShardStatus(shardId, "disconnected");
    }

    this.#shards.clear();
    this.#sessionMap.clear();

    // Clean up IPC adapter if present
    if (this.#ipcAdapter) {
      await this.#ipcAdapter.close();
      this.#ipcAdapter = null;
    }
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
   * Attempts to revive an unhealthy or disconnected shard
   *
   * @param shardId - The shard ID to revive
   * @returns Promise that resolves when the revival attempt completes
   */
  async reviveShard(shardId: number): Promise<void> {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    // Don't try to revive a shard that's already recovering
    if (shard.status === "connecting" || shard.status === "resuming") {
      return;
    }

    // Update reconnect counter
    shard.health.reconnectCount++;

    // Prefer resuming if we have a session ID
    const sessionId = this.#sessionMap.get(shardId);
    if (sessionId) {
      await this.setShardStatus(shardId, "resuming");
    } else {
      await this.setShardStatus(shardId, "reconnecting");
    }

    // The actual reconnection will be handled by the Gateway class
    // when it sees the status change and calls getAvailableShard()
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
          processId: this.#processId,
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
   * Runs health checks on all shards
   *
   * @private
   */
  async #runHealthChecks(): Promise<void> {
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
        // Mark as unhealthy and increment failed heartbeats
        shard.health.failedHeartbeats++;
        await this.updateShardHealth(shardId, {
          score: Math.max(0, shard.health.score - 30),
          failedHeartbeats: shard.health.failedHeartbeats,
        });
      }

      // Perform latency check
      if (shard.status === "ready") {
        const latency = this.#gateway.heartbeat.latency;
        await this.updateShardHealth(shardId, {
          latency,
        });
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
  async #scaleUp(currentCount: number, newCount: number): Promise<void> {
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

      // Group by buckets like in initial spawning
      const buckets = new Map<number, number[]>();
      for (const shardId of newShardIds) {
        const bucketId = this.getRateLimitKey(shardId);
        if (!buckets.has(bucketId)) {
          buckets.set(bucketId, []);
        }
        const bucket = buckets.get(bucketId);
        if (bucket) {
          bucket.push(shardId);
        }
      }

      // Spawn new shards bucket by bucket
      const orderedBuckets = Array.from(buckets.entries()).sort(
        ([a], [b]) => a - b,
      );

      for (let i = 0; i < orderedBuckets.length; i++) {
        const entry = orderedBuckets[i];
        if (!entry) {
          continue;
        }

        const [bucketId, shardIds] = entry as [number, number[]];

        // Initialize all shards in this bucket
        for (const shardId of shardIds) {
          this.#initializeShard(shardId, newCount, bucketId);
        }

        // Wait for rate limits between buckets
        if (i < orderedBuckets.length - 1) {
          await setTimeout(this.#options.spawnDelay);
        }
      }

      // Wait for all shards to be ready if requested
      if (this.#options.scaling.waitForReady) {
        await this.#waitForShardsReady(
          newShardIds,
          this.#options.scaling.timeout,
        );
      }

      // If we need to redistribute guilds, do it now based on strategy
      if (this.#options.scaling.strategy === "balanced") {
        this.#redistributeGuilds();
      }
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
  async #scaleDown(currentCount: number, newCount: number): Promise<void> {
    // Identify shards to remove
    const shardsToRemove = Array.from(
      { length: currentCount - newCount },
      (_, i) => currentCount - 1 - i,
    );

    // Redistribute guilds from shards being removed
    await this.#redistributeGuildsFromShards(shardsToRemove, newCount);

    // Disconnect and remove the shards
    for (const shardId of shardsToRemove) {
      const shard = this.#shards.get(shardId);
      if (shard) {
        await this.setShardStatus(shardId, "disconnected");
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
   * Waits for specified shards to reach ready state
   *
   * @param shardIds - Array of shard IDs to wait for
   * @param timeout - Maximum wait time in milliseconds
   * @private
   */
  async #waitForShardsReady(
    shardIds: number[],
    timeout: number,
  ): Promise<void> {
    const startTime = Date.now();

    // Helper to check if all specified shards are ready
    const allShardsReady = (): boolean =>
      shardIds.every((id) => {
        const shard = this.#shards.get(id);
        return shard && shard.status === "ready";
      });

    // Wait for all shards to be ready or timeout
    while (!allShardsReady()) {
      if (Date.now() - startTime > timeout) {
        throw new Error("Timed out waiting for shards to become ready");
      }

      await setTimeout(500); // Check every 500ms
    }
  }

  /**
   * Redistributes guilds among all shards for better balance
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
  async #redistributeGuildsFromShards(
    shardIds: number[],
    newTotalShards: number,
  ): Promise<void> {
    // Calculate new shard ID based on new total
    const calculateNewShardId = (guildId: string): number => {
      return Number(BigInt(guildId) >> BigInt(22)) % newTotalShards;
    };

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
        const newShardId = calculateNewShardId(guildId);

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
      lastUpdated: Date.now(),
      isScaling: false,
      processId: this.#processId,
      health: {
        latency: 0,
        averageLatency: 0,
        successfulHeartbeats: 0,
        failedHeartbeats: 0,
        lastHeartbeat: Date.now(),
        reconnectCount: 0,
        resumeCount: 0,
        score: 100, // Start with perfect health
      },
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
      processId: this.#processId,
    };
    this.#gateway.emit("shardCreate", createEvent);
  }

  /**
   * Handles status updates from other processes
   *
   * @param data - Status update data
   * @private
   */
  #handleRemoteShardStatus(data: unknown): void {
    // Validate the data structure
    if (!data || typeof data !== "object" || !("shardId" in data)) {
      return;
    }

    const update = data as {
      shardId: number;
      oldStatus: ShardStatus;
      newStatus: ShardStatus;
      processId: string;
      timestamp: string;
    };

    // Ignore updates from this process
    if (update.processId === this.#processId) {
      return;
    }

    // Update our local copy of the shard if we have one
    const shard = this.#shards.get(update.shardId);
    if (shard) {
      shard.status = update.newStatus;
      shard.lastUpdated = Date.now();
    }
  }

  /**
   * Handles scaling requests from other processes
   *
   * @param data - Scaling request data
   * @private
   */
  #handleRemoteScalingRequest(data: unknown): void {
    // Validate the data structure
    if (!data || typeof data !== "object" || !("newShardCount" in data)) {
      return;
    }

    const request = data as ShardScalingEvent;

    // Ignore requests from this process
    if (request.initiator === this.#processId) {
      return;
    }

    // Forward the event to our gateway
    this.#gateway.emit("shardScaling", request);

    // Mark all shards as being in a scaling operation
    for (const shard of this.#shards.values()) {
      shard.isScaling = true;
    }
  }

  /**
   * Handles health updates from other processes
   *
   * @param data - Health update data
   * @private
   */
  #handleRemoteHealthUpdate(data: unknown): void {
    // Validate the data structure
    if (!data || typeof data !== "object" || !("shardId" in data)) {
      return;
    }

    const update = data as ShardHealthCheckEvent;

    // Ignore updates from this process
    if (update.processId === this.#processId) {
      return;
    }

    // Update our local copy of the shard if we have one
    const shard = this.#shards.get(update.shardId);
    if (shard) {
      shard.health = { ...update.metrics };

      // If the remote shard is unhealthy, mark it as such locally
      if (update.score < 40 && shard.status !== "unhealthy") {
        shard.status = "unhealthy";
      }
    }
  }

  /**
   * Handles guild additions from other processes
   *
   * @param data - Guild add data
   * @private
   */
  #handleRemoteGuildAdd(data: unknown): void {
    // Validate the data structure
    if (!data || typeof data !== "object" || !("guildId" in data)) {
      return;
    }

    const update = data as ShardGuildAddEvent;

    // Ignore updates from this process
    if (update.processId === this.#processId) {
      return;
    }

    // Update our local copy of the shard if we have one
    const shard = this.#shards.get(update.shardId);
    if (shard) {
      shard.guilds.add(update.guildId);
      shard.guildCount = update.newGuildCount;
      shard.lastUpdated = Date.now();
    }
  }

  /**
   * Handles guild removals from other processes
   *
   * @param data - Guild remove data
   * @private
   */
  #handleRemoteGuildRemove(data: unknown): void {
    // Validate the data structure
    if (!data || typeof data !== "object" || !("guildId" in data)) {
      return;
    }

    const update = data as ShardGuildRemoveEvent;

    // Ignore updates from this process
    if (update.processId === this.#processId) {
      return;
    }

    // Update our local copy of the shard if we have one
    const shard = this.#shards.get(update.shardId);
    if (shard) {
      shard.guilds.delete(update.guildId);
      shard.guildCount = update.newGuildCount;
      shard.lastUpdated = Date.now();
    }
  }
}
