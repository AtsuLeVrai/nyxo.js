import { Buffer } from "node:buffer";
import { clearInterval, clearTimeout, setInterval, setTimeout } from "node:timers";
import { URL } from "node:url";
import type { Integer } from "@nyxjs/core";
import { GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { pack, unpack } from "erlpack";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { Inflate, Z_SYNC_FLUSH } from "zlib-sync";
import type { HelloStructure } from "../events/hello";
import type { ReadyEventFields } from "../events/ready";
import type { ResumeStructure } from "../events/resume";
import type { GatewayManagerEvents, GatewayManagerReceiveEvents, GatewayManagerSendEvents } from "../types/events";
import type { GatewayManagerOptions } from "../types/gateway";
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
    t: keyof GatewayManagerReceiveEvents | null;
};

export class GatewayManager extends EventEmitter<GatewayManagerEvents<keyof GatewayManagerReceiveEvents>> {
    #ws: WebSocket | null = null;

    #sequence: number | null = null;

    #sessionId: string | null = null;

    #resumeGatewayUrl: string | null = null;

    #lastHeartbeatAck: boolean = false;

    #heartbeatInterval: NodeJS.Timeout | null = null;

    #reconnectTimeout: NodeJS.Timeout | null = null;

    #inflator: Inflate = new Inflate({ chunkSize: 65_535 });

    readonly #token: string;

    readonly #options: Readonly<GatewayManagerOptions>;

    readonly #shardManager: ShardManager;

    public constructor(token: string, rest: Rest, options: GatewayManagerOptions) {
        super();
        this.#token = token;
        this.#shardManager = new ShardManager(this, token, rest, options);
        this.#options = Object.freeze({ ...options });
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

            this.#ws.on("open", this.onOpen.bind(this));
            this.#ws.on("message", this.onMessage.bind(this));
            this.#ws.on("close", this.onClose.bind(this));
            this.#ws.on("error", this.onError.bind(this));

            this.emit("debug", `Connecting to Gateway: ${url}`);
        } catch (error) {
            if (error instanceof Error) {
                this.emit("error", error);
            }

            this.emit("error", new Error(String(error)));
            this.scheduleReconnect();
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
        this.emit("debug", "Gateway connection destroyed");
    }

    public cleanup(): void {
        if (this.#heartbeatInterval) {
            clearInterval(this.#heartbeatInterval);
        }

        if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
        }

        this.#sequence = null;
        this.#sessionId = null;
        this.#resumeGatewayUrl = null;
        this.#lastHeartbeatAck = false;
        this.#shardManager.clear();
    }

    public send<T extends keyof GatewayManagerSendEvents>(op: T, data: Readonly<GatewayManagerSendEvents[T]>): void {
        if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
            this.emit("warn", "Attempted to send a message while the WebSocket is not open");
            return;
        }

        const payload: GatewayManagerPayload = {
            op,
            d: data,
            s: this.#sequence,
            t: null,
        };

        this.#ws.send(this.encodePayload(payload));
    }

    private onOpen(): void {
        this.emit("debug", "WebSocket connection opened");
    }

    private onMessage(data: Buffer): void {
        let decompressedData: Buffer | string = data;

        if (this.#options.compress === "zlib-stream" && Buffer.isBuffer(data)) {
            decompressedData = this.decompressZlib(data);
        } else if (this.#options.compress === "zstd-stream" && Buffer.isBuffer(data)) {
            throw new Error("ZSTD compression is not supported yet");
        }

        const decodedPayload = this.decodePayload<GatewayManagerPayload>(decompressedData);
        this.handlePayload(decodedPayload);
    }

    private handlePayload(payload: GatewayManagerPayload): void {
        if (payload.s) {
            this.#sequence = payload.s;
        }

        switch (payload.op) {
            case GatewayOpcodes.Dispatch: {
                this.handleDispatch(payload);
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
                this.invalidSession(payload.d as boolean);
                break;
            }

            case GatewayOpcodes.Hello: {
                this.hello(payload.d as HelloStructure);
                break;
            }

            case GatewayOpcodes.HeartbeatAck: {
                this.heartbeatAck();
                break;
            }

            default: {
                this.emit("warn", `Unhandled gateway opcode: ${payload.op}`);
                break;
            }
        }
    }

    private handleDispatch(payload: GatewayManagerPayload): void {
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this.#sessionId = ready.session_id;
            this.#resumeGatewayUrl = ready.resume_gateway_url;
            this.emit("debug", `Session established: ${this.#sessionId}`);
        }

        if (!payload.t) {
            return;
        }

        this.emit("dispatch", payload.t, payload.d as never);
    }

    private sendHeartbeat(): void {
        if (!this.#lastHeartbeatAck) {
            this.emit("warn", "No heartbeat acknowledgement received, reconnecting");
            this.reconnect();
            return;
        }

        this.#lastHeartbeatAck = false;
        this.send(GatewayOpcodes.Heartbeat, this.#sequence);
        this.emit("debug", `Sent Heartbeat: ${this.#sequence}`);
    }

    private reconnect(): void {
        this.emit("debug", "Initiating reconnection");
        this.destroy();
        void this.connect(true);
    }

    private invalidSession(resumable: boolean): void {
        this.emit("debug", `Invalid session, resumable: ${resumable}`);
        setTimeout(
            () => {
                if (resumable) {
                    this.resume();
                } else {
                    void this.#shardManager.start();
                }
            },
            (Math.random() * 5 + 1) * 1_000
        );
    }

    private resume(): void {
        if (!this.#sessionId || !this.#sequence) {
            this.emit("warn", "Failed to resume session: missing session ID or sequence number");
            void this.#shardManager.start();
            return;
        }

        const resume: ResumeStructure = {
            token: this.#token,
            session_id: this.#sessionId,
            seq: this.#sequence,
        };

        this.send(GatewayOpcodes.Resume, resume);
    }

    private hello(data: HelloStructure): void {
        void this.#shardManager.start();
        this.setHeartbeatInterval(data.heartbeat_interval);
    }

    private setHeartbeatInterval(interval: Integer): void {
        this.emit("debug", `heartbeat interval: ${interval}ms`);
        if (this.#heartbeatInterval) {
            clearInterval(this.#heartbeatInterval);
        }

        const jitter = Math.floor(Math.random() * interval);

        setTimeout(() => {
            this.sendHeartbeat();
            this.#heartbeatInterval = setInterval(() => this.sendHeartbeat(), interval);
        }, jitter);
    }

    private heartbeatAck(): void {
        this.emit("debug", "Received Heartbeat Ack");
        this.#lastHeartbeatAck = true;
    }

    private onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this.cleanup();
        this.emit("close", code, reason.toString());

        const errorMessage = this.getCloseCodeErrorMessage(code);
        this.emit("error", new Error(errorMessage));

        if (this.canReconnect(code)) {
            this.scheduleReconnect();
        } else {
            this.emit("error", new Error("Cannot reconnect due to critical error"));
        }
    }

    private getCloseCodeErrorMessage(code: GatewayCloseCodes): string {
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

    private canReconnect(code: GatewayCloseCodes): boolean {
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

    private scheduleReconnect(): void {
        if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
        }

        this.#reconnectTimeout = setTimeout(async () => this.connect(true), 5_000);
    }

    private onError(error: Error): void {
        this.emit("error", error);
    }

    private decompressZlib(data: Buffer): Buffer | string {
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

    private decodePayload<T>(data: Buffer | string): T {
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

    private encodePayload(data: unknown): Buffer | string {
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
