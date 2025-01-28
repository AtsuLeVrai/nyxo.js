import { setTimeout } from "node:timers/promises";
import { Store } from "@nyxjs/store";
import type { Gateway } from "../core/index.js";
import type { ShardOptions } from "../options/index.js";
import type { ShardData } from "../types/index.js";

const SHARD_CONSTANTS = {
  spawnDelayMs: 5000,
  largeThreshold: 2500,
  veryLargeThreshold: 150000,
  minSessionLimit: 2000,
  sessionsPer1kGuilds: 5,
} as const;

export class ShardManager {
  #currentIndex = 0;
  #maxConcurrency = 1;
  #currentShardId: number | null = null;
  #shards = new Store<number, ShardData>();

  readonly #gateway: Gateway;
  readonly #options: ShardOptions;

  constructor(gateway: Gateway, options: ShardOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  get totalShards(): number {
    return this.#shards.size;
  }

  get currentShardId(): number {
    if (this.#currentShardId === null) {
      throw new Error("No active shard");
    }

    return this.#currentShardId;
  }

  isEnabled(): boolean {
    const totalGuildCount = this.#calculateTotalGuildCount();
    return (
      Boolean(this.#options.totalShards) ||
      totalGuildCount >= SHARD_CONSTANTS.largeThreshold
    );
  }

  async spawn(
    guildCount: number,
    maxConcurrency: number,
    recommendedShards: number,
  ): Promise<void> {
    this.#validateSpawnConditions(guildCount, recommendedShards);

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

    await this.#spawnShards(totalShards, guildCount);
  }

  getNextShard(): [number, number] {
    if (this.#shards.size === 0) {
      throw new Error("No shards available");
    }

    const shard = this.#shards.get(this.#currentIndex);
    if (!shard) {
      throw new Error(`Invalid shard ID: ${this.#currentIndex}`);
    }

    this.#currentShardId = shard.shardId;
    this.#currentIndex = (this.#currentIndex + 1) % this.#shards.size;
    return [shard.shardId, shard.totalShards];
  }

  getCurrentShardId(): number {
    if (this.#currentShardId === null) {
      this.#gateway.emit(
        "debug",
        "Attempted to get current shard ID when no shard is active",
      );
      throw new Error("No active shard");
    }

    if (!this.#shards.has(this.#currentShardId)) {
      this.#gateway.emit(
        "debug",
        `Current shard ID ${this.#currentShardId} not found in shard list`,
      );
      throw new Error(`Invalid shard ID: ${this.#currentShardId}`);
    }

    return this.#currentShardId;
  }

  setCurrentShardId(shardId: number): void {
    if (!this.#shards.has(shardId)) {
      throw new Error(`Invalid shard ID: ${shardId}`);
    }

    this.#currentShardId = shardId;
    this.#gateway.emit("debug", `Current shard ID set to ${shardId}`);
  }

  calculateShardId(guildId: string): number {
    if (this.#shards.size === 0) {
      return 0;
    }
    return Number(BigInt(guildId) >> BigInt(22)) % this.#shards.size;
  }

  getRateLimitKey(shardId: number): number {
    return shardId % this.#maxConcurrency;
  }

  getShardInfo(shardId: number): Readonly<ShardData> | undefined {
    return this.#shards.get(shardId);
  }

  isDmShard(shardId: number): boolean {
    return shardId === 0;
  }

  destroy(): void {
    this.#shards.clear();
    this.#currentIndex = 0;
    this.#currentShardId = null;
  }

  #calculateTotalGuildCount(): number {
    return Array.from(this.#shards.values()).reduce(
      (acc, shard) => acc + shard.guildCount,
      0,
    );
  }

  #validateSpawnConditions(
    guildCount: number,
    recommendedShards: number,
  ): void {
    const isShardingRequired = guildCount >= SHARD_CONSTANTS.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;

    if (!(isShardingRequired || hasConfiguredShards)) {
      return;
    }

    const minShards = Math.ceil(guildCount / SHARD_CONSTANTS.largeThreshold);
    if (
      guildCount >= SHARD_CONSTANTS.largeThreshold &&
      recommendedShards < minShards
    ) {
      throw new Error(
        `Recommended shard count too low (minimum ${minShards} shards required)`,
      );
    }
  }

  #calculateTotalShards(guildCount: number, recommendedShards: number): number {
    if (this.#options.totalShards === "auto") {
      return recommendedShards;
    }

    if (typeof this.#options.totalShards === "number") {
      return this.#options.totalShards;
    }

    const minimumShards = Math.ceil(
      guildCount / SHARD_CONSTANTS.largeThreshold,
    );
    return Math.max(1, minimumShards);
  }

  #handleLargeBotRequirements(
    guildCount: number,
    totalShards: number,
    recommendedShards: number,
  ): void {
    const isLargeBot = guildCount >= SHARD_CONSTANTS.veryLargeThreshold;

    if (!isLargeBot) {
      return;
    }

    if (totalShards % recommendedShards !== 0) {
      throw new Error(
        `Total shards (${totalShards}) must be a multiple of recommended shards (${recommendedShards}) for large bots`,
      );
    }

    const newSessionLimit = Math.max(
      SHARD_CONSTANTS.minSessionLimit,
      Math.ceil((guildCount / 1000) * SHARD_CONSTANTS.sessionsPer1kGuilds),
    );

    this.#gateway.emit(
      "debug",
      `Large bot detected - Session limit increased to ${newSessionLimit}`,
    );
  }

  async #spawnShards(totalShards: number, guildCount: number): Promise<void> {
    if (this.#options.shardList?.length > 0) {
      this.#validateShardList(totalShards);
    }

    const buckets = this.#createShardBuckets(totalShards);
    const averageGuildsPerShard = Math.ceil(guildCount / totalShards);

    await this.#spawnShardBuckets(buckets, totalShards, averageGuildsPerShard);
  }

  #validateShardList(totalShards: number): void {
    if (!this.#options.shardList) {
      return;
    }

    const maxShardId = Math.max(...this.#options.shardList);
    if (maxShardId >= totalShards) {
      throw new Error("Shard list contains invalid shard IDs");
    }
  }

  #createShardBuckets(totalShards: number): Map<number, number[]> {
    const buckets = new Map<number, number[]>();
    const shardIds =
      this.#options.shardList ??
      Array.from({ length: totalShards }, (_, i) => i);

    for (const shardId of shardIds) {
      const bucketId = this.getRateLimitKey(shardId);
      if (!buckets.has(bucketId)) {
        buckets.set(bucketId, []);
      }
      buckets.get(bucketId)?.push(shardId);
    }

    return buckets;
  }

  async #spawnShardBuckets(
    buckets: Map<number, number[]>,
    totalShards: number,
    averageGuildsPerShard: number,
  ): Promise<void> {
    const orderedBuckets = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );

    for (const [bucketId, bucketShardIds] of orderedBuckets) {
      this.#gateway.emit(
        "debug",
        `Spawning bucket ${bucketId} with shards: ${bucketShardIds.join(", ")}`,
      );

      await Promise.all(
        bucketShardIds.map((shardId) =>
          this.#initializeShard(shardId, totalShards, averageGuildsPerShard),
        ),
      );

      const isLastBucket = bucketId === orderedBuckets.at(-1)?.[0];
      if (!isLastBucket) {
        await setTimeout(SHARD_CONSTANTS.spawnDelayMs);
      }
    }
  }

  #initializeShard(
    shardId: number,
    totalShards: number,
    guildCount: number,
  ): void {
    this.#shards.set(shardId, {
      shardId,
      totalShards,
      guildCount,
    });

    this.#gateway.emit(
      "debug",
      `Shard ${shardId}/${totalShards - 1} connected`,
    );
  }
}
