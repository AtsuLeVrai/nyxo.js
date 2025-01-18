import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import type { ShardOptions } from "../options/index.js";
import type { GatewayEvents, ShardSession } from "../types/index.js";

export class ShardService extends EventEmitter<GatewayEvents> {
  readonly #shards = new Store<string, ShardSession>();
  readonly #buckets = new Store<number, Store<number, string[]>>();
  readonly #state = {
    guildCount: 0,
    recommendedShards: 1,
    maxConcurrency: 1,
    currentShardIndex: 0,
    isSpawning: false,
  };

  readonly #options: z.output<typeof ShardOptions>;

  constructor(options: z.output<typeof ShardOptions>) {
    super();
    this.#options = options;
    this.#state.maxConcurrency = this.#options.maxConcurrency;
  }

  get totalShards(): number {
    return this.#shards.size;
  }

  get connectedShards(): number {
    return Array.from(this.#shards.values()).filter(
      (s) => s.status === "connected",
    ).length;
  }

  isFullyConnected(): boolean {
    return this.connectedShards === this.totalShards;
  }

  isEnabled(): boolean {
    return Boolean(this.#options.totalShards);
  }

  async spawn(
    guildCount?: number,
    maxConcurrency?: number,
    recommendedShards?: number,
  ): Promise<void> {
    if (!this.#options.totalShards) {
      return;
    }

    if (this.#state.isSpawning) {
      this.emit("debug", "Spawn already in progress");
      return;
    }

    try {
      this.#state.isSpawning = true;
      this.emit("debug", "Initializing spawn process");

      this.#state.guildCount = guildCount ?? this.#state.guildCount;
      this.#state.maxConcurrency = this.#validateConcurrency(
        maxConcurrency ?? this.#options.maxConcurrency,
      );
      this.#state.recommendedShards =
        recommendedShards ?? this.#calculateRecommendedShards();

      const totalShards = this.#calculateTotalShards(this.#options.totalShards);
      const sessions = this.#createShardSessions(totalShards);

      this.#createBuckets(sessions);
      await this.#spawnBuckets();

      this.emit(
        "debug",
        `Spawn process completed - ${totalShards} shards initialized`,
      );
    } catch (error) {
      throw new Error("Failed to spawn shard", {
        cause: error,
      });
    } finally {
      this.#state.isSpawning = false;
    }
  }

  getNextShard(): [number, number] {
    const shards = Array.from(this.#shards.values());
    if (shards.length === 0) {
      throw new Error("No shards are available");
    }

    const session = shards[this.#state.currentShardIndex];
    if (!session) {
      throw new Error(`Invalid shard ID: ${this.#state.currentShardIndex}`);
    }

    this.#state.currentShardIndex =
      (this.#state.currentShardIndex + 1) % shards.length;
    return [session.shardId, session.numShards];
  }

  calculateShardId(guildId: string): number {
    return Number(BigInt(guildId) >> BigInt(22)) % this.totalShards;
  }

  async respawnAll(): Promise<void> {
    this.emit("debug", "Starting full respawn");
    this.destroy();
    await this.spawn();
  }

  async respawnShard(shardId: number): Promise<void> {
    const session = this.#getSession(shardId);
    if (!session) {
      throw new Error(`Invalid shard ID: ${shardId}`);
    }

    this.emit("debug", `Respawning shard ${shardId}`);
    await this.#destroyShard(shardId);
    this.emit("shardReconnect", shardId);
    await this.#spawnShard(session);
  }

  destroy(): void {
    this.emit("debug", "Destroying shard service");

    const destroyPromises = Array.from(this.#shards.keys()).map((shardId) =>
      this.#destroyShard(Number(shardId)),
    );

    Promise.all(destroyPromises).then(() => {
      this.#shards.clear();
      this.#buckets.clear();
      this.emit("debug", "All shards destroyed");
    });
  }

  updateGuildCount(count: number): void {
    this.#state.guildCount = count;
    this.emit("debug", `Updated guild count: ${count}`);
  }

  getShardStatus(shardId: number): Readonly<ShardSession> | undefined {
    return this.#getSession(shardId);
  }

  #validateConcurrency(concurrency: number): number {
    if (concurrency > 16) {
      throw new Error(`Max concurrency exceeded: ${concurrency} > ${16}`);
    }
    return concurrency;
  }

  #createShardSessions(totalShards: number): ShardSession[] {
    const shardList =
      this.#options.shardList?.length > 0
        ? this.#options.shardList
        : Array.from({ length: totalShards }, (_, i) => i);

    return shardList.map((shardId) => ({
      shardId,
      numShards: totalShards,
      status: "idle",
      guildCount: 0,
    }));
  }

  #createBuckets(sessions: ShardSession[]): void {
    this.#buckets.clear();

    const shardGroups = new Store<number, string[]>();
    for (const session of sessions) {
      const shardKey = this.#getShardKey(session.shardId);
      this.#shards.set(shardKey, session);

      if (!shardGroups.has(session.numShards)) {
        shardGroups.set(session.numShards, []);
      }
      shardGroups.get(session.numShards)?.push(shardKey);
    }

    for (const [numShards, shardKeys] of shardGroups) {
      const bucketGroup = new Store<number, string[]>();
      this.#buckets.set(numShards, bucketGroup);

      for (const shardKey of shardKeys) {
        const session = this.#shards.get(shardKey);
        if (!session) {
          continue;
        }

        const bucketId = this.#calculateBucketId(session.shardId);
        if (!bucketGroup.has(bucketId)) {
          bucketGroup.set(bucketId, []);
        }
        bucketGroup.get(bucketId)?.push(shardKey);
      }
    }
  }

  async #spawnBuckets(): Promise<void> {
    const buckets = this.#getBucketsList();

    for (const [bucketId, shardKeys] of buckets) {
      this.emit(
        "debug",
        `Spawning bucket ${bucketId} with shards: ${shardKeys
          .map((key) => this.#shards.get(key)?.shardId)
          .join(", ")}`,
      );

      const spawnPromises = shardKeys.map((shardKey) => {
        const session = this.#shards.get(shardKey);
        if (!session) {
          return Promise.resolve();
        }
        return this.#spawnShard(session);
      });

      await Promise.all(spawnPromises);
      this.emit("shardSpawn", bucketId);

      if (bucketId !== buckets.at(-1)?.[0]) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.#options.spawnDelay),
        );
      }
    }
  }

  async #spawnShard(session: ShardSession): Promise<void> {
    const shardKey = this.#getShardKey(session.shardId);

    await this.#gracefulHandoff(shardKey);

    this.#shards.set(shardKey, {
      ...session,
      status: "connected",
    });

    this.emit("shardSpawn", session.shardId);
    if (this.isFullyConnected()) {
      this.emit("shardReady", session.shardId);
    }
  }

  async #gracefulHandoff(shardKey: string): Promise<void> {
    const oldSession = this.#shards.get(shardKey);
    if (!oldSession) {
      return;
    }

    this.emit(
      "debug",
      `Starting graceful handoff for shard ${oldSession.shardId}`,
    );

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Shard ${oldSession.shardId} spawn timed out after ${this.#options.spawnTimeout}ms`,
          ),
        );
      }, this.#options.spawnTimeout);

      const cleanup = (): void => {
        clearTimeout(timeout);
        this.#shards.delete(shardKey);
        resolve();
      };

      try {
        cleanup();
      } catch (error) {
        reject(error);
      }
    });
  }

  #calculateRecommendedShards(): number {
    if (!this.#state.guildCount) {
      return 1;
    }

    const guildsPerShard = Math.ceil(
      this.#state.guildCount / this.#options.shardCount,
    );

    if (guildsPerShard > this.#options.maxGuildsPerShard) {
      const recommended = Math.ceil(
        this.#state.guildCount / this.#options.maxGuildsPerShard,
      );

      this.emit(
        "debug",
        `Calculated ${recommended} recommended shards based on ${this.#state.guildCount} guilds`,
      );

      return recommended;
    }

    return this.#options.shardCount;
  }

  #calculateTotalShards(totalShards: "auto" | number): number {
    if (totalShards === "auto") {
      return this.#state.recommendedShards;
    }

    return totalShards;
  }

  #getBucketsList(): [number, string[]][] {
    const buckets = new Store<number, string[]>();

    for (const [, bucketGroup] of this.#buckets) {
      for (const [bucketId, shardKeys] of bucketGroup) {
        if (!buckets.has(bucketId)) {
          buckets.set(bucketId, []);
        }

        for (const shardKey of shardKeys) {
          buckets.get(bucketId)?.push(shardKey);
        }
      }
    }

    return Array.from(buckets.entries()).sort(([a], [b]) => a - b);
  }

  #getShardKey(shardId: number): string {
    return `${shardId}`;
  }

  #calculateBucketId(shardId: number): number {
    return shardId % this.#state.maxConcurrency;
  }

  #getSession(shardId: number): ShardSession | undefined {
    return this.#shards.get(this.#getShardKey(shardId));
  }

  async #destroyShard(shardId: number): Promise<void> {
    const shardKey = this.#getShardKey(shardId);
    const session = this.#shards.get(shardKey);

    if (!session) {
      return;
    }

    session.status = "disconnected";

    await new Promise((resolve) => setTimeout(resolve, 100));

    this.#shards.delete(shardKey);
    this.emit("shardDisconnect", shardId);

    this.emit("debug", `Destroyed shard ${shardId}`);
  }
}
