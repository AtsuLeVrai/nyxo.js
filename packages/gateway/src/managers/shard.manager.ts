import { Store } from "@nyxjs/store";
import type { ShardInfo, ShardOptions } from "../types/index.js";

export class ShardManager {
  readonly #maxGuildsPerShard = 2500;
  readonly #largeGuildThreshold = 150000;

  #shardCount: number;
  #maxConcurrency: number;
  #shards: Store<number, ShardInfo>;
  #initialized = false;
  #autoMode = false;
  #buckets: Map<number, number[]> = new Map();

  constructor(options: ShardOptions = {}) {
    this.#shardCount = options.shardCount ?? 1;
    this.#maxConcurrency = options.maxConcurrency ?? 1;
    this.#shards = new Store();
    this.#autoMode = options.shard === "auto";
  }

  get totalShards(): number {
    return this.#shardCount;
  }

  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  initialize(recommendedShards?: number, maxConcurrency?: number): void {
    if (this.#initialized) {
      throw new Error("ShardManager is already initialized");
    }

    if (this.#autoMode && recommendedShards) {
      this.#shardCount = recommendedShards;
    }

    this.#maxConcurrency = maxConcurrency ?? this.#maxConcurrency;

    for (let i = 0; i < this.#shardCount; i++) {
      this.#shards.set(i, {
        shardId: i,
        totalShards: this.#shardCount,
        guildIds: [],
        status: "idle",
      });

      const bucket = i % this.#maxConcurrency;
      if (!this.#buckets.has(bucket)) {
        this.#buckets.set(bucket, []);
      }
      this.#buckets.get(bucket)?.push(i);
    }

    this.#initialized = true;
  }

  validateShardCount(guildCount: number, recommendedShards?: number): boolean {
    if (this.shouldUseLargeSharding(guildCount) && recommendedShards) {
      return this.#shardCount % recommendedShards === 0;
    }

    const minimumShards = this.calculateRequiredShards(guildCount);
    return this.#shardCount >= minimumShards;
  }

  calculateRequiredShards(guildCount: number): number {
    return Math.ceil(guildCount / this.#maxGuildsPerShard);
  }

  isLargeBot(guildCount: number): boolean {
    return guildCount >= this.#largeGuildThreshold;
  }

  shouldUseLargeSharding(guildCount: number): boolean {
    return guildCount >= this.#largeGuildThreshold;
  }

  calculateShardId(guildId: string): number {
    const bigIntGuildId = BigInt(guildId);
    return Number(bigIntGuildId >> BigInt(22)) % this.#shardCount;
  }

  addGuildToShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    if (!shard.guildIds.includes(guildId)) {
      shard.guildIds.push(guildId);
    }
  }

  removeGuildFromShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guildIds = shard.guildIds.filter((id) => id !== guildId);
  }

  getShardInfo(shardId: number): ShardInfo | null {
    const shard = this.#shards.get(shardId);
    return shard ? { ...shard } : null;
  }

  getAllShards(): ShardInfo[] {
    return Array.from(this.#shards.values()).map((shard) => ({ ...shard }));
  }

  getRateLimitKey(shardId: number): number {
    return shardId % this.#maxConcurrency;
  }

  getShardsByRateLimitKey(rateLimitKey: number): number[] {
    return Array.from(this.#shards.keys()).filter(
      (shardId) => this.getRateLimitKey(shardId) === rateLimitKey,
    );
  }

  getGuildCount(shardId: number): number {
    const shard = this.#shards.get(shardId);
    return shard?.guildIds.length ?? 0;
  }

  getTotalGuildCount(): number {
    return Array.from(this.#shards.values()).reduce(
      (total, shard) => total + shard.guildIds.length,
      0,
    );
  }

  validateShardId(shardId: number): boolean {
    return shardId >= 0 && shardId < this.#shardCount;
  }

  canStartShard(shardId: number): boolean {
    const bucket = this.getRateLimitKey(shardId);
    const shardsInBucket = this.#buckets.get(bucket) ?? [];

    // Check if any shard in the same bucket is currently connecting
    return !shardsInBucket.some((id) => {
      const shard = this.#shards.get(id);
      return shard && shard.status === "connecting";
    });
  }

  getNextShardToSpawn(): number | null {
    const idleShards = Array.from(this.#shards.entries())
      .filter(([, shard]) => shard.status === "idle")
      .map(([id]) => id);

    if (idleShards.length === 0) {
      return null;
    }

    const idleShardsByBucket = new Map<number, number[]>();
    for (const shardId of idleShards) {
      const bucket = this.getRateLimitKey(shardId);
      if (!idleShardsByBucket.has(bucket)) {
        idleShardsByBucket.set(bucket, []);
      }
      idleShardsByBucket.get(bucket)?.push(shardId);
    }

    const orderedBuckets = Array.from(idleShardsByBucket.entries()).sort(
      ([a], [b]) => a - b,
    );

    if (orderedBuckets.length === 0) {
      return null;
    }

    const firstBucket = orderedBuckets[0];
    if (!firstBucket) {
      return null;
    }

    const [, shards] = firstBucket;
    return Math.min(...shards);
  }

  updateShardStatus(
    shardId: number,
    status: "connecting" | "ready" | "disconnected" | "idle",
  ): void {
    const shard = this.#shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.status = status;
  }

  reset(): void {
    this.#shards.clear();
    this.#initialized = false;
    this.#buckets.clear();
  }
}
