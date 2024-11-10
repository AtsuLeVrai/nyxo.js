import { GatewayCloseCodes } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { GatewayEvents } from "../types/index.js";

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

export enum WebSocketErrorCode {
    ConnectionError = "WEBSOCKET_CONNECTION_ERROR",
    SendError = "WEBSOCKET_SEND_ERROR",
    CleanupError = "WEBSOCKET_CLEANUP_ERROR",
    StateError = "WEBSOCKET_STATE_ERROR",
    InvalidState = "WEBSOCKET_INVALID_STATE",
}

export class WebSocketError extends Error {
    code: WebSocketErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: WebSocketErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "WebSocketError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class WebSocketManager extends EventEmitter<Pick<GatewayEvents, "error" | "debug" | "warn" | "raw" | "close">> {
    #state: WebSocketState = {
        socket: null,
        isOpen: false,
        lastError: null,
        reconnectAttempt: 0,
        bytesReceived: 0,
        bytesSent: 0,
    };

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
                WebSocketErrorCode.ConnectionError,
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
            const wsError = new WebSocketError("Error during WebSocket cleanup", WebSocketErrorCode.CleanupError, {
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
                WebSocketErrorCode.InvalidState,
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
            const wsError = new WebSocketError("Failed to send WebSocket message", WebSocketErrorCode.SendError, {
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
                WebSocketErrorCode.InvalidState,
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
        this.emit("close", code, reason.toString());
    }

    #handleSocketError(error: Error): void {
        const wsError = new WebSocketError("WebSocket error occurred", WebSocketErrorCode.ConnectionError, { error });
        this.#handleError(wsError);
    }

    #handleError(error: WebSocketError): void {
        this.#state.lastError = error;
        this.#emitError(error);
    }

    #handleMessage(data: WebSocket.RawData, isBinary: boolean): void {
        try {
            const dataLength = Buffer.isBuffer(data) ? data.length : data.toString().length;
            this.#state.bytesReceived += dataLength;
            this.#emitDebug(`Received ${dataLength} bytes`, { isBinary });
            this.emit("raw", data, isBinary);
        } catch (error) {
            const wsError = new WebSocketError("Error processing WebSocket message", WebSocketErrorCode.StateError, {
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
        this.emit(
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
        this.emit(
            "debug",
            Logger.debug(message, {
                component: "WebSocketManager",
                details,
            }),
        );
    }
}
