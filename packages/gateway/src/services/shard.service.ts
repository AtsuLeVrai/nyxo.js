import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import {
  ShardOptions,
  ShardSession,
  ShardStats,
  ShardStatus,
} from "../schemas/index.js";
import type { GatewayEvents } from "../types/index.js";

export class ShardService extends EventEmitter<GatewayEvents> {
  static readonly RECOMMENDED_GUILD_THRESHOLD = 1000;
  static readonly LARGE_GUILD_MEMBER_COUNT = 250;
  static readonly DEFAULT_LARGE_THRESHOLD_SHARD0 = 250;
  static readonly DEFAULT_LARGE_THRESHOLD_OTHER = 50;
  static readonly MAX_CONCURRENCY_HARD_LIMIT = 16;
  static readonly IDENTIFY_BUCKET_INTERVAL = 5100;

  #guildCount = 0;
  #recommendedShards = 1;
  #maxConcurrency = 1;
  #currentShardIndex = 0;
  #shards: Store<string, ShardSession> = new Store();
  #buckets: Store<number, Store<number, ShardSession[]>> = new Store();
  #monitorInterval: NodeJS.Timeout | null = null;

  #stats: ShardStats;
  readonly #options: ShardOptions;
  readonly #startTime: number;

  constructor(options: Partial<ShardOptions> = {}) {
    super();
    this.#startTime = Date.now();
    this.#options = ShardOptions.parse(options);
    this.#stats = this.#createInitialStats();

    if (this.#options.validateConfiguration) {
      this.#validateConfiguration();
    }

    if (this.#options.monitorEnabled) {
      this.#startMonitoring();
    }
  }

  get totalShards(): number {
    return this.#shards.size;
  }

  get connectedShards(): number {
    return Array.from(this.#shards.values()).filter(
      (s) => s.status === "connected",
    ).length;
  }

  get currentStats(): Readonly<ShardStats> {
    return Object.freeze({ ...this.#stats });
  }

  get currentOptions(): Readonly<Required<ShardOptions>> {
    return Object.freeze({ ...this.#options });
  }

  get isFullyConnected(): boolean {
    return this.connectedShards === this.totalShards;
  }

  get averageLatency(): number {
    const connectedShards = Array.from(this.#shards.values()).filter(
      (s) => s.status === "connected",
    );
    if (connectedShards.length === 0) {
      return 0;
    }
    return (
      connectedShards.reduce((sum, shard) => sum + shard.latency, 0) /
      connectedShards.length
    );
  }

  get uptimeMs(): number {
    return Date.now() - this.#startTime;
  }

  static calculateBucketId(shardId: number, maxConcurrency: number): number {
    return shardId % maxConcurrency;
  }

  async spawn(
    guildCount?: number,
    maxConcurrency?: number,
    recommendedShards?: number,
  ): Promise<void> {
    this.emit("debug", "[Gateway:ShardService] Initializing spawn process");

    this.#guildCount = guildCount ?? this.#guildCount;
    this.#maxConcurrency = maxConcurrency ?? this.#options.maxConcurrency;
    this.#recommendedShards =
      recommendedShards ?? this.#calculateRecommendedShards();

    const totalShards = this.#calculateTotalShards();
    const sessions = this.#createShardSessions(totalShards);

    this.#createBuckets(sessions);
    await this.#spawnBuckets();

    this.emit(
      "debug",
      `[Gateway:ShardService] Spawn process completed - ${totalShards} shards initialized`,
    );
  }

  getNextShard(): [number, number] {
    const sessions = Array.from(this.#shards.values());
    if (sessions.length === 0) {
      throw new Error("No shards available");
    }

    // Récupère la session correspondante à l'index courant
    const session = sessions[this.#currentShardIndex];
    if (!session) {
      throw new Error(`No shard found at index ${this.#currentShardIndex}`);
    }

    // Incrémente l'index et revient à 0 si on dépasse la longueur
    this.#currentShardIndex = (this.#currentShardIndex + 1) % sessions.length;

    // Retourne le tuple [shardId, numShards] pour l'identification
    return [session.shardId, session.numShards];
  }

  getShardInfo(shardId: number): [number, number] {
    const session = Array.from(this.#shards.values()).find(
      (s) => s.shardId === shardId,
    );

    if (!session) {
      throw new Error(`No shard found with id ${shardId}`);
    }

    return [session.shardId, session.numShards];
  }

  calculateShardId(guildId: string): number {
    return Number(BigInt(guildId) >> BigInt(22)) % this.totalShards;
  }

  async respawnAll(): Promise<void> {
    this.emit("debug", "[Gateway:ShardService] Starting full respawn");
    this.destroy();
    await this.spawn();
  }

  async respawnShard(shardId: number): Promise<void> {
    const session = this.#shards.get(this.#getShardKey(shardId));
    if (!session) {
      throw new Error(`No shard found with ID ${shardId}`);
    }

    this.emit("debug", `[Gateway:ShardService] Respawning shard ${shardId}`);
    this.#destroyShard(shardId);
    await this.#spawnShard(session);
  }

  destroy(): void {
    this.emit("debug", "[Gateway:ShardService] Destroying shard service");
    this.#stopMonitoring();

    for (const [shardId] of this.#shards) {
      this.#destroyShard(Number.parseInt(shardId));
    }

    this.#shards.clear();
    this.#buckets.clear();
    this.#stats = this.#createInitialStats();
  }

  updateGuildCount(count: number): void {
    this.#guildCount = count;
    this.emit("debug", `[Gateway:ShardService] Updated guild count: ${count}`);
  }

  #validateConfiguration(): void {
    if (this.#options.maxConcurrency < 1) {
      throw new Error("Concurrency must be at least 1");
    }

    if (
      this.#options.maxConcurrency > ShardService.MAX_CONCURRENCY_HARD_LIMIT
    ) {
      throw new Error(
        `Concurrency cannot exceed ${ShardService.MAX_CONCURRENCY_HARD_LIMIT}`,
      );
    }

    if (this.#options.spawnTimeout < 0) {
      throw new Error("Spawn timeout must be non-negative");
    }

    if (this.#options.maxGuildsPerShard < 1) {
      throw new Error("Max guilds per shard must be at least 1");
    }
  }

  #createInitialStats(): ShardStats {
    const stats: ShardStats = {
      totalShards: 0,
      connectedShards: 0,
      activeShards: 0,
      totalGuilds: 0,
      averageLatency: 0,
      guildsPerShard: 0,
      uptimeMs: 0,
      memoryUsage: 0,
      status: Object.values(ShardStatus).reduce(
        (acc, status) => {
          acc[status] = 0;
          return acc;
        },
        {} as Record<ShardStatus, number>,
      ),
    };

    return ShardStats.parse(stats);
  }

  #startMonitoring(): void {
    if (this.#monitorInterval) {
      this.#stopMonitoring();
    }

    this.#monitorInterval = setInterval(
      () => this.#updateStats(),
      this.#options.monitorInterval,
    );

    this.emit("debug", "[Gateway:ShardService] Monitoring started");
  }

  #stopMonitoring(): void {
    if (this.#monitorInterval) {
      clearInterval(this.#monitorInterval);
      this.#monitorInterval = null;
      this.emit("debug", "[Gateway:ShardService] Monitoring stopped");
    }
  }

  #updateStats(): void {
    const shards = Array.from(this.#shards.values());
    const statusCounts = Object.values(ShardStatus).reduce(
      (acc, status) => {
        acc[status] = shards.filter((s) => s.status === status).length;
        return acc;
      },
      {} as Record<ShardStatus, number>,
    );

    this.#stats = {
      totalShards: this.totalShards,
      connectedShards: this.connectedShards,
      activeShards: shards.filter((s) => s.isActive).length,
      totalGuilds: shards.reduce((sum, shard) => sum + shard.guildCount, 0),
      averageLatency: this.averageLatency,
      guildsPerShard: Math.ceil(
        this.#stats.totalGuilds / Math.max(1, this.totalShards),
      ),
      uptimeMs: this.uptimeMs,
      memoryUsage: process.memoryUsage().heapUsed,
      status: statusCounts,
    };

    if (this.#options.collectMetrics) {
      this.emit("statsUpdate", this.#stats);
    }
  }

  #createShardSessions(totalShards: number): ShardSession[] {
    const shardList =
      this.#options.shardList?.length > 0
        ? this.#options.shardList
        : Array.from({ length: totalShards }, (_, i) => i);

    return shardList.map((shardId) =>
      ShardSession.parse({
        shardId,
        numShards: totalShards,
        status: "idle",
        latency: 0,
        guildCount: 0,
        connectAttempts: 0,
        reconnectAttempts: 0,
        largeThreshold:
          shardId === 0
            ? ShardService.DEFAULT_LARGE_THRESHOLD_SHARD0
            : ShardService.DEFAULT_LARGE_THRESHOLD_OTHER,
        maxReconnectAttempts: this.#options.maxReconnectAttempts,
        isActive: false,
        stats: {
          receivedPackets: 0,
          sentPackets: 0,
          errors: 0,
          zombieConnections: 0,
          avgHeartbeatLatency: 0,
          totalGuildMembers: 0,
        },
      }),
    );
  }

  #createBuckets(sessions: ShardSession[]): void {
    this.#buckets.clear();

    const shardGroups = new Store<number, ShardSession[]>();
    for (const session of sessions) {
      if (!shardGroups.has(session.numShards)) {
        shardGroups.set(session.numShards, []);
      }
      shardGroups.get(session.numShards)?.push(session);
    }

    for (const [numShards, groupSessions] of shardGroups) {
      const bucketGroup = new Store<number, ShardSession[]>();
      this.#buckets.set(numShards, bucketGroup);

      for (const session of groupSessions) {
        const bucketId = ShardService.calculateBucketId(
          session.shardId,
          this.#maxConcurrency,
        );
        if (!bucketGroup.has(bucketId)) {
          bucketGroup.set(bucketId, []);
        }
        bucketGroup.get(bucketId)?.push(session);
      }
    }
  }

  async #spawnBuckets(): Promise<void> {
    const buckets = this.#getBucketsList();

    for (const [bucketId, sessions] of buckets) {
      this.emit(
        "debug",
        `[Gateway:ShardService] Spawning bucket ${bucketId} with shards: ${sessions.map((s) => s.shardId).join(", ")}`,
      );

      const spawnPromises = sessions.map((session) =>
        this.#spawnShard(session),
      );
      await Promise.all(spawnPromises);

      const isLastBucket = bucketId === buckets.at(-1)?.[0];
      if (!isLastBucket) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.#options.spawnDelay),
        );
      }
    }
  }

  async #spawnShard(session: ShardSession): Promise<void> {
    this.#validateShardSession(session);
    const shardKey = this.#getShardKey(session.shardId);

    if (
      this.#shards.has(shardKey) &&
      this.#options.handoffStrategy === "graceful"
    ) {
      await this.#gracefulHandoff(shardKey);
    }

    session.status = "connected";
    session.connectAttempts++;
    session.connectedAt = Date.now();

    this.emit("shardSpawn", session.shardId);
    this.#shards.set(shardKey, session);
  }

  async #gracefulHandoff(shardKey: string): Promise<void> {
    const oldShard = this.#shards.get(shardKey);
    if (!oldShard) {
      return;
    }

    this.emit(
      "debug",
      `[Gateway:ShardService] Starting graceful handoff for shard ${oldShard.shardId}`,
    );

    return new Promise<void>((resolve) => {
      const cleanup = (): void => {
        this.#shards.delete(shardKey);
        resolve();
      };

      setTimeout(cleanup, this.#options.spawnTimeout);
    });
  }

  #calculateRecommendedShards(): number {
    if (!this.#guildCount) {
      return 1;
    }

    const guildsPerShard = Math.ceil(
      this.#guildCount / this.#options.shardCount,
    );
    if (guildsPerShard > this.#options.maxGuildsPerShard) {
      const recommended = Math.ceil(
        this.#guildCount / this.#options.maxGuildsPerShard,
      );
      this.emit(
        "debug",
        `[Gateway:ShardService] Calculated ${recommended} recommended shards based on ${this.#guildCount} guilds`,
      );
      return recommended;
    }

    return this.#options.shardCount;
  }

  #calculateTotalShards(): number {
    if (this.#options.totalShards === "auto") {
      return this.#recommendedShards;
    }
    return this.#options.totalShards;
  }

  #validateShardSession(session: ShardSession): void {
    if (session.shardId < 0) {
      throw new Error("Shard ID must be non-negative");
    }

    if (session.numShards < 1) {
      throw new Error("Number of shards must be at least 1");
    }

    if (session.shardId >= session.numShards) {
      throw new Error("Shard ID must be less than total number of shards");
    }

    const guildsPerShard = Math.ceil(this.#guildCount / session.numShards);
    if (guildsPerShard > this.#options.maxGuildsPerShard) {
      throw new Error(
        `Too many guilds per shard: ${guildsPerShard} exceeds maximum of ${this.#options.maxGuildsPerShard}`,
      );
    }
  }

  #getBucketsList(): [number, ShardSession[]][] {
    const buckets = new Store<number, ShardSession[]>();

    for (const [, bucketGroup] of this.#buckets) {
      for (const [bucketId, sessions] of bucketGroup) {
        if (!buckets.has(bucketId)) {
          buckets.set(bucketId, []);
        }

        for (const session of sessions) {
          buckets.get(bucketId)?.push(session);
        }
      }
    }

    return Array.from(buckets.entries()).sort(([a], [b]) => a - b);
  }

  #getShardKey(shardId: number): string {
    return `${shardId}`;
  }

  #destroyShard(shardId: number): void {
    const shardKey = this.#getShardKey(shardId);
    const session = this.#shards.get(shardKey);

    if (!session) {
      return;
    }

    session.status = "disconnected";
    session.disconnectedAt = Date.now();
    session.isActive = false;

    this.#shards.delete(shardKey);
    this.emit("shardDisconnect", shardId);

    this.emit("debug", `[Gateway:ShardService] Destroyed shard ${shardId}`);
  }
}
