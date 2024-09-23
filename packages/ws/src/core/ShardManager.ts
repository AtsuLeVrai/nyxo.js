import { setTimeout } from "node:timers/promises";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import { GatewayRoutes, Rest, UserRoutes } from "@nyxjs/rest";
import type { IdentifyStructure } from "../events/identity";
import type { GatewayOptions } from "../types/gateway";
import type { Gateway } from "./Gateway";

const rest = Symbol("rest");
const shards = Symbol("shards");
const concurrency = Symbol("concurrency");
const rateLimitQueue = Symbol("rateLimitQueue");

type ShardInfo = Readonly<{
    shardId: Integer;
    totalShards: Integer;
}>;

export class ShardManager {
    private readonly [rest]: Rest;

    private readonly [shards]: Map<Integer, ShardInfo>;

    private [concurrency]: number;

    private readonly [rateLimitQueue]: Map<Integer, ShardInfo[]>;

    public constructor(
        private readonly gateway: Gateway,
        private readonly token: string,
        private readonly options: Readonly<GatewayOptions>
    ) {
        this[rest] = new Rest(this.token);
        this[shards] = new Map<Integer, ShardInfo>();
        this[concurrency] = 1;
        this[rateLimitQueue] = new Map<Integer, ShardInfo[]>();
    }

    public async initialize(): Promise<void> {
        try {
            const [minShardId, maxShardId, maxConcurrency] = await this.determineShardInfo();
            this[concurrency] = maxConcurrency;

            for (let shardId = minShardId; shardId < maxShardId; shardId++) {
                const shardInfo: ShardInfo = Object.freeze({
                    shardId,
                    totalShards: maxShardId,
                });
                this[shards].set(shardId, shardInfo);
                const rateLimitKey = this.calculateRateLimitKey(shardId, this[concurrency]);
                if (!this[rateLimitQueue].has(rateLimitKey)) {
                    this[rateLimitQueue].set(rateLimitKey, []);
                }

                this[rateLimitQueue].get(rateLimitKey)!.push(shardInfo);
            }

            await this.connectShards();
        } catch (error) {
            this.gateway.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    public cleanup(): void {
        this[shards].clear();
        this[rateLimitQueue].clear();
    }

    private async connectShards(): Promise<void> {
        const connectPromises: Promise<void>[] = [];

        for (let index = 0; index < this[concurrency]; index++) {
            connectPromises.push(this.processRateLimitQueue(index));
        }

        await Promise.all(connectPromises);
    }

    private async processRateLimitQueue(rateLimitKey: number): Promise<void> {
        const queue = this[rateLimitQueue].get(rateLimitKey) ?? [];
        for (const shardInfo of queue) {
            await this.connectShard(shardInfo);
            await setTimeout(5_000);
        }
    }

    private async connectShard(shardInfo: ShardInfo): Promise<void> {
        this.gateway.emit("debug", `[WS] Connecting shard ${shardInfo.shardId}...`);

        const payload: IdentifyStructure = {
            token: this.token,
            properties: {
                os: "linux",
                browser: "nyxjs",
                device: "nyxjs",
            },
            intents: this.options.intents,
            large_threshold: this.options.large_threshold,
            presence: this.options.presence,
            compress: Boolean(this.options.compress),
            shard: [shardInfo.shardId, shardInfo.totalShards],
        };

        this.gateway.send(GatewayOpcodes.Identify, payload);
    }

    private async determineShardInfo(): Promise<[minShardId: number, maxShardId: number, maxConcurrency: number]> {
        const info = await this[rest].request(GatewayRoutes.getGatewayBot());
        const totalShards = info.shards;

        const guilds = await this[rest].request(UserRoutes.getCurrentUserGuilds());
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

    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula}
     */
    private calculateShardId(guildId: Snowflake, shardCount: Integer): Integer {
        return Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
    }

    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway#sharding-max-concurrency}
     */
    private calculateRateLimitKey(shardId: Integer, maxConcurrency: Integer): Integer {
        return shardId % maxConcurrency;
    }
}
