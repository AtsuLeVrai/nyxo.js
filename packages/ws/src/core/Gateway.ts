import { GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { Inflate } from "zlib-sync";
import type { HelloStructure } from "../events/hello";
import type { ReadyEventFields } from "../events/ready";
import type { ResumeStructure } from "../events/resume";
import { decompressZlib } from "../helpers/compression";
import { decodeMessage, encodeMessage } from "../helpers/encoding";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayEvents, GatewayOptions, GatewayPayload } from "../types/gateway";
import { ShardManager } from "./ShardManager";

const ws = Symbol("ws");
const heartbeatInterval = Symbol("heartbeatInterval");
const sequence = Symbol("sequence");
const sessionId = Symbol("sessionId");
const resumeGatewayUrl = Symbol("resumeGatewayUrl");
const token = Symbol("token");
const zlibInflate = Symbol("zlibInflate");
const shardManager = Symbol("shardManager");
const options = Symbol("options");

export class Gateway extends EventEmitter<GatewayEvents> {
    private [ws]: WebSocket | null;

    private [heartbeatInterval]: NodeJS.Timeout | null;

    private [sequence]: number | null;

    private [sessionId]: string | null;

    private [resumeGatewayUrl]: string | null;

    private readonly [token]: string;

    private readonly [zlibInflate]: Inflate;

    private readonly [shardManager]: ShardManager;

    private readonly [options]: Readonly<GatewayOptions>;

    public constructor(initialToken: string, initialOptions: GatewayOptions) {
        super();
        this[ws] = null;
        this[heartbeatInterval] = null;
        this[sequence] = null;
        this[sessionId] = null;
        this[resumeGatewayUrl] = null;
        this[token] = initialToken;
        this[zlibInflate] = new Inflate({ chunkSize: 1_024 * 1_024 });
        this[shardManager] = new ShardManager(this, initialToken, initialOptions);
        this[options] = Object.freeze({ ...initialOptions });
    }

    private get wsUrl(): string {
        const query = new URL("wss://gateway.discord.gg/");
        query.searchParams.set("v", this[options].v.toString());
        query.searchParams.set("encoding", this[options].encoding);
        if (this[options].compress) {
            query.searchParams.set("compress", this[options].compress);
        }

        this.emit("debug", `[WS] Generated WebSocket URL: ${query.toString()}`);
        return query.toString();
    }

    public async connect(resumeAttempt = false): Promise<void> {
        if (this[ws]) {
            this.disconnect();
        }

        try {
            const url = resumeAttempt && this[resumeGatewayUrl] ? this[resumeGatewayUrl] : this.wsUrl;
            this[ws] = new WebSocket(url);

            this[ws].on("open", this.onOpen.bind(this));
            this[ws].on("message", this.onMessage.bind(this));
            this[ws].on("close", this.onClose.bind(this));
            this[ws].on("error", this.onError.bind(this));
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error(String(error));
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this[ws]) {
            this.emit("warn", "[WS] Attempted to send message without active WebSocket connection");
            return;
        }

        const payload: GatewayPayload = {
            d: data,
            op,
            s: this[sequence],
            t: null,
        };

        const encoded = encodeMessage(payload, this[options].encoding);
        this[ws].send(encoded);
    }

    public disconnect(): void {
        if (this[ws]) {
            this[ws].close();
        }

        this.cleanup();
    }

    private cleanup(): void {
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
        }

        this[ws] = null;
        this[heartbeatInterval] = null;
        this[sequence] = null;
        this[sessionId] = null;
        this[resumeGatewayUrl] = null;
        this[shardManager].cleanup();
    }

    private onOpen(): void {
        this.emit("debug", "[WS] WebSocket connection opened");
    }

    private async onMessage(data: Buffer): Promise<void> {
        let decompressedData: Buffer | string = data;

        try {
            if (this[options].compress === "zlib-stream" && Buffer.isBuffer(data)) {
                decompressedData = await decompressZlib(data, this[zlibInflate]);
            } else if (this[options].compress === "zstd-stream" && Buffer.isBuffer(data)) {
                throw new Error("[WS] Zstd compression is not supported yet...");
            }

            const decoded: GatewayPayload = decodeMessage(decompressedData, this[options].encoding);

            await this.handleMessage(decoded);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error(String(error));
        }
    }

    private onClose(code: GatewayCloseCodes, reason: Buffer): void {
        const reasonStr = reason.toString();
        this.emit("close", GatewayCloseCodes[code], reasonStr);

        switch (code) {
            case GatewayCloseCodes.UnknownError: {
                this.emit("error", new Error(`[WS] Unknown error: ${reasonStr}`));
                break;
            }

            case GatewayCloseCodes.UnknownOpcode: {
                this.emit("error", new Error(`[WS] Unknown opcode: ${reasonStr}`));
                break;
            }

            case GatewayCloseCodes.DecodeError: {
                this.emit("error", new Error(`[WS] Decode error: ${reasonStr}`));
                break;
            }

            case GatewayCloseCodes.NotAuthenticated: {
                this.emit("warn", "[WS] Not authenticated. Re-identifying...");
                this[sessionId] = null;
                this[sequence] = null;
                break;
            }

            case GatewayCloseCodes.AuthenticationFailed: {
                this.emit("error", new Error("[WS] Authentication failed. Check your token"));
                break;
            }

            case GatewayCloseCodes.AlreadyAuthenticated: {
                this.emit("warn", "[WS] Already authenticated. Reconnecting...");
                break;
            }

            case GatewayCloseCodes.InvalidSeq: {
                this.emit("warn", "[WS] Invalid sequence. Resetting session...");
                this[sequence] = null;
                break;
            }

            case GatewayCloseCodes.RateLimited: {
                this.emit("warn", "[WS] Rate limited. Implementing backoff strategy...");
                break;
            }

            case GatewayCloseCodes.SessionTimedOut: {
                this.emit("warn", "[WS] Session timed out. Reconnecting...");
                this[sessionId] = null;
                break;
            }

            case GatewayCloseCodes.InvalidShard: {
                this.emit("error", new Error("[WS] Invalid shard. Check your shard configuration"));
                break;
            }

            case GatewayCloseCodes.ShardingRequired: {
                this.emit("error", new Error("[WS] Sharding is required but not implemented"));
                break;
            }

            case GatewayCloseCodes.InvalidApiVersion: {
                this.emit("error", new Error("[WS] Invalid API version. Update your client"));
                break;
            }

            case GatewayCloseCodes.InvalidIntents: {
                this.emit("error", new Error("[WS] Invalid intents specified"));
                break;
            }

            case GatewayCloseCodes.DisallowedIntents: {
                this.emit("error", new Error("[WS] Disallowed intents specified. Check your permissions"));
                break;
            }

            default: {
                this.emit("warn", `[WS] Unhandled close code: ${code}`);
            }
        }

        this.cleanup();

        if (
            [
                GatewayCloseCodes.UnknownError,
                GatewayCloseCodes.UnknownOpcode,
                GatewayCloseCodes.DecodeError,
                GatewayCloseCodes.InvalidSeq,
                GatewayCloseCodes.SessionTimedOut,
            ].includes(code)
        ) {
            this.emit("debug", "[WS] Attempting to reconnect...");
            setTimeout(async () => this.connect(), 5_000);
        }
    }

    private onError(error: Error): void {
        this.emit("error", error);
    }

    private async handleMessage(payload: GatewayPayload): Promise<void> {
        this[sequence] = payload.s ?? this[sequence];

        switch (payload.op) {
            case GatewayOpcodes.Hello:
                await this.handleHello(payload.d as HelloStructure);
                break;
            case GatewayOpcodes.InvalidSession:
                this.handleInvalidSession(Boolean(payload.d));
                break;
            case GatewayOpcodes.Reconnect:
                await this.connect(true);
                break;
            case GatewayOpcodes.Dispatch:
                this.handleDispatchEvent(payload);
                break;
            case GatewayOpcodes.HeartbeatAck:
                this.emit("debug", "[WS] Received heartbeat ack");
                break;
            default:
                this.emit("warn", `[WS] Received unhandled gateway event: ${GatewayOpcodes[payload.op]}`);
        }
    }

    private async handleHello(data: HelloStructure): Promise<void> {
        this.setupHeartbeat(data.heartbeat_interval);
        if (this[sessionId] && this[sequence]) {
            this.sendResume();
        } else {
            await this[shardManager].initialize();
        }
    }

    private setupHeartbeat(interval: number): void {
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
        }

        this[heartbeatInterval] = setInterval(() => {
            this.emit("debug", `[WS] Sending heartbeat, sequence: ${this[sequence]}, interval: ${interval}ms`);
            this.send(GatewayOpcodes.Heartbeat, this[sequence]);
        }, interval);
    }

    private handleInvalidSession(resumable: boolean): void {
        if (resumable) {
            setTimeout(() => this.sendResume(), 5_000);
        } else {
            this[sessionId] = null;
            this[sequence] = null;
        }
    }

    private sendResume(): void {
        if (!this[sessionId] || this[sequence] === null) {
            this.emit("warn", "[WS] Attempted to resume without a valid session, re-identifying");
            return;
        }

        const resumePayload: ResumeStructure = {
            token: this[token],
            session_id: this[sessionId],
            seq: this[sequence],
        };

        this.send(GatewayOpcodes.Resume, resumePayload);
    }

    private handleDispatchEvent(payload: GatewayPayload): void {
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this[sessionId] = ready.session_id;
            this[resumeGatewayUrl] = ready.resume_gateway_url;
            this.emit("debug", `[WS] Session ID: ${this[sessionId]}`);
        }

        if (!payload.t) {
            return;
        }

        this.emit("dispatch", payload.t, payload.d as never);
    }
}
