import { GatewayCloseCodes } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import WebSocket from "ws";
import type { Gateway } from "../Gateway.js";
import { BaseError, ErrorCodes } from "../errors/index.js";

export interface WebSocketState {
    socket: WebSocket | null;
    isOpen: boolean;
    lastError: Error | null;
    reconnectAttempt: number;
    lastPing?: number;
    latency?: number;
    bytesReceived: number;
    bytesSent: number;
}

export class WebSocketError extends BaseError {}

export class WebSocketManager {
    readonly #gateway: Gateway;

    #state: WebSocketState = {
        socket: null,
        isOpen: false,
        lastError: null,
        reconnectAttempt: 0,
        bytesReceived: 0,
        bytesSent: 0,
    };

    constructor(gateway: Gateway) {
        this.#gateway = gateway;
    }

    get state(): WebSocketState {
        return { ...this.#state };
    }

    connect(url: string): void {
        this.#emitDebug(`Connecting to WebSocket: ${url}`);

        if (this.#state.socket) {
            this.#emitDebug("Cleaning up existing connection before reconnect");
            this.destroy();
        }

        try {
            this.#state.socket = new WebSocket(url, {
                handshakeTimeout: 30000,
                maxPayload: 104857600,
            });
            this.#setupEventListeners();
        } catch (error) {
            const wsError = new WebSocketError(
                "Failed to establish WebSocket connection",
                ErrorCodes.WebSocketConnectionError,
                { url, error },
            );
            this.#handleError(wsError);
        }
    }

    destroy(): void {
        if (!this.#state.socket) {
            return;
        }

        try {
            this.#emitDebug("Starting WebSocket cleanup");
            this.#state.socket.removeAllListeners();
            this.#state.socket.close(GatewayCloseCodes.UnknownError, "WebSocket manager destroyed");
        } catch (error) {
            const wsError = new WebSocketError("Error during WebSocket cleanup", ErrorCodes.WebSocketCleanupError, {
                error,
            });
            this.#handleError(wsError);
        } finally {
            this.#resetState();
            this.#emitDebug("WebSocket manager destroyed");
        }
    }

    send(data: string | Buffer): void {
        if (!this.isConnected()) {
            const wsError = new WebSocketError(
                "Attempted to send a message while the WebSocket is not open",
                ErrorCodes.WebSocketInvalidState,
                { socketState: this.#state.socket?.readyState },
            );
            this.#emitError(wsError);
            return;
        }

        try {
            this.#state.socket?.send(data);
            this.#state.bytesSent += data.length;
            this.#emitDebug(`Sent ${data.length} bytes over WebSocket`);
        } catch (error) {
            const wsError = new WebSocketError("Failed to send WebSocket message", ErrorCodes.WebSocketSendError, {
                dataLength: data.length,
                error,
            });
            this.#handleError(wsError);
        }
    }

    isConnected(): boolean {
        return this.#state.socket !== null && this.#state.socket.readyState === WebSocket.OPEN && this.#state.isOpen;
    }

    #resetState(): void {
        const oldState = { ...this.#state };
        this.#state = {
            socket: null,
            isOpen: false,
            lastError: null,
            reconnectAttempt: 0,
            bytesReceived: 0,
            bytesSent: 0,
        };
        this.#emitDebug("WebSocket state reset", { oldState: JSON.stringify(oldState) });
    }

    #setupEventListeners(): void {
        if (!this.#state.socket) {
            const wsError = new WebSocketError(
                "Cannot setup listeners: socket is null",
                ErrorCodes.WebSocketInvalidState,
            );
            this.#handleError(wsError);
            return;
        }

        this.#state.socket.on("open", this.#handleOpen.bind(this));
        this.#state.socket.on("close", this.#handleClose.bind(this));
        this.#state.socket.on("error", this.#handleSocketError.bind(this));
        this.#state.socket.on("message", this.#handleMessage.bind(this));
        this.#state.socket.on("ping", this.#handlePing.bind(this));
        this.#state.socket.on("pong", this.#handlePong.bind(this));
    }

    #handleOpen(): void {
        this.#state.isOpen = true;
        this.#state.reconnectAttempt = 0;
        this.#emitDebug("Connection opened successfully", {
            reconnectAttempts: this.#state.reconnectAttempt,
        });
    }

    #handleClose(code: GatewayCloseCodes, reason: Buffer): void {
        this.#state.isOpen = false;
        this.#emitDebug("Connection closed", {
            code,
            reason: reason.toString(),
            bytesReceived: this.#state.bytesReceived,
            bytesSent: this.#state.bytesSent,
        });

        this.#gateway.handleClose(code, reason.toString());
    }

    #handleSocketError(error: Error): void {
        const wsError = new WebSocketError("WebSocket error occurred", ErrorCodes.WebSocketConnectionError, { error });
        this.#handleError(wsError);
    }

    #handleError(error: WebSocketError): void {
        this.#state.lastError = error;
        this.#emitError(error);
    }

    async #handleMessage(data: WebSocket.RawData, isBinary: boolean): Promise<void> {
        try {
            const dataLength = Buffer.isBuffer(data) ? data.length : data.toString().length;
            this.#state.bytesReceived += dataLength;
            this.#emitDebug(`Received ${dataLength} bytes`, { isBinary });
            await this.#gateway.handleMessage(data, isBinary);
        } catch (error) {
            const wsError = new WebSocketError("Error processing WebSocket message", ErrorCodes.WebSocketStateError, {
                dataSize: data.slice.length,
                isBinary,
                error,
            });
            this.#handleError(wsError);
        }
    }

    #handlePing(data: Buffer): void {
        this.#state.lastPing = Date.now();
        this.#emitDebug("Received ping");

        if (this.#state.socket?.readyState === WebSocket.OPEN) {
            this.#state.socket.pong(data);
        }
    }

    #handlePong(): void {
        if (this.#state.lastPing) {
            this.#state.latency = Date.now() - this.#state.lastPing;
            this.#emitDebug(`Received pong (latency: ${this.#state.latency}ms)`);
        }
    }

    #emitError(error: WebSocketError): void {
        this.#gateway.emit(
            "error",
            Logger.error(error.message, {
                component: "WebSocketManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitDebug(message: string, details?: Record<string, unknown>): void {
        this.#gateway.emit(
            "debug",
            Logger.debug(message, {
                component: "WebSocketManager",
                details,
            }),
        );
    }
}
