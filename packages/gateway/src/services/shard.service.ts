import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import { ShardOptions, ShardSession } from "../schemas/index.js";
import type { GatewayEvents } from "../types/index.js";

export class ShardService extends EventEmitter<GatewayEvents> {
  #guildCount = 0;
  #recommendedShards = 1;
  #maxConcurrency = 1;
  #currentShardIndex = 0;
  #shards: Store<string, ShardSession> = new Store();
  #buckets: Store<number, Store<number, ShardSession[]>> = new Store();

  readonly #options: ShardOptions;

  constructor(options: Partial<ShardOptions> = {}) {
    super();
    this.#options = ShardOptions.parse(options);
  }

  get totalShards(): number {
    return this.#shards.size;
  }

  get connectedShards(): number {
    return Array.from(this.#shards.values()).filter(
      (s) => s.status === "connected",
    ).length;
  }

  get currentOptions(): Readonly<Required<ShardOptions>> {
    return Object.freeze({ ...this.#options });
  }

  get isFullyConnected(): boolean {
    return this.connectedShards === this.totalShards;
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

    const session = sessions[this.#currentShardIndex];
    if (!session) {
      throw new Error(`No shard found at index ${this.#currentShardIndex}`);
    }

    this.#currentShardIndex = (this.#currentShardIndex + 1) % sessions.length;

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

    for (const [shardId] of this.#shards) {
      this.#destroyShard(Number.parseInt(shardId));
    }

    this.#shards.clear();
    this.#buckets.clear();
  }

  updateGuildCount(count: number): void {
    this.#guildCount = count;
    this.emit("debug", `[Gateway:ShardService] Updated guild count: ${count}`);
  }

  #createShardSessions(totalShards: number): ShardSession[] {
    const shardList =
      this.#options.shardList?.length > 0
        ? this.#options.shardList
        : Array.from({ length: totalShards }, (_, i) => i);

    return shardList.map((shardId) => {
      const data: ShardSession = {
        shardId,
        numShards: totalShards,
        status: "idle",
        guildCount: 0,
      };

      return ShardSession.parse(data);
    });
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

    await this.#gracefulHandoff(shardKey);

    session.status = "connected";
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

    this.#shards.delete(shardKey);
    this.emit("shardDisconnect", shardId);

    this.emit("debug", `[Gateway:ShardService] Destroyed shard ${shardId}`);
  }
}
