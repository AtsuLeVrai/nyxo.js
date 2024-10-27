import { platform } from "node:process";
import { GatewayOpcodes, type Integer, type Snowflake } from "@nyxjs/core";
import { GatewayRoutes, type Rest, type SessionStartLimitStructure, UserRoutes } from "@nyxjs/rest";
import type { Gateway } from "../Gateway.js";
import type { IdentifyStructure } from "../events/index.js";
import type { GatewayOptions, GatewayShardTypes, ShardConfig } from "../types/index.js";

export class ShardManager {
    #shards: Map<number, ShardConfig> = new Map();

    #connectionQueue: ShardConfig[] = [];

    #maxConcurrency = 1;

    #sessionStartLimit: SessionStartLimitStructure | null = null;

    readonly #gateway: Gateway;

    readonly #rest: Rest;

    readonly #token: string;

    readonly #options: Readonly<GatewayOptions>;

    constructor(gateway: Gateway, rest: Rest, token: string, options: GatewayOptions) {
        this.#gateway = gateway;
        this.#rest = rest;
        this.#token = token;
        this.#options = Object.freeze({ ...options });
    }

    clear(): void {
        this.#shards.clear();
        this.#connectionQueue = [];
        this.#gateway.emit("DEBUG", "[SHARD] ShardManager cleared all shards and connection queue");
    }

    async initialize(mode?: GatewayShardTypes): Promise<void> {
        try {
            if (!mode) {
                await this.#connectShard();
                return;
            }

            if (mode === "auto") {
                await this.#setupAutoSharding();
            } else if (Array.isArray(mode)) {
                const [shardId, shardCount] = mode;
                this.#addShard({ shardId, shardCount });
            } else {
                this.#addShard(mode);
            }

            await this.#connectShards();
        } catch (error) {
            throw new Error(`Failed to initialize shards: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async #setupAutoSharding(): Promise<void> {
        try {
            const [guilds, gatewayInfo] = await this.#rest.manyRequest([
                UserRoutes.getCurrentUserGuilds(),
                GatewayRoutes.getGatewayBot(),
            ]);

            if (guilds.length <= 2_500) {
                this.#gateway.emit("WARN", "[SHARD] You have less than 2500 guilds, consider disabling auto-sharding.");
            }

            if (guilds.length === 0) {
                this.#addShard({ shardId: 0, shardCount: 1 });
                this.#gateway.emit("DEBUG", "[SHARD] No guilds found, added single shard");
                return;
            }

            this.#sessionStartLimit = gatewayInfo.session_start_limit;
            this.#maxConcurrency = gatewayInfo.session_start_limit.max_concurrency;
            this.#gateway.emit(
                "DEBUG",
                `[SHARD] Max concurrency set to ${gatewayInfo.session_start_limit.max_concurrency}`
            );

            const shardIds = new Set(guilds.map((guild) => this.#calculateShardId(guild.id, gatewayInfo.shards)));
            for (const shardId of shardIds) {
                this.#addShard({ shardId, shardCount: gatewayInfo.shards });
            }

            this.#gateway.emit("DEBUG", `[SHARD] Added ${shardIds.size} shards based on guild distribution`);
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
        this.#gateway.emit("DEBUG", `[SHARD] Added shard ${config.shardId} to connection queue`);
    }

    async #connectShards(): Promise<void> {
        try {
            const concurrentConnections = Math.min(this.#maxConcurrency, this.#connectionQueue.length);
            this.#gateway.emit("DEBUG", `[SHARD] Connecting ${concurrentConnections} shards concurrently`);
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
            if (!this.#canStartNewSession()) {
                await this.#waitForReset();
            }

            const config = this.#connectionQueue.shift();
            if (config) {
                try {
                    await this.#connectShard(config);
                    this.#gateway.emit("DEBUG", `[SHARD] Connected shard ${config.shardId}`);
                    this.#decrementSessionStartLimit();
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

        this.#gateway.emit("DEBUG", "[SHARD] Finished processing connection queue");
    }

    #canStartNewSession(): boolean {
        return this.#sessionStartLimit !== null && this.#sessionStartLimit.remaining > 0;
    }

    #decrementSessionStartLimit(): void {
        if (this.#sessionStartLimit) {
            this.#sessionStartLimit.remaining--;
        }
    }

    async #waitForReset(): Promise<void> {
        if (this.#sessionStartLimit) {
            const waitTime = this.#sessionStartLimit.reset_after;
            this.#gateway.emit("DEBUG", `[SHARD] Waiting ${waitTime}ms for session limit reset`);
            await new Promise((resolve) => {
                setTimeout(resolve, waitTime);
            });
            await this.#refreshSessionStartLimit();
        }
    }

    async #refreshSessionStartLimit(): Promise<void> {
        try {
            const { session_start_limit } = await this.#rest.request(GatewayRoutes.getGatewayBot());
            this.#sessionStartLimit = session_start_limit;
            this.#gateway.emit(
                "DEBUG",
                `[SHARD] Refreshed session start limit: ${JSON.stringify(this.#sessionStartLimit)}`
            );
        } catch (error) {
            throw new Error(
                `Failed to refresh session start limit: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    async #connectShard(shard?: ShardConfig): Promise<void> {
        const payload: IdentifyStructure = {
            token: this.#token,
            intents: this.#options.intents,
            properties: {
                os: platform,
                browser: "nyxjs",
                device: "nyxjs",
            },
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

        if (shard) {
            payload.shard = [shard.shardId, shard.shardCount];
            this.#gateway.emit("DEBUG", `[SHARD] Shard ${shard.shardId} connected`);
        }

        try {
            this.#gateway.send(GatewayOpcodes.Identify, payload);
        } catch (error) {
            throw new Error(`Failed to connect shard: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
