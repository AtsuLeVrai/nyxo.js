import { GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import { GatewayRoutes, type Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type WebSocket from "ws";
import { ErrorCodes, GatewayError } from "./GatewayError.js";
import type { HelloStructure, ReadyEventFields, ResumeStructure } from "./events/index.js";
import {
    CompressionManager,
    HeartbeatManager,
    PayloadManager,
    SessionManager,
    ShardManager,
    WebSocketManager,
} from "./managers/index.js";
import type { GatewayEvents, GatewayOptions, GatewayPayload, GatewaySendEvents } from "./types/index.js";

export class Gateway extends EventEmitter<GatewayEvents> {
    #token: string;
    readonly #rest: Rest;
    readonly #options: Readonly<GatewayOptions>;
    #compression: CompressionManager | null = null;
    #payload: PayloadManager | null = null;
    #session: SessionManager | null = null;
    #ws: WebSocketManager | null = null;
    #heartbeat: HeartbeatManager | null = null;
    #shardManager: ShardManager | null = null;
    #reconnectTimer: NodeJS.Timeout | null = null;

    constructor(token: string, rest: Rest, options: GatewayOptions) {
        super();
        this.#token = token;
        this.#rest = rest;
        this.#options = Object.freeze({ ...options });
    }

    get compression(): CompressionManager {
        if (!this.#compression) {
            this.#compression = new CompressionManager(this);
        }
        return this.#compression;
    }

    get payload(): PayloadManager {
        if (!this.#payload) {
            this.#payload = new PayloadManager(this, this.#options.encoding);
        }
        return this.#payload;
    }

    get session(): SessionManager {
        if (!this.#session) {
            this.#session = new SessionManager(this);
        }
        return this.#session;
    }

    get ws(): WebSocketManager {
        if (!this.#ws) {
            this.#ws = new WebSocketManager(this);
        }
        return this.#ws;
    }

    get heartbeat(): HeartbeatManager {
        if (!this.#heartbeat) {
            this.#heartbeat = new HeartbeatManager(this);
        }
        return this.#heartbeat;
    }

    get shardManager(): ShardManager {
        if (!this.#shardManager) {
            this.#shardManager = new ShardManager(this, this.#rest, this.#token, this.#options, this.session);
        }
        return this.#shardManager;
    }

    async connect(resume = false): Promise<void> {
        try {
            if (!resume) {
                const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
                this.session.updateLimit(gateway);
            }

            const url = this.#buildGatewayUrl(resume);
            if (this.#options.compress === "zlib-stream") {
                this.compression.initializeZlib();
            }

            await this.session.acquire();
            this.ws.connect(url);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to establish gateway connection",
                ErrorCodes.GatewayConnectionError,
                { details: { resume }, cause: error },
            );
            this.#emitError(gatewayError);
            this.#scheduleReconnect();
        }
    }

    destroy(): void {
        try {
            this.ws.destroy();
            this.cleanup();
            this.removeAllListeners();
        } catch (error) {
            const gatewayError = new GatewayError("Error during gateway destruction", ErrorCodes.GatewayStateError, {
                cause: error,
            });
            this.#emitError(gatewayError);
        }
    }

    cleanup(): void {
        try {
            this.#clearReconnectTimer();
            if (this.#heartbeat) {
                this.#heartbeat.destroy();
            }
            if (this.#session) {
                this.#session.destroy();
            }
            if (this.#shardManager) {
                this.#shardManager.destroy();
            }
            this.#compression = null;
            this.#payload = null;
            this.#ws = null;
        } catch (error) {
            const gatewayError = new GatewayError("Error during gateway cleanup", ErrorCodes.GatewayStateError, {
                cause: error,
            });
            this.#emitError(gatewayError);
        }
    }

    send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this.isConnected()) {
            const error = new GatewayError(
                "Attempted to send message while disconnected",
                ErrorCodes.GatewayStateError,
                { details: { operation: op } },
            );
            this.#emitError(error);
            return;
        }

        try {
            const payload: GatewayPayload = {
                op,
                d: data,
                s: this.session.sequence,
                t: null,
            };

            this.ws.send(this.payload.encode(payload));
        } catch (error) {
            const gatewayError = new GatewayError("Failed to send payload", ErrorCodes.GatewayPayloadError, {
                details: { operation: op },
                cause: error,
            });
            this.#emitError(gatewayError);
        }
    }

    isConnected(): boolean {
        return this.ws.isConnected();
    }

    async updateToken(token: string): Promise<void> {
        try {
            this.#token = token;
            if (this.isConnected()) {
                this.destroy();
                await this.connect(false);
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to update token", ErrorCodes.GatewayStateError, {
                cause: error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async resume(): Promise<void> {
        try {
            if (!this.session.canResume() || this.session.sequence === null || this.session.sessionId === null) {
                await this.#initializeNewSession();
                return;
            }

            await this.session.acquire();

            const resumeData: ResumeStructure = {
                token: this.#token,
                session_id: this.session.sessionId,
                seq: this.session.sequence,
            };

            this.send(GatewayOpcodes.Resume, resumeData);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to resume gateway connection",
                ErrorCodes.GatewayConnectionError,
                { cause: error },
            );
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    sendHeartbeat(): void {
        try {
            this.send(GatewayOpcodes.Heartbeat, this.session.sequence);
        } catch (error) {
            const gatewayError = new GatewayError("Failed to send heartbeat", ErrorCodes.GatewayPayloadError, {
                details: { sequence: this.session.sequence },
                cause: error,
            });
            this.#emitError(gatewayError);
        }
    }

    async handleMessage(data: WebSocket.RawData, isBinary: boolean): Promise<void> {
        try {
            const decompressed = this.#decompressData(data);
            if (!decompressed) {
                return;
            }

            const payload = this.payload.decode<GatewayPayload>(decompressed, isBinary);
            await this.#handlePayload(payload);
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle gateway message", ErrorCodes.GatewayMessageError, {
                details: { dataSize: data.slice.length, isBinary },
                cause: error,
            });
            this.#emitError(gatewayError);
        }
    }

    async reconnect(): Promise<void> {
        try {
            this.destroy();
            await this.connect(true);
        } catch (error) {
            const gatewayError = new GatewayError("Manual reconnection failed", ErrorCodes.GatewayConnectionError, {
                cause: error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    handleClose(code: GatewayCloseCodes, reason: string): void {
        try {
            this.cleanup();
            this.emit("close", code, reason);

            const errorMessage = this.#getCloseCodeMessage(code);
            const canReconnect = this.#canReconnect(code);

            const closeError = new GatewayError(`WebSocket closed: ${errorMessage}`, ErrorCodes.WebSocketStateError, {
                details: { code, reason, message: errorMessage, canReconnect },
            });
            this.#emitError(closeError);

            if (canReconnect) {
                this.#scheduleReconnect();
            }
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to handle WebSocket close",
                ErrorCodes.WebSocketConnectionError,
                { details: { code, reason }, cause: error },
            );
            this.#emitError(gatewayError);
        }
    }

    #buildGatewayUrl(resume: boolean): string {
        if (resume && this.session.resumeUrl) {
            return this.session.resumeUrl;
        }

        const url = new URL("wss://gateway.discord.gg/");
        url.searchParams.set("v", this.#options.version.toString());
        url.searchParams.set("encoding", this.#options.encoding);

        if (this.#options.compress) {
            url.searchParams.set("compress", this.#options.compress);
        }

        return url.toString();
    }

    #decompressData(data: WebSocket.RawData): Buffer | null {
        if (!Buffer.isBuffer(data)) {
            return null;
        }

        try {
            if (this.#options.compress === "zlib-stream") {
                return this.compression.decompressZlib(data);
            }
            if (this.#options.compress === "zstd-stream") {
                throw new GatewayError("Zstd compression not supported", ErrorCodes.CompressionInvalidData);
            }
            return data;
        } catch (error) {
            const gatewayError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Failed to decompress data", ErrorCodes.CompressionInvalidData, {
                          details: {
                              compressionType: this.#options.compress,
                              dataSize: Buffer.isBuffer(data) ? data.length : "unknown",
                          },
                          cause: error,
                      });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async #handlePayload(payload: GatewayPayload): Promise<void> {
        try {
            if (payload.s) {
                this.session.updateSequence(payload.s);
            }

            switch (payload.op) {
                case GatewayOpcodes.Dispatch:
                    this.#handleDispatch(payload);
                    break;
                case GatewayOpcodes.Heartbeat:
                    this.sendHeartbeat();
                    break;
                case GatewayOpcodes.Reconnect:
                    await this.reconnect();
                    break;
                case GatewayOpcodes.InvalidSession:
                    await this.#handleInvalidSession(payload.d as boolean);
                    break;
                case GatewayOpcodes.Hello:
                    await this.#handleHello(payload.d as HelloStructure);
                    break;
                case GatewayOpcodes.HeartbeatAck:
                    this.heartbeat.acknowledge();
                    break;
                default: {
                    const error = new GatewayError(
                        `Unhandled gateway opcode: ${GatewayOpcodes[payload.op]}`,
                        ErrorCodes.GatewayPayloadError,
                        { details: { opcode: payload.op } },
                    );
                    this.#emitError(error);
                }
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle payload", ErrorCodes.GatewayPayloadError, {
                details: { opcode: payload.op, type: payload.t },
                cause: error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    #handleDispatch(payload: GatewayPayload): void {
        try {
            if (!payload.t) {
                return;
            }

            if (payload.t === "READY") {
                const ready = payload.d as ReadyEventFields;
                this.session.updateSession(ready.session_id, ready.resume_gateway_url);
            }

            this.emit("dispatch", payload.t, payload.d as never);
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle dispatch", ErrorCodes.GatewayPayloadError, {
                details: { type: payload.t },
                cause: error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async #handleInvalidSession(resumable: boolean): Promise<void> {
        try {
            const delay = (Math.random() * 5 + 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));

            if (resumable) {
                await this.resume();
            } else {
                await this.#initializeNewSession();
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle invalid session", ErrorCodes.SessionStateError, {
                details: { resumable },
                cause: error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async #handleHello(data: HelloStructure): Promise<void> {
        try {
            if (this.session.remaining === 0) {
                const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
                this.session.updateLimit(gateway);
            }

            await this.shardManager.initialize(this.#options.shard);
            this.heartbeat.connect(data.heartbeat_interval, () => this.sendHeartbeat());
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to handle hello event",
                ErrorCodes.GatewayInitializationError,
                { details: { heartbeatInterval: data.heartbeat_interval }, cause: error },
            );
            this.#emitError(gatewayError);
            this.#scheduleReconnect();
        }
    }

    async #initializeNewSession(): Promise<void> {
        try {
            const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
            this.session.updateLimit(gateway);
            await this.shardManager.initialize(this.#options.shard);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to initialize new session",
                ErrorCodes.GatewayInitializationError,
                { cause: error },
            );
            this.#emitError(gatewayError);
            this.#scheduleReconnect();
        }
    }

    #canReconnect(code: GatewayCloseCodes): boolean {
        const nonRecoverableCodes = [
            GatewayCloseCodes.AuthenticationFailed,
            GatewayCloseCodes.InvalidShard,
            GatewayCloseCodes.ShardingRequired,
            GatewayCloseCodes.InvalidApiVersion,
            GatewayCloseCodes.InvalidIntents,
            GatewayCloseCodes.DisallowedIntents,
        ];
        return !nonRecoverableCodes.includes(code);
    }

    #getCloseCodeMessage(code: GatewayCloseCodes): string {
        const messages: Record<number, string> = {
            [GatewayCloseCodes.UnknownError]: "Unknown error",
            [GatewayCloseCodes.UnknownOpcode]: "Unknown opcode",
            [GatewayCloseCodes.DecodeError]: "Decode error",
            [GatewayCloseCodes.NotAuthenticated]: "Not authenticated",
            [GatewayCloseCodes.AuthenticationFailed]: "Authentication failed",
            [GatewayCloseCodes.AlreadyAuthenticated]: "Already authenticated",
            [GatewayCloseCodes.InvalidSeq]: "Invalid sequence",
            [GatewayCloseCodes.RateLimited]: "Rate limited",
            [GatewayCloseCodes.SessionTimedOut]: "Session timeout",
            [GatewayCloseCodes.InvalidShard]: "Invalid shard",
            [GatewayCloseCodes.ShardingRequired]: "Sharding required",
            [GatewayCloseCodes.InvalidApiVersion]: "Invalid API version",
            [GatewayCloseCodes.InvalidIntents]: "Invalid intents",
            [GatewayCloseCodes.DisallowedIntents]: "Disallowed intents",
        };
        return messages[code] ?? `Unknown close code: ${code}`;
    }

    #scheduleReconnect(): void {
        try {
            this.#clearReconnectTimer();
            const reconnectDelay = 5000;

            this.#reconnectTimer = setTimeout(async () => {
                try {
                    const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
                    this.session.updateLimit(gateway);
                    await this.connect(true);
                } catch (error) {
                    const gatewayError = new GatewayError(
                        "Scheduled reconnection failed",
                        ErrorCodes.GatewayConnectionError,
                        { cause: error },
                    );
                    this.#emitError(gatewayError);
                    this.#scheduleReconnect();
                }
            }, reconnectDelay);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to schedule reconnection",
                ErrorCodes.GatewayConnectionError,
                { cause: error },
            );
            this.#emitError(gatewayError);
        }
    }

    #clearReconnectTimer(): void {
        try {
            if (this.#reconnectTimer) {
                clearTimeout(this.#reconnectTimer);
                this.#reconnectTimer = null;
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to clear reconnect timer", ErrorCodes.GatewayStateError, {
                cause: error,
            });
            this.#emitError(gatewayError);
        }
    }

    #emitError(error: GatewayError): void {
        this.emit(
            "error",
            Logger.error(error.message, {
                component: "Gateway",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }
}
