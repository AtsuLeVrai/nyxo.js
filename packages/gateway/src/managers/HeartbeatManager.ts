import type { Integer } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import { EventEmitter } from "eventemitter3";
import type { GatewayEvents } from "../types/index.js";

export interface HeartbeatState {
    interval: NodeJS.Timeout | null;
    timer: NodeJS.Timeout | null;
    lastAck: boolean;
    lastBeat: number | null;
    missedAcks: number;
    totalBeats: number;
    latency: number | null;
    isActive: boolean;
}

export enum HeartbeatErrorCode {
    SendFailure = "HEARTBEAT_SEND_FAILURE",
    MaxMissedAcks = "MAX_MISSED_ACKS_EXCEEDED",
    InvalidInterval = "INVALID_INTERVAL",
    StateError = "HEARTBEAT_STATE_ERROR",
}

export class HeartbeatError extends Error {
    code: HeartbeatErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: HeartbeatErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "HeartbeatError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class HeartbeatManager extends EventEmitter<Pick<GatewayEvents, "error" | "debug" | "warn" | "missedAck">> {
    #maxMissedAcks = 3;
    #minInterval = 1000;
    #maxInterval = 60000;
    #state: HeartbeatState;

    constructor() {
        super();
        this.#state = this.#createInitialState();
    }

    get stats(): Omit<HeartbeatState, "interval" | "timer"> {
        const { interval, timer, ...stats } = this.#state;
        return stats;
    }

    setInterval(intervalMs: Integer, onHeartbeat: () => void): void {
        try {
            this.#validateInterval(intervalMs);
            this.cleanup();

            const jitter = this.#calculateJitter(intervalMs);
            this.#state.lastAck = true;
            this.#state.isActive = true;

            this.#emitDebug(`Setting up heartbeat with interval ${intervalMs}ms (jitter: ${jitter.toFixed(2)}ms)`);

            this.#state.timer = this.#createSafeTimeout(() => {
                this.#sendHeartbeat(onHeartbeat);

                this.#state.interval = this.#createSafeInterval(() => {
                    if (!this.#state.lastAck) {
                        this.#handleMissedAck();
                        return;
                    }

                    this.#sendHeartbeat(onHeartbeat);
                }, intervalMs);
            }, jitter);
        } catch (error) {
            const heartbeatError = new HeartbeatError(
                "Failed to set heartbeat interval",
                HeartbeatErrorCode.StateError,
                {
                    originalError: error,
                    intervalMs,
                },
            );
            this.#emitError(heartbeatError);
            throw heartbeatError;
        }
    }

    acknowledge(): void {
        try {
            if (!this.#state.isActive) {
                throw new HeartbeatError(
                    "Cannot acknowledge heartbeat: manager is not active",
                    HeartbeatErrorCode.StateError,
                );
            }

            const now = Date.now();
            this.#state.latency = this.#state.lastBeat ? now - this.#state.lastBeat : null;
            this.#state.lastAck = true;
            this.#state.missedAcks = 0;

            this.#emitDebug(
                `Heartbeat acknowledged${this.#state.latency ? ` (latency: ${this.#state.latency}ms)` : ""}`,
            );

            // this.emit("heartbeatAck", {
            //     latency: this.#state.latency,
            //     totalBeats: this.#state.totalBeats,
            // });
        } catch (error) {
            const heartbeatError =
                error instanceof HeartbeatError
                    ? error
                    : new HeartbeatError("Failed to acknowledge heartbeat", HeartbeatErrorCode.StateError, {
                          originalError: error,
                      });
            this.#emitError(heartbeatError);
            throw heartbeatError;
        }
    }

    cleanup(): void {
        try {
            if (this.#state.interval) {
                clearInterval(this.#state.interval);
                this.#state.interval = null;
            }

            if (this.#state.timer) {
                clearTimeout(this.#state.timer);
                this.#state.timer = null;
            }

            this.#state = this.#createInitialState();
            this.#emitDebug("Heartbeat manager cleaned up");
        } catch (error) {
            const heartbeatError = new HeartbeatError("Error during cleanup", HeartbeatErrorCode.StateError, {
                originalError: error,
            });
            this.#emitError(heartbeatError);
        }
    }

    #createInitialState(): HeartbeatState {
        return {
            interval: null,
            timer: null,
            lastAck: false,
            lastBeat: null,
            missedAcks: 0,
            totalBeats: 0,
            latency: null,
            isActive: false,
        };
    }

    #validateInterval(intervalMs: number): void {
        if (!Number.isInteger(intervalMs) || intervalMs < this.#minInterval || intervalMs > this.#maxInterval) {
            throw new HeartbeatError(
                `Invalid heartbeat interval: must be between ${this.#minInterval}ms and ${this.#maxInterval}ms`,
                HeartbeatErrorCode.InvalidInterval,
                { providedInterval: intervalMs },
            );
        }
    }

    #calculateJitter(intervalMs: number): number {
        return Math.random() * Math.min(intervalMs, 1000);
    }

    #createSafeTimeout(callback: () => void, ms: number): NodeJS.Timeout {
        return setTimeout(() => {
            try {
                callback();
            } catch (error) {
                this.#emitError(
                    new HeartbeatError("Error in timeout callback", HeartbeatErrorCode.StateError, {
                        originalError: error,
                    }),
                );
            }
        }, ms);
    }

    #createSafeInterval(callback: () => void, ms: number): NodeJS.Timeout {
        return setInterval(() => {
            try {
                callback();
            } catch (error) {
                this.#emitError(
                    new HeartbeatError("Error in interval callback", HeartbeatErrorCode.StateError, {
                        originalError: error,
                    }),
                );
            }
        }, ms);
    }

    #sendHeartbeat(onHeartbeat: () => void): void {
        try {
            this.#state.lastAck = false;
            this.#state.lastBeat = Date.now();
            this.#state.totalBeats++;

            onHeartbeat();
            this.#emitDebug(`Heartbeat sent (total: ${this.#state.totalBeats})`);

            // this.emit("heartbeat", {
            //     totalBeats: this.#state.totalBeats,
            //     missedAcks: this.#state.missedAcks,
            // });
        } catch (error) {
            const heartbeatError = new HeartbeatError("Failed to send heartbeat", HeartbeatErrorCode.SendFailure, {
                originalError: error,
                totalBeats: this.#state.totalBeats,
            });
            this.#emitError(heartbeatError);
            throw heartbeatError;
        }
    }

    #handleMissedAck(): void {
        this.#state.missedAcks++;

        const warning = `No heartbeat acknowledgement received. Missed acks: ${
            this.#state.missedAcks
        }/${this.#maxMissedAcks}`;

        this.emit("missedAck", warning);

        if (this.#state.missedAcks >= this.#maxMissedAcks) {
            const error = new HeartbeatError(
                `Maximum missed heartbeats (${this.#maxMissedAcks}) exceeded`,
                HeartbeatErrorCode.MaxMissedAcks,
                {
                    missedAcks: this.#state.missedAcks,
                    maxMissedAcks: this.#maxMissedAcks,
                    totalBeats: this.#state.totalBeats,
                },
            );
            this.#emitError(error);
            this.cleanup();
            throw error;
        }
    }

    #emitError(error: HeartbeatError): void {
        this.emit(
            "error",
            Logger.debug(error.message, {
                component: "HeartbeatManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitDebug(message: string): void {
        this.emit(
            "debug",
            Logger.debug(message, {
                component: "HeartbeatManager",
            }),
        );
    }
}
