import type { Gateway } from "../core/index.js";
import type { HeartbeatOptions } from "../options/index.js";
import { GatewayOpcodes } from "../types/index.js";

export class HeartbeatManager {
  #latency = 0;
  #latencyHistory: number[] = [];
  #missedHeartbeats = 0;
  #totalBeats = 0;
  #lastSend = 0;

  #intervalMs = 0;
  #isAcked = true;
  #isReconnecting = false;
  #retryAttempts = 0;

  #interval: NodeJS.Timeout | null = null;
  #reconnectTimeout: NodeJS.Timeout | null = null;

  readonly #gateway: Gateway;
  readonly #options: HeartbeatOptions;

  constructor(gateway: Gateway, options: HeartbeatOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  get latency(): number {
    return this.#latency;
  }

  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  get totalBeats(): number {
    return this.#totalBeats;
  }

  get intervalMs(): number {
    return this.#intervalMs;
  }

  get retryAttempts(): number {
    return this.#retryAttempts;
  }

  get lastSend(): number {
    return this.#lastSend;
  }

  isAcked(): boolean {
    return this.#isAcked;
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
    if (interval <= this.#options.minInterval) {
      throw new Error(`Invalid heartbeat interval: ${interval}ms`);
    }

    if (this.isRunning()) {
      throw new Error("Heartbeat service is already running");
    }

    this.#startHeartbeat(interval);
  }

  destroy(): void {
    this.#cleanupTimers();
    this.#resetState();
    this.#gateway.emit("debug", "Destroyed - All state reset");
  }

  ackHeartbeat(): void {
    const now = Date.now();
    this.#handleAck();
    this.#updateLatency(now);
    this.#gateway.emit("debug", `Acknowledged - Latency: ${this.#latency}ms`);
    this.#gateway.emit("heartbeatUpdate", {
      type: "success",
      interval: this.#intervalMs,
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
    this.#gateway.emit(
      "debug",
      `Sending heartbeat - Total beats: ${this.#totalBeats}`,
    );
    this.#gateway.send(
      GatewayOpcodes.Heartbeat,
      this.#gateway.session.sequence,
    );
  }

  #startHeartbeat(interval: number): void {
    this.#cleanupTimers();
    this.#intervalMs = interval;

    const initialDelay = Math.floor(interval * Math.random());
    this.#gateway.emit(
      "debug",
      `Starting - Interval: ${interval}ms, Initial delay: ${initialDelay}ms`,
    );
    this.#gateway.emit("heartbeatUpdate", {
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

  #handleAck(): void {
    this.#isAcked = true;
    this.#missedHeartbeats = 0;
    this.#retryAttempts = 0;
    this.#isReconnecting = false;
  }

  #handleMissedHeartbeat(): void {
    this.#missedHeartbeats++;

    this.#gateway.emit(
      "debug",
      `Missed beat - Count: ${this.#missedHeartbeats}/${this.#options.maxMissedHeartbeats}`,
    );

    if (this.#missedHeartbeats >= this.#options.maxMissedHeartbeats) {
      this.#gateway.emit("heartbeatUpdate", { type: "stop" });
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

    this.#gateway.emit("debug", "Attempting to reconnect");

    this.#reconnectTimeout = setTimeout(() => {
      if (this.#intervalMs > 0) {
        this.start(this.#intervalMs);
      }
    }, this.#options.reconnectDelay);
  }

  #updateLatency(now: number): void {
    this.#latency = now - this.#lastSend;
    this.#latencyHistory.push(this.#latency);

    if (this.#latencyHistory.length > this.#options.maxHistorySize) {
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

  #resetState(): void {
    this.#latency = 0;
    this.#missedHeartbeats = 0;
    this.#totalBeats = 0;
    this.#lastSend = 0;
    this.#intervalMs = 0;
    this.#retryAttempts = 0;
    this.#isAcked = true;
    this.#isReconnecting = false;
    this.#latencyHistory = [];
  }
}
