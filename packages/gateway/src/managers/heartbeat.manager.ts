import { z } from "zod/v4";
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
 */
export class HeartbeatManager {
  /**
   * Tracks the round-trip time in milliseconds between sending a heartbeat and receiving an ACK
   * Used to monitor connection health and report network performance metrics
   * @private
   */
  #latency = 0;

  /**
   * Tracks how many consecutive heartbeats have been sent without receiving an ACK
   * Critical for determining when to consider a connection as failed/zombied
   * @private
   */
  #missedHeartbeats = 0;

  /**
   * Timestamp when the most recent heartbeat was sent
   * Used for calculating latency and tracking heartbeat state
   * @private
   */
  #lastSend = 0;

  /**
   * The interval in milliseconds between heartbeats as specified by Discord
   * Typically around 41.25 seconds (41250ms) but can vary
   * @private
   */
  #intervalMs = 0;

  /**
   * Flag indicating whether the last sent heartbeat has been acknowledged
   * Used to track heartbeat state and detect missed heartbeats
   * @private
   */
  #isAcked = true;

  /**
   * NodeJS interval reference for the recurring heartbeat timer
   * Used to clean up the interval when the heartbeat manager is destroyed
   * @private
   */
  #interval: NodeJS.Timeout | null = null;

  /**
   * NodeJS timeout reference for pending reconnection attempts
   * Used to track and manage reconnection state
   * @private
   */
  #reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Reference to the parent Gateway instance
   * Used to send heartbeats and emit events
   * @private
   */
  readonly #gateway: Gateway;

  /**
   * Configuration options for the heartbeat manager
   * Controls behavior like retry attempts and reconnection delays
   * @private
   */
  readonly #options: HeartbeatOptions;

  /**
   * Creates a new HeartbeatManager
   *
   * @param gateway - The parent Gateway instance that manages the WebSocket connection
   * @param options - Heartbeat configuration options to customize behavior
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
   * A high or increasing latency may indicate network issues that
   * could eventually lead to connection problems.
   *
   * @returns The current latency in milliseconds
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
   * This value is crucial for connection health monitoring as
   * consecutive missed heartbeats indicate potential connection issues.
   *
   * @returns The number of consecutive missed heartbeats
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
   * This value is determined by Discord and should be respected to
   * maintain proper connection health.
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
   * Useful for debugging and monitoring heartbeat timing issues.
   *
   * @returns The timestamp of the last heartbeat send
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
   * Critical for monitoring connection health - an unacknowledged
   * heartbeat may indicate connection issues with Discord's Gateway.
   *
   * @returns True if the last heartbeat was acknowledged
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
   * Useful for checking the operational status of the heartbeat
   * service, especially after reconnection attempts.
   *
   * @returns True if the heartbeat service is running
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
   * Useful for tracking connection state and preventing duplicate
   * reconnection attempts.
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
   * @throws {Error} If the interval is too small or the service is already running
   */
  start(interval: number): void {
    // Validate that the interval meets minimum requirements
    if (interval <= this.#options.minInterval) {
      throw new Error(
        `Invalid heartbeat interval: ${interval}ms (minimum: ${this.#options.minInterval}ms)`,
      );
    }

    // Prevent duplicate running instances
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
   */
  destroy(): void {
    // Reset all internal state metrics
    this.#latency = 0;
    this.#missedHeartbeats = 0;
    this.#lastSend = 0;
    this.#intervalMs = 0;
    this.#isAcked = true;

    // Clear the heartbeat interval if it exists
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    // Clear any pending reconnection timeout
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
   * The calculated latency value is important for monitoring connection
   * quality and can be used for diagnostics or user-facing ping displays.
   */
  ackHeartbeat(): void {
    const now = Date.now();
    this.#handleAck();
    // Calculate the round-trip time as the difference between now and when the heartbeat was sent
    this.#latency = now - this.#lastSend;

    // Emit an event with detailed information about this acknowledgement
    this.#gateway.emit("heartbeatAcknowledge", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
      latency: this.#latency,
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
   * Manual heartbeats can be useful for testing connection health or
   * resynchronizing with Discord after unusual events.
   */
  sendHeartbeat(): void {
    // Record the time this heartbeat was sent for latency calculation
    this.#lastSend = Date.now();

    // Check if the previous heartbeat was acknowledged
    if (!this.#isAcked) {
      // Previous heartbeat wasn't acknowledged - handle as a missed heartbeat
      this.#handleMissedHeartbeat();
      return;
    }

    // Mark as unacknowledged until we receive an ACK
    this.#isAcked = false;

    // Emit event for logging/monitoring
    this.#gateway.emit("heartbeatSent", {
      timestamp: new Date().toISOString(),
      sequence: this.#gateway.sequence,
    });

    // Send the actual heartbeat to Discord with the current sequence number
    this.#gateway.send(GatewayOpcodes.Heartbeat, this.#gateway.sequence);
  }

  /**
   * Starts the heartbeat with the specified interval
   * Implements Discord's recommended jitter to prevent thundering herd
   *
   * The jitter added to the initial heartbeat helps distribute heartbeats
   * across time when multiple clients connect simultaneously, preventing
   * server load spikes (thundering herd problem).
   *
   * @param interval - Heartbeat interval in milliseconds
   * @private
   */
  #startHeartbeat(interval: number): void {
    // Clean up existing timers and reset state
    this.destroy();

    // Store the heartbeat interval for future reference
    this.#intervalMs = interval;

    // Use jitter to prevent thundering herd problem
    // Discord documentation recommends adding random jitter to the first heartbeat
    // This distributes the load when many clients connect simultaneously
    const initialDelay = interval * Math.random();

    // Send first heartbeat after the jittered delay, then set up regular interval
    setTimeout(() => {
      // Send initial heartbeat
      this.sendHeartbeat();

      // Set up regular heartbeat interval
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
   * Called when Discord acknowledges a heartbeat, indicating
   * the connection is healthy.
   *
   * @private
   */
  #handleAck(): void {
    // Mark the heartbeat as acknowledged
    this.#isAcked = true;

    // Reset missed heartbeat counter since we've received an ACK
    this.#missedHeartbeats = 0;
  }

  /**
   * Handles a missed heartbeat
   *
   * After too many missed heartbeats, the connection is considered zombied
   * and should be terminated per Discord guidelines. This method increments
   * the missed heartbeat counter and triggers reconnection if necessary.
   *
   * A zombied connection is one where the client can send data but not receive,
   * or vice versa, and needs to be terminated and re-established.
   *
   * @private
   */
  #handleMissedHeartbeat(): void {
    // Increment missed heartbeat counter
    this.#missedHeartbeats++;

    // Emit event with detailed information about the missed heartbeat
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
      // Connection is considered zombied, destroy heartbeat service
      this.destroy();

      // Attempt reconnection if configured to do so
      if (this.#options.autoReconnect) {
        this.#handleReconnect();
      }
    }
  }

  /**
   * Handles reconnection after missed heartbeats
   *
   * Per Discord documentation, a failed heartbeat should result in a reconnection.
   * This method sets up a delayed reconnection attempt to avoid connection storms
   * and implements the reconnect delay specified in options.
   *
   * @private
   */
  #handleReconnect(): void {
    // Only set up reconnection if there isn't one already in progress
    if (this.#reconnectTimeout !== null) {
      return;
    }

    // Schedule reconnection after the configured delay
    this.#reconnectTimeout = setTimeout(() => {
      // Only attempt to restart heartbeat if we have a valid interval
      if (this.#intervalMs > 0) {
        this.start(this.#intervalMs);
      }
    }, this.#options.reconnectDelay);
  }
}
