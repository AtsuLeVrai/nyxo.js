import { GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
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
import type {
    GatewayEvents,
    GatewayManagerPayload,
    GatewayOptions,
    GatewayReceiveEvents,
    GatewaySendEvents,
} from "./types/index.js";

export class Gateway extends EventEmitter<GatewayEvents<keyof GatewayReceiveEvents>> {
    readonly #webSocket: WebSocketManager;
    readonly #compression: CompressionManager;
    readonly #payload: PayloadManager;
    readonly #heartbeat: HeartbeatManager;
    readonly #session: SessionManager;
    readonly #shardManager: ShardManager;
    #reconnectTimeout: NodeJS.Timeout | null = null;
    #token: string;
    readonly #options: Readonly<GatewayOptions>;

    constructor(token: string, rest: Rest, options: GatewayOptions) {
        super();
        this.#token = token;
        this.#options = Object.freeze({ ...options });

        this.#webSocket = new WebSocketManager();
        this.#compression = new CompressionManager();
        this.#payload = new PayloadManager(options.encoding);
        this.#heartbeat = new HeartbeatManager();
        this.#session = new SessionManager();
        this.#shardManager = new ShardManager(this, rest, token, options);

        this.#setupEventListeners();
    }

    async connect(resumable = false): Promise<void> {
        try {
            const query = new URL("wss://gateway.discord.gg/");
            query.searchParams.set("v", this.#options.v.toString());
            query.searchParams.set("encoding", this.#options.encoding);

            if (this.#options.compress) {
                query.searchParams.set("compress", this.#options.compress);
                if (this.#options.compress === "zlib-stream") {
                    this.#compression.initialize();
                    this.emit("DEBUG", "[GATEWAY] Zlib-stream compression initialized");
                }
            }

            const url = resumable && this.#session.getResumeUrl() ? this.#session.getResumeUrl()! : query.toString();

            this.#webSocket.connect(url);
            this.emit("DEBUG", `[GATEWAY] Connecting to Gateway: ${url} (Resumable: ${resumable})`);
        } catch (error) {
            const errorMessage = `[GATEWAY] Failed to connect to Gateway: ${error instanceof Error ? error.message : String(error)}`;
            this.emit("ERROR", new Error(errorMessage));
            this.#scheduleReconnect();
        }
    }

    destroy(): void {
        this.#webSocket.destroy();
        this.cleanup();
        this.removeAllListeners();
        this.emit("DEBUG", "[GATEWAY] Gateway connection destroyed. Cleaning up resources.");
    }

    cleanup(): void {
        this.#heartbeat.cleanup();
        if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
            this.#reconnectTimeout = null;
        }
        this.#session.clear();
        this.#shardManager.clear();
        this.emit("DEBUG", "[GATEWAY] Cleanup completed. Resources released.");
    }

    send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this.#webSocket.isConnected()) {
            this.emit("WARN", "[GATEWAY] Attempted to send a message while the WebSocket is not open");
            return;
        }

        const payload: GatewayManagerPayload = {
            op,
            d: data,
            s: this.#session.getSequence(),
            t: null,
        };

        this.#webSocket.send(this.#payload.encode(payload));
    }

    isConnected(): boolean {
        return this.#webSocket.isConnected();
    }

    setToken(token: string): void {
        this.#token = token;
        this.emit("DEBUG", "[GATEWAY] Token updated successfully");

        if (this.isConnected()) {
            this.emit("DEBUG", "[GATEWAY] Reconnecting with new token");
            this.destroy();
            void this.connect(false);
        }
    }

    async resumeSession(): Promise<void> {
        if (this.#session.canResume()) {
            await this.connect(true);
        } else {
            throw new Error("Cannot resume session: missing session ID, sequence number, or resume URL");
        }
    }

    sendHeartbeat(): void {
        this.send(GatewayOpcodes.Heartbeat, this.#session.getSequence());
        this.emit("DEBUG", `[GATEWAY] Sent Heartbeat. Sequence: ${this.#session.getSequence()}`);
    }

    reconnect(): void {
        this.emit("DEBUG", "[GATEWAY] Initiating reconnection process.");
        this.destroy();
        void this.connect(true);
    }

    resume(): void {
        if (!this.#session.canResume()) {
            this.emit(
                "WARN",
                "[GATEWAY] Failed to resume session: missing session ID or sequence number. Starting new session."
            );
            void this.#shardManager.initialize(this.#options.shard);
            return;
        }

        const resume: ResumeStructure = {
            token: this.#token,
            session_id: this.#session.getSessionId()!,
            seq: this.#session.getSequence()!,
        };

        this.send(GatewayOpcodes.Resume, resume);
    }

    #setupEventListeners(): void {
        this.#webSocket.on("MESSAGE", this.#onMessage.bind(this));
        this.#webSocket.on("CLOSE", (code, reason) => this.#onClose(code as GatewayCloseCodes, reason));
        this.#webSocket.on("ERROR", (error) => this.emit("ERROR", error));
        this.#webSocket.on("DEBUG", (message) => this.emit("DEBUG", message));

        this.#heartbeat.on("MISSED_ACK", () => {
            this.emit("WARN", "[GATEWAY] No heartbeat acknowledgement received. Initiating reconnection.");
            this.reconnect();
        });
    }

    #onMessage(data: WebSocket.RawData, isBinary: boolean): void {
        let decompressedData: Buffer = Buffer.alloc(0);

        try {
            if (this.#options.compress === "zlib-stream" && Buffer.isBuffer(data)) {
                decompressedData = this.#compression.decompressZlib(data);
            } else if (this.#options.compress === "zstd-stream" && Buffer.isBuffer(data)) {
                throw new Error("Zstd compression is not supported in this environment");
            } else if (Buffer.isBuffer(data)) {
                decompressedData = Buffer.from(data);
            }

            if (decompressedData.length > 0) {
                const decodedPayload = this.#payload.decode<GatewayManagerPayload>(decompressedData, isBinary);
                this.#handlePayload(decodedPayload);
            }
        } catch (error) {
            const errorMessage = `[GATEWAY] Failed to handle message: ${error instanceof Error ? error.message : String(error)}`;
            this.emit("ERROR", new Error(errorMessage));
        }
    }

    #handlePayload(payload: GatewayManagerPayload): void {
        if (payload.s) {
            this.#session.updateSequence(payload.s);
        }

        try {
            switch (payload.op) {
                case GatewayOpcodes.Dispatch: {
                    this.#handleDispatch(payload);
                    break;
                }

                case GatewayOpcodes.Heartbeat: {
                    this.sendHeartbeat();
                    break;
                }

                case GatewayOpcodes.Reconnect: {
                    this.reconnect();
                    break;
                }

                case GatewayOpcodes.InvalidSession: {
                    this.#handleInvalidSession(payload.d as boolean);
                    break;
                }

                case GatewayOpcodes.Hello: {
                    this.#handleHello(payload.d as HelloStructure);
                    break;
                }

                case GatewayOpcodes.HeartbeatAck: {
                    this.#heartbeat.acknowledge();
                    this.emit("DEBUG", "[GATEWAY] Received Heartbeat Acknowledgement.");
                    break;
                }

                default: {
                    this.emit("WARN", `[GATEWAY] Unhandled gateway opcode: ${GatewayOpcodes[payload.op]}`);
                    break;
                }
            }
        } catch (error) {
            const errorMessage = `[GATEWAY] Error handling payload: ${error instanceof Error ? error.message : String(error)}`;
            this.emit("ERROR", new Error(errorMessage));
        }
    }

    #handleDispatch(payload: GatewayManagerPayload): void {
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this.#session.updateSession(ready.session_id, ready.resume_gateway_url);
            this.emit(
                "DEBUG",
                `[GATEWAY] Session established. Session ID: ${ready.session_id}, Resume URL: ${ready.resume_gateway_url}`
            );
        }

        if (!payload.t) {
            return;
        }

        this.emit("DISPATCH", payload.t, payload.d as never);
    }

    #handleInvalidSession(resumable: boolean): void {
        this.emit("DEBUG", `[GATEWAY] Received Invalid Session. Resumable: ${resumable}`);
        setTimeout(
            () => {
                if (resumable) {
                    this.resume();
                } else {
                    void this.#shardManager.initialize(this.#options.shard);
                }
            },
            (Math.random() * 5 + 1) * 1_000
        );
    }

    #handleHello(data: HelloStructure): void {
        void this.#shardManager.initialize(this.#options.shard);
        this.#heartbeat.setInterval(data.heartbeat_interval, () => this.sendHeartbeat());
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

    #onClose(code: GatewayCloseCodes, reason: string): void {
        this.cleanup();

        this.emit("CLOSE", code, reason);
        const errorMessage = this.#getCloseCodeErrorMessage(code);
        this.emit("ERROR", new Error(`[GATEWAY] WebSocket closed: ${errorMessage}. Reason: ${reason}`));

        if (this.#canReconnect(code)) {
            this.emit(
                "DEBUG",
                `[GATEWAY] Scheduling reconnection attempt after close. Code: ${code}, Reason: ${reason}`
            );
            this.#scheduleReconnect();
        } else {
            this.emit(
                "ERROR",
                new Error(`[GATEWAY] Cannot reconnect due to critical error. Close code: ${code}, Reason: ${reason}`)
            );
        }
    }

    #getCloseCodeErrorMessage(code: GatewayCloseCodes): string {
        switch (code) {
            case GatewayCloseCodes.UnknownError:
                return "Unknown error. Try reconnecting?";
            case GatewayCloseCodes.UnknownOpcode:
                return "Unknown opcode sent";
            case GatewayCloseCodes.DecodeError:
                return "Invalid payload sent";
            case GatewayCloseCodes.NotAuthenticated:
                return "Payload sent before identifying";
            case GatewayCloseCodes.AuthenticationFailed:
                return "Invalid token";
            case GatewayCloseCodes.AlreadyAuthenticated:
                return "Already identified";
            case GatewayCloseCodes.InvalidSeq:
                return "Invalid seq number";
            case GatewayCloseCodes.RateLimited:
                return "Rate limited";
            case GatewayCloseCodes.SessionTimedOut:
                return "Session timed out";
            case GatewayCloseCodes.InvalidShard:
                return "Invalid shard";
            case GatewayCloseCodes.ShardingRequired:
                return "Sharding required";
            case GatewayCloseCodes.InvalidApiVersion:
                return "Invalid API version";
            case GatewayCloseCodes.InvalidIntents:
                return "Invalid intent(s)";
            case GatewayCloseCodes.DisallowedIntents:
                return "Disallowed intent(s)";
            default:
                return `Unknown close code: ${code}`;
        }
    }

    #scheduleReconnect(): void {
        if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
        }

        this.#reconnectTimeout = setTimeout(async () => {
            this.emit("DEBUG", "[GATEWAY] Attempting to reconnect");
            await this.connect(true);
        }, 5_000);
    }
}
