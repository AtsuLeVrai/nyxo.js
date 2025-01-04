import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type {
  GatewayEvents,
  ShardSession,
  ShardingConfig,
} from "../types/index.js";

export class ShardManager extends EventEmitter<GatewayEvents> {
  static readonly GUILDS_PER_SHARD = 2500;
  static readonly LARGE_BOT_THRESHOLD = 150000;
  static readonly LARGE_THRESHOLD_SHARD0 = 250;
  static readonly LARGE_THRESHOLD_OTHER = 50;

  #maxConcurrency = 1;
  #recommendedShards = 1;
  #guildCount = 0;
  #currentShardIndex = 0;
  #shards: Store<string, ShardSession> = new Store();
  #buckets: Store<number, Store<number, ShardSession[]>> = new Store();

  #config: ShardingConfig;

  constructor(config: ShardingConfig = {}) {
    super();
    this.#config = config;
    this.#validateConfig();
  }

  static calculateShardId(guildId: string, numShards: number): number {
    return Number(BigInt(guildId) >> BigInt(22)) % numShards;
  }

  static calculateRateLimitKey(
    shardId: number,
    maxConcurrency: number,
  ): number {
    return shardId % maxConcurrency;
  }

  async spawn(
    guildCount: number,
    maxConcurrency: number,
    recommendedShards: number,
  ): Promise<void> {
    try {
      this.#guildCount = guildCount;
      this.#maxConcurrency = maxConcurrency;
      this.#recommendedShards = recommendedShards;

      const totalShards = this.#calculateTotalShards();
      const sessions = this.#createSessions(totalShards);

      this.#createBuckets(sessions);
      await this.#spawnBuckets();
    } catch (error) {
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  getNextShard(): [number, number] {
    const sessions = Array.from(this.#shards.values());
    if (sessions.length === 0) {
      throw new Error("No shards available");
    }

    const session = sessions[this.#currentShardIndex];
    if (!session) {
      throw new Error("No shard found");
    }

    this.#currentShardIndex = (this.#currentShardIndex + 1) % sessions.length;
    return [session.shardId, session.numShards];
  }

  getShards(index = 0): [number, number] {
    const sessions = Array.from(this.#shards.values());
    if (sessions.length === 0) {
      throw new Error("No shards available");
    }

    const session = sessions[index % sessions.length];
    if (!session) {
      throw new Error(`No shard found at index ${index}`);
    }

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

  updateGuildCount(count: number): void {
    this.#guildCount = count;
  }

  destroy(): void {
    this.#shards.clear();
    this.#buckets.clear();
  }

  #validateConfig(): void {
    this.#config.spawnTimeout = this.#config.spawnTimeout ?? 5000;
  }

  #createBuckets(sessions: ShardSession[]): void {
    const maxConcurrency = this.#maxConcurrency;
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
        const rateLimitKey = session.shardId % maxConcurrency;
        if (!bucketGroup.has(rateLimitKey)) {
          bucketGroup.set(rateLimitKey, []);
        }
        bucketGroup.get(rateLimitKey)?.push(session);
      }
    }
  }

  async #spawnBuckets(): Promise<void> {
    const maxConcurrency = this.#maxConcurrency;

    const buckets = new Store<number, ShardSession[]>();
    for (let i = 0; i < maxConcurrency; i++) {
      buckets.set(i, []);
    }

    for (const [, bucketGroup] of this.#buckets) {
      for (const [, sessions] of bucketGroup) {
        for (const session of sessions) {
          const rateLimitKey = ShardManager.calculateRateLimitKey(
            session.shardId,
            maxConcurrency,
          );
          buckets.get(rateLimitKey)?.push(session);
        }
      }
    }

    const sortedBucketEntries = Array.from(buckets.entries()).sort(
      ([a], [b]) => a - b,
    );

    for (const [bucketId, sessions] of sortedBucketEntries) {
      if (sessions.length === 0) {
        continue;
      }

      this.emit(
        "debug",
        `Spawning bucket ${bucketId} with shards: ${sessions.map((s) => s.shardId).join(", ")}`,
      );

      await Promise.all(sessions.map((session) => this.#spawnSession(session)));

      const lastEntry = sortedBucketEntries.at(-1);
      if (!lastEntry) {
        continue;
      }

      const isLastBucket = bucketId === lastEntry[0];
      if (!isLastBucket) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.#config.spawnTimeout),
        );
      }
    }
  }

  #validateShardConfiguration(session: ShardSession): void {
    const guildsPerShard = Math.ceil(this.#guildCount / session.numShards);
    if (guildsPerShard > ShardManager.GUILDS_PER_SHARD) {
      throw new Error(
        `Too many guilds per shard: ${guildsPerShard} exceeds maximum of ${ShardManager.GUILDS_PER_SHARD}`,
      );
    }

    if (
      this.#guildCount >= ShardManager.LARGE_BOT_THRESHOLD &&
      session.numShards % this.#recommendedShards !== 0
    ) {
      throw new Error(
        `For large bots, shard count (${session.numShards}) must be a multiple of ` +
          `the recommended count (${this.#recommendedShards})`,
      );
    }

    if (session.shardId === 0) {
      this.emit("debug", "Shard 0 will receive DMs");
    }
  }

  async #spawnSession(session: ShardSession): Promise<void> {
    this.#validateShardConfiguration(session);

    const shardKey = `${session.shardId}-${session.numShards}-${session.sessionIndex ?? 0}`;

    if (
      this.#shards.has(shardKey) &&
      this.#config.handoffStrategy === "graceful"
    ) {
      await this.#gracefulHandoff(shardKey);
    }

    this.#shards.set(shardKey, session);
  }

  async #gracefulHandoff(shardKey: string): Promise<void> {
    const oldShard = this.#shards.get(shardKey);
    if (!oldShard) {
      return;
    }

    await new Promise<void>((resolve) => {
      const cleanup = (): void => {
        this.#shards.delete(shardKey);
        resolve();
      };

      setTimeout(cleanup, 5000);
    });
  }

  #calculateTotalShards(): number {
    return this.#config.totalShards === "auto"
      ? this.#recommendedShards
      : (this.#config.totalShards ?? 1);
  }

  #createSessions(totalShards: number): ShardSession[] {
    if (this.#config.sessions) {
      return this.#config.sessions;
    }

    const shardList =
      this.#config.shardList ??
      Array.from({ length: totalShards }, (_, i) => i);

    return shardList.map((shardId) => ({
      shardId,
      numShards: totalShards,
      largeThreshold:
        shardId === 0
          ? ShardManager.LARGE_THRESHOLD_SHARD0
          : ShardManager.LARGE_THRESHOLD_OTHER,
    }));
  }
}
