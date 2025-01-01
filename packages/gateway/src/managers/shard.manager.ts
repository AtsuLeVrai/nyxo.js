import { Store } from "@nyxjs/store";
import type { ShardInfo, ShardStatus } from "../types/index.js";
import type { RateLimitManager } from "./rate-limit.manager.js";

export class ShardManager {
  static readonly MAX_GUILDS_PER_SHARD = 2500;
  static readonly LARGE_GUILD_THRESHOLD = 150_000;

  readonly #shardStore = new Store<number, ShardInfo>();
  readonly #buckets = new Store<number, number[]>();
  readonly #rateLimitManager: RateLimitManager;

  #totalShards = 1;
  #maxConcurrency = 1;
  #largeBotSharding = false;

  constructor(rateLimitManager: RateLimitManager) {
    this.#rateLimitManager = rateLimitManager;
  }

  get totalShards(): number {
    return this.#totalShards;
  }

  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  get isLargeBot(): boolean {
    return this.#largeBotSharding;
  }

  async spawnShards(
    recommendedShards: number,
    maxConcurrency: number,
  ): Promise<void> {
    this.#totalShards = recommendedShards;
    this.#maxConcurrency = maxConcurrency;

    for (let shardId = 0; shardId < this.#totalShards; shardId++) {
      this.#shardStore.set(shardId, {
        shardId,
        totalShards: this.#totalShards,
        guildIds: [],
        status: "idle",
      });

      const bucket = this.#getBucketId(shardId);
      if (!this.#buckets.has(bucket)) {
        this.#buckets.set(bucket, []);
      }
      this.#buckets.get(bucket)?.push(shardId);
    }

    for (const [, shards] of Array.from(this.#buckets.entries()).sort(
      (a, b) => a[0] - b[0],
    )) {
      if (!shards) {
        continue;
      }

      await Promise.all(
        shards.map(async (shardId) => {
          await this.#rateLimitManager.acquireIdentify(shardId);
          this.updateShardStatus(shardId, "connecting");
        }),
      );
    }
  }

  calculateShardId(guildId: string): number {
    try {
      const bigIntGuildId = BigInt(guildId);
      return Number((bigIntGuildId >> BigInt(22)) % BigInt(this.#totalShards));
    } catch (error) {
      throw new Error(
        `Failed to calculate shard ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  isBotShardingRequired(guildCount: number): boolean {
    return guildCount >= ShardManager.MAX_GUILDS_PER_SHARD;
  }

  validateShardCount(guildCount: number, recommendedShards?: number): boolean {
    if (guildCount >= ShardManager.LARGE_GUILD_THRESHOLD) {
      this.#largeBotSharding = true;

      if (!recommendedShards) {
        throw new Error("Sharding is required for large bots");
      }
    }

    return true;
  }

  addGuildToShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#getShardOrThrow(shardId);

    if (shard.guildIds.length >= ShardManager.MAX_GUILDS_PER_SHARD) {
      throw new Error(`Shard ${shardId} has reached maximum guild capacity`);
    }

    if (!shard.guildIds.includes(guildId)) {
      shard.guildIds.push(guildId);
    }
  }

  removeGuildFromShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#getShardOrThrow(shardId);
    shard.guildIds = shard.guildIds.filter((id) => id !== guildId);
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
    if (!firstBucket?.[1] || firstBucket?.[1]?.length === 0) {
      return null;
    }

    return Math.min(...firstBucket[1]);
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

  updateShardStatus(shardId: number, status: ShardStatus): void {
    const shard = this.#getShardOrThrow(shardId);
    shard.status = status;
  }

  reset(): void {
    this.#shardStore.clear();
    this.#buckets.clear();
    this.#largeBotSharding = false;
  }

  #getBucketId(shardId: number): number {
    return shardId % this.#maxConcurrency;
  }

  #validateShardId(shardId: number): boolean {
    return (
      Number.isInteger(shardId) && shardId >= 0 && shardId < this.#totalShards
    );
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
