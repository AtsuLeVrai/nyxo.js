import { GatewayCloseCodes, GatewayOpcodes, type Integer } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { pack, unpack } from "erlpack";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { Inflate, Z_SYNC_FLUSH } from "zlib-sync";
import type { HelloStructure, ReadyEventFields, ResumeStructure } from "../events";
import type { GatewayEvents, GatewayOptions, GatewayReceiveEvents, GatewaySendEvents } from "../types";
import { ShardManager } from "./ShardManager";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#payload-structure}
 */
type GatewayManagerPayload = {
    /**
     * Event data
     */
    d: unknown;
    /**
     * Gateway opcode, which indicates the payload type
     */
    op: GatewayOpcodes;
    /**
     * Sequence number of event used for resuming sessions and heartbeating
     */
    s: Integer | null;
    /**
     * Event name
     */
    t: keyof GatewayReceiveEvents | null;
};

export class Gateway extends EventEmitter<GatewayEvents<keyof GatewayReceiveEvents>> {
    #ws: WebSocket | null = null;

    #sequence: number | null = null;

    #sessionId: string | null = null;

    #resumeGatewayUrl: string | null = null;

    #lastHeartbeatAck = false;

    #isOpened = false;

    #heartbeatInterval: NodeJS.Timeout | null = null;

    #heartbeatTimer: NodeJS.Timeout | null = null;

    #reconnectTimeout: NodeJS.Timeout | null = null;

    #inflator: Inflate | null = null;

    #token: string;

    readonly #options: Readonly<GatewayOptions>;

    readonly #shardManager: ShardManager;

    constructor(token: string, rest: Rest, options: GatewayOptions) {
        super();
        this.#token = token;
        this.#shardManager = new ShardManager(this, rest, token, options);
        this.#options = Object.freeze({ ...options });
    }

    async connect(resumable = false) {
        if (this.#ws) {
            this.destroy();
        }

        this.#isOpened = false;

        try {
            const query = new URL("wss://gateway.discord.gg/");

            query.searchParams.set("v", this.#options.v.toString());
            query.searchParams.set("encoding", this.#options.encoding);

            if (this.#options.compress) {
                query.searchParams.set("compress", this.#options.compress);
            }

            const url = resumable && this.#resumeGatewayUrl ? this.#resumeGatewayUrl : query.toString();
            this.#ws = new WebSocket(url);

            if (this.#options.compress === "zlib-stream") {
                this.#inflator = new Inflate({ chunkSize: 65_535 });
                this.emit("DEBUG", "[GATEWAY] Zlib-stream compression initialized");
            }

            this.#ws.on("open", this.#onOpen.bind(this));
            this.#ws.on("message", this.#onMessage.bind(this));
            this.#ws.on("close", this.#onClose.bind(this));
            this.#ws.on("error", this.#onError.bind(this));

            this.emit("DEBUG", `[GATEWAY] Connecting to Gateway: ${url} (Resumable: ${resumable})`);
        } catch (error) {
            const errorMessage = `[GATEWAY] Failed to connect to Gateway: ${error instanceof Error ? error.message : String(error)}`;
            this.emit("ERROR", new Error(errorMessage));
            this.#scheduleReconnect();
        }
    }

    destroy(): void {
        if (this.#ws) {
            this.#ws.removeAllListeners();
            this.#ws.close();
            this.#ws = null;
        }

        this.#isOpened = false;
        this.cleanup();
        this.removeAllListeners();
        this.emit("DEBUG", "[GATEWAY] Gateway connection destroyed. Cleaning up resources.");
    }

    cleanup(): void {
        if (this.#heartbeatInterval) {
            clearInterval(this.#heartbeatInterval);
        }

        if (this.#heartbeatTimer) {
            clearTimeout(this.#heartbeatTimer);
        }

        if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
        }

        this.#sequence = null;
        this.#sessionId = null;
        this.#resumeGatewayUrl = null;
        this.#lastHeartbeatAck = false;
        this.#shardManager.clear();
        this.emit("DEBUG", "[GATEWAY] Cleanup completed. Resources released.");
    }

    send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN || !this.#isOpened) {
            this.emit("WARN", "[GATEWAY] Attempted to send a message while the WebSocket is not open");
            return;
        }

        const payload: GatewayManagerPayload = {
            op,
            d: data,
            s: this.#sequence,
            t: null,
        };

        this.#ws.send(this.#encodePayload(payload));
    }

    isConnected(): boolean {
        return this.#ws !== null && this.#ws.readyState === WebSocket.OPEN && this.#isOpened;
    }

    forceHeartbeat(): void {
        this.#sendHeartbeat();
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
        if (this.#sessionId && this.#sequence && this.#resumeGatewayUrl) {
            await this.connect(true);
        } else {
            throw new Error("Cannot resume session: missing session ID, sequence number, or resume URL");
        }
    }

    #onOpen(): void {
        this.#isOpened = true;
        this.emit("DEBUG", "[GATEWAY] WebSocket connection opened");
    }

    #onMessage(data: WebSocket.RawData, isBinary: boolean): void {
        let decompressedData: Buffer = Buffer.alloc(0);

        try {
            if (this.#options.compress === "zlib-stream" && Buffer.isBuffer(data)) {
                decompressedData = this.#decompressZlib(data);
            } else if (this.#options.compress === "zstd-stream" && Buffer.isBuffer(data)) {
                throw new Error("Zstd compression is not supported in this environment");
            } else if (Buffer.isBuffer(data)) {
                decompressedData = Buffer.from(data);
            }

            if (decompressedData.length > 0) {
                const decodedPayload = this.#decodePayload<GatewayManagerPayload>(decompressedData, isBinary);
                this.#handlePayload(decodedPayload);
            }
        } catch (error) {
            const errorMessage = `[GATEWAY] Failed to handle message: ${error instanceof Error ? error.message : String(error)}`;
            this.emit("ERROR", new Error(errorMessage));
        }
    }

    #handlePayload(payload: GatewayManagerPayload): void {
        if (payload.s) {
            this.#sequence = payload.s;
        }

        try {
            switch (payload.op) {
                case GatewayOpcodes.Dispatch: {
                    this.#handleDispatch(payload);
                    break;
                }

                case GatewayOpcodes.Heartbeat: {
                    this.#sendHeartbeat();
                    break;
                }

                case GatewayOpcodes.Reconnect: {
                    this.#reconnect();
                    break;
                }

                case GatewayOpcodes.InvalidSession: {
                    this.#invalidSession(payload.d as boolean);
                    break;
                }

                case GatewayOpcodes.Hello: {
                    this.#hello(payload.d as HelloStructure);
                    break;
                }

                case GatewayOpcodes.HeartbeatAck: {
                    this.#heartbeatAck();
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
            this.#sessionId = ready.session_id;
            this.#resumeGatewayUrl = ready.resume_gateway_url;
            this.emit(
                "DEBUG",
                `[GATEWAY] Session established. Session ID: ${this.#sessionId}, Resume URL: ${this.#resumeGatewayUrl}`
            );
        }

        if (!payload.t) {
            return;
        }

        this.emit("DISPATCH", payload.t, payload.d as never);
    }

    #sendHeartbeat(): void {
        this.send(GatewayOpcodes.Heartbeat, this.#sequence);
        this.emit("DEBUG", `[GATEWAY] Sent Heartbeat. Sequence: ${this.#sequence}`);
    }

    #reconnect(): void {
        this.emit("DEBUG", "[GATEWAY] Initiating reconnection process.");
        this.destroy();
        void this.connect(true);
    }

    #invalidSession(resumable: boolean): void {
        this.emit("DEBUG", `[GATEWAY] Received Invalid Session. Resumable: ${resumable}`);
        setTimeout(
            () => {
                if (resumable) {
                    this.#resume();
                } else {
                    void this.#shardManager.initialize(this.#options.shard);
                }
            },
            (Math.random() * 5 + 1) * 1_000
        );
    }

    #resume(): void {
        if (!this.#sessionId || !this.#sequence) {
            this.emit(
                "WARN",
                "[GATEWAY] Failed to resume session: missing session ID or sequence number. Starting new session."
            );
            void this.#shardManager.initialize(this.#options.shard);
            return;
        }

        const resume: ResumeStructure = {
            token: this.#token,
            session_id: this.#sessionId,
            seq: this.#sequence,
        };

        this.send(GatewayOpcodes.Resume, resume);
    }

    #hello(data: HelloStructure): void {
        void this.#shardManager.initialize(this.#options.shard);
        this.#setHeartbeatInterval(data.heartbeat_interval);
    }

    #setHeartbeatInterval(interval: Integer): void {
        this.emit("DEBUG", `[GATEWAY] Setting heartbeat interval to ${interval}ms with jitter.`);
        if (this.#heartbeatInterval) {
            clearInterval(this.#heartbeatInterval);
        }

        if (this.#heartbeatTimer) {
            clearTimeout(this.#heartbeatTimer);
        }

        const jitter = Math.random() * interval;
        this.#lastHeartbeatAck = true;

        this.#heartbeatTimer = setTimeout(() => {
            this.#sendHeartbeat();
            this.#heartbeatInterval = setInterval(() => {
                if (!this.#lastHeartbeatAck) {
                    this.emit("WARN", "[GATEWAY] No heartbeat acknowledgement received. Initiating reconnection.");
                    this.#reconnect();
                    return;
                }

                this.#lastHeartbeatAck = false;
                this.#sendHeartbeat();
            }, interval);
        }, jitter);
    }

    #heartbeatAck(): void {
        this.emit("DEBUG", "[GATEWAY] Received Heartbeat Acknowledgement.");
        this.#lastHeartbeatAck = true;
    }

    #onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this.#isOpened = false;
        this.cleanup();

        const reasonStr = reason.toString();
        this.emit("CLOSE", code, reasonStr);

        const errorMessage = this.#getCloseCodeErrorMessage(code);
        this.emit("ERROR", new Error(`[GATEWAY] WebSocket closed: ${errorMessage}. Reason: ${reasonStr}`));

        if (this.#canReconnect(code)) {
            this.emit(
                "DEBUG",
                `[GATEWAY] Scheduling reconnection attempt after close. Code: ${code}, Reason: ${reasonStr}`
            );
            this.#scheduleReconnect();
        } else {
            this.emit(
                "ERROR",
                new Error(`[GATEWAY] Cannot reconnect due to critical error. Close code: ${code}, Reason: ${reasonStr}`)
            );
        }
    }

    #getCloseCodeErrorMessage(code: GatewayCloseCodes): string {
        switch (code) {
            case GatewayCloseCodes.UnknownError: {
                return "Unknown error. Try reconnecting?";
            }

            case GatewayCloseCodes.UnknownOpcode: {
                return "Unknown opcode sent";
            }

            case GatewayCloseCodes.DecodeError: {
                return "Invalid payload sent";
            }

            case GatewayCloseCodes.NotAuthenticated: {
                return "Payload sent before identifying";
            }

            case GatewayCloseCodes.AuthenticationFailed: {
                return "Invalid token";
            }

            case GatewayCloseCodes.AlreadyAuthenticated: {
                return "Already identified";
            }

            case GatewayCloseCodes.InvalidSeq: {
                return "Invalid seq number";
            }

            case GatewayCloseCodes.RateLimited: {
                return "Rate limited";
            }

            case GatewayCloseCodes.SessionTimedOut: {
                return "Session timed out";
            }

            case GatewayCloseCodes.InvalidShard: {
                return "Invalid shard";
            }

            case GatewayCloseCodes.ShardingRequired: {
                return "Sharding required";
            }

            case GatewayCloseCodes.InvalidApiVersion: {
                return "Invalid API version";
            }

            case GatewayCloseCodes.InvalidIntents: {
                return "Invalid intent(s)";
            }

            case GatewayCloseCodes.DisallowedIntents: {
                return "Disallowed intent(s)";
            }

            default: {
                return `Unknown close code: ${code}`;
            }
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

    #scheduleReconnect(): void {
        if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
        }

        this.#reconnectTimeout = setTimeout(async () => {
            this.emit("DEBUG", "[GATEWAY] Attempting to reconnect");
            await this.connect(true);
        }, 5_000);
    }

    #onError(error: Error): void {
        const errorMessage = `[GATEWAY] WebSocket error: ${error.message}`;
        this.emit("ERROR", new Error(errorMessage));
    }

    #decompressZlib(data: Buffer): Buffer {
        if (!this.#inflator) {
            throw new Error("Inflator is not initialized");
        }

        try {
            const length = data.length;
            const flush =
                length >= 4 &&
                data[length - 4] === 0x00 &&
                data[length - 3] === 0x00 &&
                data[length - 2] === 0xff &&
                data[length - 1] === 0xff;

            this.#inflator.push(data, flush && Z_SYNC_FLUSH);

            if (!flush) {
                return Buffer.alloc(0);
            }

            if (this.#inflator.err < 0) {
                throw new Error(`Zlib decompression error: ${this.#inflator.msg}`);
            }

            const result = this.#inflator.result;
            if (result && Buffer.isBuffer(result)) {
                return result;
            }

            return Buffer.alloc(0);
        } catch (error) {
            throw new Error(
                `Failed to decompress zlib data: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    #decodePayload<T>(data: Buffer, isBinary: boolean): T {
        if (!isBinary && !Buffer.isBuffer(data)) {
            return JSON.parse(data);
        }

        switch (this.#options.encoding) {
            case "json": {
                try {
                    return JSON.parse(data.toString());
                } catch (error) {
                    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            case "etf": {
                try {
                    return unpack(data);
                } catch (error) {
                    throw new Error(`Failed to unpack ETF: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            default: {
                throw new Error(`Unsupported encoding type: ${this.#options.encoding}`);
            }
        }
    }

    #encodePayload(data: unknown): Buffer | string {
        switch (this.#options.encoding) {
            case "json": {
                try {
                    return JSON.stringify(data);
                } catch (error) {
                    throw new Error(
                        `Failed to stringify JSON: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }

            case "etf": {
                try {
                    return pack(data);
                } catch (error) {
                    throw new Error(`Failed to pack ETF: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            default: {
                throw new Error(`Unsupported encoding type: ${this.#options.encoding}`);
            }
        }
    }
}
