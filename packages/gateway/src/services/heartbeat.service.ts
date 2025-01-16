import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import type { Gateway } from "../gateway.js";
import type { HeartbeatOptions } from "../options/index.js";
import type {
  GatewayEvents,
  HeartbeatState,
  HeartbeatStats,
} from "../types/index.js";
import { GatewayOpcodes } from "../types/index.js";

export class HeartbeatService extends EventEmitter<GatewayEvents> {
  #stats: HeartbeatStats = {
    latency: 0,
    latencyHistory: [],
    missedHeartbeats: 0,
    totalBeats: 0,
    sequence: 0,
    lastAck: 0,
    lastSend: 0,
  };

  #state: HeartbeatState = {
    intervalMs: 0,
    isAcked: true,
    isReconnecting: false,
    retryAttempts: 0,
  };

  #interval: NodeJS.Timeout | null = null;
  #reconnectTimeout: NodeJS.Timeout | null = null;

  readonly #gateway: Gateway;
  readonly #options: z.output<typeof HeartbeatOptions>;

  constructor(gateway: Gateway, options: z.output<typeof HeartbeatOptions>) {
    super();
    this.#gateway = gateway;
    this.#options = options;
  }

  get latency(): number {
    return this.#stats.latency;
  }

  get lastAck(): number {
    return this.#stats.lastAck;
  }

  get sequence(): number {
    return this.#stats.sequence;
  }

  get missedHeartbeats(): number {
    return this.#stats.missedHeartbeats;
  }

  isRunning(): boolean {
    return this.#interval !== null;
  }

  isReconnecting(): boolean {
    return this.#state.isReconnecting;
  }

  averageLatency(): number {
    if (this.#stats.latencyHistory.length === 0) {
      return 0;
    }
    const sum = this.#stats.latencyHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.#stats.latencyHistory.length);
  }

  start(interval: number): void {
    if (interval <= 0) {
      throw new Error(`Invalid heartbeat interval: ${interval}ms`);
    }

    if (this.isRunning()) {
      throw new Error("Heartbeat service is already running");
    }

    this.#cleanupTimers();
    this.#state.intervalMs = interval;

    const initialDelay = this.#options.useJitter
      ? Math.floor(interval * this.#calculateJitter())
      : this.#options.initialInterval;

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Starting - Interval: ${interval}ms, Initial delay: ${initialDelay}ms`,
    );

    setTimeout(() => {
      this.sendHeartbeat();
      this.#interval = setInterval(
        () => this.sendHeartbeat(),
        this.#state.intervalMs,
      );
    }, initialDelay);
  }

  destroy(): void {
    this.#cleanupTimers();
    this.#resetStats();
    this.#state = {
      intervalMs: 0,
      isAcked: true,
      isReconnecting: false,
      retryAttempts: 0,
    };

    this.emit("debug", "[Gateway:Heartbeat] Destroyed - All state reset");
  }

  updateSequence(sequence: number): void {
    if (
      sequence < this.#options.minSequence ||
      sequence > this.#options.maxSequence
    ) {
      throw new Error(
        `Invalid sequence number: ${sequence} - Must be between ${this.#options.minSequence} and ${this.#options.maxSequence}`,
      );
    }

    this.#stats.sequence = sequence;
    this.emit("debug", `[Gateway:Heartbeat] Sequence updated: ${sequence}`);
  }

  ackHeartbeat(): void {
    const now = Date.now();
    this.#state.isAcked = true;
    this.#stats.lastAck = now;
    this.#stats.missedHeartbeats = 0;
    this.#state.retryAttempts = 0;
    this.#state.isReconnecting = false;

    this.#updateLatency(now);

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Acknowledged - Latency: ${this.#stats.latency}ms, Sequence: ${this.#stats.sequence}`,
    );
  }

  sendHeartbeat(): void {
    this.#stats.lastSend = Date.now();
    this.#stats.totalBeats++;

    if (!this.#state.isAcked) {
      this.#handleMissedHeartbeat();
      return;
    }

    this.#state.isAcked = false;

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Sending - Sequence: ${this.#stats.sequence}, Total beats: ${this.#stats.totalBeats}`,
    );

    try {
      this.#gateway.send(GatewayOpcodes.Heartbeat, this.#stats.sequence);
    } catch {
      if (this.#options.retryOnFail) {
        this.#handleSendError();
      }
    }
  }

  #handleMissedHeartbeat(): void {
    this.#stats.missedHeartbeats++;

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Missed beat - Count: ${this.#stats.missedHeartbeats}/${this.#options.maxMissedHeartbeats}`,
    );

    if (
      this.#stats.missedHeartbeats >= this.#options.maxMissedHeartbeats &&
      this.#options.resetOnZombie
    ) {
      this.destroy();

      if (this.#options.autoReconnect) {
        this.#handleReconnect();
      }
    }
  }

  #handleSendError(): void {
    this.#state.retryAttempts++;
    const backoff = Math.min(
      1000 * 2 ** (this.#state.retryAttempts - 1),
      30000,
    );

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Retry attempt ${this.#state.retryAttempts} in ${backoff}ms`,
    );

    this.#reconnectTimeout = setTimeout(() => {
      if (this.#state.retryAttempts < 5) {
        this.sendHeartbeat();
      } else {
        this.destroy();
      }
    }, backoff);
  }

  #handleReconnect(): void {
    if (this.#state.isReconnecting) {
      return;
    }

    this.#state.isReconnecting = true;
    this.emit("debug", "[Gateway:Heartbeat] Attempting to reconnect");

    setTimeout(() => {
      if (this.#state.intervalMs > 0) {
        this.start(this.#state.intervalMs);
      }
    }, 1000);
  }

  #updateLatency(now: number): void {
    this.#stats.latency = now - this.#stats.lastSend;
    this.#stats.latencyHistory.push(this.#stats.latency);

    if (this.#stats.latencyHistory.length > 100) {
      this.#stats.latencyHistory.shift();
    }

    if (this.#stats.latency > this.#options.maxLatency) {
      this.emit(
        "warn",
        `[Gateway:Heartbeat] High latency detected: ${this.#stats.latency}ms`,
      );
    }
  }

  #calculateJitter(): number {
    return (
      this.#options.minJitter +
      Math.random() * (this.#options.maxJitter - this.#options.minJitter)
    );
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

  #resetStats(): void {
    this.#stats = {
      latency: 0,
      latencyHistory: [],
      missedHeartbeats: 0,
      totalBeats: 0,
      sequence: 0,
      lastAck: 0,
      lastSend: 0,
    };
  }
}
