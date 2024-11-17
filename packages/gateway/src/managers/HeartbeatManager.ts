import type { Integer } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import type { Gateway } from "../Gateway.js";
import { BaseError, ErrorCodes } from "../errors/index.js";

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

export class HeartbeatError extends BaseError {}

export class HeartbeatManager {
    readonly #gateway: Gateway;
    readonly #maxMissedAcks = 3;
    readonly #minInterval = 1000;
    readonly #maxInterval = 60000;
    #state: HeartbeatState;

    constructor(gateway: Gateway) {
        this.#gateway = gateway;
        this.#state = this.#createInitialState();
    }

    setInterval(intervalMs: Integer, onHeartbeat: () => void): void {
        try {
            this.#validateInterval(intervalMs);
            this.cleanup();

            const jitter = this.#calculateJitter(intervalMs);
            this.#state.lastAck = true;
            this.#state.isActive = true;

            this.#emitDebug("Heartbeat started", { intervalMs, jitter: Math.round(jitter) });

            this.#state.timer = this.#createSafeTimeout(() => {
                this.#sendHeartbeat(onHeartbeat);

                this.#state.interval = this.#createSafeInterval(async () => {
                    if (!this.#state.lastAck) {
                        await this.#handleMissedAck();
                        return;
                    }

                    this.#sendHeartbeat(onHeartbeat);
                }, intervalMs);
            }, jitter);
        } catch (error) {
            const heartbeatError = new HeartbeatError(
                "Failed to set heartbeat interval",
                ErrorCodes.HeartbeatStateError,
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
                    ErrorCodes.HeartbeatStateError,
                );
            }

            const now = Date.now();
            const latency = this.#state.lastBeat ? now - this.#state.lastBeat : null;

            if (latency && latency > 1000) {
                this.#emitDebug("High heartbeat latency detected", { latencyMs: latency });
            }

            this.#state.latency = latency;
            this.#state.lastAck = true;
            this.#state.missedAcks = 0;
        } catch (error) {
            const heartbeatError =
                error instanceof HeartbeatError
                    ? error
                    : new HeartbeatError("Failed to acknowledge heartbeat", ErrorCodes.HeartbeatStateError, {
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

            if (this.#state.isActive) {
                this.#emitDebug("Heartbeat stopped", {
                    totalBeats: this.#state.totalBeats,
                    missedAcks: this.#state.missedAcks,
                });
            }

            this.#state = this.#createInitialState();
        } catch (error) {
            const heartbeatError = new HeartbeatError("Error during cleanup", ErrorCodes.HeartbeatStateError, {
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
                ErrorCodes.HeartbeatIntervalError,
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
                    new HeartbeatError("Error in timeout callback", ErrorCodes.HeartbeatStateError, {
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
                    new HeartbeatError("Error in interval callback", ErrorCodes.HeartbeatIntervalError, {
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
        } catch (error) {
            const heartbeatError = new HeartbeatError("Failed to send heartbeat", ErrorCodes.HeartbeatSendError, {
                originalError: error,
                totalBeats: this.#state.totalBeats,
            });
            this.#emitError(heartbeatError);
            throw heartbeatError;
        }
    }

    async #handleMissedAck(): Promise<void> {
        this.#state.missedAcks++;

        this.#emitDebug("Missed heartbeat acknowledgement", {
            missedAcks: this.#state.missedAcks,
            maxMissedAcks: this.#maxMissedAcks,
        });

        await this.#gateway.reconnect();

        if (this.#state.missedAcks >= this.#maxMissedAcks) {
            const error = new HeartbeatError(
                `Maximum missed heartbeats (${this.#maxMissedAcks}) exceeded`,
                ErrorCodes.HeartbeatMaxMissedError,
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
        this.#gateway.emit(
            "error",
            Logger.error(error.message, {
                component: "HeartbeatManager",
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
                component: "HeartbeatManager",
                details,
            }),
        );
    }
}
