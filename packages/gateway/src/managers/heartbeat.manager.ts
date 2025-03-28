import type { Gateway } from "../core/index.js";
import type { HeartbeatOptions } from "../options/index.js";
import { GatewayOpcodes } from "../types/index.js";

/**
 * Manages Gateway heartbeat operations
 *
 * This class implements Discord's heartbeating protocol which keeps the websocket connection alive.
 * Per Discord documentation, it:
 * - Sends periodic heartbeats at specified intervals
 * - Tracks heartbeat acknowledgements from Discord
 * - Calculates connection latency
 * - Handles missed heartbeats and reconnection logic
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#sending-heartbeats}
 */
export class HeartbeatManager {
  /** Current latency in milliseconds */
  #latency = 0;

  /** History of latency measurements for averaging */
  #latencyHistory: number[] = [];

  /** Number of consecutive missed heartbeats */
  #missedHeartbeats = 0;

  /** Total heartbeats sent since start */
  #totalBeats = 0;

  /** Timestamp of last heartbeat send */
  #lastSend = 0;

  /** Current heartbeat interval in milliseconds */
  #intervalMs = 0;

  /** Whether the last heartbeat was acknowledged */
  #isAcked = true;

  /** Whether a reconnection is in progress */
  #isReconnecting = false;

  /** Number of reconnection attempts made */
  #retryAttempts = 0;

  /** Interval timer for sending heartbeats */
  #interval: NodeJS.Timeout | null = null;

  /** Timeout for reconnection attempts */
  #reconnectTimeout: NodeJS.Timeout | null = null;

  /** Reference to parent Gateway */
  readonly #gateway: Gateway;

  /** Heartbeat configuration options */
  readonly #options: HeartbeatOptions;

  /**
   * Creates a new HeartbeatManager
   *
   * @param gateway - The parent Gateway instance
   * @param options - Heartbeat configuration options
   */
  constructor(gateway: Gateway, options: HeartbeatOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Gets the current latency in milliseconds
   */
  get latency(): number {
    return this.#latency;
  }

  /**
   * Gets the number of consecutive missed heartbeats
   */
  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  /**
   * Gets the total number of heartbeats sent
   */
  get totalBeats(): number {
    return this.#totalBeats;
  }

  /**
   * Gets the current heartbeat interval in milliseconds
   */
  get intervalMs(): number {
    return this.#intervalMs;
  }

  /**
   * Gets the number of reconnection attempts made
   */
  get retryAttempts(): number {
    return this.#retryAttempts;
  }

  /**
   * Gets the timestamp of the last heartbeat send
   */
  get lastSend(): number {
    return this.#lastSend;
  }

  /**
   * Checks if the last heartbeat was acknowledged
   */
  isAcked(): boolean {
    return this.#isAcked;
  }

  /**
   * Checks if the heartbeat service is currently running
   */
  isRunning(): boolean {
    return this.#interval !== null;
  }

  /**
   * Checks if a reconnection is in progress
   */
  isReconnecting(): boolean {
    return this.#isReconnecting;
  }

  /**
   * Calculates the average latency from history
   *
   * @returns The average latency in milliseconds
   */
  averageLatency(): number {
    if (this.#latencyHistory.length === 0) {
      return 0;
    }
    const sum = this.#latencyHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.#latencyHistory.length);
  }

  /**
   * Starts the heartbeat service with the interval specified by Discord
   *
   * @param interval - Heartbeat interval in milliseconds from Discord's Hello message
   * @throws {Error} If the interval is invalid or the service is already running
   */
  start(interval: number): void {
    if (interval <= this.#options.minInterval) {
      throw new Error(
        `Invalid heartbeat interval: ${interval}ms (minimum: ${this.#options.minInterval}ms)`,
      );
    }

    if (this.isRunning()) {
      throw new Error("Heartbeat service is already running");
    }

    this.#startHeartbeat(interval);
  }

  /**
   * Destroys the heartbeat service and resets all state
   */
  destroy(): void {
    this.#latency = 0;
    this.#missedHeartbeats = 0;
    this.#totalBeats = 0;
    this.#lastSend = 0;
    this.#intervalMs = 0;
    this.#retryAttempts = 0;
    this.#isAcked = true;
    this.#isReconnecting = false;
    this.#latencyHistory = [];
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }
  }

  /**
   * Acknowledges a heartbeat and calculates latency
   * Called when Discord responds with a Heartbeat ACK (opcode 11)
   */
  ackHeartbeat(): void {
    const now = Date.now();
    this.#handleAck();
    this.#updateLatency(now);

    this.#gateway.emit("heartbeatAcknowledge", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
      latencyMs: this.#latency,
    });
  }

  /**
   * Sends a heartbeat to the gateway
   * This sends opcode 1 with the current sequence number
   */
  sendHeartbeat(): void {
    this.#lastSend = Date.now();
    this.#totalBeats++;

    if (!this.#isAcked) {
      this.#handleMissedHeartbeat();
      return;
    }

    this.#isAcked = false;

    this.#gateway.emit("heartbeatSent", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
      totalSent: this.#totalBeats,
    });

    this.#gateway.send(GatewayOpcodes.Heartbeat, this.#gateway.sequence);
  }

  /**
   * Starts the heartbeat with the specified interval
   * Implements Discord's recommended jitter to prevent thundering herd
   *
   * @param interval - Heartbeat interval in milliseconds
   * @private
   */
  #startHeartbeat(interval: number): void {
    // Clean up existing timers
    this.destroy();
    this.#intervalMs = interval;

    // Use jitter to prevent thundering herd problem
    // Discord documentation recommends adding random jitter to the first heartbeat
    const initialDelay = interval * Math.random();

    // We don't emit a specific event for starting heartbeats in the new event system

    setTimeout(() => {
      this.sendHeartbeat();
      this.#interval = setInterval(
        () => this.sendHeartbeat(),
        this.#intervalMs,
      );
    }, initialDelay);
  }

  /**
   * Handles heartbeat acknowledgement
   * Resets missed heartbeat counters and reconnection status
   *
   * @private
   */
  #handleAck(): void {
    this.#isAcked = true;
    this.#missedHeartbeats = 0;
    this.#retryAttempts = 0;
    this.#isReconnecting = false;
  }

  /**
   * Handles a missed heartbeat
   * After too many missed heartbeats, the connection is considered zombied
   * and should be terminated per Discord guidelines
   *
   * @private
   */
  #handleMissedHeartbeat(): void {
    this.#missedHeartbeats++;

    this.#gateway.emit("heartbeatTimeout", {
      timestamp: new Date().toISOString(),
      missedCount: this.#missedHeartbeats,
      maxRetries: this.#options.maxRetries,
      willReconnect:
        this.#missedHeartbeats >= this.#options.maxRetries &&
        this.#options.autoReconnect,
    });

    // If we've reached the max retries, destroy the heartbeat and reconnect if configured
    if (this.#missedHeartbeats >= this.#options.maxRetries) {
      this.destroy();

      if (this.#options.autoReconnect) {
        this.#handleReconnect();
      }
    }
  }

  /**
   * Handles reconnection after missed heartbeats
   * Per Discord documentation, a failed heartbeat should result in a reconnection
   *
   * @private
   */
  #handleReconnect(): void {
    if (this.#isReconnecting) {
      return;
    }

    this.#isReconnecting = true;
    this.#retryAttempts++;

    // Emit reconnection event
    this.#gateway.emit("reconnectionScheduled", {
      timestamp: new Date().toISOString(),
      delayMs: this.#options.reconnectDelay,
      reason: "heartbeat_timeout",
      previousAttempts: this.#retryAttempts - 1,
    });

    this.#reconnectTimeout = setTimeout(() => {
      if (this.#intervalMs > 0) {
        this.start(this.#intervalMs);
      }
    }, this.#options.reconnectDelay);
  }

  /**
   * Updates latency based on heartbeat acknowledgement
   *
   * @param now - Current timestamp
   * @private
   */
  #updateLatency(now: number): void {
    // Calculate round-trip time
    this.#latency = now - this.#lastSend;

    // Add to history for average calculation
    this.#latencyHistory.push(this.#latency);

    // Maintain maximum history size
    if (this.#latencyHistory.length > this.#options.maxHistorySize) {
      this.#latencyHistory.shift();
    }
  }
}
