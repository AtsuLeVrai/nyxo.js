import process from "node:process";
import { setTimeout } from "node:timers/promises";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { GatewayRoutes, UserRoutes } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import type { IdentifyStructure } from "../events/identity";
import type { GatewayOptions } from "../types/gateway";
import type { GatewayManager } from "./GatewayManager";

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
    #maxConcurrency: number;

    readonly #token: string;

    readonly #ws: GatewayManager;

    readonly #rest: Rest;

    readonly #options: Readonly<GatewayOptions>;

    readonly #shards: Store<Integer, ShardInfo>;

    readonly #rateLimitQueue: Store<Integer, ShardInfo[]>;

    public constructor(token: string, ws: GatewayManager, rest: Rest, options: Readonly<GatewayOptions>) {
        this.#maxConcurrency = 1;
        this.#token = token;
        this.#ws = ws;
        this.#rest = rest;
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
            if (error instanceof Error) {
                throw error;
            }

            throw new Error(String(error));
        }
    }

    public cleanup(): void {
        this.#shards.clear();
        this.#rateLimitQueue.clear();
    }

    private async initializeWithSharding(): Promise<void> {
        const [minShardId, maxShardId, maxConcurrency] = await this.determineShardInfo();
        this.#maxConcurrency = maxConcurrency;

        for (let shardId = minShardId; shardId < maxShardId; shardId++) {
            const shardInfo: ShardInfo = Object.freeze({
                shardId,
                totalShards: maxShardId,
            });
            this.#shards.set(shardId, shardInfo);
            const rateLimitKey = this.calculateRateLimitKey(shardId, this.#maxConcurrency);
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

        for (let index = 0; index < this.#maxConcurrency; index++) {
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
                    this.#ws.emit("debug", `[WS] Connecting shard: [${shardInfo.shardId},${shardInfo.totalShards}]`);
                    payload.shard = [shardInfo.shardId, shardInfo.totalShards];
                }

                this.#ws.emit("debug", `[WS] Sending identify payload: ${JSON.stringify(payload, null, 2)}`);
                this.#ws.send(GatewayOpcodes.Identify, payload);
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
