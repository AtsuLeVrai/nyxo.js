import { type GatewayCloseCodes, GatewayOpcodes } from "@nyxjs/core";
import WebSocket from "ws";
import { Inflate } from "zlib-sync";
import { decompressZlib } from "../common/compression";
import { decodeMessage, encodeMessage } from "../common/encoding";
import type { HelloStructure } from "../events/hello";
import type { ReadyEventFields } from "../events/ready";
import type { ResumeStructure } from "../events/resume";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayOptions, GatewayPayload } from "../types/gateway";
import type { Gateway } from "./Gateway";

const ws = Symbol("ws");
const heartbeatInterval = Symbol("heartbeatInterval");
const sequence = Symbol("sequence");
const sessionId = Symbol("sessionId");
const resumeGatewayUrl = Symbol("resumeGatewayUrl");
const zlibInflate = Symbol("zlibInflate");
const gateway = Symbol("gateway");
const token = Symbol("token");
const options = Symbol("options");

export class GatewayConnection {
    private [ws]: WebSocket | null = null;

    private [heartbeatInterval]: NodeJS.Timeout | null = null;

    private [sequence]: number | null = null;

    private [sessionId]: string | null = null;

    private [resumeGatewayUrl]: string | null = null;

    private readonly [zlibInflate]: Inflate;

    private readonly [gateway]: Gateway;

    private readonly [token]: string;

    private readonly [options]: Readonly<GatewayOptions>;

    public constructor(initialGateway: Gateway, initialToken: string, initialOptions: Readonly<GatewayOptions>) {
        this[gateway] = initialGateway;
        this[token] = initialToken;
        this[options] = Object.freeze({ ...initialOptions });
        this[zlibInflate] = new Inflate({ chunkSize: 1_024 * 1_024 });
    }

    private get wsUrl(): string {
        const query = new URL("wss://gateway.discord.gg/");
        query.searchParams.set("v", this[options].v.toString());
        query.searchParams.set("encoding", this[options].encoding);
        if (this[options].compress) {
            query.searchParams.set("compress", this[options].compress);
        }

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
        this[gateway].emit("debug", "[WS] Disconnecting from the gateway...");
        if (this[ws]) {
            this[ws].close();
        }

        this.cleanup();
    }

    public cleanup(): void {
        this[gateway].emit("debug", "[WS] Cleaning up...");
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
        }

        this[ws] = null;
        this[heartbeatInterval] = null;
        this[sequence] = null;
    }

    private async onMessage(data: Buffer): Promise<void> {
        let decompressedData: Buffer | string = data;

        try {
            if (this[options].compress === "zlib-stream" && Buffer.isBuffer(data)) {
                decompressedData = await decompressZlib(data, this[options].encoding, this[zlibInflate]);
            } else if (this[options].compress === "zstd-stream") {
                throw new Error("[WS] Zstd compression is not supported yet...");
            } else {
                decompressedData = decodeMessage(decompressedData, this[options].encoding);
            }

            const decoded = JSON.parse(decompressedData as string) as GatewayPayload;
            this.handleMessage(decoded);
        } catch (error) {
            throw new TypeError(`[WS] Failed to process WebSocket message: ${error}`);
        }
    }

    private handleMessage(payload: GatewayPayload): void {
        this[sequence] = payload.s ?? this[sequence];

        switch (payload.op) {
            case GatewayOpcodes.Hello:
                this.handleHello(payload.d as HelloStructure);
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
                this[gateway].emit("debug", "[WS] Received a heartbeat ack...");
                break;
            default:
                this[gateway].emit(
                    "warn",
                    `[WS] Received an unhandled gateway event: ${GatewayOpcodes[payload.op]}...`
                );
        }
    }

    private handleHello(data: HelloStructure): void {
        this.setupHeartbeat(data.heartbeat_interval);
        if (this[sessionId] && this[sequence]) {
            this.sendResume();
        } else {
            void this[gateway].shardManager.initialize();
        }
    }

    private handleInvalidSession(resumable: boolean): void {
        if (resumable) {
            setTimeout(() => this.sendResume(), 5_000);
        } else {
            this[sessionId] = null;
            this[sequence] = null;
            void this[gateway].shardManager.initialize();
        }
    }

    private handleReconnect(): void {
        this[gateway].emit("debug", "[WS] Received Reconnect opcode, attempting to resume");
        this.disconnect();
        void this.connect(true);
    }

    private handleDispatchEvent(payload: GatewayPayload): void {
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this[sessionId] = ready.session_id;
            this[resumeGatewayUrl] = ready.resume_gateway_url;
        }

        if (!payload.t) {
            this[gateway].emit("warn", "[WS] Received a dispatch event without a name...");
            return;
        }

        this[gateway].emit("dispatch", payload.t, payload.d as never);
    }

    private onOpen(): void {
        this[gateway].emit("debug", "[WS] Connected to the gateway...");
    }

    private onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this[gateway].emit("close", code, reason.toString());
        this.cleanup();
    }

    private onError(error: Error): void {
        this[gateway].emit("error", error);
    }

    private setupHeartbeat(interval: number): void {
        this[gateway].emit("debug", `[WS] Setting up heartbeat with interval: ${interval}ms...`);
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
        }

        this[heartbeatInterval] = setInterval(() => {
            this.send(GatewayOpcodes.Heartbeat, this[sequence]);
        }, interval);
    }

    private sendResume(): void {
        if (!this[sessionId] || this[sequence] === null) {
            this[gateway].emit("warn", "[WS] Attempted to resume without a valid session, re-identifying");
            void this[gateway].shardManager.initialize();
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
