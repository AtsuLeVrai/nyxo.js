import { setTimeout } from "node:timers/promises";
import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import type { ShardOptions } from "../options/index.js";
import type { GatewayEvents, ShardData } from "../types/index.js";

const SHARD_SPAWN_DELAY = 5000;
const LARGE_THRESHOLD = 2500;
const VERY_LARGE_THRESHOLD = 150000;

export class ShardManager extends EventEmitter<GatewayEvents> {
  #currentIndex = 0;
  #maxConcurrency = 1;
  #currentShardId: number | null = null;
  #shards = new Store<number, ShardData>();

  readonly #options: z.output<typeof ShardOptions>;

  constructor(options: z.output<typeof ShardOptions>) {
    super();
    this.#options = options;
  }

  get totalShards(): number {
    return this.#shards.size;
  }

  isEnabled(): boolean {
    const totalGuildCount = Array.from(this.#shards.values()).reduce(
      (acc, shard) => acc + shard.guildCount,
      0,
    );

    return (
      Boolean(this.#options.totalShards) || totalGuildCount >= LARGE_THRESHOLD
    );
  }

  async spawn(
    guildCount: number,
    maxConcurrency: number,
    recommendedShards: number,
  ): Promise<void> {
    const isShardingRequired = guildCount >= LARGE_THRESHOLD;
    const hasConfiguredShards = this.#options.totalShards !== undefined;

    if (!(isShardingRequired || hasConfiguredShards)) {
      return;
    }

    let totalShards = 1;
    if (this.#options.totalShards === "auto") {
      totalShards = recommendedShards;
    } else if (typeof this.#options.totalShards === "number") {
      totalShards = this.#options.totalShards;
    }

    const minShards = Math.ceil(guildCount / LARGE_THRESHOLD);
    if (guildCount >= LARGE_THRESHOLD && totalShards < minShards) {
      throw new Error(
        `Recommended shard count too low (minimum ${minShards} shards required)`,
      );
    }

    this.#maxConcurrency = maxConcurrency;
    const isLargeBot = guildCount >= VERY_LARGE_THRESHOLD;
    if (isLargeBot) {
      if (totalShards % recommendedShards !== 0) {
        throw new Error(
          `Total shards (${totalShards}) must be a multiple of recommended shards (${recommendedShards}) for large bots`,
        );
      }

      const newSessionLimit = Math.max(
        2000,
        Math.ceil((guildCount / 1000) * 5),
      );
      this.emit(
        "debug",
        `Large bot detected - Session limit increased to ${newSessionLimit}`,
      );
    }

    if (this.#options.shardList?.length > 0) {
      const maxShardId = Math.max(...this.#options.shardList);
      if (maxShardId >= totalShards) {
        throw new Error("Shard list contains invalid shard IDs");
      }
    }

    const buckets = new Store<number, number[]>();
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

    const orderedBuckets = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );
    const averageGuildsPerShard = Math.ceil(guildCount / totalShards);

    for (const [bucketId, bucketShardIds] of orderedBuckets) {
      this.emit(
        "debug",
        `Spawning bucket ${bucketId} with shards: ${bucketShardIds.join(", ")}`,
      );

      const promises = bucketShardIds.map((shardId) => {
        this.#shards.set(shardId, {
          shardId,
          totalShards,
          guildCount: averageGuildsPerShard,
        });

        this.emit("debug", `Shard ${shardId}/${totalShards - 1} connected`);
      });

      await Promise.all(promises);
      const isLastBucket = bucketId === orderedBuckets.at(-1)?.[0];
      if (!isLastBucket) {
        await setTimeout(SHARD_SPAWN_DELAY);
      }
    }
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
      throw new Error("No active shard");
    }

    return this.#currentShardId;
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

  destroy(): void {
    this.#shards.clear();
    this.#currentIndex = 0;
    this.#currentShardId = null;
  }

  isDmShard(shardId: number): boolean {
    return shardId === 0;
  }
}
