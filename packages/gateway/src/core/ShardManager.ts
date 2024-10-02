import { platform } from "node:os";
import { setTimeout } from "node:timers/promises";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { GatewayRoutes, UserRoutes } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import type { IdentifyStructure } from "../events/identity";
import type { GatewayManagerOptions } from "../types/gateway";
import type { GatewayManager } from "./GatewayManager";

type ShardInfo = {
    /**
     * The shard ID.
     */
    shardId: Integer;
    /**
     * The total number of shards.
     */
    totalShards: Integer;
};

export class ShardManager {
    #maxConcurrency: number = 1;

    readonly #token: string;

    readonly #ws: GatewayManager;

    readonly #rest: Rest;

    readonly #options: Readonly<GatewayManagerOptions>;

    readonly #shards: Store<Integer, ShardInfo> = new Store();

    readonly #rateLimitQueue: Store<Integer, ShardInfo[]> = new Store();

    public constructor(ws: GatewayManager, token: string, rest: Rest, options: GatewayManagerOptions) {
        this.#ws = ws;
        this.#token = token;
        this.#rest = rest;
        this.#options = options;
        this.#options = Object.freeze({ ...options });
    }

    public async start(): Promise<void> {
        try {
            if (this.#options.shard === "auto") {
                await this.autoShard();
            } else {
                await this.connectOne();
            }
        } catch (error) {
            throw new Error(`Failed to initialize ShardManager: ${error}`);
        }
    }

    public clear(): void {
        this.#shards.clear();
        this.#rateLimitQueue.clear();
    }

    private calculateShardId(guildId: Snowflake, totalShards: Integer): Integer {
        const guildIdBigInt = BigInt(guildId);
        const shardIdBigInt = (guildIdBigInt >> 22n) % BigInt(totalShards);
        return Number(shardIdBigInt);
    }

    private async getShardInfo(): Promise<[Integer, Integer, number]> {
        const info = await this.#rest.request(GatewayRoutes.getGatewayBot());
        const totalShards = info.shards;
        const maxConcurrency = info.session_start_limit.max_concurrency;

        const guilds = await this.#rest.request(UserRoutes.getCurrentUserGuilds());

        if (guilds.length <= 2_500) {
            this.#ws.emit("warn", "The bot is in less than 2500 guilds, auto-sharding is not necessary.");
        }

        if (guilds.length === 0) {
            return [0, totalShards, maxConcurrency];
        }

        const shardIds = new Set<Integer>();
        for (const guild of guilds) {
            const shardId = this.calculateShardId(guild.id, totalShards);
            shardIds.add(shardId);
        }

        const minShardId = Math.min(...shardIds);
        const maxShardId = Math.max(...shardIds) + 1;
        return [minShardId, maxShardId, maxConcurrency];
    }

    private calculateRateLimitKey(shardId: Integer): Integer {
        return shardId % this.#maxConcurrency;
    }

    private async autoShard(): Promise<void> {
        const [minShardId, maxShardId, maxConcurrency] = await this.getShardInfo();
        this.#maxConcurrency = maxConcurrency;

        for (let shardId = minShardId; shardId < maxShardId; shardId++) {
            const shardInfo: ShardInfo = Object.freeze({
                shardId,
                totalShards: maxShardId,
            });
            this.#shards.set(shardId, shardInfo);
            const rateLimitKey = this.calculateRateLimitKey(shardId);
            const queue = this.#rateLimitQueue.get(rateLimitKey) ?? [];
            queue.push(shardInfo);
            this.#rateLimitQueue.set(rateLimitKey, queue);
        }

        await this.connectAll();
    }

    private async connectAll(): Promise<void> {
        const promises: Promise<void>[] = [];

        for (let index = 0; index < this.#maxConcurrency; index++) {
            promises.push(this.processQueue(index));
        }

        await Promise.all(promises);
    }

    private async processQueue(rateLimitKey: Integer): Promise<void> {
        const queue = this.#rateLimitQueue.get(rateLimitKey) ?? [];
        for (const shardInfo of queue) {
            await this.connectOne(shardInfo);
            await setTimeout(5_000);
        }
    }

    private async connectOne(shardInfo?: ShardInfo): Promise<void> {
        const identify: IdentifyStructure = {
            token: this.#token,
            intents: this.#options.intents,
            large_threshold: this.#options.large_threshold,
            presence: this.#options.presence,
            compress: Boolean(this.#options.compress),
            properties: {
                os: platform(),
                browser: "nyxjs",
                device: "nyxjs",
            },
        };

        if (shardInfo) {
            identify.shard = [shardInfo.shardId, shardInfo.totalShards];
        } else if (Array.isArray(this.#options.shard)) {
            identify.shard = this.#options.shard;
        }

        this.#ws.send(GatewayOpcodes.Identify, identify);
        this.#ws.emit("debug", `Sent Identify payload: ${JSON.stringify(identify, null, 2)}`);
    }
}
