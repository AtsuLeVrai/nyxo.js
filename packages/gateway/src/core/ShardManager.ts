import { platform } from "node:process";
import { setTimeout } from "node:timers";
import type { Integer, Snowflake } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { GatewayRoutes, UserRoutes } from "@nyxjs/rest";
import type { IdentifyStructure } from "../events";
import type { GatewayOptions, GatewayShardType } from "../types";
import type { Gateway } from "./index";

type ShardConfig = {
    /**
     * The total number of shards.
     */
    shardCount: Integer;
    /**
     * The shard ID.
     */
    shardId: Integer;
};

export class ShardManager {
    #shards: Map<number, ShardConfig> = new Map();

    #connectionQueue: ShardConfig[] = [];

    #maxConcurrency: number = 1;

    readonly #gateway: Gateway;

    readonly #rest: Rest;

    readonly #token: string;

    readonly #options: Readonly<GatewayOptions>;

    public constructor(gateway: Gateway, rest: Rest, token: string, options: GatewayOptions) {
        this.#gateway = gateway;
        this.#rest = rest;
        this.#token = token;
        this.#options = Object.freeze({ ...options });
    }

    public clear(): void {
        this.#shards.clear();
        this.#connectionQueue = [];
    }

    public async initialize(mode: GatewayShardType): Promise<void> {
        try {
            if (mode === "auto") {
                await this.#setupAutoSharding();
            } else {
                const [shardId, shardCount] = mode;
                this.#addShard({ shardId, shardCount });
            }

            await this.#connectShards();
        } catch (error) {
            throw new Error(`Failed to initialize shards: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public getShardsInfo(): ReadonlyMap<Integer, Readonly<ShardConfig>> {
        return new Map(Array.from(this.#shards, ([id, config]) => [id, Object.freeze({ ...config })]));
    }

    async #setupAutoSharding(): Promise<void> {
        try {
            const guilds = await this.#rest.request(UserRoutes.getCurrentUserGuilds());
            if (guilds.length === 0) {
                this.#addShard({ shardId: 0, shardCount: 1 });
                return;
            }

            if (guilds.length <= 2_500) {
                this.#gateway.emit("WARN", "[SHARD] You have less than 2500 guilds, consider disabling auto-sharding.");
            }

            const {
                shards: recommendedShards,
                session_start_limit: { max_concurrency },
            } = await this.#rest.request(GatewayRoutes.getGatewayBot());

            this.#maxConcurrency = max_concurrency;

            const shardIds = new Set(guilds.map((guild) => this.#calculateShardId(guild.id, recommendedShards)));
            for (const shardId of shardIds) {
                this.#addShard({ shardId, shardCount: recommendedShards });
            }
        } catch (error) {
            throw new Error(`Failed to setup auto-sharding: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    #calculateShardId(guildId: Snowflake, shardCount: Integer): Integer {
        return Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
    }

    #addShard(config: ShardConfig): void {
        this.#shards.set(config.shardId, config);
        this.#connectionQueue.push(config);
    }

    async #connectShards(): Promise<void> {
        try {
            const concurrentConnections = Math.min(this.#maxConcurrency, this.#connectionQueue.length);
            const connectionPromises = Array.from({ length: concurrentConnections }, async () =>
                this.#processConnectionQueue()
            );
            await Promise.all(connectionPromises);
        } catch (error) {
            throw new Error(`Failed to connect shards: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async #processConnectionQueue(): Promise<void> {
        while (this.#connectionQueue.length > 0) {
            const config = this.#connectionQueue.shift();
            if (config) {
                try {
                    await this.#connectShard(config);
                    await new Promise((resolve) => {
                        setTimeout(resolve, 5_000);
                    });
                } catch (error) {
                    throw new Error(
                        `Failed to connect shard ${config.shardId}: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }
        }
    }

    async #connectShard({ shardId, shardCount }: ShardConfig): Promise<void> {
        const payload: IdentifyStructure = {
            token: this.#token,
            properties: {
                os: platform,
                browser: "nyxjs",
                device: "nyxjs",
            },
            intents: this.#options.intents,
            shard: [shardId, shardCount],
        };

        if (this.#options.presence) {
            payload.presence = this.#options.presence;
        }

        if (this.#options.large_threshold) {
            payload.large_threshold = this.#options.large_threshold;
        }

        if (this.#options.compress !== undefined) {
            payload.compress = Boolean(this.#options.compress);
        }

        try {
            this.#gateway.send(GatewayOpcodes.Identify, payload);
            this.#gateway.emit("DEBUG", `[SHARD] Shard ${shardId} connected`);
        } catch (error) {
            throw new Error(
                `Failed to connect shard ${shardId}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}
