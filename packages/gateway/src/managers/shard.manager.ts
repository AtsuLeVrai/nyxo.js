import { Store } from "@nyxjs/store";
import type { ShardInfo, ShardOptions } from "../types/index.js";

export class ShardManager {
  static readonly MAX_GUILDS_PER_SHARD = 2500;
  static readonly LARGE_GUILD_THRESHOLD = 150_000;

  readonly #shardStore = new Store<number, ShardInfo>();
  readonly #buckets = new Store<number, number[]>();
  readonly #autoMode: boolean;

  #shardCount: number;
  #maxConcurrency: number;
  #initialized = false;

  constructor(options: ShardOptions = {}) {
    this.#shardCount = options.shardCount ?? 1;
    this.#maxConcurrency = options.maxConcurrency ?? 1;
    this.#autoMode = options.shard ?? false;
  }

  get isAutoMode(): boolean {
    return this.#autoMode;
  }

  get totalShards(): number {
    return this.#shardCount;
  }

  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  get isInitialized(): boolean {
    return this.#initialized;
  }

  initialize(recommendedShards?: number, maxConcurrency?: number): void {
    if (this.#initialized) {
      throw new Error("ShardManager is already initialized");
    }

    if (this.#autoMode && recommendedShards) {
      this.#shardCount = recommendedShards;
    }

    if (maxConcurrency) {
      this.#maxConcurrency = maxConcurrency;
    }

    this.#initializeShards();
    this.#initialized = true;
  }

  validateShardCount(guildCount: number, recommendedShards?: number): boolean {
    if (this.#requiresLargeSharding(guildCount)) {
      return recommendedShards
        ? this.#isValidLargeShardCount(recommendedShards)
        : false;
    }

    const minimumShards = this.#calculateRequiredShards(guildCount);
    return this.#shardCount >= minimumShards;
  }

  calculateShardId(guildId: string): number {
    const bigIntGuildId = BigInt(guildId);
    return Number((bigIntGuildId >> BigInt(22)) % BigInt(this.#shardCount));
  }

  addGuildToShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#getShardOrThrow(shardId);

    if (!shard.guildIds.includes(guildId)) {
      shard.guildIds.push(guildId);
    }
  }

  removeGuildFromShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#getShardOrThrow(shardId);
    shard.guildIds = shard.guildIds.filter((id) => id !== guildId);
  }

  getShardInfo(shardId: number): ShardInfo | null {
    const shard = this.#shardStore.get(shardId);
    return shard ? { ...shard } : null;
  }

  getAllShards(): ShardInfo[] {
    return Array.from(this.#shardStore.values()).map((shard) => ({ ...shard }));
  }

  getShardsByBucket(bucket: number): number[] {
    return [...(this.#buckets.get(bucket) ?? [])];
  }

  getTotalGuildCount(): number {
    return Array.from(this.#shardStore.values()).reduce(
      (total, shard) => total + shard.guildIds.length,
      0,
    );
  }

  canStartShard(shardId: number): boolean {
    if (!this.#validateShardId(shardId)) {
      return false;
    }

    const bucket = this.#getBucketId(shardId);
    const shardsInBucket = this.getShardsByBucket(bucket);

    return !shardsInBucket.some((id) => {
      const shard = this.#shardStore.get(id);
      return shard?.status === "connecting";
    });
  }

  getNextShardToSpawn(): number | null {
    const idleShards = this.#getIdleShards();
    if (idleShards.length === 0) {
      return null;
    }

    const shardsByBucket = this.#groupShardsByBucket(idleShards);
    const orderedBuckets = Array.from(shardsByBucket.entries()).sort(
      ([a], [b]) => a - b,
    );

    if (orderedBuckets.length === 0) {
      return null;
    }

    const firstBucket = orderedBuckets[0];
    if (!firstBucket) {
      return null;
    }

    const shards = firstBucket[1];
    if (!shards || shards.length === 0) {
      return null;
    }

    return Math.min(...shards);
  }

  updateShardStatus(
    shardId: number,
    status: "connecting" | "ready" | "disconnected" | "idle",
  ): void {
    const shard = this.#getShardOrThrow(shardId);
    shard.status = status;
  }

  reset(): void {
    this.#shardStore.clear();
    this.#buckets.clear();
    this.#initialized = false;
  }

  #initializeShards(): void {
    for (let shardId = 0; shardId < this.#shardCount; shardId++) {
      this.#shardStore.set(shardId, {
        shardId,
        totalShards: this.#shardCount,
        guildIds: [],
        status: "idle",
      });

      const bucket = this.#getBucketId(shardId);
      if (!this.#buckets.has(bucket)) {
        this.#buckets.set(bucket, []);
      }
      this.#buckets.get(bucket)?.push(shardId);
    }
  }

  #getBucketId(shardId: number): number {
    return shardId % this.#maxConcurrency;
  }

  #calculateRequiredShards(guildCount: number): number {
    return Math.ceil(guildCount / ShardManager.MAX_GUILDS_PER_SHARD);
  }

  #requiresLargeSharding(guildCount: number): boolean {
    return guildCount >= ShardManager.LARGE_GUILD_THRESHOLD;
  }

  #isValidLargeShardCount(recommendedShards: number): boolean {
    return this.#shardCount % recommendedShards === 0;
  }

  #validateShardId(shardId: number): boolean {
    return shardId >= 0 && shardId < this.#shardCount;
  }

  #getShardOrThrow(shardId: number): ShardInfo {
    const shard = this.#shardStore.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }
    return shard;
  }

  #getIdleShards(): number[] {
    return Array.from(this.#shardStore.entries())
      .filter(([, shard]) => shard.status === "idle")
      .map(([id]) => id);
  }

  #groupShardsByBucket(shardIds: number[]): Store<number, number[]> {
    const bucketMap = new Store<number, number[]>();

    for (const shardId of shardIds) {
      const bucket = this.#getBucketId(shardId);
      if (!bucketMap.has(bucket)) {
        bucketMap.set(bucket, []);
      }
      bucketMap.get(bucket)?.push(shardId);
    }

    return bucketMap;
  }
}
