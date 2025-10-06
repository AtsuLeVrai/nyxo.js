import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import type {
  GuildCreateEntity,
  ReadyEntity,
  UnavailableGuildEntity,
} from "../../resources/index.js";
import { sleep } from "../../utils/index.js";
import type { Rest } from "../rest.js";
import { Gateway, GatewayConnectionState, type GatewayOptions } from "./gateway.js";
import type {
  GatewayReceiveEvents,
  RequestGuildMembersEntity,
  RequestSoundboardSoundsEntity,
  UpdatePresenceEntity,
  UpdateVoiceStateEntity,
} from "./gateway.types.js";

export interface ShardInfo {
  shardId: number;
  totalShards: number;
  gateway: Gateway;
  guildCount: number;
  guilds: Set<string>;
  status: GatewayConnectionState;
  lastReady: number | null;
  reconnectAttempts: number;
  uptime: number;
}

export interface ShardManagerEvents {
  shardReady: [shardId: number, guilds: UnavailableGuildEntity[]];
  shardResumed: [shardId: number];
  shardDisconnected: [shardId: number, code: number];
  shardError: [shardId: number, error: Error];
  shardReconnecting: [shardId: number, attempt: number];
  allShardsReady: [];
  dispatch: [
    shardId: number,
    event: keyof GatewayReceiveEvents,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ];
}

export const ShardManagerOptions = z.object({
  totalShards: z.union([z.int().positive(), z.literal("auto")]).default("auto"),
  shardList: z.array(z.int().nonnegative()).optional(),
  spawnDelay: z.int().positive().default(5000),
  autoReconnect: z.boolean().default(true),
  maxReconnectAttempts: z.int().positive().default(5),
});

export class ShardManager extends EventEmitter<ShardManagerEvents> {
  readonly #rest: Rest;
  readonly #gatewayOptions: z.input<typeof GatewayOptions>;
  readonly #shardOptions: z.infer<typeof ShardManagerOptions>;

  #shards = new Map<number, ShardInfo>();
  #maxConcurrency = 1;
  #isSpawning = false;

  constructor(
    rest: Rest,
    gatewayOptions: z.input<typeof GatewayOptions>,
    shardOptions: z.input<typeof ShardManagerOptions> = {},
  ) {
    super();
    this.#rest = rest;
    this.#gatewayOptions = gatewayOptions;

    try {
      this.#shardOptions = ShardManagerOptions.parse(shardOptions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }
  }

  get readyShards(): number {
    return Array.from(this.#shards.values()).filter((shard) => shard.status === "ready").length;
  }

  get totalGuilds(): number {
    return Array.from(this.#shards.values()).reduce((sum, shard) => sum + shard.guildCount, 0);
  }

  get stats() {
    const now = Date.now();
    const shardStats = Array.from(this.#shards.values()).map((shard) => ({
      shardId: shard.shardId,
      status: shard.status,
      guildCount: shard.guildCount,
      uptime: shard.lastReady ? now - shard.lastReady : 0,
      reconnectAttempts: shard.reconnectAttempts,
    }));

    return {
      totalShards: this.totalShards,
      readyShards: this.readyShards,
      totalGuilds: this.totalGuilds,
      averageGuildsPerShard: this.totalGuilds / this.totalShards || 0,
      shards: shardStats,
      allReady: this.readyShards === this.totalShards,
    };
  }

  async spawn(): Promise<void> {
    if (this.#isSpawning) {
      throw new Error("Shards are already spawning");
    }

    this.#isSpawning = true;

    try {
      const gatewayInfo = await this.#rest.gateway.fetchBotGatewayInfo();
      const totalShards =
        this.#shardOptions.totalShards === "auto"
          ? gatewayInfo.shards
          : this.#shardOptions.totalShards;

      this.#maxConcurrency = gatewayInfo.session_start_limit.max_concurrency;
      if (totalShards === 0) {
        throw new Error("Cannot spawn 0 shards");
      }

      const shardIds =
        this.#shardOptions.shardList ?? Array.from({ length: totalShards }, (_, i) => i);
      for (const shardId of shardIds) {
        if (shardId >= totalShards) {
          throw new Error(`Invalid shard ID ${shardId}, must be < ${totalShards}`);
        }
      }

      for (const shardId of shardIds) {
        this.#createShard(shardId, totalShards);
      }

      await this.#spawnShardsByBuckets(shardIds);
    } finally {
      this.#isSpawning = false;
    }
  }

  calculateShardId(guildId: string): number {
    if (this.totalShards === 0) return 0;
    return Number(BigInt(guildId) >> BigInt(22)) % this.totalShards;
  }

  getShardByGuildId(guildId: string): ShardInfo | undefined {
    const shardId = this.calculateShardId(guildId);
    return this.#shards.get(shardId);
  }

  getShard(shardId: number): ShardInfo | undefined {
    return this.#shards.get(shardId);
  }

  updatePresence(presence: UpdatePresenceEntity, shardId?: number): void {
    if (shardId !== undefined) {
      const shard = this.#shards.get(shardId);
      if (shard?.status === "ready") {
        shard.gateway.updatePresence(presence);
      } else {
        throw new Error(`Shard ${shardId} is not ready`);
      }
    } else {
      for (const shard of this.#shards.values()) {
        if (shard.status === "ready") {
          shard.gateway.updatePresence(presence);
        }
      }
    }
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    const shardId = this.calculateShardId(options.guild_id);
    const shard = this.#shards.get(shardId);

    if (!shard || shard.status !== "ready") {
      throw new Error(`Shard ${shardId} is not ready for guild ${options.guild_id}`);
    }

    shard.gateway.updateVoiceState(options);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    const shardId = this.calculateShardId(options.guild_id);
    const shard = this.#shards.get(shardId);

    if (!shard || shard.status !== "ready") {
      throw new Error(`Shard ${shardId} is not ready for guild ${options.guild_id}`);
    }

    shard.gateway.requestGuildMembers(options);
  }

  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    const shardIds = new Set<number>();

    for (const guildId of options.guild_ids) {
      shardIds.add(this.calculateShardId(guildId));
    }

    for (const shardId of shardIds) {
      const shard = this.#shards.get(shardId);
      if (shard?.status === "ready") {
        shard.gateway.requestSoundboardSounds(options);
      }
    }
  }

  async reconnectShard(shardId: number): Promise<void> {
    await this.#scheduleReconnect(shardId);
  }

  disconnectShard(shardId: number, code = 1000, reason = "Manual disconnect"): void {
    const shard = this.#shards.get(shardId);
    if (shard) {
      shard.gateway.disconnect(code, reason);
    }
  }

  async destroy(): Promise<void> {
    const destroyPromises = Array.from(this.#shards.values()).map((shard) => {
      shard.gateway.removeAllListeners();
      return shard.gateway.destroy();
    });

    await Promise.allSettled(destroyPromises);
    this.#shards.clear();
    this.removeAllListeners();
  }

  #createShard(shardId: number, totalShards: number): void {
    const gateway = new Gateway(this.#rest, this.#gatewayOptions);

    const shardInfo: ShardInfo = {
      shardId,
      totalShards,
      gateway,
      guildCount: 0,
      guilds: new Set(),
      status: GatewayConnectionState.Idle,
      lastReady: null,
      reconnectAttempts: 0,
      uptime: 0,
    };

    gateway.on("resumed", () => {
      shardInfo.status = GatewayConnectionState.Ready;
      shardInfo.lastReady = Date.now();
      shardInfo.reconnectAttempts = 0;

      this.emit("shardResumed", shardId);
    });

    gateway.on("wsError", async (error) => {
      shardInfo.status = GatewayConnectionState.Disconnected;
      this.emit("shardError", shardId, error);

      if (this.#shardOptions.autoReconnect) {
        await this.#scheduleReconnect(shardId);
      }
    });

    gateway.on("stateChange", async (_oldState, newState) => {
      shardInfo.status = newState;

      if (newState === "disconnected") {
        this.emit("shardDisconnected", shardId, 1000);
        if (this.#shardOptions.autoReconnect) {
          await this.#scheduleReconnect(shardId);
        }
      }
    });

    gateway.on("dispatch", (event, data) => {
      if (event === "GUILD_CREATE") {
        const guildCreate = data as GuildCreateEntity;
        shardInfo.guilds.add(guildCreate.id);
        shardInfo.guildCount = shardInfo.guilds.size;
      } else if (event === "GUILD_DELETE") {
        const guildDelete = data as UnavailableGuildEntity;
        shardInfo.guilds.delete(guildDelete.id);
        shardInfo.guildCount = shardInfo.guilds.size;
      } else if (event === "READY") {
        const ready = data as ReadyEntity;
        shardInfo.status = GatewayConnectionState.Ready;
        shardInfo.lastReady = Date.now();
        shardInfo.reconnectAttempts = 0;
        shardInfo.guildCount = ready.guilds.length;

        for (const guild of ready.guilds) {
          shardInfo.guilds.add(guild.id);
        }

        this.emit("shardReady", shardId, ready.guilds);
        this.#checkAllShardsReady();
      }

      this.emit("dispatch", shardId, event, data);
    });

    this.#shards.set(shardId, shardInfo);
  }

  async #spawnShardsByBuckets(shardIds: number[]): Promise<void> {
    const buckets = new Map<number, number[]>();
    for (const shardId of shardIds) {
      const bucketId = shardId % this.#maxConcurrency;
      if (!buckets.has(bucketId)) {
        buckets.set(bucketId, []);
      }
      buckets.get(bucketId)?.push(shardId);
    }

    const sortedBuckets = Array.from(buckets.entries()).sort(([a], [b]) => a - b);
    for (let i = 0; i < sortedBuckets.length; i++) {
      const [_bucketId, bucketShards] = sortedBuckets[i] as [number, number[]];
      const gatewayInfo = await this.#rest.gateway.fetchBotGatewayInfo();
      if (gatewayInfo.session_start_limit.remaining === 0) {
        const waitTime = gatewayInfo.session_start_limit.reset_after;
        await sleep(waitTime);
      }

      const connectPromises = bucketShards.map(async (shardId) => {
        const shard = this.#shards.get(shardId) as ShardInfo;
        try {
          shard.gateway.setShard(shardId, shard.totalShards);
          shard.status = GatewayConnectionState.Connecting;
          await shard.gateway.connect();
        } catch (_error) {
          shard.status = GatewayConnectionState.Failed;
        }
      });

      await Promise.allSettled(connectPromises);
      if (i < sortedBuckets.length - 1) {
        await sleep(this.#shardOptions.spawnDelay);
      }
    }
  }

  async #scheduleReconnect(shardId: number): Promise<void> {
    const shard = this.#shards.get(shardId);
    if (!shard) return;

    if (shard.reconnectAttempts >= this.#shardOptions.maxReconnectAttempts) {
      shard.status = GatewayConnectionState.Failed;
      return;
    }

    shard.reconnectAttempts++;
    shard.status = GatewayConnectionState.Reconnecting;

    this.emit("shardReconnecting", shardId, shard.reconnectAttempts);

    const delay = Math.min(1000 * 2 ** (shard.reconnectAttempts - 1) + Math.random() * 1000, 30000);
    await sleep(delay);
    try {
      await shard.gateway.connect();
    } catch (_error) {
      setTimeout(() => this.#scheduleReconnect(shardId), 5000);
    }
  }

  #checkAllShardsReady(): void {
    const allReady = Array.from(this.#shards.values()).every((shard) => shard.status === "ready");

    if (allReady) {
      this.emit("allShardsReady");
    }
  }
}
