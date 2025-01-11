import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { ShardController } from "../controllers/index.js";
import { ShardError } from "../errors/index.js";
import { ShardOptions, ShardSession } from "../schemas/index.js";
import type { GatewayEvents } from "../types/index.js";

export class ShardService extends EventEmitter<GatewayEvents> {
  readonly #shards = new Store<string, ShardController>();
  readonly #buckets = new Store<number, Store<number, ShardController[]>>();
  readonly #state = {
    guildCount: 0,
    recommendedShards: 1,
    maxConcurrency: 1,
    currentShardIndex: 0,
    isSpawning: false,
  };

  readonly #options: z.output<typeof ShardOptions>;

  constructor(options: z.input<typeof ShardOptions> = {}) {
    super();
    try {
      this.#options = ShardOptions.parse(options);
    } catch (error) {
      throw ShardError.validationError(fromError(error).message);
    }

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

  get isFullyConnected(): boolean {
    return this.connectedShards === this.totalShards;
  }

  async spawn(
    guildCount?: number,
    maxConcurrency?: number,
    recommendedShards?: number,
  ): Promise<void> {
    if (this.#state.isSpawning) {
      this.emit("debug", "[Gateway:ShardService] Spawn already in progress");
      return;
    }

    try {
      this.#state.isSpawning = true;
      this.emit("debug", "[Gateway:ShardService] Initializing spawn process");

      this.#state.guildCount = guildCount ?? this.#state.guildCount;
      this.#state.maxConcurrency = this.#validateConcurrency(
        maxConcurrency ?? this.#options.maxConcurrency,
      );
      this.#state.recommendedShards =
        recommendedShards ?? this.#calculateRecommendedShards();

      const totalShards = this.#calculateTotalShards();
      const sessions = this.#createShardSessions(totalShards);

      this.#createBuckets(sessions);
      await this.#spawnBuckets();

      this.emit(
        "debug",
        `[Gateway:ShardService] Spawn process completed - ${totalShards} shards initialized`,
      );
    } catch (error) {
      throw ShardError.spawnError(-1, error);
    } finally {
      this.#state.isSpawning = false;
    }
  }

  getNextShard(): [number, number] {
    const shards = Array.from(this.#shards.values());
    if (shards.length === 0) {
      throw ShardError.noShardsAvailable();
    }

    const controller = shards[this.#state.currentShardIndex];
    if (!controller) {
      throw ShardError.invalidShardId(this.#state.currentShardIndex);
    }

    this.#state.currentShardIndex =
      (this.#state.currentShardIndex + 1) % shards.length;
    return [controller.shardId, controller.numShards];
  }

  getShardInfo(shardId: number): [number, number] {
    const controller = this.#getController(shardId);
    if (!controller) {
      throw ShardError.invalidShardId(shardId);
    }

    return [controller.shardId, controller.numShards];
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
    const controller = this.#getController(shardId);
    if (!controller) {
      throw ShardError.invalidShardId(shardId);
    }

    this.emit("debug", `[Gateway:ShardService] Respawning shard ${shardId}`);
    await this.#destroyShard(shardId);
    await this.#spawnShard(controller.session);
  }

  destroy(): void {
    this.emit("debug", "[Gateway:ShardService] Destroying shard service");

    const destroyPromises = Array.from(this.#shards.keys()).map((shardId) =>
      this.#destroyShard(Number(shardId)),
    );

    Promise.all(destroyPromises).then(() => {
      this.#shards.clear();
      this.#buckets.clear();
      this.emit("debug", "[Gateway:ShardService] All shards destroyed");
    });
  }

  updateGuildCount(count: number): void {
    this.#state.guildCount = count;
    this.emit("debug", `[Gateway:ShardService] Updated guild count: ${count}`);
  }

  getShardStatus(shardId: number): ShardController | undefined {
    return this.#getController(shardId);
  }

  #validateConcurrency(concurrency: number): number {
    if (concurrency > 16) {
      throw ShardError.concurrencyExceeded(concurrency, 16);
    }
    return concurrency;
  }

  #createShardSessions(totalShards: number): ShardSession[] {
    const shardList =
      this.#options.shardList?.length > 0
        ? this.#options.shardList
        : Array.from({ length: totalShards }, (_, i) => i);

    return shardList.map((shardId) => {
      const session: ShardSession = {
        shardId,
        numShards: totalShards,
        status: "idle",
        guildCount: 0,
      };

      return ShardSession.parse(session);
    });
  }

  #createBuckets(sessions: ShardSession[]): void {
    this.#buckets.clear();

    const shardGroups = new Store<number, ShardController[]>();
    for (const session of sessions) {
      const controller = new ShardController(session);
      if (!shardGroups.has(session.numShards)) {
        shardGroups.set(session.numShards, []);
      }
      shardGroups.get(session.numShards)?.push(controller);
    }

    for (const [numShards, controllers] of shardGroups) {
      const bucketGroup = new Store<number, ShardController[]>();
      this.#buckets.set(numShards, bucketGroup);

      for (const controller of controllers) {
        const bucketId = this.#calculateBucketId(controller.shardId);
        if (!bucketGroup.has(bucketId)) {
          bucketGroup.set(bucketId, []);
        }
        bucketGroup.get(bucketId)?.push(controller);
      }
    }
  }

  async #spawnBuckets(): Promise<void> {
    const buckets = this.#getBucketsList();

    for (const [bucketId, controllers] of buckets) {
      this.emit(
        "debug",
        `[Gateway:ShardService] Spawning bucket ${bucketId} with shards: ${controllers
          .map((c) => c.shardId)
          .join(", ")}`,
      );

      const spawnPromises = controllers.map((controller) =>
        this.#spawnShard(controller.session),
      );

      await Promise.all(spawnPromises);

      if (bucketId !== buckets.at(-1)?.[0]) {
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

    const controller = new ShardController(session);
    controller.setStatus("connected");

    this.#shards.set(shardKey, controller);
    this.emit("shardSpawn", controller.shardId);
  }

  async #gracefulHandoff(shardKey: string): Promise<void> {
    const oldController = this.#shards.get(shardKey);
    if (!oldController) {
      return;
    }

    this.emit(
      "debug",
      `[Gateway:ShardService] Starting graceful handoff for shard ${oldController.shardId}`,
    );

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          ShardError.spawnTimeout(
            oldController.shardId,
            this.#options.spawnTimeout,
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
        `[Gateway:ShardService] Calculated ${recommended} recommended shards based on ${this.#state.guildCount} guilds`,
      );

      return recommended;
    }

    return this.#options.shardCount;
  }

  #calculateTotalShards(): number {
    if (this.#options.totalShards === "auto") {
      return this.#state.recommendedShards;
    }
    return this.#options.totalShards;
  }

  #validateShardSession(session: ShardSession): void {
    if (session.shardId < 0) {
      throw ShardError.invalidShardId(session.shardId);
    }

    if (session.numShards < 1) {
      throw ShardError.invalidSession(session.shardId, session.numShards);
    }

    if (session.shardId >= session.numShards) {
      throw ShardError.invalidSession(session.shardId, session.numShards);
    }

    const guildsPerShard = Math.ceil(
      this.#state.guildCount / session.numShards,
    );
    if (guildsPerShard > this.#options.maxGuildsPerShard) {
      throw ShardError.tooManyGuilds(
        guildsPerShard,
        this.#options.maxGuildsPerShard,
      );
    }
  }

  #getBucketsList(): [number, ShardController[]][] {
    const buckets = new Store<number, ShardController[]>();

    for (const [, bucketGroup] of this.#buckets) {
      for (const [bucketId, controllers] of bucketGroup) {
        if (!buckets.has(bucketId)) {
          buckets.set(bucketId, []);
        }

        for (const controller of controllers) {
          buckets.get(bucketId)?.push(controller);
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

  #getController(shardId: number): ShardController | undefined {
    return this.#shards.get(this.#getShardKey(shardId));
  }

  async #destroyShard(shardId: number): Promise<void> {
    const shardKey = this.#getShardKey(shardId);
    const controller = this.#shards.get(shardKey);

    if (!controller) {
      return;
    }

    controller.setStatus("disconnected");

    await new Promise((resolve) => setTimeout(resolve, 100));

    this.#shards.delete(shardKey);
    this.emit("shardDisconnect", shardId);

    this.emit("debug", `[Gateway:ShardService] Destroyed shard ${shardId}`);
  }
}
