import { setTimeout } from "node:timers/promises";
import { Store } from "@nyxjs/store";
import type { Gateway } from "../core/index.js";
import type { ShardOptions } from "../options/index.js";
import type { ShardData, ShardStatus } from "../types/index.js";

export class ShardManager {
  #shards = new Store<number, ShardData>();
  #maxConcurrency = 1;

  readonly #gateway: Gateway;
  readonly #options: ShardOptions;

  constructor(gateway: Gateway, options: ShardOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  get totalShards(): number {
    return this.#shards.size;
  }

  get maxConcurrency(): number {
    return this.#maxConcurrency;
  }

  get shards(): Store<number, ShardData> {
    return this.#shards;
  }

  get shardIds(): number[] {
    return Array.from(this.#shards.keys());
  }

  get shardData(): ShardData[] {
    return Array.from(this.#shards.values());
  }

  isEnabled(): boolean {
    const totalGuildCount = this.#calculateTotalGuildCount();
    return (
      Boolean(this.#options.totalShards) ||
      totalGuildCount >= this.#options.largeThreshold
    );
  }

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
  }

  async getAvailableShard(): Promise<[number, number]> {
    let attempts = 0;

    for (const [shardId, shard] of this.#shards.entries()) {
      if (this.isShardBucketAvailable(shard.bucket)) {
        if (shard.status === "reconnecting") {
          this.#gateway.emit("shardReconnect", {
            shardId,
            totalShards: shard.totalShards,
            attempts: ++attempts,
            delay: this.#options.spawnDelay,
          });
        }

        shard.rateLimit.remaining--;
        this.setShardStatus(shardId, "connecting");
        return [shardId, shard.totalShards];
      }
    }

    await this.#waitForAvailableBucket();
    return this.getAvailableShard();
  }

  addGuildToShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guilds.add(guildId);
    shard.guildCount = shard.guilds.size;

    this.#gateway.emit("debug", `Added guild ${guildId} to shard ${shardId}`);
  }

  removeGuildFromShard(guildId: string): void {
    const shardId = this.calculateShardId(guildId);
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    shard.guilds.delete(guildId);
    shard.guildCount = shard.guilds.size;

    this.#gateway.emit(
      "debug",
      `Removed guild ${guildId} from shard ${shardId}`,
    );
  }

  addGuildsToShard(shardId: number, guildIds: string[]): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    for (const guildId of guildIds) {
      shard.guilds.add(guildId);
    }

    shard.guildCount = shard.guilds.size;

    this.#gateway.emit(
      "debug",
      `Added ${guildIds.length} guilds to shard ${shardId}`,
    );
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

  getShardByGuildId(guildId: string): Readonly<ShardData> | undefined {
    const shardId = this.calculateShardId(guildId);
    return this.getShardInfo(shardId);
  }

  setShardStatus(shardId: number, status: ShardStatus): void {
    const shard = this.#shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    const oldStatus = shard.status;
    shard.status = status;

    if (status === "disconnected" && oldStatus !== "disconnected") {
      this.#gateway.emit("shardDisconnect", {
        shardId,
        totalShards: shard.totalShards,
        code: 1006,
        reason: "Connection closed",
        wasClean: false,
      });
    }

    if (status === "resuming") {
      this.#gateway.emit("shardResume", {
        shardId,
        totalShards: shard.totalShards,
        sessionId: this.#gateway.session.sessionId ?? "",
        replayedEvents: 0,
        latency: this.#gateway.heartbeat.latency,
      });
    }
  }

  isDmShard(shardId: number): boolean {
    return shardId === 0;
  }

  destroy(): void {
    for (const [shardId] of this.#shards.entries()) {
      this.setShardStatus(shardId, "disconnected");
    }

    this.#shards.clear();
  }

  isShardBucketAvailable(bucket: number): boolean {
    const shards = Array.from(this.#shards.values()).filter(
      (shard) => shard.bucket === bucket,
    );

    return shards.some((shard) => shard.rateLimit.remaining > 0);
  }

  async #waitForAvailableBucket(): Promise<void> {
    const nextReset = Math.min(
      ...Array.from(this.#shards.values()).map(
        (shard) => shard.rateLimit.reset,
      ),
    );

    for (const shard of this.#shards.values()) {
      if (shard.rateLimit.remaining === 0) {
        this.#gateway.emit("shardRateLimit", {
          shardId: shard.shardId,
          totalShards: shard.totalShards,
          bucket: shard.bucket,
          timeout: nextReset - Date.now(),
          remaining: 0,
          reset: nextReset,
        });
      }
    }

    const delay = nextReset - Date.now();
    if (delay > 0) {
      await setTimeout(delay);
    }

    for (const shard of this.#shards.values()) {
      if (shard.rateLimit.reset <= nextReset) {
        shard.rateLimit.remaining = 120;
        shard.rateLimit.reset = Date.now() + 60_000;
      }
    }
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
  ): boolean {
    const isShardingRequired = guildCount >= this.#options.largeThreshold;
    const hasConfiguredShards = this.#options.totalShards !== undefined;

    if (!(isShardingRequired && hasConfiguredShards)) {
      return false;
    }

    const minShards = Math.ceil(guildCount / this.#options.largeThreshold);
    if (
      guildCount >= this.#options.largeThreshold &&
      recommendedShards < minShards
    ) {
      throw new Error(
        `Recommended shard count too low (minimum ${minShards} shards required)`,
      );
    }

    return true;
  }

  #calculateTotalShards(guildCount: number, recommendedShards: number): number {
    if (this.#options.totalShards === "auto") {
      return recommendedShards;
    }

    if (typeof this.#options.totalShards === "number") {
      return this.#options.totalShards;
    }

    const minimumShards = Math.ceil(guildCount / this.#options.largeThreshold);
    return Math.max(1, minimumShards);
  }

  #handleLargeBotRequirements(
    guildCount: number,
    totalShards: number,
    recommendedShards: number,
  ): void {
    const isLargeBot = guildCount >= this.#options.veryLargeThreshold;

    if (!isLargeBot) {
      return;
    }

    if (totalShards % recommendedShards !== 0) {
      throw new Error(
        `Total shards (${totalShards}) must be a multiple of recommended shards (${recommendedShards}) for large bots`,
      );
    }

    const newSessionLimit = Math.max(
      this.#options.minSessionLimit,
      Math.ceil((guildCount / 1000) * this.#options.sessionsPerGuilds),
    );

    this.#gateway.emit(
      "debug",
      `Large bot detected - Session limit increased to ${newSessionLimit}`,
    );
  }

  async #spawnShards(totalShards: number): Promise<void> {
    if (this.#options.shardList) {
      this.#validateShardList(totalShards);
    }

    const buckets = this.#createShardBuckets(totalShards);
    await this.#spawnShardBuckets(buckets, totalShards);
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
  ): Promise<void> {
    const orderedBuckets = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );

    const chunkSize = this.maxConcurrency;
    for (let i = 0; i < orderedBuckets.length; i += chunkSize) {
      const chunk = orderedBuckets.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async ([bucketId, bucketShardIds]) => {
          this.#gateway.emit(
            "debug",
            `Spawning bucket ${bucketId} with shards: ${bucketShardIds.join(", ")}`,
          );

          await Promise.all(
            bucketShardIds.map((shardId) =>
              this.#initializeShard(shardId, totalShards),
            ),
          );
        }),
      );

      if (i + chunkSize < orderedBuckets.length) {
        await setTimeout(this.#options.spawnDelay);
      }
    }
  }

  #initializeShard(shardId: number, totalShards: number): void {
    this.#shards.set(shardId, {
      shardId,
      totalShards,
      guildCount: 0,
      guilds: new Set(),
      status: "disconnected",
      bucket: this.getRateLimitKey(shardId),
      rateLimit: {
        remaining: 120,
        reset: Date.now() + 60_000,
      },
    });

    this.#gateway.emit("shardReady", {
      shardId,
      totalShards,
      sessionId: this.#gateway.session.sessionId ?? "",
      latency: this.#gateway.heartbeat.latency,
      guildCount: 0,
    });

    this.#gateway.emit(
      "debug",
      `Shard ${shardId}/${totalShards - 1} connected`,
    );
  }
}
