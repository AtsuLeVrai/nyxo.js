import type { Integer } from "@nyxjs/core";
import { ErrorCodes, GatewayError } from "../GatewayError.js";
import { BaseManager } from "./BaseManager.js";

export class HeartbeatManager extends BaseManager {
    readonly #minInterval = 1000;
    readonly #maxInterval = 60000;
    readonly #maxMissedAcks = 3;

    #interval: NodeJS.Timeout | null = null;
    #lastAck = true;
    #missedAcks = 0;

    connect(intervalMs: Integer, onHeartbeat: () => void): void {
        try {
            this.destroy();

            if (!Number.isInteger(intervalMs) || intervalMs < this.#minInterval || intervalMs > this.#maxInterval) {
                throw new GatewayError(
                    `Invalid interval: must be between ${this.#minInterval}ms and ${this.#maxInterval}ms`,
                    ErrorCodes.HeartbeatIntervalError,
                );
            }

            const jitter = Math.random() * Math.min(intervalMs, 1000);
            setTimeout(() => this.#setupHeartbeat(intervalMs, onHeartbeat), jitter);
        } catch (error) {
            const heartbeatError = new GatewayError("Failed to start heartbeat", ErrorCodes.HeartbeatStateError, {
                cause: error,
            });
            this.error(heartbeatError);
            throw heartbeatError;
        }
    }

    acknowledge(): void {
        if (!this.#interval) {
            const error = new GatewayError("Heartbeat is not running", ErrorCodes.HeartbeatStateError);
            this.error(error);
            return;
        }

        this.#lastAck = true;
        this.#missedAcks = 0;
        this.debug("Received heartbeat acknowledgement");
    }

    destroy(): void {
        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = null;
        }
        this.#lastAck = true;
        this.#missedAcks = 0;
    }

    #setupHeartbeat(intervalMs: number, onHeartbeat: () => void): void {
        this.#sendHeartbeat(onHeartbeat);

        this.#interval = setInterval(async () => {
            try {
                if (!this.#lastAck) {
                    await this.#handleMissedHeartbeat();
                    return;
                }
                this.#sendHeartbeat(onHeartbeat);
            } catch (error) {
                const heartbeatError = new GatewayError(
                    "Error in heartbeat interval",
                    ErrorCodes.HeartbeatIntervalError,
                    { cause: error },
                );
                this.error(heartbeatError);
                throw heartbeatError;
            }
        }, intervalMs);
    }

    #sendHeartbeat(onHeartbeat: () => void): void {
        this.#lastAck = false;
        this.debug("Sending heartbeat");
        onHeartbeat();
    }

    async #handleMissedHeartbeat(): Promise<void> {
        this.#missedAcks++;
        this.debug("Missed heartbeat acknowledgement", {
            missedAcks: this.#missedAcks,
            maxMissedAcks: this.#maxMissedAcks,
        });

        await this.gateway.reconnect();

        if (this.#missedAcks >= this.#maxMissedAcks) {
            this.destroy();
            throw new GatewayError(
                `Maximum missed heartbeats (${this.#maxMissedAcks}) exceeded`,
                ErrorCodes.HeartbeatMaxMissedError,
            );
        }
    }
}
