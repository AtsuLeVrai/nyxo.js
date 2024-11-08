import { GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import { GatewayRoutes, type Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type WebSocket from "ws";
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

export enum GatewayErrorCode {
    ConnectionError = "GATEWAY_CONNECTION_ERROR",
    InitializationError = "GATEWAY_INITIALIZATION_ERROR",
    ManageHandlingError = "GATEWAY_MESSAGE_ERROR",
    PayloadError = "GATEWAY_PAYLOAD_ERROR",
    SessionError = "GATEWAY_SESSION_ERROR",
    HeartBeatError = "GATEWAY_HEARTBEAT_ERROR",
    WebSocketError = "GATEWAY_WEBSOCKET_ERROR",
    ReconnectionError = "GATEWAY_RECONNECTION_ERROR",
    CompressionError = "GATEWAY_COMPRESSION_ERROR",
    StateError = "GATEWAY_STATE_ERROR",
}

export class GatewayError extends Error {
    code: GatewayErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: GatewayErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "GatewayError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class Gateway extends EventEmitter<GatewayEvents> {
    #token: string;
    #rest: Rest;
    #options: Readonly<GatewayOptions>;

    #compression: CompressionManager;
    #payload: PayloadManager;
    #session: SessionManager;
    #ws: WebSocketManager;
    #heartbeat: HeartbeatManager;
    #shardManager: ShardManager;

    #reconnectTimer: NodeJS.Timeout | null = null;
    #isReconnecting = false;

    constructor(token: string, rest: Rest, options: GatewayOptions) {
        super();

        this.#token = token;
        this.#rest = rest;
        this.#options = Object.freeze({ ...options });

        this.#compression = new CompressionManager();
        this.#payload = new PayloadManager(this.#options.encoding);
        this.#session = new SessionManager();
        this.#ws = new WebSocketManager();
        this.#heartbeat = new HeartbeatManager();
        this.#shardManager = new ShardManager(this, rest, token, this.#options, this.#session);

        this.#setupEventListeners();
    }

    async connect(resume = false): Promise<void> {
        try {
            if (!resume) {
                const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
                this.#session.updateLimit(gateway);
                this.#emitDebug("Retrieved fresh gateway session limits");
            }

            const url = this.#buildGatewayUrl(resume);

            if (this.#options.compress === "zlib-stream") {
                this.#compression.initializeZlib();
                this.#emitDebug("Initialized zlib-stream compression");
            }

            await this.#session.acquire();
            this.#ws.connect(url);

            this.#emitDebug(`Connected to gateway: ${url} (Resume: ${resume})`);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to establish gateway connection",
                GatewayErrorCode.ConnectionError,
                {
                    resume,
                    error,
                },
            );
            this.#emitError(gatewayError);
            this.#scheduleReconnect();
        }
    }

    destroy(): void {
        try {
            this.#emitDebug("Destroying gateway connection");
            this.#ws.destroy();
            this.cleanup();
            this.removeAllListeners();
            this.#emitDebug("Gateway connection destroyed");
        } catch (error) {
            const gatewayError = new GatewayError("Error during gateway destruction", GatewayErrorCode.StateError, {
                error,
            });
            this.#emitError(gatewayError);
        }
    }

    cleanup(): void {
        try {
            this.#emitDebug("Starting gateway cleanup");
            this.#heartbeat.cleanup();
            this.#clearReconnectTimer();
            this.#session.destroy();
            this.#shardManager.destroy();
            this.#emitDebug("Gateway cleanup completed");
        } catch (error) {
            const gatewayError = new GatewayError("Error during gateway cleanup", GatewayErrorCode.StateError, {
                error,
            });
            this.#emitError(gatewayError);
        }
    }

    send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this.isConnected()) {
            const error = new GatewayError(
                "Attempted to send message while disconnected",
                GatewayErrorCode.StateError,
                { operation: op },
            );
            this.#emitError(error);
            return;
        }

        try {
            const payload: GatewayPayload = {
                op,
                d: data,
                s: this.#session.sequence,
                t: null,
            };

            this.#ws.send(this.#payload.encode(payload));
            this.#emitDebug("Sent payload", { op: GatewayOpcodes[op] });
        } catch (error) {
            const gatewayError = new GatewayError("Failed to send payload", GatewayErrorCode.PayloadError, {
                operation: op,
                error,
            });
            this.#emitError(gatewayError);
        }
    }

    isConnected(): boolean {
        return this.#ws.isConnected();
    }

    async updateToken(token: string): Promise<void> {
        try {
            this.#emitDebug("Updating gateway token");
            this.#token = token;

            if (this.isConnected()) {
                this.#emitDebug("Reconnecting with new token");
                this.destroy();
                await this.connect(false);
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to update token", GatewayErrorCode.StateError, { error });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async resume(): Promise<void> {
        try {
            if (!this.#session.canResume()) {
                this.#emitDebug("Cannot resume: missing session data");
                await this.#initializeNewSession();
                return;
            }

            if (this.#session.sequence === null || this.#session.sessionId === null) {
                this.#emitDebug("Cannot resume: missing sequence or session ID");
                await this.#initializeNewSession();
                return;
            }

            await this.#session.acquire();

            const resumeData: ResumeStructure = {
                token: this.#token,
                session_id: this.#session.sessionId,
                seq: this.#session.sequence,
            };

            this.send(GatewayOpcodes.Resume, resumeData);
            this.#emitDebug("Resume request sent");
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to resume gateway connection",
                GatewayErrorCode.SessionError,
                { error },
            );
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    sendHeartbeat(): void {
        try {
            this.send(GatewayOpcodes.Heartbeat, this.#session.sequence);
            this.#emitDebug("Sent heartbeat", { sequence: this.#session.sequence });
        } catch (error) {
            const gatewayError = new GatewayError("Failed to send heartbeat", GatewayErrorCode.PayloadError, {
                sequence: this.#session.sequence,
                error,
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

            const payload = this.#payload.decode<GatewayPayload>(decompressed, isBinary);
            await this.#handlePayload(payload);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to handle gateway message",
                GatewayErrorCode.ManageHandlingError,
                {
                    dataSize: data.slice.length,
                    isBinary,
                    error,
                },
            );
            this.#emitError(gatewayError);
        }
    }

    #setupEventListeners(): void {
        try {
            this.#emitDebug("Setting up gateway event listeners");
            this.#compression.on("debug", (message) => this.emit("debug", message));
            this.#compression.on("error", (error) => this.emit("error", error));

            this.#payload.on("debug", (message) => this.emit("debug", message));
            this.#payload.on("error", (error) => this.emit("error", error));

            this.#ws.on("raw", this.handleMessage.bind(this));
            this.#ws.on("close", this.#handleClose.bind(this));
            this.#ws.on("debug", (message) => this.emit("debug", message));
            this.#ws.on("error", (error) => this.emit("error", error));

            this.#heartbeat.on("debug", (message) => this.emit("debug", message));
            this.#heartbeat.on("error", (error) => this.emit("error", error));
            this.#heartbeat.on("missedAck", async () => {
                this.#emitDebug("Missed heartbeat acknowledgement");
                if (!this.#isReconnecting) {
                    this.#isReconnecting = true;
                    await this.#reconnect();
                    this.#isReconnecting = false;
                }
            });

            this.#session.on("debug", (message) => this.emit("debug", message));
            this.#session.on("error", (error) => this.emit("error", error));

            this.#emitDebug("Event listeners setup completed");
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to setup event listeners",
                GatewayErrorCode.InitializationError,
                { error },
            );
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    #buildGatewayUrl(resume: boolean): string {
        try {
            if (resume && this.#session.resumeUrl) {
                this.#emitDebug("Using resume URL for connection");
                return this.#session.resumeUrl;
            }

            const url = new URL("wss://gateway.discord.gg/");
            url.searchParams.set("v", this.#options.v.toString());
            url.searchParams.set("encoding", this.#options.encoding);

            if (this.#options.compress) {
                url.searchParams.set("compress", this.#options.compress);
            }

            this.#emitDebug("Built gateway URL", {
                url: url.toString(),
                version: this.#options.v,
                encoding: this.#options.encoding,
                compression: this.#options.compress,
            });

            return url.toString();
        } catch (error) {
            const gatewayError = new GatewayError("Failed to build gateway URL", GatewayErrorCode.InitializationError, {
                resume,
                error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    #decompressData(data: WebSocket.RawData): Buffer | null {
        try {
            if (!Buffer.isBuffer(data)) {
                this.#emitDebug("Received non-buffer data, skipping decompression");
                return null;
            }

            switch (this.#options.compress) {
                case "zlib-stream": {
                    this.#emitDebug("Decompressing zlib data", { size: data.length });
                    return this.#compression.decompressZlib(data);
                }

                case "zstd-stream": {
                    throw new GatewayError("Zstd compression not supported", GatewayErrorCode.CompressionError, {
                        compressionType: "zstd-stream",
                    });
                }

                default: {
                    this.#emitDebug("No compression, returning raw data");
                    return data;
                }
            }
        } catch (error) {
            const gatewayError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Failed to decompress data", GatewayErrorCode.CompressionError, {
                          compressionType: this.#options.compress,
                          dataSize: Buffer.isBuffer(data) ? data.length : "unknown",
                          error,
                      });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async #handlePayload(payload: GatewayPayload): Promise<void> {
        try {
            if (payload.s) {
                this.#session.updateSequence(payload.s);
            }

            this.#emitDebug("Processing payload", {
                op: GatewayOpcodes[payload.op],
                type: payload.t,
                sequence: payload.s,
            });

            switch (payload.op) {
                case GatewayOpcodes.Dispatch:
                    this.#handleDispatch(payload);
                    break;

                case GatewayOpcodes.Heartbeat: {
                    this.#emitDebug("Received heartbeat request");
                    this.sendHeartbeat();
                    break;
                }

                case GatewayOpcodes.Reconnect: {
                    this.#emitDebug("Received reconnect request");
                    await this.#reconnect();
                    break;
                }

                case GatewayOpcodes.InvalidSession:
                    await this.#handleInvalidSession(payload.d as boolean);
                    break;

                case GatewayOpcodes.Hello:
                    await this.#handleHello(payload.d as HelloStructure);
                    break;

                case GatewayOpcodes.HeartbeatAck: {
                    this.#heartbeat.acknowledge();
                    this.#emitDebug("Received heartbeat acknowledgement");
                    break;
                }

                default: {
                    const error = new GatewayError(
                        `Unhandled gateway opcode: ${GatewayOpcodes[payload.op]}`,
                        GatewayErrorCode.PayloadError,
                        { opcode: payload.op },
                    );
                    this.#emitError(error);
                }
            }
        } catch (error) {
            const gatewayError =
                error instanceof GatewayError
                    ? error
                    : new GatewayError("Failed to handle payload", GatewayErrorCode.PayloadError, {
                          opcode: payload.op,
                          type: payload.t,
                          error,
                      });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    #handleDispatch(payload: GatewayPayload): void {
        try {
            if (!payload.t) {
                this.#emitDebug("Received dispatch without type, ignoring");
                return;
            }

            this.#emitDebug(`Handling dispatch event: ${payload.t}`);

            if (payload.t === "READY") {
                const ready = payload.d as ReadyEventFields;
                this.#session.updateSession(ready.session_id, ready.resume_gateway_url);
                this.#emitDebug("Session established", {
                    sessionId: ready.session_id,
                    resumeUrl: ready.resume_gateway_url,
                });
            }

            this.emit("dispatch", payload.t, payload.d as never);
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle dispatch", GatewayErrorCode.PayloadError, {
                type: payload.t,
                error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async #handleInvalidSession(resumable: boolean): Promise<void> {
        try {
            this.#emitDebug("Handling invalid session", { resumable });

            const delay = (Math.random() * 5 + 1) * 1000;
            this.#emitDebug(`Waiting ${delay}ms before ${resumable ? "resuming" : "reinitializing"}`);
            await new Promise((resolve) => setTimeout(resolve, delay));

            if (resumable) {
                await this.resume();
            } else {
                await this.#initializeNewSession();
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle invalid session", GatewayErrorCode.SessionError, {
                resumable,
                error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
        }
    }

    async #handleHello(data: HelloStructure): Promise<void> {
        try {
            this.#emitDebug("Received Hello event", {
                heartbeatInterval: data.heartbeat_interval,
            });

            if (this.#session.remaining === 0) {
                const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
                this.#session.updateLimit(gateway);
                this.#emitDebug("Updated session limits");
            }

            await this.#shardManager.initialize(this.#options.shard);
            this.#heartbeat.setInterval(data.heartbeat_interval, () => this.sendHeartbeat());
            this.#emitDebug("Hello handling completed");
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to handle hello event",
                GatewayErrorCode.InitializationError,
                {
                    heartbeatInterval: data.heartbeat_interval,
                    error,
                },
            );
            this.#emitError(gatewayError);
            this.#scheduleReconnect();
        }
    }

    async #initializeNewSession(): Promise<void> {
        try {
            this.#emitDebug("Initializing new session");
            const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());
            this.#session.updateLimit(gateway);
            this.#emitDebug("Retrieved fresh session limits");
            await this.#shardManager.initialize(this.#options.shard);
            this.#emitDebug("New session initialized successfully");
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to initialize new session",
                GatewayErrorCode.InitializationError,
                { error },
            );
            this.#emitError(gatewayError);
            this.#scheduleReconnect();
        }
    }

    #handleClose(code: GatewayCloseCodes, reason: string): void {
        try {
            this.#emitDebug("Handling WebSocket close", { code: code, reason });

            this.cleanup();
            this.emit("close", code, reason);

            const errorMessage = this.#getCloseCodeMessage(code);
            const canReconnect = this.#canReconnect(code);

            const closeError = new GatewayError(`WebSocket closed: ${errorMessage}`, GatewayErrorCode.WebSocketError, {
                code: code,
                reason,
                message: errorMessage,
                canReconnect,
            });
            this.#emitError(closeError);

            if (canReconnect) {
                this.#emitDebug("Connection is recoverable, scheduling reconnection", {
                    code: code,
                    reason,
                });
                this.#scheduleReconnect();
            } else {
                const finalError = new GatewayError(
                    `Cannot reconnect: ${errorMessage}`,
                    GatewayErrorCode.ReconnectionError,
                    {
                        code: code,
                        reason,
                        message: errorMessage,
                    },
                );
                this.#emitError(finalError);
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to handle WebSocket close", GatewayErrorCode.WebSocketError, {
                code,
                reason,
                error,
            });
            this.#emitError(gatewayError);
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

        const canReconnect = !nonRecoverableCodes.includes(code);
        this.#emitDebug("Checking if code is recoverable", {
            code,
            recoverable: canReconnect,
            message: this.#getCloseCodeMessage(code),
        });

        return canReconnect;
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

        const message = messages[code] ?? `Unknown close code: ${code}`;
        this.#emitDebug("Getting close code message", { code, message });
        return message;
    }

    #scheduleReconnect(): void {
        try {
            this.#clearReconnectTimer();
            const reconnectDelay = 5000;
            this.#emitDebug(`Scheduling reconnection attempt in ${reconnectDelay}ms`);

            this.#reconnectTimer = setTimeout(async () => {
                try {
                    this.#emitDebug("Executing scheduled reconnection");
                    const gateway = await this.#rest.request(GatewayRoutes.getGatewayBot());

                    this.#session.updateLimit(gateway);
                    this.#emitDebug("Retrieved fresh session limits for reconnection", {
                        remaining: gateway.session_start_limit.remaining,
                        resetAfter: gateway.session_start_limit.reset_after,
                    });

                    await this.connect(true);
                } catch (error) {
                    const gatewayError = new GatewayError(
                        "Scheduled reconnection failed",
                        GatewayErrorCode.ReconnectionError,
                        { error },
                    );
                    this.#emitError(gatewayError);
                    this.#scheduleReconnect();
                }
            }, reconnectDelay);
        } catch (error) {
            const gatewayError = new GatewayError(
                "Failed to schedule reconnection",
                GatewayErrorCode.ReconnectionError,
                { error },
            );
            this.#emitError(gatewayError);
        }
    }

    #clearReconnectTimer(): void {
        try {
            if (this.#reconnectTimer) {
                this.#emitDebug("Clearing existing reconnect timer");
                clearTimeout(this.#reconnectTimer);
                this.#reconnectTimer = null;
            }
        } catch (error) {
            const gatewayError = new GatewayError("Failed to clear reconnect timer", GatewayErrorCode.StateError, {
                error,
            });
            this.#emitError(gatewayError);
        }
    }

    async #reconnect(): Promise<void> {
        try {
            this.#emitDebug("Initiating manual reconnection");

            this.destroy();
            await this.connect(true);

            this.#emitDebug("Manual reconnection completed successfully");
        } catch (error) {
            const gatewayError = new GatewayError("Manual reconnection failed", GatewayErrorCode.ReconnectionError, {
                error,
            });
            this.#emitError(gatewayError);
            throw gatewayError;
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

    #emitDebug(message: string, details?: Record<string, unknown>): void {
        this.emit(
            "debug",
            Logger.debug(message, {
                component: "Gateway",
                details,
            }),
        );
    }
}
