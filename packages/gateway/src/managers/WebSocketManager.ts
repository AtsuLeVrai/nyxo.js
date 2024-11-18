import { GatewayCloseCodes } from "@nyxjs/core";
import { formatUrl } from "@nyxjs/logger";
import WebSocket from "ws";
import { ErrorCodes, GatewayError } from "../GatewayError.js";
import { BaseManager } from "./BaseManager.js";

export class WebSocketManager extends BaseManager {
    #socket: WebSocket | null = null;
    #isOpen = false;
    #lastPing = 0;
    #latency = 0;

    connect(url: string): void {
        this.debug("Attempting WebSocket connection", { url: formatUrl(url) });

        if (this.#socket) {
            this.destroy();
        }

        try {
            this.#socket = new WebSocket(url, {
                handshakeTimeout: 10000,
                maxPayload: 104857600,
                perMessageDeflate: false,
            });

            this.#setupEventListeners();
        } catch (error) {
            const wsError = new GatewayError(
                "Failed to establish WebSocket connection",
                ErrorCodes.WebSocketConnectionError,
                { details: { url }, cause: error },
            );
            this.error(wsError);
        }
    }

    destroy(): void {
        if (!this.#socket) {
            return;
        }

        try {
            this.#socket.removeAllListeners();
            this.#socket.close(GatewayCloseCodes.UnknownError, "WebSocket manager destroyed");
        } catch (error) {
            const wsError = new GatewayError("Error during WebSocket cleanup", ErrorCodes.WebSocketCleanupError, {
                cause: error,
            });
            this.error(wsError);
        }
    }

    send(data: string | Buffer): void {
        if (!this.isConnected()) {
            const wsError = new GatewayError(
                "Attempted to send a message while the WebSocket is not open",
                ErrorCodes.WebSocketInvalidState,
                { details: { socketState: this.#socket?.readyState } },
            );
            this.error(wsError);
            return;
        }

        try {
            this.#socket?.send(data);
        } catch (error) {
            const wsError = new GatewayError("Failed to send WebSocket message", ErrorCodes.WebSocketSendError, {
                details: { dataLength: data.length },
                cause: error,
            });
            this.error(wsError);
        }
    }

    isConnected(): boolean {
        return this.#socket !== null && this.#socket.readyState === WebSocket.OPEN && this.#isOpen;
    }

    #setupEventListeners(): void {
        if (!this.#socket) {
            const wsError = new GatewayError(
                "Cannot setup listeners: socket is null",
                ErrorCodes.WebSocketInvalidState,
            );
            this.error(wsError);
            return;
        }

        this.#socket.on("open", this.#handleOpen.bind(this));
        this.#socket.on("close", this.#handleClose.bind(this));
        this.#socket.on("error", this.#handleSocketError.bind(this));
        this.#socket.on("message", this.#handleMessage.bind(this));
        this.#socket.on("ping", this.#handlePing.bind(this));
        this.#socket.on("pong", this.#handlePong.bind(this));
    }

    #handleOpen(): void {
        this.#isOpen = true;
    }

    #handleClose(code: GatewayCloseCodes, reason: Buffer): void {
        this.#isOpen = false;
        this.gateway.handleClose(code, reason.toString());
    }

    #handleSocketError(error: Error): void {
        this.error(new GatewayError("WebSocket error occurred", ErrorCodes.WebSocketConnectionError, { cause: error }));
    }

    async #handleMessage(data: WebSocket.RawData, isBinary: boolean): Promise<void> {
        try {
            await this.gateway.handleMessage(data, isBinary);
        } catch (error) {
            const wsError = new GatewayError("Error processing WebSocket message", ErrorCodes.WebSocketStateError, {
                details: { dataSize: data.slice.length, isBinary },
                cause: error,
            });
            this.error(wsError);
        }
    }

    #handlePing(data: Buffer): void {
        this.#lastPing = Date.now();
        if (this.#socket?.readyState === WebSocket.OPEN) {
            this.#socket.pong(data);
        }
    }

    #handlePong(): void {
        if (this.#lastPing) {
            this.#latency = Date.now() - this.#lastPing;
            if (this.#latency > 1000) {
                this.debug("High latency detected", {
                    latencyMs: this.#latency,
                });
            }
        }
    }
}
