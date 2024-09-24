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
    private [ws]: WebSocket | null;

    private [heartbeatInterval]: NodeJS.Timeout | null;

    private [sequence]: number | null;

    private [sessionId]: string | null;

    private [resumeGatewayUrl]: string | null;

    private readonly [gateway]: Gateway;

    private readonly [token]: string;

    private readonly [options]: Readonly<GatewayOptions>;

    private readonly [zlibInflate]: Inflate;

    public constructor(initialGateway: Gateway, initialToken: string, initialOptions: Readonly<GatewayOptions>) {
        this[ws] = null;
        this[heartbeatInterval] = null;
        this[sequence] = null;
        this[sessionId] = null;
        this[resumeGatewayUrl] = null;
        this[gateway] = initialGateway;
        this[token] = initialToken;
        this[options] = Object.freeze({ ...initialOptions });
        this[zlibInflate] = new Inflate({ chunkSize: 1_024 * 1_024 });
        this[gateway].emit("debug", `[GatewayConnection] Initialized with options: ${JSON.stringify(this[options])}`);
    }

    private get wsUrl(): string {
        const query = new URL("wss://gateway.discord.gg/");
        query.searchParams.set("v", this[options].v.toString());
        query.searchParams.set("encoding", this[options].encoding);
        if (this[options].compress) {
            query.searchParams.set("compress", this[options].compress);
        }

        this[gateway].emit("debug", `[GatewayConnection] Generated WebSocket URL: ${query.toString()}`);
        return query.toString();
    }

    public async connect(resumeAttempt = false): Promise<void> {
        if (this[ws]) {
            this[gateway].emit(
                "debug",
                "[GatewayConnection] Closing existing WebSocket connection before reconnecting"
            );
            this[ws].close();
        }

        try {
            const url = resumeAttempt && this[resumeGatewayUrl] ? this[resumeGatewayUrl] : this.wsUrl;
            this[gateway].emit("debug", `[GatewayConnection] Connecting to WebSocket URL: ${url}`);
            this[ws] = new WebSocket(url);

            this[ws].on("open", this.onOpen.bind(this));
            this[ws].on("message", this.onMessage.bind(this));
            this[ws].on("close", this.onClose.bind(this));
            this[ws].on("error", this.onError.bind(this));
            this[gateway].emit("debug", "[GatewayConnection] WebSocket event listeners attached");
        } catch (error) {
            throw new Error(`[GatewayConnection] Failed to establish a WebSocket connection: ${error}`);
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: Readonly<GatewaySendEvents[T]>): void {
        if (!this[ws]) {
            this[gateway].emit(
                "warn",
                "[GatewayConnection] Attempted to send message without active WebSocket connection"
            );
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
        this[gateway].emit("debug", `[GatewayConnection] Sent payload with op ${op}`);
    }

    public disconnect(): void {
        this[gateway].emit("debug", "[GatewayConnection] Disconnecting from the gateway");
        if (this[ws]) {
            this[ws].close();
        }

        this.cleanup();
    }

    public cleanup(): void {
        this[gateway].emit("debug", "[GatewayConnection] Starting cleanup process");
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
            this[gateway].emit("debug", "[GatewayConnection] Cleared heartbeat interval");
        }

        this[ws] = null;
        this[heartbeatInterval] = null;
        this[sequence] = null;
        this[gateway].emit("debug", "[GatewayConnection] Cleanup complete");
    }

    private async onMessage(data: Buffer): Promise<void> {
        this[gateway].emit("debug", "[GatewayConnection] Received WebSocket message");
        let decompressedData: Buffer | string = data;

        try {
            if (this[options].compress === "zlib-stream" && Buffer.isBuffer(data)) {
                this[gateway].emit("debug", "[GatewayConnection] Decompressing zlib-stream data");
                decompressedData = await decompressZlib(data, this[zlibInflate]);
            } else if (this[options].compress === "zstd-stream") {
                this[gateway].emit("warn", "[GatewayConnection] Zstd compression is not supported yet");
                throw new Error("[WS] Zstd compression is not supported yet...");
            }

            const decoded: GatewayPayload = decodeMessage(decompressedData, this[options].encoding);
            this[gateway].emit("debug", `[GatewayConnection] Decoded message with op ${decoded.op}`);

            this.handleMessage(decoded);
        } catch (error) {
            throw new Error(`[GatewayConnection] Failed to process WebSocket message: ${error}`);
        }
    }

    private handleMessage(payload: GatewayPayload): void {
        this[sequence] = payload.s ?? this[sequence];
        this[gateway].emit("debug", `[GatewayConnection] Handling message with op ${payload.op}`);

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
                this[gateway].emit("debug", "[GatewayConnection] Received heartbeat ack");
                break;
            default:
                this[gateway].emit(
                    "warn",
                    `[GatewayConnection] Received unhandled gateway event: ${GatewayOpcodes[payload.op]}`
                );
        }
    }

    private handleHello(data: HelloStructure): void {
        this[gateway].emit("debug", "[GatewayConnection] Received Hello event");
        this.setupHeartbeat(data.heartbeat_interval);
        if (this[sessionId] && this[sequence]) {
            this[gateway].emit("debug", "[GatewayConnection] Attempting to resume session");
            this.sendResume();
        } else {
            this[gateway].emit("debug", "[GatewayConnection] Initializing new session");
            void this[gateway].shardManager.initialize();
        }
    }

    private handleInvalidSession(resumable: boolean): void {
        this[gateway].emit("debug", `[GatewayConnection] Received Invalid Session (resumable: ${resumable})`);
        if (resumable) {
            this[gateway].emit("debug", "[GatewayConnection] Attempting to resume in 5 seconds");
            setTimeout(() => this.sendResume(), 5_000);
        } else {
            this[gateway].emit("debug", "[GatewayConnection] Session not resumable, reinitializing");
            this[sessionId] = null;
            this[sequence] = null;
            void this[gateway].shardManager.initialize();
        }
    }

    private handleReconnect(): void {
        this[gateway].emit("debug", "[GatewayConnection] Received Reconnect opcode, attempting to resume");
        this.disconnect();
        void this.connect(true);
    }

    private handleDispatchEvent(payload: GatewayPayload): void {
        this[gateway].emit("debug", `[GatewayConnection] Received Dispatch event: ${payload.t}`);
        if (payload.t === "READY") {
            const ready = payload.d as ReadyEventFields;
            this[sessionId] = ready.session_id;
            this[resumeGatewayUrl] = ready.resume_gateway_url;
            this[gateway].emit("debug", `[GatewayConnection] Received READY event, session ID: ${this[sessionId]}`);
        }

        if (!payload.t) {
            this[gateway].emit("warn", "[GatewayConnection] Received a dispatch event without a name");
            return;
        }

        this[gateway].emit("dispatch", payload.t, payload.d as never);
    }

    private onOpen(): void {
        this[gateway].emit("debug", "[GatewayConnection] WebSocket connection opened");
    }

    private onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this[gateway].emit(
            "close",
            `[GatewayConnection] WebSocket connection closed with code ${code}: ${reason.toString()}`,
            code,
            reason.toString()
        );
        this.cleanup();
    }

    private onError(error: Error): void {
        this[gateway].emit("error", error);
    }

    private setupHeartbeat(interval: number): void {
        this[gateway].emit("debug", `[GatewayConnection] Setting up heartbeat with interval: ${interval}ms`);
        if (this[heartbeatInterval]) {
            clearInterval(this[heartbeatInterval]);
        }

        this[heartbeatInterval] = setInterval(() => {
            this[gateway].emit("debug", `[GatewayConnection] Sending heartbeat, sequence: ${this[sequence]}`);
            this.send(GatewayOpcodes.Heartbeat, this[sequence]);
        }, interval);
    }

    private sendResume(): void {
        if (!this[sessionId] || this[sequence] === null) {
            this[gateway].emit(
                "warn",
                "[GatewayConnection] Attempted to resume without a valid session, re-identifying"
            );
            void this[gateway].shardManager.initialize();
            return;
        }

        const resumePayload: ResumeStructure = {
            token: this[token],
            session_id: this[sessionId],
            seq: this[sequence],
        };

        this[gateway].emit(
            "debug",
            `[GatewayConnection] Sending Resume payload, session ID: ${this[sessionId]}, sequence: ${this[sequence]}`
        );
        this.send(GatewayOpcodes.Resume, resumePayload);
    }
}
