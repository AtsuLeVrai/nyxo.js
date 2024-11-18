import { platform } from "node:process";
import { GatewayIntents, GatewayOpcodes, type Integer, type Snowflake } from "@nyxjs/core";
import { GatewayRoutes, type Rest, UserRoutes } from "@nyxjs/rest";
import type { Gateway } from "../Gateway.js";
import { ErrorCodes, GatewayError } from "../GatewayError.js";
import type { IdentifyStructure } from "../events/index.js";
import type { GatewayOptions, GatewayShardTypes, ShardConfig } from "../types/index.js";
import { BaseManager } from "./BaseManager.js";
import type { SessionManager } from "./SessionManager.js";

interface ShardBucket {
    key: number;
    shardIds: number[];
}

export type ShardStatusTypes = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface ShardState {
    config: ShardConfig;
    status: ShardStatusTypes;
    lastReconnectAttempt?: number;
    reconnectAttempts: number;
    rateLimitKey: number;
    guilds: Set<Snowflake>;
}

export class ShardManager extends BaseManager {
    readonly #gateway: Gateway;
    readonly #rest: Rest;
    readonly #token: string;
    readonly #options: Readonly<GatewayOptions>;
    readonly #session: SessionManager;
    #isProcessingQueue = false;
    readonly #defaultShardCount = 1;
    readonly #maxReconnectAttempts = 5;
    readonly #guildsPerShard = 2500;
    readonly #reconnectTimeout = 5000;
    readonly #largeBotThreshold = 150_000;
    readonly #connectionQueue: number[] = [];
    readonly #shards = new Map<number, ShardState>();
    readonly #buckets = new Map<number, ShardBucket>();

    constructor(
        gateway: Gateway,
        rest: Rest,
        token: string,
        options: Readonly<GatewayOptions>,
        session: SessionManager,
    ) {
        super(gateway);
        this.#gateway = gateway;
        this.#rest = rest;
        this.#token = token;
        this.#options = options;
        this.#session = session;
    }

    get shardCount(): number {
        return this.#shards.size;
    }

    get allShards(): Map<number, ShardState> {
        return new Map(this.#shards);
    }

    get shardStats(): Array<{
        shardId: number;
        status: string;
        guildCount: number;
        reconnectAttempts: number;
        lastReconnectAttempt?: number;
    }> {
        return Array.from(this.#shards.entries()).map(([shardId, shard]) => ({
            shardId,
            status: shard.status,
            guildCount: shard.guilds.size,
            reconnectAttempts: shard.reconnectAttempts,
            lastReconnectAttempt: shard.lastReconnectAttempt,
        }));
    }

    get bucketStats(): Array<{
        bucketId: number;
        shardCount: number;
        shardIds: number[];
    }> {
        return Array.from(this.#buckets.entries()).map(([bucketId, bucket]) => ({
            bucketId,
            shardCount: bucket.shardIds.length,
            shardIds: bucket.shardIds,
        }));
    }

    get overallStats(): {
        totalShards: number;
        totalGuilds: number;
        bucketsCount: number;
        reconnectingShards: number;
        isLargeBot: boolean;
    } {
        let totalGuilds = 0;
        let reconnectingShards = 0;

        for (const shard of this.#shards.values()) {
            totalGuilds += shard.guilds.size;
            if (shard.status === "reconnecting") {
                reconnectingShards++;
            }
        }

        return {
            totalShards: this.#shards.size,
            totalGuilds,
            bucketsCount: this.#buckets.size,
            reconnectingShards,
            isLargeBot: this.#isLargeBot(),
        };
    }

    async initialize(mode?: GatewayShardTypes): Promise<void> {
        try {
            this.debug(`Starting shard initialization: ${mode ?? "single shard"}`);

            if (!mode) {
                return this.#setupSingleShard();
            }

            if (mode === "auto") {
                await this.#setupAutoSharding();
            } else if (Array.isArray(mode)) {
                const [shardId, shardCount] = mode;
                await this.#spawnShard({ shardId, shardCount });
            } else {
                await this.#spawnShard(mode);
            }

            this.debug(`Shard initialization completed with ${this.#shards.size} shards`);
        } catch (error) {
            const shardError = new GatewayError("Failed to initialize shards", ErrorCodes.ShardInitError, {
                details: { mode },
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        }
    }

    fetchShardStatus(shardId: number): ShardState | undefined {
        return this.#shards.get(shardId);
    }

    async reconnectAll(): Promise<void> {
        try {
            this.debug("Starting reconnection of all shards");
            for (const [shardId] of this.#shards) {
                await this.#reconnectShard(shardId);
            }
            this.debug("All shards reconnected successfully");
        } catch (error) {
            const shardError = new GatewayError("Failed to reconnect all shards", ErrorCodes.ShardReconnectionError, {
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        }
    }

    destroy(): void {
        try {
            this.debug("Destroying ShardManager");
            this.#shards.clear();
            this.#connectionQueue.length = 0;
            this.#buckets.clear();
            this.debug("ShardManager destroyed successfully");
        } catch (error) {
            const shardError = new GatewayError("Error during ShardManager destruction", ErrorCodes.ShardStateError, {
                cause: error,
            });
            this.error(shardError);
        }
    }

    getShardForGuild(guildId: Snowflake): number {
        return this.#calculateShardId(guildId, this.shardCount);
    }

    handleGuildEvent(guildId: Snowflake, type: "ADD" | "REMOVE"): void {
        try {
            const shardId = this.getShardForGuild(guildId);
            const shard = this.#shards.get(shardId);

            if (shard) {
                if (type === "ADD") {
                    shard.guilds.add(guildId);
                    if (shard.guilds.size > this.#guildsPerShard) {
                        this.warn(`Shard ${shardId} exceeds ${this.#guildsPerShard} guilds threshold`);
                    }
                } else {
                    shard.guilds.delete(guildId);
                }
            }
        } catch (error) {
            const shardError = new GatewayError("Failed to handle guild event", ErrorCodes.ShardStateError, {
                details: { guildId, type },
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        }
    }

    async rescale(newShardCount: number): Promise<void> {
        try {
            this.debug(`Starting rescale operation to ${newShardCount} shards`);
            const gatewayInfo = await this.#rest.request(GatewayRoutes.getGatewayBot());

            if (this.#isLargeBot() && !this.#isValidShardCount(gatewayInfo.shards)) {
                throw new GatewayError(
                    `Invalid shard count. Must be a multiple of ${gatewayInfo.shards}`,
                    ErrorCodes.ShardScalingError,
                    { details: { newShardCount, recommendedShards: gatewayInfo.shards } },
                );
            }

            const currentDistribution = new Map<number, Set<Snowflake>>();
            for (const [_, shard] of this.#shards) {
                for (const guildId of shard.guilds) {
                    const newShardId = this.#calculateShardId(guildId, newShardCount);
                    if (!currentDistribution.has(newShardId)) {
                        currentDistribution.set(newShardId, new Set());
                    }
                    currentDistribution.get(newShardId)?.add(guildId);
                }
            }

            this.destroy();

            await this.#checkSessionLimits();
            await this.initialize({ shardId: 0, shardCount: newShardCount });

            for (const [newShardId, guilds] of currentDistribution) {
                const shard = this.#shards.get(newShardId);
                if (shard) {
                    for (const guildId of guilds) {
                        shard.guilds.add(guildId);
                    }
                }
            }

            this.debug(`Rescale completed: ${newShardCount} shards active`);
        } catch (error) {
            const shardError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Failed to rescale shards", ErrorCodes.ShardScalingError, {
                          details: { newShardCount },
                          cause: error,
                      });
            this.error(shardError);
            throw shardError;
        }
    }

    #setupSingleShard(): void {
        try {
            const shard: ShardState = {
                config: { shardId: 0, shardCount: 1 },
                status: "connecting",
                reconnectAttempts: 0,
                rateLimitKey: 0,
                guilds: new Set<Snowflake>(),
            };

            this.#shards.set(0, shard);
            this.#connectShard(shard);
        } catch (error) {
            const shardError = new GatewayError("Failed to setup single shard", ErrorCodes.ShardAutoError, {
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        }
    }

    async #setupAutoSharding(): Promise<void> {
        try {
            if (!this.#session.isReady) {
                const gatewayInfo = await this.#rest.request(GatewayRoutes.getGatewayBot());
                this.#session.updateLimit(gatewayInfo);
            }

            const guilds = await this.#rest.request(UserRoutes.getCurrentUserGuilds());

            const recommendedShards = this.#getRecommendedShards(
                guilds.length,
                this.#session.shards ?? this.#defaultShardCount,
            );

            if (guilds.length < this.#guildsPerShard) {
                this.warn(
                    `Auto-sharding requested but only ${guilds.length} guilds present. Using single shard for better performance.`,
                );
                await this.#spawnShard({
                    shardId: 0,
                    shardCount: this.#defaultShardCount,
                });
                return;
            }

            if (guilds.length > this.#guildsPerShard) {
                this.warn(
                    `Sharding is required: ${guilds.length} guilds exceed the ${this.#guildsPerShard} guild limit`,
                );
            }

            if (
                guilds.length >= this.#largeBotThreshold &&
                this.#session.shards &&
                !this.#isValidShardCount(this.#session.shards)
            ) {
                throw new GatewayError(
                    `Large bot sharding requires shard count to be a multiple of ${this.#session.shards}`,
                    ErrorCodes.ShardConfigError,
                    {
                        details: { guildCount: guilds.length, requiredShards: this.#session.shards },
                    },
                );
            }

            const guildDistribution = new Map<number, Set<Snowflake>>();
            for (const guild of guilds) {
                const shardId = this.#calculateShardId(guild.id, recommendedShards);
                if (!guildDistribution.has(shardId)) {
                    guildDistribution.set(shardId, new Set());
                }
                guildDistribution.get(shardId)?.add(guild.id);
            }

            this.#organizeShardsIntoBuckets(Array.from(guildDistribution.keys()), this.#session.maxConcurrency);

            await Promise.all(
                Array.from(this.#buckets.values()).map((bucket) => this.#spawnBucket(bucket, guildDistribution)),
            );

            this.debug(`Auto-sharding completed with ${this.#buckets.size} buckets`);
        } catch (error) {
            const shardError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Auto-sharding setup failed", ErrorCodes.ShardAutoError, { cause: error });
            this.error(shardError);
            throw shardError;
        }
    }

    #organizeShardsIntoBuckets(shardIds: number[], maxConcurrency: number): void {
        try {
            this.#buckets.clear();

            for (const shardId of shardIds) {
                const rateLimitKey = shardId % maxConcurrency;

                if (!this.#buckets.has(rateLimitKey)) {
                    this.#buckets.set(rateLimitKey, {
                        key: rateLimitKey,
                        shardIds: [],
                    });
                }

                this.#buckets.get(rateLimitKey)?.shardIds.push(shardId);
            }
        } catch (error) {
            const shardError = new GatewayError("Failed to organize shards into buckets", ErrorCodes.ShardStateError, {
                details: { shardIds, maxConcurrency },
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        }
    }

    async #spawnBucket(bucket: ShardBucket, guildDistribution: Map<number, Set<Snowflake>>): Promise<void> {
        try {
            await Promise.all(
                bucket.shardIds.map((shardId) =>
                    this.#spawnShard(
                        {
                            shardId,
                            shardCount: this.#session?.shards ?? 1,
                        },
                        guildDistribution.get(shardId),
                    ),
                ),
            );

            await this.#wait(1000);
        } catch (error) {
            const shardError = new GatewayError("Failed to spawn bucket", ErrorCodes.ShardSpawnError, {
                details: { bucket },
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        }
    }

    async #spawnShard(config: ShardConfig, guilds?: Set<Snowflake>): Promise<void> {
        try {
            if (config.shardId < 0) {
                throw new GatewayError(
                    `Invalid shard ID: ${config.shardId}. Must be >= 0`,
                    ErrorCodes.ShardConfigError,
                    {
                        details: { config },
                    },
                );
            }

            if (config.shardCount < 1) {
                throw new GatewayError(
                    `Invalid shard count: ${config.shardCount}. Must be >= 1`,
                    ErrorCodes.ShardConfigError,
                    {
                        details: { config },
                    },
                );
            }

            if (config.shardId >= config.shardCount) {
                throw new GatewayError(
                    `Invalid shard ID: ${config.shardId}. Must be less than shard count: ${config.shardCount}`,
                    ErrorCodes.ShardConfigError,
                    { details: { config } },
                );
            }

            if (this.#shards.has(config.shardId)) {
                throw new GatewayError(`Shard ${config.shardId} already exists`, ErrorCodes.ShardSpawnError, {
                    details: { config },
                });
            }

            const rateLimitKey = config.shardId % this.#session.maxConcurrency;

            const shardState: ShardState = {
                config,
                status: "disconnected",
                reconnectAttempts: 0,
                rateLimitKey,
                guilds: guilds ?? new Set(),
            };

            this.#shards.set(config.shardId, shardState);
            this.#connectionQueue.push(config.shardId);

            if (!this.#isProcessingQueue) {
                await this.#processQueue();
            }
        } catch (error) {
            const shardError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Failed to spawn shard", ErrorCodes.ShardSpawnError, {
                          details: { config },
                          cause: error,
                      });
            this.error(shardError);
            throw shardError;
        }
    }

    async #processQueue(): Promise<void> {
        if (this.#isProcessingQueue) {
            return;
        }

        this.#isProcessingQueue = true;

        try {
            const pendingBuckets = new Map<number, number[]>();

            for (const shardId of this.#connectionQueue) {
                const shard = this.#shards.get(shardId);
                if (!shard) {
                    continue;
                }

                if (!pendingBuckets.has(shard.rateLimitKey)) {
                    pendingBuckets.set(shard.rateLimitKey, []);
                }
                pendingBuckets.get(shard.rateLimitKey)?.push(shardId);
            }

            const sortedBuckets = Array.from(pendingBuckets.entries()).sort(([keyA], [keyB]) => keyA - keyB);

            for (const [bucketKey, shardIds] of sortedBuckets) {
                const connectionPromises = shardIds.map((shardId) => {
                    const shard = this.#shards.get(shardId);
                    if (!shard) {
                        return;
                    }

                    this.#connectionQueue.splice(this.#connectionQueue.indexOf(shardId), 1);
                    return this.#connectShard(shard);
                });

                await Promise.all(connectionPromises);

                if (bucketKey < Math.max(...Array.from(pendingBuckets.keys()))) {
                    await this.#wait(5000);
                }
            }
        } catch (error) {
            const shardError = new GatewayError("Failed to process connection queue", ErrorCodes.ShardQueueError, {
                cause: error,
            });
            this.error(shardError);
            throw shardError;
        } finally {
            this.#isProcessingQueue = false;
        }
    }

    #connectShard(shard: ShardState): void {
        try {
            shard.status = "connecting";

            const payload: IdentifyStructure = {
                token: this.#token,
                intents: GatewayIntents.resolve(this.#options.intents),
                properties: {
                    os: platform,
                    browser: "nyx.js",
                    device: "nyx.js",
                },
                shard: [shard.config.shardId, shard.config.shardCount],
            };

            if (this.#options.presence) {
                payload.presence = this.#options.presence;
            }

            if (this.#options.largeThreshold) {
                payload.large_threshold = this.#options.largeThreshold;
            }

            if (this.#options.compress !== undefined) {
                payload.compress = Boolean(this.#options.compress);
            }

            this.#gateway.send(GatewayOpcodes.Identify, payload);
            shard.status = "connected";
            shard.reconnectAttempts = 0;
        } catch (error) {
            shard.status = "disconnected";
            this.#handleConnectionError(shard, error);
        }
    }

    async #reconnectShard(shardId: number): Promise<void> {
        const shard = this.#shards.get(shardId);
        if (!shard) {
            return;
        }

        try {
            if (shard.reconnectAttempts > this.#maxReconnectAttempts) {
                throw new GatewayError(
                    `Maximum reconnection attempts (${this.#maxReconnectAttempts}) exceeded`,
                    ErrorCodes.ShardReconnectionError,
                    {
                        details: {
                            shardId,
                            attempts: shard.reconnectAttempts,
                            maxAttempts: this.#maxReconnectAttempts,
                        },
                    },
                );
            }

            shard.status = "reconnecting";
            shard.reconnectAttempts++;
            shard.lastReconnectAttempt = Date.now();

            this.debug(
                `Reconnecting shard ${shardId} (attempt ${shard.reconnectAttempts}/${this.#maxReconnectAttempts})`,
            );

            this.#connectShard(shard);
        } catch (error) {
            if (error instanceof GatewayError) {
                this.error(error);
            }
            await this.#wait(this.#reconnectTimeout);
            await this.#reconnectShard(shardId);
        }
    }

    async #wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    #calculateShardId(guildId: Snowflake, shardCount: Integer): Integer {
        return Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
    }

    #isValidShardCount(recommendedShards: number): boolean {
        const currentShards = this.#session?.shards ?? 1;
        return currentShards % recommendedShards === 0;
    }

    #isLargeBot(): boolean {
        let totalGuilds = 0;
        for (const shard of this.#shards.values()) {
            totalGuilds += shard.guilds.size;
        }
        return totalGuilds >= this.#largeBotThreshold;
    }

    #handleConnectionError(shard: ShardState, error: unknown): void {
        const connectionError = new GatewayError(
            `Shard ${shard.config.shardId} failed to connect`,
            ErrorCodes.ShardConnectionError,
            {
                details: {
                    shardId: shard.config.shardId,
                    attempts: shard.reconnectAttempts,
                    maxAttempts: this.#maxReconnectAttempts,
                    cause: error,
                },
            },
        );

        this.error(connectionError);

        if (shard.reconnectAttempts < this.#maxReconnectAttempts) {
            this.debug(
                `Connection failed for shard ${shard.config.shardId} - Queuing reconnection (attempt ${shard.reconnectAttempts + 1}/${this.#maxReconnectAttempts})`,
            );
            this.#connectionQueue.push(shard.config.shardId);
            if (!this.#isProcessingQueue) {
                this.#processQueue().catch((err) => {
                    const queueError = new GatewayError(
                        "Failed to process reconnection queue",
                        ErrorCodes.ShardQueueError,
                        {
                            details: { shardId: shard.config.shardId },
                            cause: err,
                        },
                    );
                    this.error(queueError);
                });
            }
        } else {
            const maxAttemptsError = new GatewayError(
                `Shard ${shard.config.shardId} exceeded maximum reconnection attempts`,
                ErrorCodes.ShardReconnectionError,
                {
                    details: {
                        shardId: shard.config.shardId,
                        attempts: shard.reconnectAttempts,
                        maxAttempts: this.#maxReconnectAttempts,
                    },
                    cause: error,
                },
            );
            this.error(maxAttemptsError);
            this.warn(`Maximum reconnection attempts reached for shard ${shard.config.shardId}`);
        }
    }

    #getRecommendedShards(guildCount: number, gatewayShards: number): number {
        const minimumShards = Math.ceil(guildCount / this.#guildsPerShard);
        return Math.max(minimumShards, gatewayShards, this.#defaultShardCount);
    }

    async #checkSessionLimits(): Promise<void> {
        try {
            if (!this.#session.isReady) {
                const gatewayInfo = await this.#rest.request(GatewayRoutes.getGatewayBot());
                this.#session.updateLimit(gatewayInfo);
            }

            const remaining = this.#session.remaining;
            if (remaining < this.shardCount * 2) {
                this.debug(`Session limits critical: ${remaining}/${this.shardCount} sessions available`);
            }

            if (remaining === 0) {
                throw new GatewayError("Session limit reached", ErrorCodes.ShardStateError);
            }

            if (remaining < this.shardCount) {
                throw new GatewayError(
                    `Insufficient sessions remaining (${remaining}) to connect all shards (${this.shardCount})`,
                    ErrorCodes.ShardLimitError,
                    {
                        details: { remaining, required: this.shardCount, deficit: this.shardCount - remaining },
                    },
                );
            }
        } catch (error) {
            const shardError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Failed to check session limits", ErrorCodes.ShardStateError, { cause: error });
            this.error(shardError);
            throw shardError;
        }
    }
}
