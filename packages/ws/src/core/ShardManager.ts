import { setTimeout } from "node:timers";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import { GatewayRoutes, Rest, UserRoutes } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
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

    private readonly [shards]: Store<string, ShardInfo>;

    private [concurrency]: number;

    private readonly [rateLimitQueue]: Store<string, ShardInfo[]>;

    public constructor(
        private readonly gateway: Gateway,
        private readonly token: string,
        private readonly options: Readonly<GatewayOptions>
    ) {
        this[rest] = new Rest(this.token);
        this[shards] = new Store();
        this[concurrency] = 1;
        this[rateLimitQueue] = new Store();
        this.gateway.emit("debug", "[ShardManager] Initialized");
    }

    public async initialize(): Promise<void> {
        try {
            this.gateway.emit("debug", "[ShardManager] Starting initialization");
            const [minShardId, maxShardId, maxConcurrency] = await this.determineShardInfo();
            this[concurrency] = maxConcurrency;
            this.gateway.emit(
                "debug",
                `[ShardManager] Determined shard info: min=${minShardId}, max=${maxShardId}, concurrency=${maxConcurrency}`
            );

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

                if (!this[rateLimitQueue].get(String(rateLimitKey))!.some((s) => s.shardId === shardId)) {
                    this[rateLimitQueue].get(String(rateLimitKey))!.push(shardInfo);
                    this.gateway.emit(
                        "debug",
                        `[ShardManager] Added shard ${shardId} to rate limit queue ${rateLimitKey}`
                    );
                }
            }

            await this.connectShards();
        } catch (error) {
            this.gateway.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    public cleanup(): void {
        this.gateway.emit("debug", "[ShardManager] Cleaning up");
        this[shards].clear();
        this[rateLimitQueue].clear();
    }

    private async connectShards(): Promise<void> {
        this.gateway.emit("debug", "[ShardManager] Starting to connect shards");
        const connectPromises: Promise<void>[] = [];

        for (let index = 0; index < this[concurrency]; index++) {
            connectPromises.push(this.processRateLimitQueue(index));
        }

        await Promise.all(connectPromises);
        this.gateway.emit("debug", "[ShardManager] All shards connected");
    }

    private async processRateLimitQueue(rateLimitKey: number): Promise<void> {
        this.gateway.emit("debug", `[ShardManager] Processing rate limit queue ${rateLimitKey}`);
        const queue = this[rateLimitQueue].get(String(rateLimitKey)) ?? [];
        for (const shardInfo of queue) {
            await this.connectShard(shardInfo);
            this.gateway.emit("debug", `[ShardManager] Waiting 5 seconds before next shard connection`);
            await new Promise((resolve) => {
                setTimeout(resolve, 5_000);
            });
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

        this.gateway.emit("debug", `[WS] Sending Identify payload for shard ${shardInfo.shardId}`);
        this.gateway.send(GatewayOpcodes.Identify, payload);
    }

    private async determineShardInfo(): Promise<[minShardId: number, maxShardId: number, maxConcurrency: number]> {
        this.gateway.emit("debug", "[ShardManager] Determining shard info");
        const info = await this[rest].request(GatewayRoutes.getGatewayBot());
        const totalShards = info.shards;
        this.gateway.emit("debug", `[ShardManager] Gateway info received: totalShards=${totalShards}`);

        const guilds = await this[rest].request(UserRoutes.getCurrentUserGuilds());
        this.gateway.emit("debug", `[ShardManager] Retrieved ${guilds.length} guilds`);

        if (guilds.length === 0) {
            this.gateway.emit("debug", "[ShardManager] No guilds found, using default shard info");
            return [0, totalShards, info.session_start_limit.max_concurrency];
        }

        const shardIds = new Set<Integer>();
        for (const guild of guilds) {
            const shardId = this.calculateShardId(guild.id, totalShards);
            shardIds.add(shardId);
        }

        if (shardIds.size === 1) {
            this.gateway.emit("debug", `[ShardManager] Single shard determined: ${[...shardIds][0]}`);
            return [[...shardIds][0], totalShards, info.session_start_limit.max_concurrency];
        }

        const minShardId = Math.min(...shardIds);
        const maxShardId = Math.max(...shardIds);
        this.gateway.emit("debug", `[ShardManager] Multiple shards determined: min=${minShardId}, max=${maxShardId}`);
        return [minShardId, maxShardId + 1, info.session_start_limit.max_concurrency];
    }

    private calculateShardId(guildId: Snowflake, shardCount: Integer): Integer {
        const shardId = Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
        this.gateway.emit("debug", `[ShardManager] Calculated shard ID ${shardId} for guild ${guildId}`);
        return shardId;
    }

    private calculateRateLimitKey(shardId: Integer, maxConcurrency: Integer): Integer {
        const key = shardId % maxConcurrency;
        this.gateway.emit("debug", `[ShardManager] Calculated rate limit key ${key} for shard ${shardId}`);
        return key;
    }
}
