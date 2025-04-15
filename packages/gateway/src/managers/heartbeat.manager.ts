import { z } from "zod";
import type { Gateway } from "../core/index.js";
import { GatewayOpcodes } from "../types/index.js";

/**
 * Options for configuring Gateway heartbeat behavior
 *
 * Heartbeats are essential for maintaining the WebSocket connection to Discord's Gateway.
 * They serve as a periodic health check that ensures the connection remains active and
 * allows measuring connection latency (ping).
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#heartbeating}
 *
 * @example
 * ```ts
 * // Default configuration for most bots
 * const defaultOptions: HeartbeatOptions = {
 *   maxRetries: 3,
 *   autoReconnect: true,
 *   reconnectDelay: 1000,
 *   minInterval: 1
 * };
 *
 * // More aggressive heartbeat configuration for unstable networks
 * const aggressiveOptions: HeartbeatOptions = {
 *   maxRetries: 2,               // Reconnect sooner if heartbeats fail
 *   autoReconnect: true,
 *   reconnectDelay: 500,         // Faster reconnection
 *   minInterval: 1
 * };
 * ```
 */
export const HeartbeatOptions = z.object({
  /**
   * Maximum number of consecutive heartbeat failures before triggering a reconnection
   *
   * If this number of heartbeats are missed without acknowledgement, the connection
   * will be considered dead and a reconnection attempt will be initiated.
   *
   * Discord documentation recommends assuming the connection is zombied after
   * a few failures. A value of 3 is a good default for most applications.
   *
   * @default 3
   */
  maxRetries: z.number().int().positive().default(3),

  /**
   * Whether to automatically attempt reconnection after heartbeat failures
   *
   * When true, the client will automatically attempt to reconnect after
   * reaching the maxRetries limit. When false, the client will simply
   * report the failure but not attempt reconnection.
   *
   * For most applications, this should be true. Set to false only if you
   * want manual control over reconnection logic.
   *
   * @default true
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Delay in milliseconds before attempting reconnection after heartbeat failure
   *
   * Provides a buffer before reconnection attempts to prevent rapid reconnection cycles
   * (also known as "reconnection storms"). This delay helps distribute reconnection
   * attempts over time if multiple clients lose connection simultaneously.
   *
   * @default 1000
   */
  reconnectDelay: z.number().int().positive().default(1000),

  /**
   * Minimum allowed heartbeat interval in milliseconds
   *
   * Safety check to prevent extremely low heartbeat intervals that could
   * cause excessive traffic or resource usage. Discord typically sends
   * intervals around 41.25 seconds (41250ms), but this safeguard prevents
   * errors if Discord were to send an unusually small value.
   *
   * @default 1
   */
  minInterval: z.number().int().positive().default(1),
});

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;

/**
 * Manages Gateway heartbeat operations
 *
 * This class implements Discord's heartbeating protocol which keeps the WebSocket connection alive.
 * Per Discord documentation:
 * - Clients must send heartbeats at the interval specified in the Hello message
 * - Discord responds with Heartbeat ACK messages to confirm receipt
 * - If a client doesn't receive an ACK within the heartbeat interval, it should reconnect
 * - Latency is calculated based on the time between sending a heartbeat and receiving an ACK
 *
 * The heartbeat flow typically works like this:
 * 1. Client connects to Discord Gateway and receives Hello message with heartbeat_interval
 * 2. Client sends periodic Heartbeat messages at the specified interval
 * 3. Discord responds with Heartbeat ACK messages
 * 4. If acknowledgements are missed, the client reconnects
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#sending-heartbeats}
 *
 * @example
 * ```ts
 * // Using the heartbeat manager within a Gateway implementation
 * const gateway = new Gateway(token, intents);
 * const heartbeat = new HeartbeatManager(gateway, {
 *   maxRetries: 3,
 *   autoReconnect: true
 * });
 *
 * // When receiving Discord's Hello message
 * connection.on('hello', (data) => {
 *   const interval = data.heartbeat_interval;
 *   heartbeat.start(interval);
 * });
 *
 * // When receiving a Heartbeat ACK
 * connection.on('heartbeatAck', () => {
 *   heartbeat.ackHeartbeat();
 * });
 *
 * // Getting connection status
 * console.log(`Current latency: ${heartbeat.latency}ms`);
 * ```
 */
export class HeartbeatManager {
  /** Current latency in milliseconds (round-trip time for last heartbeat) */
  #latency = 0;

  /** Number of consecutive missed heartbeats */
  #missedHeartbeats = 0;

  /** Timestamp of last heartbeat send (in milliseconds since epoch) */
  #lastSend = 0;

  /** Current heartbeat interval in milliseconds (from Discord) */
  #intervalMs = 0;

  /** Whether the last heartbeat was acknowledged by Discord */
  #isAcked = true;

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
   * @param gateway - The parent Gateway instance that manages the WebSocket connection
   * @param options - Heartbeat configuration options to customize behavior
   *
   * @example
   * ```ts
   * const gateway = new Gateway(token, intents);
   * const heartbeat = new HeartbeatManager(gateway, {
   *   maxRetries: 3,
   *   autoReconnect: true
   * });
   * ```
   */
  constructor(gateway: Gateway, options: HeartbeatOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Gets the current latency in milliseconds
   *
   * This is the round-trip time between sending the most recent
   * heartbeat and receiving an acknowledgement from Discord.
   *
   * @returns The current latency in milliseconds
   *
   * @example
   * ```ts
   * console.log(`Current ping: ${heartbeat.latency}ms`);
   * ```
   */
  get latency(): number {
    return this.#latency;
  }

  /**
   * Gets the number of consecutive missed heartbeats
   *
   * This counter increases when heartbeats are sent but
   * not acknowledged, and resets when an acknowledgement
   * is received.
   *
   * @returns The number of consecutive missed heartbeats
   *
   * @example
   * ```ts
   * if (heartbeat.missedHeartbeats > 0) {
   *   console.log(`Warning: ${heartbeat.missedHeartbeats} missed heartbeats`);
   * }
   * ```
   */
  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  /**
   * Gets the current heartbeat interval in milliseconds
   *
   * This is the interval provided by Discord in the Hello packet,
   * typically around 41.25 seconds (41250ms).
   *
   * @returns The current heartbeat interval in milliseconds
   */
  get intervalMs(): number {
    return this.#intervalMs;
  }

  /**
   * Gets the timestamp of the last heartbeat send
   *
   * This is the timestamp (in milliseconds since epoch) when
   * the most recent heartbeat was sent to Discord.
   *
   * @returns The timestamp of the last heartbeat send
   *
   * @example
   * ```ts
   * const timeSinceLastBeat = Date.now() - heartbeat.lastSend;
   * console.log(`Time since last heartbeat: ${timeSinceLastBeat}ms`);
   * ```
   */
  get lastSend(): number {
    return this.#lastSend;
  }

  /**
   * Checks if the last heartbeat was acknowledged by Discord
   *
   * Returns true if the most recent heartbeat was acknowledged,
   * or if no heartbeats have been sent yet.
   *
   * @returns True if the last heartbeat was acknowledged
   *
   * @example
   * ```ts
   * if (!heartbeat.isAcked) {
   *   console.log("Waiting for Discord to acknowledge heartbeat...");
   * }
   * ```
   */
  get isAcked(): boolean {
    return this.#isAcked;
  }

  /**
   * Checks if the heartbeat service is currently running
   *
   * Returns true if heartbeats are being sent regularly,
   * false if the service has been destroyed or not started.
   *
   * @returns True if the heartbeat service is running
   *
   * @example
   * ```ts
   * if (!heartbeat.isRunning) {
   *   console.log("Heartbeat service is not running!");
   *   heartbeat.start(41250);
   * }
   * ```
   */
  get isRunning(): boolean {
    return this.#interval !== null;
  }

  /**
   * Checks if a reconnection is in progress
   *
   * Returns true if the manager is currently attempting to
   * reconnect after missed heartbeats.
   *
   * @returns True if a reconnection is in progress
   */
  get isReconnecting(): boolean {
    return this.#reconnectTimeout !== null;
  }

  /**
   * Starts the heartbeat service with the interval specified by Discord
   *
   * This method should be called after receiving Discord's Hello message,
   * which provides the appropriate heartbeat interval. It implements
   * Discord's recommended jitter to prevent thundering herd problems.
   *
   * @param interval - Heartbeat interval in milliseconds from Discord's Hello message
   * @throws If the interval is too small or the service is already running
   *
   * @example
   * ```ts
   * // Handle Discord's Hello message
   * gateway.on('hello', (data) => {
   *   const heartbeatInterval = data.d.heartbeat_interval;
   *   try {
   *     heartbeat.start(heartbeatInterval);
   *     console.log(`Started heartbeat with interval ${heartbeatInterval}ms`);
   *   } catch (error) {
   *     console.error(`Failed to start heartbeat: ${error.message}`);
   *   }
   * });
   * ```
   */
  start(interval: number): void {
    if (interval <= this.#options.minInterval) {
      throw new Error(
        `Invalid heartbeat interval: ${interval}ms (minimum: ${this.#options.minInterval}ms)`,
      );
    }

    if (this.isRunning) {
      throw new Error("Heartbeat service is already running");
    }

    this.#startHeartbeat(interval);
  }

  /**
   * Destroys the heartbeat service and resets all state
   *
   * This method:
   * - Stops sending heartbeats
   * - Cancels any pending reconnection attempts
   * - Resets all counters and metrics
   *
   * It should be called when closing the Gateway connection
   * or when preparing to reconnect with a new connection.
   *
   * @example
   * ```ts
   * // When shutting down the bot
   * function shutdown() {
   *   console.log("Destroying heartbeat service...");
   *   heartbeat.destroy();
   *   gateway.disconnect();
   * }
   *
   * // When reconnecting with a new WebSocket
   * function reconnect() {
   *   heartbeat.destroy();
   *   gateway.connect();
   *   // heartbeat.start() will be called when Hello is received
   * }
   * ```
   */
  destroy(): void {
    this.#latency = 0;
    this.#missedHeartbeats = 0;
    this.#lastSend = 0;
    this.#intervalMs = 0;
    this.#isAcked = true;

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
   *
   * This method should be called when Discord responds with a Heartbeat ACK
   * (opcode 11). It updates the latency metrics, resets missed heartbeat
   * counters, and emits an appropriate event.
   *
   * @example
   * ```ts
   * // Handle Discord's Heartbeat ACK
   * gateway.on('heartbeatAck', () => {
   *   heartbeat.ackHeartbeat();
   *   console.log(`Heartbeat acknowledged, latency: ${heartbeat.latency}ms`);
   * });
   * ```
   */
  ackHeartbeat(): void {
    const now = Date.now();
    this.#handleAck();
    this.#latency = now - this.#lastSend;

    this.#gateway.emit("heartbeatAcknowledge", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
      latencyMs: this.#latency,
    });
  }

  /**
   * Sends a heartbeat to the gateway
   *
   * This method sends a heartbeat (opcode 1) with the current sequence number.
   * If the previous heartbeat wasn't acknowledged, it will count as a missed
   * heartbeat and potentially trigger reconnection.
   *
   * Typically, you don't need to call this method directly as it's
   * automatically called at the interval specified by Discord.
   *
   * @example
   * ```ts
   * // Manually send a heartbeat (usually not necessary)
   * if (needToConfirmConnection) {
   *   heartbeat.sendHeartbeat();
   * }
   * ```
   */
  sendHeartbeat(): void {
    this.#lastSend = Date.now();

    if (!this.#isAcked) {
      this.#handleMissedHeartbeat();
      return;
    }

    this.#isAcked = false;

    this.#gateway.emit("heartbeatSent", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
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
    if (this.#reconnectTimeout !== null) {
      return;
    }

    this.#reconnectTimeout = setTimeout(() => {
      if (this.#intervalMs > 0) {
        this.start(this.#intervalMs);
      }
    }, this.#options.reconnectDelay);
  }
}
