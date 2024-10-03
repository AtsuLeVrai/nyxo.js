import { platform } from "node:process";
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
                this.#ws.emit("debug", "Starting auto-sharding process.");
                await this.#autoShard();
            } else {
                this.#ws.emit("debug", "Starting single shard connection.");
                await this.#connectOne();
            }
        } catch (error) {
            throw new Error(`Failed to initialize ShardManager: ${error}`);
        }
    }

    public clear(): void {
        this.#shards.clear();
        this.#rateLimitQueue.clear();
    }

    #calculateShardId(guildId: Snowflake, totalShards: Integer): Integer {
        const guildIdBigInt = BigInt(guildId);
        const shardIdBigInt = (guildIdBigInt >> 22n) % BigInt(totalShards);
        return Number(shardIdBigInt);
    }

    async #getShardInfo(): Promise<[Integer, Integer, number]> {
        try {
            const info = await this.#rest.request(GatewayRoutes.getGatewayBot());
            const totalShards = info.shards;
            const maxConcurrency = info.session_start_limit.max_concurrency;

            const guilds = await this.#rest.request(UserRoutes.getCurrentUserGuilds());

            if (guilds.length <= 2_500) {
                this.#ws.emit("warn", "The bot is in less than 2500 guilds. Auto-sharding may not be necessary.");
            }

            if (guilds.length === 0) {
                this.#ws.emit("debug", "No guilds found. Using default shard configuration.");
                return [0, totalShards, maxConcurrency];
            }

            const shardIds = new Set<Integer>();
            for (const guild of guilds) {
                const shardId = this.#calculateShardId(guild.id, totalShards);
                shardIds.add(shardId);
            }

            const minShardId = Math.min(...shardIds);
            const maxShardId = Math.max(...shardIds) + 1;
            this.#ws.emit(
                "debug",
                `Calculated shard range: ${minShardId} to ${maxShardId - 1}. Max concurrency: ${maxConcurrency}`
            );
            return [minShardId, maxShardId, maxConcurrency];
        } catch (error) {
            this.#ws.emit("error", new Error(`Failed to get shard information: ${error}`));
            throw error;
        }
    }

    #calculateRateLimitKey(shardId: Integer): Integer {
        return shardId % this.#maxConcurrency;
    }

    async #autoShard(): Promise<void> {
        try {
            const [minShardId, maxShardId, maxConcurrency] = await this.#getShardInfo();
            this.#maxConcurrency = maxConcurrency;

            for (let shardId = minShardId; shardId < maxShardId; shardId++) {
                const shardInfo: ShardInfo = Object.freeze({
                    shardId,
                    totalShards: maxShardId,
                });
                this.#shards.set(shardId, shardInfo);
                const rateLimitKey = this.#calculateRateLimitKey(shardId);
                const queue = this.#rateLimitQueue.get(rateLimitKey) ?? [];
                queue.push(shardInfo);
                this.#rateLimitQueue.set(rateLimitKey, queue);
            }

            this.#ws.emit("debug", `Auto-sharding setup complete. Total shards: ${maxShardId - minShardId}`);
            await this.#connectAll();
        } catch (error) {
            this.#ws.emit("error", new Error(`Failed to auto-shard: ${error}`));
            throw error;
        }
    }

    async #connectAll(): Promise<void> {
        const promises: Promise<void>[] = [];

        for (let index = 0; index < this.#maxConcurrency; index++) {
            promises.push(this.#processQueue(index));
        }

        this.#ws.emit("debug", `Connecting all shards with max concurrency of ${this.#maxConcurrency}`);
        await Promise.all(promises);
    }

    async #processQueue(rateLimitKey: Integer): Promise<void> {
        const queue = this.#rateLimitQueue.get(rateLimitKey) ?? [];
        for (const shardInfo of queue) {
            this.#ws.emit("debug", `Processing shard ${shardInfo.shardId} (Rate limit key: ${rateLimitKey})`);
            await this.#connectOne(shardInfo);
            await setTimeout(5_000);
        }
    }

    async #connectOne(shardInfo?: ShardInfo): Promise<void> {
        const identify: IdentifyStructure = {
            token: this.#token,
            intents: this.#options.intents,
            large_threshold: this.#options.large_threshold,
            presence: this.#options.presence,
            compress: Boolean(this.#options.compress),
            properties: {
                os: platform,
                browser: "nyxjs",
                device: "nyxjs",
            },
        };

        if (shardInfo) {
            identify.shard = [shardInfo.shardId, shardInfo.totalShards];
            this.#ws.emit("debug", `Connecting shard ${shardInfo.shardId}/${shardInfo.totalShards}`);
        } else if (Array.isArray(this.#options.shard)) {
            const [shardId, totalShards] = this.#options.shard;
            identify.shard = [shardId, totalShards];
            this.#ws.emit("debug", `Connecting single shard ${shardId}/${totalShards}`);
        } else {
            this.#ws.emit("debug", "Connecting without shard information");
        }

        this.#ws.send(GatewayOpcodes.Identify, identify);
        this.#ws.emit(
            "debug",
            `Sent Identify payload for ${shardInfo ? `shard ${shardInfo.shardId}` : "single connection"} with payload: ${JSON.stringify(identify, null, 2)}`
        );
    }
}
