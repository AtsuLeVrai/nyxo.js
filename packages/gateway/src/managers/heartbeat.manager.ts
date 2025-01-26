import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import type { HeartbeatOptions } from "../options/index.js";
import type { GatewayEvents } from "../types/index.js";

export class HeartbeatManager extends EventEmitter<GatewayEvents> {
  #latency = 0;
  #latencyHistory: number[] = [];
  #missedHeartbeats = 0;
  #totalBeats = 0;
  #sequence = 0;
  #lastAck = 0;
  #lastSend = 0;

  #intervalMs = 0;
  #isAcked = true;
  #isReconnecting = false;
  #retryAttempts = 0;

  #interval: NodeJS.Timeout | null = null;
  #reconnectTimeout: NodeJS.Timeout | null = null;

  readonly #options: z.output<typeof HeartbeatOptions>;
  readonly #sendHeartbeatPayload: (sequence: number) => void;

  constructor(
    options: z.output<typeof HeartbeatOptions>,
    sendHeartbeatPayload: (sequence: number) => void,
  ) {
    super();
    this.#options = options;
    this.#sendHeartbeatPayload = sendHeartbeatPayload;
  }

  get latency(): number {
    return this.#latency;
  }

  get lastAck(): number {
    return this.#lastAck;
  }

  get sequence(): number {
    return this.#sequence;
  }

  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  isRunning(): boolean {
    return this.#interval !== null;
  }

  isReconnecting(): boolean {
    return this.#isReconnecting;
  }

  averageLatency(): number {
    if (this.#latencyHistory.length === 0) {
      return 0;
    }
    const sum = this.#latencyHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.#latencyHistory.length);
  }

  start(interval: number): void {
    if (interval <= 0) {
      throw new Error(`Invalid heartbeat interval: ${interval}ms`);
    }

    if (this.isRunning()) {
      throw new Error("Heartbeat service is already running");
    }

    this.#cleanupTimers();
    this.#intervalMs = interval;

    const initialDelay = Math.floor(interval * Math.random());
    this.emit(
      "debug",
      `Starting - Interval: ${interval}ms, Initial delay: ${initialDelay}ms`,
    );
    this.emit("heartbeatUpdate", {
      type: "start",
      interval,
    });

    setTimeout(() => {
      this.sendHeartbeat();
      this.#interval = setInterval(
        () => this.sendHeartbeat(),
        this.#intervalMs,
      );
    }, initialDelay);
  }

  destroy(): void {
    this.#cleanupTimers();

    this.#latency = 0;
    this.#missedHeartbeats = 0;
    this.#totalBeats = 0;
    this.#sequence = 0;
    this.#lastAck = 0;
    this.#lastSend = 0;
    this.#intervalMs = 0;
    this.#retryAttempts = 0;
    this.#isAcked = true;
    this.#isReconnecting = false;
    this.#latencyHistory = [];

    this.emit("debug", "Destroyed - All state reset");
  }

  updateSequence(sequence: number): void {
    this.#sequence = sequence;
  }

  ackHeartbeat(): void {
    const now = Date.now();
    this.#isAcked = true;
    this.#lastAck = now;
    this.#missedHeartbeats = 0;
    this.#retryAttempts = 0;
    this.#isReconnecting = false;

    this.#updateLatency(now);

    this.emit(
      "debug",
      `Acknowledged - Latency: ${this.#latency}ms, Sequence: ${this.#sequence}`,
    );
    this.emit("heartbeatUpdate", {
      type: "success",
      latency: this.#latency,
    });
  }

  sendHeartbeat(): void {
    this.#lastSend = Date.now();
    this.#totalBeats++;

    if (!this.#isAcked) {
      this.#handleMissedHeartbeat();
      return;
    }

    this.#isAcked = false;

    this.emit(
      "debug",
      `Sending - Sequence: ${this.#sequence}, Total beats: ${this.#totalBeats}`,
    );

    this.#sendHeartbeatPayload(this.#sequence);
  }

  #handleMissedHeartbeat(): void {
    this.#missedHeartbeats++;

    this.emit(
      "debug",
      `Missed beat - Count: ${this.#missedHeartbeats}/${this.#options.maxMissedHeartbeats}`,
    );

    if (this.#missedHeartbeats >= this.#options.maxMissedHeartbeats) {
      this.emit("heartbeatUpdate", { type: "stop" });
      this.destroy();

      if (this.#options.autoReconnect) {
        this.#handleReconnect();
      }
    }
  }

  #handleReconnect(): void {
    if (this.#isReconnecting) {
      return;
    }

    this.#isReconnecting = true;
    this.#retryAttempts++;

    this.emit("debug", "Attempting to reconnect");

    setTimeout(() => {
      if (this.#intervalMs > 0) {
        this.start(this.#intervalMs);
      }
    }, 1000);
  }

  #updateLatency(now: number): void {
    this.#latency = now - this.#lastSend;
    this.#latencyHistory.push(this.#latency);

    if (this.#latencyHistory.length > 100) {
      this.#latencyHistory.shift();
    }
  }

  #cleanupTimers(): void {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }
  }
}
