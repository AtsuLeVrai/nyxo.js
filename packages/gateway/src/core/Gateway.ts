import { Buffer } from "node:buffer";
import { platform } from "node:process";
import { clearInterval, clearTimeout, setInterval, setTimeout } from "node:timers";
import { URL } from "node:url";
import type { Integer } from "@nyxjs/core";
import { GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { pack, unpack } from "erlpack";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { Inflate, Z_SYNC_FLUSH } from "zlib-sync";
import type { HelloStructure, IdentifyStructure, ReadyEventFields, ResumeStructure } from "../events";
import { ShardManager } from "../managers";
import type { GatewayEvents, GatewayOptions, GatewayReceiveEvents, GatewaySendEvents } from "../types";

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

    #lastHeartbeatAck: boolean = false;

    #heartbeatInterval: NodeJS.Timeout | null = null;

    #heartbeatTimer: NodeJS.Timeout | null = null;

    #reconnectTimeout: NodeJS.Timeout | null = null;

    #inflator: Inflate = new Inflate({ chunkSize: 65_535 });

    #token: string;

    readonly #options: Readonly<GatewayOptions>;

    readonly #shardManager: ShardManager;

    public constructor(token: string, rest: Rest, options: GatewayOptions) {
        super();
        this.#token = token;
        this.#shardManager = new ShardManager(this, rest, token, options);
        this.#options = Object.freeze({ ...options });
    }

    public get getSessionId(): string | null {
        return this.#sessionId;
    }

    public get getSequence(): number | null {
        return this.#sequence;
    }

    public get getResumeGatewayUrl(): string | null {
        return this.#resumeGatewayUrl;
    }

    public get getOptions(): Readonly<GatewayOptions> {
        return this.#options;
    }

    public isLastHeartbeatAcknowledged(): boolean {
        return this.#lastHeartbeatAck;
    }

    public async connect(resumable: boolean = false) {
        if (this.#ws) {
            this.destroy();
        }

        try {
            const query = new URL("wss://gateway.discord.gg/");

            query.searchParams.set("v", this.#options.v.toString());
            query.searchParams.set("encoding", this.#options.encoding);

            if (this.#options.compress) {
                query.searchParams.set("compress", this.#options.compress);
            }

            const url = resumable && this.#resumeGatewayUrl ? this.#resumeGatewayUrl : query.toString();
            this.#ws = new WebSocket(url);

            this.#ws.on("open", this.#onOpen.bind(this));
            this.#ws.on("message", this.#onMessage.bind(this));
            this.#ws.on("close", this.#onClose.bind(this));
            this.#ws.on("error", this.#onError.bind(this));

            this.emit("DEBUG", `Connecting to Gateway: ${url} (Resumable: ${resumable})`);
        } catch (error) {
            if (error instanceof Error) {
                this.emit("ERROR", new Error(`Failed to connect to Gateway: ${error.message}`));
            } else {
                this.emit("ERROR", new Error(`Failed to connect to Gateway: ${String(error)}`));
            }

            this.#scheduleReconnect();
        }
    }

    public destroy(): void {
        if (this.#ws) {
            this.#ws.removeAllListeners();
            this.#ws.close();
            this.#ws = null;
        }

        this.cleanup();
        this.removeAllListeners();
        this.emit("DEBUG", "Gateway connection destroyed. Cleaning up resources.");
    }

    public cleanup(): void {
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
        // this.#shardManager.clear();
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
            this.emit("WARN", "Attempted to send a message while the WebSocket is not open");
            return;
        }

        const payload: GatewayManagerPayload = {
            op,
            d: data,
            s: this.#sequence,
            t: null,
        };

        this.#ws.send(this.#encodePayload(payload));
        this.emit("DEBUG", `Sent payload: ${JSON.stringify(payload, null, 2)}`);
    }

    public isConnected(): boolean {
        return this.#ws !== null && this.#ws.readyState === WebSocket.OPEN;
    }

    public forceHeartbeat(): void {
        this.#sendHeartbeat();
    }

    public setToken(token: string): void {
        this.#token = token;
        this.emit("DEBUG", "Token updated successfully");

        if (this.isConnected()) {
            this.emit("DEBUG", "Reconnecting with new token");
            this.destroy();
            void this.connect(false);
        }
    }

    public async resumeSession(): Promise<void> {
        if (this.#sessionId && this.#sequence && this.#resumeGatewayUrl) {
            await this.connect(true);
        } else {
            throw new Error("Unable to resume session: missing required information");
        }
    }

    #onOpen(): void {
        this.emit("DEBUG", "WebSocket connection opened successfully.");
    }

    #onMessage(data: Buffer): void {
        let decompressedData: Buffer | string = data;

        if (this.#options.compress === "zlib-stream" && Buffer.isBuffer(data)) {
            decompressedData = this.#decompressZlib(data);
        } else if (this.#options.compress === "zstd-stream" && Buffer.isBuffer(data)) {
            throw new Error("ZSTD compression is not supported yet");
        }

        const decodedPayload = this.#decodePayload<GatewayManagerPayload>(decompressedData);
        this.#handlePayload(decodedPayload);
    }

    #handlePayload(payload: GatewayManagerPayload): void {
        if (payload.s) {
            this.#sequence = payload.s;
        }

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
                this.emit("WARN", `Unhandled gateway opcode: ${payload.op}`);
                break;
            }
        }
    }

    #handleDispatch(payload: GatewayManagerPayload): void {
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this.#sessionId = ready.session_id;
            this.#resumeGatewayUrl = ready.resume_gateway_url;
            this.emit(
                "DEBUG",
                `Session established. Session ID: ${this.#sessionId}, Resume URL: ${this.#resumeGatewayUrl}`
            );
        }

        if (!payload.t) {
            return;
        }

        this.emit("DISPATCH", payload.t, payload.d as never);
    }

    #sendHeartbeat(): void {
        this.send(GatewayOpcodes.Heartbeat, this.#sequence);
        this.emit("DEBUG", `Sent Heartbeat. Sequence: ${this.#sequence}`);
    }

    #reconnect(): void {
        this.emit("DEBUG", "Initiating reconnection process.");
        this.destroy();
        void this.connect(true);
    }

    #invalidSession(resumable: boolean): void {
        this.emit("DEBUG", `Received Invalid Session. Resumable: ${resumable}`);
        setTimeout(
            () => {
                if (resumable) {
                    this.#resume();
                } else {
                    this.#identify();
                }
            },
            (Math.random() * 5 + 1) * 1_000
        );
    }

    #resume(): void {
        if (!this.#sessionId || !this.#sequence) {
            this.emit("WARN", "Failed to resume session: missing session ID or sequence number. Starting new session.");
            this.#identify();
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
        this.#identify();
        this.#setHeartbeatInterval(data.heartbeat_interval);
    }

    #setHeartbeatInterval(interval: Integer): void {
        this.emit("DEBUG", `Setting heartbeat interval to ${interval}ms with jitter.`);
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
                    this.emit("WARN", "No heartbeat acknowledgement received. Initiating reconnection.");
                    this.#reconnect();
                    return;
                }

                this.#lastHeartbeatAck = false;
                this.#sendHeartbeat();
            }, interval);
        }, jitter);
    }

    #identify(): void {
        if (this.#options.shard) {
            void this.#shardManager.initialize(this.#options.shard);
        } else {
            const identify: IdentifyStructure = {
                token: this.#token,
                intents: this.#options.intents,
                large_threshold: this.#options.large_threshold,
                presence: this.#options.presence,
                compress: Boolean(this.#options.compress),
                properties: {
                    os: platform,
                    browser: "nyxjs",
                    device: "nyxjs",
                },
            };

            this.send(GatewayOpcodes.Identify, identify);
        }
    }

    #heartbeatAck(): void {
        this.emit("DEBUG", "Received Heartbeat Acknowledgement.");
        this.#lastHeartbeatAck = true;
    }

    #onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this.cleanup();
        this.emit("CLOSE", code, reason.toString());

        const errorMessage = this.#getCloseCodeErrorMessage(code);
        this.emit("ERROR", new Error(`WebSocket closed: ${errorMessage}`));

        if (this.#canReconnect(code)) {
            this.emit("DEBUG", `Scheduling reconnection attempt after close. Code: ${code}`);
            this.#scheduleReconnect();
        } else {
            this.emit("ERROR", new Error(`Cannot reconnect due to critical error. Close code: ${code}`));
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

        this.#reconnectTimeout = setTimeout(async () => this.connect(true), 5_000);
    }

    #onError(error: Error): void {
        this.emit("ERROR", error);
    }

    #decompressZlib(data: Buffer): Buffer | string {
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
            throw new Error("Failed to decompress zlib data");
        }

        const result = this.#inflator.result;
        if (result) {
            return result;
        }

        return Buffer.alloc(0);
    }

    #decodePayload<T>(data: Buffer | string): T {
        switch (this.#options.encoding) {
            case "json": {
                const jsonString = Buffer.isBuffer(data) ? data.toString() : data;

                try {
                    return JSON.parse(jsonString);
                } catch (error) {
                    throw new Error(`Failed to parse JSON: ${(error as Error).message}`);
                }
            }

            case "etf": {
                if (!Buffer.isBuffer(data)) {
                    throw new TypeError("ETF decoding requires Buffer input");
                }

                try {
                    return unpack(data);
                } catch (error) {
                    if (error instanceof Error) {
                        throw new TypeError(`Failed to unpack ETF: ${error.message}`);
                    }

                    throw new Error(`Failed to unpack ETF: ${String(error)}`);
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
                    throw new Error(`Failed to stringify JSON: ${(error as Error).message}`);
                }
            }

            case "etf": {
                try {
                    return pack(data);
                } catch (error) {
                    throw new Error(`Failed to pack ETF: ${(error as Error).message}`);
                }
            }

            default: {
                throw new Error(`Unsupported encoding type: ${this.#options.encoding}`);
            }
        }
    }
}
