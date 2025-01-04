import { EventEmitter } from "eventemitter3";
import type { Gateway } from "../core/index.js";
import { type GatewayEvents, GatewayOpcodes } from "../types/index.js";

export interface HeartbeatErrorDetails {
  lastAck: number;
  lastSend: number;
  missedHeartbeats: number;
  sequence: number | null;
  latency: number;
  intervalMs: number;
  totalBeats: number;
}

export class HeartbeatError extends Error {
  readonly code: string;
  readonly details: HeartbeatErrorDetails;
  readonly error?: string;

  constructor(
    message: string,
    details: HeartbeatErrorDetails,
    error?: unknown,
  ) {
    super(message);
    this.name = "HeartbeatError";
    this.code = "HEARTBEAT_ERROR";
    this.details = details;
    this.error = error instanceof Error ? error.message : String(error);
  }

  override toString(): string {
    const {
      lastAck,
      lastSend,
      missedHeartbeats,
      sequence,
      latency,
      intervalMs,
      totalBeats,
    } = this.details;
    return `HeartbeatError: ${this.message}
    - Last Acknowledgement: ${new Date(lastAck).toISOString()}
    - Last Send: ${new Date(lastSend).toISOString()}
    - Missed Heartbeats: ${missedHeartbeats}
    - Current Sequence: ${sequence}
    - Current Latency: ${latency}ms
    - Heartbeat Interval: ${intervalMs}ms
    - Total Beats: ${totalBeats}`;
  }
}

export class HeartbeatManager extends EventEmitter<GatewayEvents> {
  #latency = 0;
  #lastAck = 0;
  #lastSend = 0;
  #missedHeartbeats = 0;
  #intervalMs = 0;
  #isAcked = true;
  #sequence = 0;
  #totalBeats = 0;
  #interval: NodeJS.Timeout | null = null;
  readonly #maxMissedHeartbeats = 2;

  #gateway: Gateway;

  constructor(gateway: Gateway) {
    super();
    this.#gateway = gateway;
  }

  get interval(): NodeJS.Timeout | null {
    return this.#interval;
  }

  get latency(): number {
    return this.#latency;
  }

  get lastAck(): number {
    return this.#lastAck;
  }

  get lastSend(): number {
    return this.#lastSend;
  }

  get sequence(): number {
    return this.#sequence;
  }

  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  get isAcked(): boolean {
    return this.#isAcked;
  }

  get intervalMs(): number {
    return this.#intervalMs;
  }

  get totalBeats(): number {
    return this.#totalBeats;
  }

  startHeartbeat(interval: number): void {
    if (interval <= 0) {
      throw new HeartbeatError(
        "Cannot start heartbeat with invalid interval",
        this.#getErrorDetails(),
      );
    }

    if (this.#interval) {
      this.stopHeartbeat();
    }

    this.#intervalMs = interval;
    const jitter = Math.random();
    const jitterDelay = Math.floor(interval * jitter);

    this.emit("heartbeatInit", {
      interval,
      jitter,
      jitterDelay,
    });

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Starting - Interval: ${interval}ms, Initial delay: ${jitterDelay}ms, Jitter: ${jitter.toFixed(4)}`,
    );

    try {
      setTimeout(() => {
        this.sendHeartbeat();
        this.#interval = setInterval(() => this.sendHeartbeat(), interval);
      }, jitterDelay);
    } catch (error) {
      const heartbeatError = new HeartbeatError(
        "Failed to start heartbeat",
        this.#getErrorDetails(),
        error,
      );
      this.emit("error", heartbeatError);
      throw heartbeatError;
    }
  }

  sendHeartbeat(): void {
    this.#lastSend = Date.now();
    this.#totalBeats++;

    if (!this.#isAcked) {
      this.#missedHeartbeats++;

      this.emit("heartbeatTimeout", {
        missedCount: this.#missedHeartbeats,
        maxAllowed: this.#maxMissedHeartbeats,
        lastAckTime: new Date(this.#lastAck).toISOString(),
      });

      this.emit(
        "debug",
        `[Gateway:Heartbeat] Missed beat - Count: ${this.#missedHeartbeats}/${this.#maxMissedHeartbeats}, Last ACK: ${new Date(this.#lastAck).toISOString()}`,
      );

      if (this.#missedHeartbeats >= this.#maxMissedHeartbeats) {
        this.emit(
          "warn",
          "[Gateway:Heartbeat] Zombie connection detected - Starting reconnection",
        );
        this.destroyHeartbeat();
        return;
      }
    }

    this.#isAcked = false;

    this.emit("heartbeat", {
      sequence: this.sequence,
      timestamp: new Date().toISOString(),
    });

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Sending - Sequence: ${this.sequence}`,
    );

    try {
      this.#gateway.send(GatewayOpcodes.heartbeat, this.sequence);
    } catch (error) {
      const heartbeatError = new HeartbeatError(
        "Failed to send heartbeat",
        this.#getErrorDetails(),
        error,
      );
      this.emit("error", heartbeatError);
      throw heartbeatError;
    }
  }

  ackHeartbeat(): void {
    const now = Date.now();
    this.#isAcked = true;
    this.#lastAck = now;
    this.#missedHeartbeats = 0;
    this.#latency = this.#lastAck - this.#lastSend;

    this.emit("heartbeatAck", {
      latency: this.#latency,
      timestamp: new Date(now).toISOString(),
      sequence: this.sequence,
    });

    this.emit(
      "debug",
      `[Gateway:Heartbeat] Acknowledged - Latency: ${this.#latency}ms, Sequence: ${this.sequence}`,
    );
  }

  stopHeartbeat(): void {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
      this.emit(
        "warn",
        "[Gateway:Heartbeat] Stopped - Connection maintenance halted",
      );
    }
  }

  destroyHeartbeat(): void {
    this.stopHeartbeat();

    const avgLatency =
      this.#totalBeats > 0 ? this.#latency / this.#totalBeats : 0;

    this.#isAcked = true;
    this.#sequence = 0;
    this.#missedHeartbeats = 0;
    this.#latency = 0;
    this.#lastAck = 0;
    this.#lastSend = 0;
    this.#intervalMs = 0;

    this.emit("heartbeatDestroy", {
      totalBeats: this.#totalBeats,
      avgLatency,
    });

    this.#totalBeats = 0;

    this.emit("warn", "[Gateway:Heartbeat] Destroyed - Metrics reset");
  }

  updateSequence(sequence: number): void {
    if (sequence < 0) {
      throw new HeartbeatError(
        "Invalid sequence number - Must be positive",
        this.#getErrorDetails(),
      );
    }

    this.#sequence = sequence;
    this.emit("heartbeatSequence", this.#sequence);
    this.emit(
      "debug",
      `[Gateway:Heartbeat] Sequence updated: ${this.#sequence}`,
    );
  }

  #getErrorDetails(): HeartbeatErrorDetails {
    return {
      lastAck: this.#lastAck,
      lastSend: this.#lastSend,
      missedHeartbeats: this.#missedHeartbeats,
      sequence: this.#sequence,
      latency: this.#latency,
      intervalMs: this.#intervalMs,
      totalBeats: this.#totalBeats,
    };
  }
}
