import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { GatewayEvents, GatewayReceiveEvents } from "../types/index.js";

export class WebSocketManager extends EventEmitter<GatewayEvents<keyof GatewayReceiveEvents>> {
    #ws: WebSocket | null = null;
    #isOpened = false;

    constructor() {
        super();
    }

    connect(url: string): void {
        if (this.#ws) {
            this.destroy();
        }

        this.#ws = new WebSocket(url);
        this.#setupEventListeners();
    }

    destroy(): void {
        if (this.#ws) {
            this.#ws.removeAllListeners();
            this.#ws.close();
            this.#ws = null;
        }
        this.#isOpened = false;
    }

    send(data: string | Buffer): void {
        if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN || !this.#isOpened) {
            this.emit("WARN", "[WEBSOCKET] Attempted to send a message while the WebSocket is not open");
            return;
        }

        this.#ws.send(data);
    }

    isConnected(): boolean {
        return this.#ws !== null && this.#ws.readyState === WebSocket.OPEN && this.#isOpened;
    }

    #setupEventListeners(): void {
        if (!this.#ws) {
            return;
        }

        this.#ws.on("open", () => {
            this.#isOpened = true;
            this.emit("DEBUG", "[WEBSOCKET] Connection opened");
        });

        this.#ws.on("close", (code, reason) => {
            this.#isOpened = false;
            this.emit("CLOSE", code, reason.toString());
        });

        this.#ws.on("error", (error: Error) => {
            this.emit("ERROR", new Error(`[WEBSOCKET] Error: ${error.message}`));
        });

        this.#ws.on("message", (data, isBinary) => {
            this.emit("RAW", data, isBinary);
        });
    }
}
