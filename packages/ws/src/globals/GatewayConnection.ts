import { Buffer } from "node:buffer";
import { clearInterval, clearTimeout, setInterval, setTimeout } from "node:timers";
import { URL } from "node:url";
import type { GatewayCloseCodes, Integer } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import { Inflate, type ZlibOptions } from "minizlib";
import WebSocket from "ws";
import type { HelloStructure } from "../events/hello";
import type { ReadyEventFields } from "../events/ready";
import type { ResumeStructure } from "../events/resume";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayOptions, GatewayPayload } from "../types/gateway";
import { decompressZlib } from "../utils/compression";
import { decodeMessage, encodeMessage } from "../utils/encoding";
import type { Gateway } from "./Gateway";

const ZlibInflateOptions: ZlibOptions = {
    encoding: "utf8",
    async: true,
    level: 9,
};

export class GatewayConnection {
    private ws: WebSocket | null;

    private heartbeatInterval: NodeJS.Timeout | null;

    private sequence: Integer | null;

    private readonly reconnectTimeout: NodeJS.Timeout | null;

    private sessionId: string | null;

    private resumeGatewayUrl: string | null;

    private readonly zlibInflate: Inflate;

    public constructor(
        private readonly gateway: Gateway,
        private readonly token: string,
        private readonly options: GatewayOptions
    ) {
        this.ws = null;
        this.heartbeatInterval = null;
        this.sequence = null;
        this.reconnectTimeout = null;
        this.sessionId = null;
        this.resumeGatewayUrl = null;
        this.zlibInflate = new Inflate(ZlibInflateOptions);
    }

    private get wsUrl(): string {
        const query = new URL("wss://gateway.discord.gg/");
        query.searchParams.set("v", this.options.v.toString());
        query.searchParams.set("encoding", this.options.encoding);
        if (this.options.compress) {
            query.searchParams.set("compress", this.options.compress);
        }

        return query.toString();
    }

    public connect(resumeAttempt = false): void {
        if (this.ws) {
            this.ws.close();
        }

        try {
            const url = resumeAttempt && this.resumeGatewayUrl ? this.resumeGatewayUrl : this.wsUrl;
            this.ws = new WebSocket(url);

            this.ws.on("open", this.onOpen.bind(this));
            this.ws.on("message", this.onMessage.bind(this));
            this.ws.on("close", this.onClose.bind(this));
            this.ws.on("error", this.onError.bind(this));
        } catch {
            this.gateway.emit("error", new Error("Failed to establish a WebSocket connection"));
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
        if (!this.ws) {
            return;
        }

        const payload: GatewayPayload = {
            d: data,
            op,
            s: this.sequence,
            t: null,
        };

        const encoded = encodeMessage(payload, this.options.encoding);
        this.ws.send(encoded);
    }

    public disconnect(): void {
        this.gateway.emit("debug", "[WS] Disconnecting from the gateway...");
        if (this.ws) {
            this.ws.close();
        }

        this.cleanup();
    }

    public cleanup(): void {
        this.gateway.emit("debug", "[WS] Cleaning up...");
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.ws = null;
        this.heartbeatInterval = null;
        this.sequence = null;
    }

    private onOpen(): void {
        this.gateway.emit("debug", "[WS] Connected to the gateway...");
    }

    private async onMessage(data: Buffer): Promise<void> {
        let decompressedData: Buffer | string = data;

        try {
            if (this.options.compress === "zlib-stream" && Buffer.isBuffer(data)) {
                decompressedData = await decompressZlib(data, this.options.encoding, this.zlibInflate);
            } else if (this.options.compress === "zstd-stream") {
                /**
                 * Node.js does not support Zstd compression, so we throw an error.
                 */
                throw new Error("Zstd compression is not supported with node.js...");
            } else {
                decompressedData = decodeMessage(decompressedData, this.options.encoding);
            }

            const decoded = JSON.stringify(decompressedData);
            this.handleMessage(decoded);
        } catch (error) {
            if (error instanceof Error) {
                this.gateway.emit("error", new Error(`[WS] Failed to process WebSocket message: ${error.message}`));
            }

            this.disconnect();
        }
    }

    private onClose(code: GatewayCloseCodes, reason: Buffer): void {
        this.gateway.emit("close", code, reason.toString());
        this.cleanup();
    }

    private onError(error: Error): void {
        this.gateway.emit("error", error);
    }

    private handleMessage(message: string): void {
        let payload: GatewayPayload;
        try {
            payload = JSON.parse(message);
        } catch {
            this.gateway.emit("error", new Error("[WS] Failed to parse globals payload..."));
            return;
        }

        this.sequence = payload.s ?? this.sequence;

        switch (payload.op) {
            case GatewayOpcodes.Hello: {
                const hello = payload.d as HelloStructure;
                this.setupHeartbeat(hello.heartbeat_interval);
                if (this.sessionId && this.sequence) {
                    this.sendResume();
                } else {
                    void this.gateway.shardManager.initialize();
                }

                break;
            }

            case GatewayOpcodes.InvalidSession: {
                const resumable = Boolean(payload.d);
                if (resumable) {
                    setTimeout(async () => this.sendResume(), 5_000);
                } else {
                    this.sessionId = null;
                    this.sequence = null;
                    void this.gateway.shardManager.initialize();
                }

                break;
            }

            case GatewayOpcodes.Reconnect: {
                this.gateway.emit("debug", "[WS] Received Reconnect opcode, attempting to resume");
                this.disconnect();
                this.connect(true);
                break;
            }

            case GatewayOpcodes.Dispatch: {
                this.handleDispatchEvent(payload);
                break;
            }

            case GatewayOpcodes.HeartbeatAck: {
                this.gateway.emit("debug", "[WS] Received a heartbeat ack...");
                break;
            }

            default: {
                this.gateway.emit("warn", `[WS] Received an unhandled gateway event: ${GatewayOpcodes[payload.op]}...`);
                break;
            }
        }
    }

    private handleDispatchEvent(payload: GatewayPayload): void {
        switch (payload.t) {
            case "READY": {
                const ready = payload.d as ReadyEventFields;
                this.sessionId = ready.session_id;
                this.resumeGatewayUrl = ready.resume_gateway_url;
                this.gateway.emit("dispatch", "READY", ready);
                break;
            }

            default: {
                if (!payload.t) {
                    this.gateway.emit("warn", "[WS] Received a dispatch event without a name...");
                    break;
                }

                this.gateway.emit("dispatch", payload.t, payload.d as never);
                break;
            }
        }
    }

    private setupHeartbeat(interval: number): void {
        this.gateway.emit("debug", `[WS] Setting up heartbeat with interval: ${interval}ms...`);
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            this.send(GatewayOpcodes.Heartbeat, this.sequence);
        }, interval);
    }

    private sendResume(): void {
        if (!this.sessionId || this.sequence === null) {
            this.gateway.emit("warn", "[WS] Attempted to resume without a valid session, re-identifying");
            void this.gateway.shardManager.initialize();
            return;
        }

        const resumePayload: ResumeStructure = {
            token: this.token,
            session_id: this.sessionId,
            seq: this.sequence,
        };

        this.send(GatewayOpcodes.Resume, resumePayload);
    }
}
