import type { Integer } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";

type HeartbeatManagerEvents = {
    MISSED_ACK: [];
};

export class HeartbeatManager extends EventEmitter<HeartbeatManagerEvents> {
    #interval: NodeJS.Timeout | null = null;
    #timer: NodeJS.Timeout | null = null;
    #lastAck = false;

    setInterval(intervalMs: Integer, onHeartbeat: () => void): void {
        this.cleanup();

        const jitter = Math.random() * intervalMs;
        this.#lastAck = true;

        this.#timer = setTimeout(() => {
            onHeartbeat();
            this.#interval = setInterval(() => {
                if (!this.#lastAck) {
                    this.emit("MISSED_ACK");
                    return;
                }

                this.#lastAck = false;
                onHeartbeat();
            }, intervalMs);
        }, jitter);
    }

    acknowledge(): void {
        this.#lastAck = true;
    }

    cleanup(): void {
        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = null;
        }
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }
}
