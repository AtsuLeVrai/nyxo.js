import process from "node:process";
import { setTimeout } from "node:timers/promises";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { GatewayRoutes, UserRoutes } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import { safeError } from "@nyxjs/utils";
import type { IdentifyStructure } from "../events/identity";
import type { GatewayOptions } from "../types/gateway";
import type { Gateway } from "./Gateway";

type ShardInfo = Readonly<{
    /**
     * The shard ID.
     */
    shardId: Integer;
    /**
     * The total number of shards.
     */
    totalShards: Integer;
}>;

export class ShardManager {
    #concurrency: number;

    readonly #gateway: Gateway;

    readonly #rest: Rest;

    readonly #token: string;

    readonly #options: Readonly<GatewayOptions>;

    readonly #shards: Store<Integer, ShardInfo>;

    readonly #rateLimitQueue: Store<Integer, ShardInfo[]>;

    public constructor(gateway: Gateway, rest: Rest, token: string, options: Readonly<GatewayOptions>) {
        this.#concurrency = 1;
        this.#gateway = gateway;
        this.#rest = rest;
        this.#token = token;
        this.#options = options;
        this.#shards = new Store();
        this.#rateLimitQueue = new Store();
    }

    public async initialize(): Promise<void> {
        try {
            if (this.#options.shard) {
                await this.initializeWithSharding();
            } else {
                await this.connectShard();
            }
        } catch (error) {
            throw safeError(error);
        }
    }

    public cleanup(): void {
        this.#shards.clear();
        this.#rateLimitQueue.clear();
    }

    private async initializeWithSharding(): Promise<void> {
        const [minShardId, maxShardId, maxConcurrency] = await this.determineShardInfo();
        this.#concurrency = maxConcurrency;

        for (let shardId = minShardId; shardId < maxShardId; shardId++) {
            const shardInfo: ShardInfo = Object.freeze({
                shardId,
                totalShards: maxShardId,
            });
            this.#shards.set(shardId, shardInfo);
            const rateLimitKey = this.calculateRateLimitKey(shardId, this.#concurrency);
            if (!this.#rateLimitQueue.has(rateLimitKey)) {
                this.#rateLimitQueue.set(rateLimitKey, []);
            }

            if (!this.#rateLimitQueue.get(rateLimitKey)!.some((some) => some.shardId === shardId)) {
                this.#rateLimitQueue.get(rateLimitKey)!.push(shardInfo);
            }
        }

        await this.connectShards();
    }

    private async connectShards(): Promise<void> {
        const connectPromises: Promise<void>[] = [];

        for (let index = 0; index < this.#concurrency; index++) {
            connectPromises.push(this.processRateLimitQueue(index));
        }

        await Promise.all(connectPromises);
    }

    private async processRateLimitQueue(rateLimitKey: number): Promise<void> {
        const queue = this.#rateLimitQueue.get(rateLimitKey) ?? [];
        for (const shardInfo of queue) {
            await this.connectShard(shardInfo);
            await setTimeout(5_000);
        }
    }

    private async connectShard(shardInfo?: ShardInfo): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const payload: IdentifyStructure = {
                    token: this.#token,
                    intents: this.#options.intents,
                    large_threshold: this.#options.large_threshold,
                    presence: this.#options.presence,
                    compress: Boolean(this.#options.compress),
                    properties: {
                        os: process.platform,
                        browser: "nyxjs",
                        device: "nyxjs",
                    },
                };

                if (this.#options.shard && shardInfo) {
                    this.#gateway.emit(
                        "debug",
                        `[WS] Connecting shard: [${shardInfo.shardId},${shardInfo.totalShards}]`
                    );
                    payload.shard = [shardInfo.shardId, shardInfo.totalShards];
                }

                this.#gateway.emit("debug", `[WS] Sending identify payload: ${JSON.stringify(payload, null, 2)}`);
                this.#gateway.send(GatewayOpcodes.Identify, payload);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private async determineShardInfo(): Promise<[minShardId: number, maxShardId: number, maxConcurrency: number]> {
        const info = await this.#rest.request(GatewayRoutes.getGatewayBot());
        const totalShards = info.shards;

        const guilds = await this.#rest.request(UserRoutes.getCurrentUserGuilds());

        if (guilds.length === 0) {
            return [0, totalShards, info.session_start_limit.max_concurrency];
        }

        const shardIds = new Set<Integer>();
        for (const guild of guilds) {
            const shardId = this.calculateShardId(guild.id, totalShards);
            shardIds.add(shardId);
        }

        if (shardIds.size === 1) {
            return [[...shardIds][0], totalShards, info.session_start_limit.max_concurrency];
        }

        const minShardId = Math.min(...shardIds);
        const maxShardId = Math.max(...shardIds);
        return [minShardId, maxShardId + 1, info.session_start_limit.max_concurrency];
    }

    private calculateShardId(guildId: Snowflake, shardCount: Integer): Integer {
        return Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
    }

    private calculateRateLimitKey(shardId: Integer, maxConcurrency: Integer): Integer {
        return shardId % maxConcurrency;
    }
}
