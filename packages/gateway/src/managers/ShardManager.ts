import { platform } from "node:process";
import { GatewayOpcodes, type GuildStructure, type Integer, type Snowflake } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import { GatewayRoutes, type Rest, UserRoutes } from "@nyxjs/rest";
import type { Gateway } from "../Gateway.js";
import type { IdentifyStructure } from "../events/index.js";
import type { GatewayOptions, GatewayShardTypes, ShardConfig } from "../types/index.js";
import type { SessionManager } from "./SessionManager.js";

export type ShardStatusTypes = "disconnected" | "connecting" | "connected" | "reconnecting";

interface ShardBucket {
    key: number;
    shardIds: number[];
}

export interface ShardState {
    config: ShardConfig;
    status: ShardStatusTypes;
    lastReconnectAttempt?: number;
    reconnectAttempts: number;
    rateLimitKey: number;
    guilds: Set<Snowflake>;
}

export enum ShardErrorCode {
    InitializationError = "SHARD_INITIALIZATION_ERROR",
    ConnectionError = "SHARD_CONNECTION_ERROR",
    ReconnectionError = "SHARD_RECONNECTION_ERROR",
    InvalidConfig = "INVALID_SHARD_CONFIG",
    LimitExceeded = "SHARD_LIMIT_EXCEEDED",
    QueueError = "SHARD_QUEUE_ERROR",
    SessionError = "SESSION_ERROR",
    ScalingError = "SCALING_ERROR",
    StateError = "SHARD_STATE_ERROR",
    SpawnError = "SHARD_SPAWN_ERROR",
    AutoShardingError = "AUTO_SHARDING_ERROR",
    LargeBotShardingError = "LARGE_BOT_SHARDING_ERROR",
}

export class ShardError extends Error {
    code: ShardErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: ShardErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "ShardError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class ShardManager {
    #guildsPerShard = 2500;
    #largeBotThreshold = 150_000;
    #defaultShardCount = 1;
    #isProcessingQueue = false;
    #shards = new Map<number, ShardState>();
    #connectionQueue: number[] = [];
    #maxReconnectAttempts = 5;
    #reconnectTimeout = 5000;
    #buckets = new Map<number, ShardBucket>();
    #gateway: Gateway;
    #rest: Rest;
    #token: string;
    #options: Readonly<GatewayOptions>;
    #session: SessionManager;

    constructor(
        gateway: Gateway,
        rest: Rest,
        token: string,
        options: Readonly<GatewayOptions>,
        session: SessionManager,
    ) {
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
            this.#emitDebug(`Initializing shards with mode: ${mode ?? "default"}`);

            if (!mode) {
                await this.#spawnShard({ shardId: 0, shardCount: 1 });
                return;
            }

            if (mode === "auto") {
                await this.#setupAutoSharding();
            } else if (Array.isArray(mode)) {
                const [shardId, shardCount] = mode;
                await this.#spawnShard({ shardId, shardCount });
            } else {
                await this.#spawnShard(mode);
            }
        } catch (error) {
            const shardError = new ShardError("Failed to initialize shards", ShardErrorCode.InitializationError, {
                mode,
                error,
            });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    fetchShardStatus(shardId: number): ShardState | undefined {
        const state = this.#shards.get(shardId);
        this.#emitDebug(`Fetched status for shard ${shardId}: ${state?.status ?? "not found"}`);
        return state;
    }

    async reconnectAll(): Promise<void> {
        try {
            this.#emitDebug("Starting reconnection of all shards");
            for (const [shardId] of this.#shards) {
                await this.#reconnectShard(shardId);
            }
            this.#emitDebug("All shards reconnected successfully");
        } catch (error) {
            const shardError = new ShardError("Failed to reconnect all shards", ShardErrorCode.ReconnectionError, {
                error,
            });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    destroy(): void {
        try {
            this.#emitDebug("Destroying ShardManager");
            this.#shards.clear();
            this.#connectionQueue.length = 0;
            this.#buckets.clear();
            this.#emitDebug("ShardManager destroyed successfully");
        } catch (error) {
            const shardError = new ShardError("Error during ShardManager destruction", ShardErrorCode.StateError, {
                error,
            });
            this.#emitError(shardError);
        }
    }

    getShardForGuild(guildId: Snowflake): number {
        const shardId = this.#calculateShardId(guildId, this.shardCount);
        this.#emitDebug(`Calculated shard ${shardId} for guild ${guildId}`);
        return shardId;
    }

    handleGuildEvent(guildId: Snowflake, type: "ADD" | "REMOVE"): void {
        try {
            const shardId = this.getShardForGuild(guildId);
            const shard = this.#shards.get(shardId);

            if (shard) {
                if (type === "ADD") {
                    shard.guilds.add(guildId);
                    this.#emitDebug(`Guild ${guildId} added to shard ${shardId}`);

                    if (shard.guilds.size > this.#guildsPerShard) {
                        const warning = `Shard ${shardId} has exceeded ${this.#guildsPerShard} guilds`;
                        this.#emitDebug(warning);
                        this.#gateway.emit("warn", warning);
                    }
                } else {
                    shard.guilds.delete(guildId);
                    this.#emitDebug(`Guild ${guildId} removed from shard ${shardId}`);
                }
            }
        } catch (error) {
            const shardError = new ShardError("Failed to handle guild event", ShardErrorCode.StateError, {
                guildId,
                type,
                error,
            });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    async rescale(newShardCount: number): Promise<void> {
        try {
            this.#emitDebug(`Starting rescale to ${newShardCount} shards`);
            const gatewayInfo = await this.#rest.request(GatewayRoutes.getGatewayBot());

            if (this.#isLargeBot() && !this.#isValidShardCount(gatewayInfo.shards)) {
                throw new ShardError(
                    `Invalid shard count. Must be a multiple of ${gatewayInfo.shards}`,
                    ShardErrorCode.ScalingError,
                    { newShardCount, recommendedShards: gatewayInfo.shards },
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

            this.#emitDebug(`Successfully rescaled to ${newShardCount} shards`);
        } catch (error) {
            const shardError =
                error instanceof ShardError
                    ? error
                    : new ShardError("Failed to rescale shards", ShardErrorCode.ScalingError, { newShardCount, error });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    async #setupAutoSharding(): Promise<void> {
        try {
            this.#emitDebug("Starting auto-sharding setup");
            const [guilds, gatewayInfo] = await this.#rest.manyRequest([
                UserRoutes.getCurrentUserGuilds(),
                GatewayRoutes.getGatewayBot(),
            ]);

            if (guilds.length < this.#guildsPerShard) {
                this.#emitWarn(
                    `Auto-sharding requested but you only have ${guilds.length} guilds.\nAuto-sharding is designed for bots with more than ${this.#guildsPerShard} guilds.\nUsing auto-sharding with a small number of guilds is inefficient.\nConsider removing sharding configuration for better performance.`,
                );

                this.#emitDebug("Falling back to single shard due to low guild count");
                await this.#spawnShard({
                    shardId: 0,
                    shardCount: this.#defaultShardCount,
                });
                return;
            }

            this.#validateShardingRequirements(guilds);
            const recommendedShards = this.#getRecommendedShards(guilds.length, gatewayInfo.shards);

            const guildDistribution = new Map<number, Set<Snowflake>>();
            for (const guild of guilds) {
                const shardId = this.#calculateShardId(guild.id, recommendedShards);
                if (!guildDistribution.has(shardId)) {
                    guildDistribution.set(shardId, new Set());
                }
                guildDistribution.get(shardId)?.add(guild.id);
            }

            const maxConcurrency = gatewayInfo.session_start_limit.max_concurrency;
            this.#organizeShardsIntoBuckets(Array.from(guildDistribution.keys()), maxConcurrency);

            await this.#checkSessionLimits();

            for (const bucket of this.#buckets.values()) {
                await this.#spawnBucket(bucket, guildDistribution);
            }

            this.#emitDebug("Auto-sharding setup completed successfully");
        } catch (error) {
            const shardError =
                error instanceof ShardError
                    ? error
                    : new ShardError("Auto-sharding setup failed", ShardErrorCode.AutoShardingError, { error });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    #organizeShardsIntoBuckets(shardIds: number[], maxConcurrency: number): void {
        try {
            this.#emitDebug(`Organizing ${shardIds.length} shards into buckets (max concurrency: ${maxConcurrency})`);
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

            this.#emitDebug(`Created ${this.#buckets.size} buckets`);
        } catch (error) {
            const shardError = new ShardError("Failed to organize shards into buckets", ShardErrorCode.StateError, {
                shardIds,
                maxConcurrency,
                error,
            });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    async #spawnBucket(bucket: ShardBucket, guildDistribution: Map<number, Set<Snowflake>>): Promise<void> {
        try {
            this.#emitDebug(`Spawning bucket ${bucket.key} with shards: ${bucket.shardIds.join(", ")}`);

            const spawnPromises = bucket.shardIds.map((shardId) =>
                this.#spawnShard(
                    {
                        shardId,
                        shardCount: this.#session?.shards ?? 1,
                    },
                    guildDistribution.get(shardId),
                ),
            );

            await Promise.all(spawnPromises);
            await this.#wait(5000);
            this.#emitDebug(`Bucket ${bucket.key} spawned successfully`);
        } catch (error) {
            const shardError = new ShardError("Failed to spawn bucket", ShardErrorCode.SpawnError, { bucket, error });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    async #spawnShard(config: ShardConfig, guilds?: Set<Snowflake>): Promise<void> {
        try {
            this.#emitDebug(`Spawning shard ${config.shardId}/${config.shardCount}`);
            this.#validateShardConfig(config);

            if (this.#shards.has(config.shardId)) {
                throw new ShardError(`Shard ${config.shardId} already exists`, ShardErrorCode.SpawnError, { config });
            }

            const rateLimitKey = config.shardId % this.#session.maxConcurrency;

            const shardState: ShardState = {
                config,
                status: "disconnected",
                reconnectAttempts: 0,
                rateLimitKey,
                guilds: guilds ?? new Set(),
            };

            if (config.shardId === 0) {
                this.#emitDebug("Shard 0 will handle DMs");
            }

            this.#shards.set(config.shardId, shardState);
            this.#connectionQueue.push(config.shardId);

            if (!this.#isProcessingQueue) {
                await this.#processQueue();
            }

            this.#emitDebug(`Shard ${config.shardId} spawned successfully`);
        } catch (error) {
            const shardError =
                error instanceof ShardError
                    ? error
                    : new ShardError("Failed to spawn shard", ShardErrorCode.SpawnError, { config, error });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    async #processQueue(): Promise<void> {
        if (this.#isProcessingQueue) {
            return;
        }

        this.#isProcessingQueue = true;
        this.#emitDebug("Starting queue processing");

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
                this.#emitDebug(`Processing bucket ${bucketKey} with shards: ${shardIds.join(", ")}`);

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
                    this.#emitDebug("Waiting 5 seconds before processing next bucket");
                    await this.#wait(5000);
                }
            }

            this.#emitDebug("Queue processing completed successfully");
        } catch (error) {
            const shardError = new ShardError("Failed to process connection queue", ShardErrorCode.QueueError, {
                error,
            });
            this.#emitError(shardError);
            throw shardError;
        } finally {
            this.#isProcessingQueue = false;
        }
    }

    #connectShard(shard: ShardState): void {
        try {
            this.#emitDebug(`Connecting shard ${shard.config.shardId}`);
            shard.status = "connecting";

            const payload: IdentifyStructure = {
                token: this.#token,
                intents: this.#options.intents,
                properties: {
                    os: platform,
                    browser: "nyxjs",
                    device: "nyxjs",
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

            this.#emitDebug(`Shard ${shard.config.shardId} connected successfully`);
        } catch (error) {
            shard.status = "disconnected";
            this.#handleConnectionError(shard, error);
        }
    }

    async #reconnectShard(shardId: number): Promise<void> {
        const shard = this.#shards.get(shardId);
        if (!shard) {
            this.#emitDebug(`Cannot reconnect non-existent shard ${shardId}`);
            return;
        }

        try {
            this.#emitDebug(`Attempting to reconnect shard ${shardId}`);
            shard.status = "reconnecting";
            shard.reconnectAttempts++;
            shard.lastReconnectAttempt = Date.now();

            if (shard.reconnectAttempts > this.#maxReconnectAttempts) {
                throw new ShardError(
                    `Maximum reconnection attempts (${this.#maxReconnectAttempts}) exceeded`,
                    ShardErrorCode.ReconnectionError,
                    {
                        shardId,
                        attempts: shard.reconnectAttempts,
                        maxAttempts: this.#maxReconnectAttempts,
                    },
                );
            }

            this.#connectShard(shard);
        } catch (error) {
            if (error instanceof ShardError) {
                this.#emitError(error);
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
        const connectionError = new ShardError(
            `Shard ${shard.config.shardId} failed to connect`,
            ShardErrorCode.ConnectionError,
            {
                shardId: shard.config.shardId,
                attempts: shard.reconnectAttempts,
                maxAttempts: this.#maxReconnectAttempts,
                originalError: error,
            },
        );

        this.#emitError(connectionError);
        this.#emitDebug(
            `Connection failed for shard ${shard.config.shardId} (attempt ${shard.reconnectAttempts + 1}/${this.#maxReconnectAttempts})`,
        );

        if (shard.reconnectAttempts < this.#maxReconnectAttempts) {
            this.#emitDebug(`Queuing reconnection for shard ${shard.config.shardId}`);
            this.#connectionQueue.push(shard.config.shardId);

            if (!this.#isProcessingQueue) {
                this.#processQueue().catch((err) => {
                    const queueError = new ShardError(
                        "Failed to process reconnection queue",
                        ShardErrorCode.QueueError,
                        {
                            shardId: shard.config.shardId,
                            error: err,
                        },
                    );
                    this.#emitError(queueError);
                });
            }
        } else {
            const maxAttemptsError = new ShardError(
                `Shard ${shard.config.shardId} exceeded maximum reconnection attempts`,
                ShardErrorCode.ReconnectionError,
                {
                    shardId: shard.config.shardId,
                    attempts: shard.reconnectAttempts,
                    maxAttempts: this.#maxReconnectAttempts,
                    lastError: error,
                },
            );
            this.#emitError(maxAttemptsError);
            this.#emitDebug(`Maximum reconnection attempts reached for shard ${shard.config.shardId}`);
        }
    }

    #validateShardingRequirements(guilds: Partial<GuildStructure>[]): void {
        try {
            if (guilds.length > this.#guildsPerShard) {
                this.#emitDebug(
                    `Sharding is required: ${guilds.length} guilds exceed the ${this.#guildsPerShard} guild limit`,
                );
            }

            if (
                guilds.length >= this.#largeBotThreshold &&
                this.#session.shards &&
                !this.#isValidShardCount(this.#session.shards)
            ) {
                throw new ShardError(
                    `Large bot sharding requires shard count to be a multiple of ${this.#session.shards}`,
                    ShardErrorCode.InvalidConfig,
                    {
                        guildCount: guilds.length,
                        requiredShards: this.#session.shards,
                    },
                );
            }
        } catch (error) {
            const shardError =
                error instanceof ShardError
                    ? error
                    : new ShardError("Failed to validate sharding requirements", ShardErrorCode.InvalidConfig, {
                          guilds: guilds.length,
                          error,
                      });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    #getRecommendedShards(guildCount: number, gatewayShards: number): number {
        const minimumShards = Math.ceil(guildCount / this.#guildsPerShard);
        return Math.max(minimumShards, gatewayShards, this.#defaultShardCount);
    }

    #validateShardConfig(config: ShardConfig): void {
        if (config.shardId < 0) {
            throw new ShardError(`Invalid shard ID: ${config.shardId}. Must be >= 0`, ShardErrorCode.InvalidConfig, {
                config,
            });
        }

        if (config.shardCount < 1) {
            throw new ShardError(
                `Invalid shard count: ${config.shardCount}. Must be >= 1`,
                ShardErrorCode.InvalidConfig,
                { config },
            );
        }

        if (config.shardId >= config.shardCount) {
            throw new ShardError(
                `Invalid shard ID: ${config.shardId}. Must be less than shard count: ${config.shardCount}`,
                ShardErrorCode.InvalidConfig,
                { config },
            );
        }
    }

    async #checkSessionLimits(): Promise<void> {
        try {
            this.#emitDebug("Checking session limits");
            const gatewayInfo = await this.#rest.request(GatewayRoutes.getGatewayBot());
            const { remaining, reset_after } = gatewayInfo.session_start_limit;

            if (remaining === 0) {
                const resetTime = new Date(Date.now() + reset_after).toISOString();
                throw new ShardError(`Session limit reached. Resets at ${resetTime}`, ShardErrorCode.SessionError, {
                    resetTime,
                    resetAfter: reset_after,
                    shardCount: this.shardCount,
                });
            }

            if (remaining < this.shardCount) {
                throw new ShardError(
                    `Insufficient sessions remaining (${remaining}) to connect all shards (${this.shardCount})`,
                    ShardErrorCode.LimitExceeded,
                    {
                        remaining,
                        required: this.shardCount,
                        deficit: this.shardCount - remaining,
                    },
                );
            }

            this.#emitDebug(`Session limits checked: ${remaining} sessions available`);
        } catch (error) {
            const shardError =
                error instanceof ShardError
                    ? error
                    : new ShardError("Failed to check session limits", ShardErrorCode.SessionError, { error });
            this.#emitError(shardError);
            throw shardError;
        }
    }

    #emitError(error: ShardError): void {
        this.#gateway.emit(
            "error",
            Logger.error(error.message, {
                component: "ShardManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitDebug(message: string): void {
        this.#gateway.emit(
            "debug",
            Logger.debug(message, {
                component: "ShardManager",
            }),
        );
    }

    #emitWarn(message: string): void {
        this.#gateway.emit(
            "warn",
            Logger.warn(message, {
                component: "ShardManager",
            }),
        );
    }
}
