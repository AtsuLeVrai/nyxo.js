import { type GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import WebSocket from "ws";
import { Inflate } from "zlib-sync";
import type { HelloStructure } from "../events/hello";
import type { ReadyEventFields } from "../events/ready";
import type { ResumeStructure } from "../events/resume";
import { decompressZlib } from "../helpers/compression";
import { decodeMessage, encodeMessage } from "../helpers/encoding";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayOptions, GatewayPayload } from "../types/gateway";
import type { Gateway } from "./Gateway";
import { ShardManager } from "./ShardManager";

const ws = Symbol("ws");
const heartbeatInterval = Symbol("heartbeatInterval");
const sequence = Symbol("sequence");
const sessionId = Symbol("sessionId");
const resumeGatewayUrl = Symbol("resumeGatewayUrl");
const gateway = Symbol("gateway");
const token = Symbol("token");
const zlibInflate = Symbol("zlibInflate");
const shardManager = Symbol("shardManager");
const options = Symbol("options");

export class GatewayConnection {
    private [ws]: WebSocket | null;

    private [heartbeatInterval]: NodeJS.Timeout | null;

    private [sequence]: number | null;

    private [sessionId]: string | null;

    private [resumeGatewayUrl]: string | null;

    private readonly [gateway]: Gateway;

    private readonly [token]: string;

    private readonly [zlibInflate]: Inflate;

    private readonly [shardManager]: ShardManager;

    private readonly [options]: Readonly<GatewayOptions>;

    public constructor(initialGateway: Gateway, initialToken: string, initialOptions: GatewayOptions) {
        this[ws] = null;
        this[heartbeatInterval] = null;
        this[sequence] = null;
        this[sessionId] = null;
        this[resumeGatewayUrl] = null;
        this[gateway] = initialGateway;
        this[token] = initialToken;
        this[zlibInflate] = new Inflate({ chunkSize: 1_024 * 1_024 });
        this[shardManager] = new ShardManager(initialGateway, initialToken, initialOptions);
        this[options] = Object.freeze({ ...initialOptions });
    }

    private get wsUrl(): string {
        const query = new URL("wss://gateway.discord.gg/");
        query.searchParams.set("v", this[options].v.toString());
        query.searchParams.set("encoding", this[options].encoding);
        if (this[options].compress) {
            query.searchParams.set("compress", this[options].compress);
        }

        this[gateway].emit("debug", `[WS] Generated WebSocket URL: ${query.toString()}`);
        return query.toString();
    }

    public async connect(resumeAttempt = false): Promise<void> {
        if (this[ws]) {
            this[ws].close();
        }

        try {
            const url = resumeAttempt && this[resumeGatewayUrl] ? this[resumeGatewayUrl] : this.wsUrl;
            this[ws] = new WebSocket(url);

            this[ws].on("open", this.onOpen.bind(this));
            this[ws].on("message", this.onMessage.bind(this));
            this[ws].on("close", this.onClose.bind(this));
            this[ws].on("error", this.onError.bind(this));
        } catch (error) {
            throw new Error(`[WS] Failed to establish a WebSocket connection: ${error}`);
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this[ws]) {
            this[gateway].emit("warn", "[WS] Attempted to send message without active WebSocket connection");
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

    private async onMessage(data: Buffer): Promise<void> {
        let decompressedData: Buffer | string = data;

        try {
            if (this[options].compress === "zlib-stream" && Buffer.isBuffer(data)) {
                decompressedData = await decompressZlib(data, this[zlibInflate]);
            } else if (this[options].compress === "zstd-stream") {
                throw new Error("[WS] Zstd compression is not supported yet...");
            }

            const decoded: GatewayPayload = decodeMessage(decompressedData, this[options].encoding);

            await this.handleMessage(decoded);
        } catch (error) {
            throw new Error(`[WS] Failed to process WebSocket message: ${error}`);
        }
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
                this.handleReconnect();
                break;
            case GatewayOpcodes.Dispatch:
                this.handleDispatchEvent(payload);
                break;
            case GatewayOpcodes.HeartbeatAck:
                this[gateway].emit("debug", "[WS] Received heartbeat ack");
                break;
            default:
                this[gateway].emit("warn", `[WS] Received unhandled gateway event: ${GatewayOpcodes[payload.op]}`);
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

    private handleInvalidSession(resumable: boolean): void {
        if (resumable) {
            setTimeout(() => this.sendResume(), 5_000);
        } else {
            this[sessionId] = null;
            this[sequence] = null;
        }
    }

    private handleReconnect(): void {
        this.disconnect();
        void this.connect(true);
    }

    private handleDispatchEvent(payload: GatewayPayload): void {
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this[sessionId] = ready.session_id;
            this[resumeGatewayUrl] = ready.resume_gateway_url;
            this[gateway].emit("debug", `[WS] Session ID: ${this[sessionId]}`);
        }

        if (!payload.t) {
            return;
        }

        this[gateway].emit("dispatch", payload.t, payload.d as never);
    }

    private onOpen(): void {
        this[gateway].emit("debug", "[WS] WebSocket connection opened");
    }

    private onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this[gateway].emit(
            "close",
            `[WS] WebSocket connection closed with code ${code}: ${reason.toString()}`,
            code,
            reason.toString()
        );
        this.cleanup();
    }

    private onError(error: Error): void {
        this[gateway].emit("error", error);
    }

    private setupHeartbeat(interval: number): void {
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
        }

        this[heartbeatInterval] = setInterval(() => {
            this[gateway].emit("debug", `[WS] Sending heartbeat, sequence: ${this[sequence]}, interval: ${interval}ms`);
            this.send(GatewayOpcodes.Heartbeat, this[sequence]);
        }, interval);
    }

    private sendResume(): void {
        if (!this[sessionId] || this[sequence] === null) {
            this[gateway].emit("warn", "[WS] Attempted to resume without a valid session, re-identifying");
            return;
        }

        const resumePayload: ResumeStructure = {
            token: this[token],
            session_id: this[sessionId],
            seq: this[sequence],
        };

        this.send(GatewayOpcodes.Resume, resumePayload);
    }
}
