import { setTimeout } from "timers/promises";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import { GatewayRoutes, Rest, UserRoutes } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import type { IdentifyStructure } from "../events/identity";
import type { GatewayOptions } from "../types/gateway";
import type { Gateway } from "./Gateway";

const concurrency = Symbol("concurrency");
const gateway = Symbol("gateway");
const options = Symbol("options");
const token = Symbol("token");
const rest = Symbol("rest");
const shards = Symbol("shards");
const rateLimitQueue = Symbol("rateLimitQueue");

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
    private [concurrency]: number;

    private readonly [gateway]: Gateway;

    private readonly [options]: Readonly<GatewayOptions>;

    private readonly [token]: string;

    private readonly [rest]: Rest;

    private readonly [shards]: Store<string, ShardInfo>;

    private readonly [rateLimitQueue]: Store<string, ShardInfo[]>;

    public constructor(initialGateway: Gateway, initialToken: string, initialOptions: Readonly<GatewayOptions>) {
        this[concurrency] = 1;
        this[gateway] = initialGateway;
        this[options] = initialOptions;
        this[token] = initialToken;
        this[rest] = new Rest(initialToken);
        this[shards] = new Store();
        this[rateLimitQueue] = new Store();
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
                this[shards].set(String(shardId), shardInfo);
                const rateLimitKey = this.calculateRateLimitKey(shardId, this[concurrency]);
                if (!this[rateLimitQueue].has(String(rateLimitKey))) {
                    this[rateLimitQueue].set(String(rateLimitKey), []);
                }

                if (!this[rateLimitQueue].get(String(rateLimitKey))!.some((some) => some.shardId === shardId)) {
                    this[rateLimitQueue].get(String(rateLimitKey))!.push(shardInfo);
                }
            }

            await this.connectShards();
        } catch (error) {
            this[gateway].emit("error", error instanceof Error ? error : new Error(String(error)));
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
        const queue = this[rateLimitQueue].get(String(rateLimitKey)) ?? [];
        for (const shardInfo of queue) {
            await this.connectShard(shardInfo);
            await setTimeout(5_000);
        }
    }

    private async connectShard(shardInfo: ShardInfo): Promise<void> {
        this[gateway].emit("debug", `[WS] Connecting shard: [${shardInfo.shardId},${shardInfo.totalShards}]`);

        const payload: IdentifyStructure = {
            token: this[token],
            properties: {
                os: "linux",
                browser: "nyxjs",
                device: "nyxjs",
            },
            intents: this[options].intents,
            large_threshold: this[options].large_threshold,
            presence: this[options].presence,
            compress: Boolean(this[options].compress),
            shard: [shardInfo.shardId, shardInfo.totalShards],
        };

        this[gateway].send(GatewayOpcodes.Identify, payload);
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

    private calculateShardId(guildId: Snowflake, shardCount: Integer): Integer {
        return Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
    }

    private calculateRateLimitKey(shardId: Integer, maxConcurrency: Integer): Integer {
        return shardId % maxConcurrency;
    }
}
