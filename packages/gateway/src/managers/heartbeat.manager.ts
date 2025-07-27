import { z } from "zod";
import type { Gateway } from "../core/index.js";
import { GatewayOpcodes } from "../types/index.js";

/**
 * Configuration options for Gateway heartbeat behavior.
 * Controls heartbeat timing, retries, and reconnection behavior.
 *
 * @public
 */
export const HeartbeatOptions = z.object({
  /**
   * Maximum consecutive heartbeat failures before triggering reconnection.
   * Discord recommends assuming connection is zombied after a few failures.
   *
   * @default 3
   */
  maxRetries: z.number().int().positive().default(3),

  /**
   * Whether to automatically reconnect after heartbeat failures.
   * When false, failures are reported but no reconnection is attempted.
   *
   * @default true
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Delay in milliseconds before attempting reconnection.
   * Provides buffer to prevent rapid reconnection cycles.
   *
   * @default 1000
   */
  reconnectDelay: z.number().int().positive().default(1000),
});

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;

/**
 * Manages Gateway heartbeat operations for connection health monitoring.
 * Implements Discord's heartbeating protocol to keep WebSocket connections alive.
 *
 * @example
 * ```typescript
 * const heartbeat = new HeartbeatManager(gateway, {
 *   maxRetries: 3,
 *   autoReconnect: true
 * });
 *
 * heartbeat.start(41250); // Start with Discord's interval
 * console.log(`Current latency: ${heartbeat.latency}ms`);
 * ```
 *
 * @public
 */
export class HeartbeatManager {
  /**
   * Current latency in milliseconds.
   * Round-trip time between heartbeat send and acknowledgement.
   *
   * @public
   */
  latency = 0;

  /**
   * Number of consecutive missed heartbeats.
   * Counter increases when heartbeats aren't acknowledged.
   *
   * @public
   */
  missedHeartbeats = 0;

  /**
   * Current heartbeat interval in milliseconds.
   * Interval provided by Discord in Hello packet.
   *
   * @public
   */
  intervalMs = 0;

  /**
   * Timestamp of last heartbeat send.
   * Used for latency calculation and debugging.
   *
   * @public
   */
  lastSend = 0;

  /**
   * Whether last heartbeat was acknowledged by Discord.
   * Critical for monitoring connection health.
   *
   * @public
   */
  isAcked = true;

  /**
   * NodeJS interval reference for recurring heartbeat timer.
   * Used for cleanup when manager is destroyed.
   *
   * @internal
   */
  #interval: NodeJS.Timeout | null = null;

  /**
   * NodeJS timeout reference for pending reconnection attempts.
   * Used to track and manage reconnection state.
   *
   * @internal
   */
  #reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Initial timeout reference for first heartbeat send.
   * Used to implement jitter on first heartbeat.
   *
   * @internal
   */
  #initialTimeout: NodeJS.Timeout | null = null;

  /**
   * Reference to parent Gateway instance.
   * Used to send heartbeats and emit events.
   *
   * @readonly
   * @internal
   */
  readonly #gateway: Gateway;

  /**
   * Configuration options for heartbeat manager.
   * Controls retry attempts and reconnection delays.
   *
   * @readonly
   * @internal
   */
  readonly #options: HeartbeatOptions;

  /**
   * Creates a new HeartbeatManager.
   * Initializes heartbeat management with specified configuration.
   *
   * @param gateway - Parent Gateway instance managing WebSocket connection
   * @param options - Heartbeat configuration options
   *
   * @example
   * ```typescript
   * const heartbeat = new HeartbeatManager(gateway, {
   *   maxRetries: 5,
   *   autoReconnect: true,
   *   reconnectDelay: 2000
   * });
   * ```
   *
   * @public
   */
  constructor(gateway: Gateway, options: HeartbeatOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Checks if heartbeat service is currently running.
   * Returns true if heartbeats are being sent regularly.
   *
   * @returns True if heartbeat service is running
   *
   * @public
   */
  get isRunning(): boolean {
    return this.#interval !== null;
  }

  /**
   * Checks if reconnection is in progress.
   * Returns true if manager is attempting to reconnect.
   *
   * @returns True if reconnection is in progress
   *
   * @public
   */
  get isReconnecting(): boolean {
    return this.#reconnectTimeout !== null;
  }

  /**
   * Starts heartbeat service with Discord's specified interval.
   * Implements jitter to prevent thundering herd problems.
   *
   * @param interval - Heartbeat interval in milliseconds from Hello message
   *
   * @throws {Error} If interval is invalid or service is already running
   *
   * @example
   * ```typescript
   * heartbeat.start(41250); // Discord's typical interval
   * ```
   *
   * @public
   */
  start(interval: number): void {
    if (this.isRunning) {
      throw new Error("Heartbeat service is already running");
    }

    this.destroy();
    this.intervalMs = interval;

    const initialDelay = interval * Math.random();

    this.#initialTimeout = setTimeout(() => {
      this.sendHeartbeat();
      this.#interval = setInterval(() => this.sendHeartbeat(), this.intervalMs);
    }, initialDelay);
  }

  /**
   * Destroys heartbeat service and resets all state.
   * Stops heartbeats, cancels reconnections, and resets metrics.
   *
   * @example
   * ```typescript
   * heartbeat.destroy();
   * // Service is now stopped and state is reset
   * ```
   *
   * @public
   */
  destroy(): void {
    this.latency = 0;
    this.missedHeartbeats = 0;
    this.lastSend = 0;
    this.intervalMs = 0;
    this.isAcked = true;

    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }

    if (this.#initialTimeout) {
      clearTimeout(this.#initialTimeout);
      this.#initialTimeout = null;
    }
  }

  /**
   * Acknowledges heartbeat and calculates latency.
   * Called when Discord responds with Heartbeat ACK.
   *
   * @example
   * ```typescript
   * // Called automatically when ACK received
   * heartbeat.ackHeartbeat();
   * console.log(`Latency: ${heartbeat.latency}ms`);
   * ```
   *
   * @public
   */
  ackHeartbeat(): void {
    const now = Date.now();
    this.#handleAck();
    this.latency = now - this.lastSend;

    this.#gateway.emit("heartbeatAcknowledge", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
      latency: this.latency,
    });
  }

  /**
   * Sends heartbeat to the gateway.
   * Automatically called at Discord's specified interval.
   *
   * @example
   * ```typescript
   * // Manual heartbeat for testing
   * heartbeat.sendHeartbeat();
   * ```
   *
   * @public
   */
  sendHeartbeat(): void {
    this.lastSend = Date.now();

    if (!this.isAcked) {
      this.#handleMissedHeartbeat();
      return;
    }

    this.isAcked = false;

    this.#gateway.emit("heartbeatSent", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
    });

    this.#gateway.send(GatewayOpcodes.Heartbeat, this.#gateway.sequence);
  }

  /**
   * Handles heartbeat acknowledgement.
   * Resets missed heartbeat counters and reconnection status.
   *
   * @internal
   */
  #handleAck(): void {
    this.isAcked = true;
    this.missedHeartbeats = 0;
  }

  /**
   * Handles missed heartbeat.
   * Increments counter and triggers reconnection if necessary.
   *
   * @internal
   */
  #handleMissedHeartbeat(): void {
    this.missedHeartbeats++;

    this.#gateway.emit("heartbeatTimeout", {
      timestamp: new Date().toISOString(),
      missedCount: this.missedHeartbeats,
      maxRetries: this.#options.maxRetries,
      willReconnect:
        this.missedHeartbeats >= this.#options.maxRetries &&
        this.#options.autoReconnect,
    });

    if (this.missedHeartbeats >= this.#options.maxRetries) {
      this.destroy();

      if (this.#options.autoReconnect) {
        this.#handleReconnect();
      }
    }
  }

  /**
   * Handles reconnection after missed heartbeats.
   * Sets up delayed reconnection to avoid connection storms.
   *
   * @internal
   */
  #handleReconnect(): void {
    if (this.#reconnectTimeout !== null) {
      return;
    }

    this.#reconnectTimeout = setTimeout(() => {
      this.#reconnectTimeout = null;

      if (this.intervalMs > 0) {
        this.start(this.intervalMs);
      }
    }, this.#options.reconnectDelay);
  }
}
