import { EventEmitter } from "eventemitter3";
import { z } from "zod";

/**
 * Options for configuring the Heartbeat Manager
 */
export const HeartbeatOptions = z.object({
  /**
   * Whether to automatically restart heartbeats after a failed acknowledgement
   * @default true
   */
  autoRestart: z.boolean().default(true),

  /**
   * Number of missed heartbeats before considering the connection failed
   * @default 3
   */
  maxMissedHeartbeats: z.number().int().positive().default(3),
});

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;

/**
 * Events emitted by the Heartbeat Manager
 */
export interface HeartbeatEvents {
  /**
   * Emitted when a heartbeat is sent
   * @param timestamp Timestamp when the heartbeat was sent
   * @param sequence Last sequence number acknowledged
   */
  beat: [timestamp: number, sequence: number];

  /**
   * Emitted when a heartbeat acknowledgement is received
   * @param latency Round-trip time in milliseconds
   */
  ack: [latency: number];

  /**
   * Emitted when a heartbeat fails (no acknowledgement received in time)
   * @param missedCount Number of consecutive heartbeats missed
   */
  timeout: [missedCount: number];

  /**
   * Emitted when the connection is deemed dead due to too many missed heartbeats
   */
  dead: [];
}

/**
 * Manages heartbeats for a voice connection
 *
 * Heartbeats are required to maintain the WebSocket connection with Discord's
 * voice servers. This manager handles sending heartbeats at the interval
 * specified by the server and tracking acknowledgements.
 */
export class HeartbeatManager extends EventEmitter<HeartbeatEvents> {
  /**
   * Options for the heartbeat manager
   * @private
   */
  readonly #options: HeartbeatOptions;

  /**
   * Interval timer for sending heartbeats
   * @private
   */
  #interval: NodeJS.Timeout | null = null;

  /**
   * Timeout timer for heartbeat acknowledgements
   * @private
   */
  #ackTimeout: NodeJS.Timeout | null = null;

  /**
   * Timestamp of the last heartbeat sent
   * @private
   */
  #lastHeartbeatSent = 0;

  /**
   * Timestamp of the last heartbeat acknowledgement received
   * @private
   */
  #lastHeartbeatAcked = 0;

  /**
   * Current heartbeat interval in milliseconds
   * @private
   */
  #heartbeatInterval = 0;

  /**
   * Number of consecutive heartbeats that have failed (not been acknowledged)
   * @private
   */
  #missedHeartbeats = 0;

  /**
   * Last sequence number received from the gateway
   * @private
   */
  #lastSequence = -1;

  /**
   * Function to send heartbeat payloads to Discord
   * @private
   */
  readonly #sendHeartbeat: (sequence: number) => void;

  /**
   * Creates a new Heartbeat Manager
   *
   * @param sendHeartbeat Function that sends a heartbeat payload to Discord
   * @param options Configuration options for the heartbeat manager
   */
  constructor(
    sendHeartbeat: (sequence: number) => void,
    options: HeartbeatOptions,
  ) {
    super();
    this.#options = options;
    this.#sendHeartbeat = sendHeartbeat;
  }

  /**
   * Gets the latency (ping) of the connection
   *
   * Calculated as the time difference between sending a heartbeat and
   * receiving the acknowledgement.
   *
   * @returns Latency in milliseconds, or -1 if no heartbeats have been acknowledged
   */
  get latency(): number {
    // If we haven't sent any heartbeats yet, or haven't received any acks
    if (this.#lastHeartbeatSent === 0 || this.#lastHeartbeatAcked === 0) {
      return -1;
    }

    return this.#lastHeartbeatAcked - this.#lastHeartbeatSent;
  }

  /**
   * Gets the current heartbeat interval
   *
   * @returns Heartbeat interval in milliseconds
   */
  get interval(): number {
    return this.#heartbeatInterval;
  }

  /**
   * Updates the last sequence number received from the gateway
   *
   * @param sequence New sequence number
   */
  updateSequence(sequence: number): void {
    this.#lastSequence = sequence;
  }

  /**
   * Starts sending heartbeats at the specified interval
   *
   * @param interval Heartbeat interval in milliseconds
   */
  start(interval: number): void {
    // Clear any existing intervals
    this.stop();

    // Store the heartbeat interval
    this.#heartbeatInterval = interval;

    // Reset counters
    this.#missedHeartbeats = 0;

    // Send an initial heartbeat
    this.beat();

    // Set up interval for regular heartbeats
    this.#interval = setInterval(() => this.beat(), interval);
  }

  /**
   * Stops the heartbeat interval
   */
  stop(): void {
    // Clear the heartbeat interval
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    // Clear the acknowledgement timeout
    if (this.#ackTimeout) {
      clearTimeout(this.#ackTimeout);
      this.#ackTimeout = null;
    }
  }

  /**
   * Sends a heartbeat immediately
   *
   * This is used for both scheduled heartbeats and on-demand heartbeats
   * when requested by Discord.
   */
  beat(): void {
    // Record when we sent the heartbeat
    this.#lastHeartbeatSent = Date.now();

    // Send the heartbeat with the last sequence number
    this.#sendHeartbeat(this.#lastSequence);

    // Emit beat event
    this.emit("beat", this.#lastHeartbeatSent, this.#lastSequence);

    // Set a timeout for acknowledgement
    this.#setAckTimeout();
  }

  /**
   * Processes a heartbeat acknowledgement from Discord
   *
   * Records the acknowledgement time and calculates latency.
   */
  ack(): void {
    // Record when we received the ack
    this.#lastHeartbeatAcked = Date.now();

    // Clear the acknowledgement timeout
    if (this.#ackTimeout) {
      clearTimeout(this.#ackTimeout);
      this.#ackTimeout = null;
    }

    // Reset the missed heartbeat counter
    this.#missedHeartbeats = 0;

    // Calculate and emit the latency
    const latency = this.latency;
    if (latency >= 0) {
      this.emit("ack", latency);
    }
  }

  /**
   * Cleans up resources used by the heartbeat manager
   *
   * Stops heartbeat interval and clears all event listeners.
   */
  destroy(): void {
    // Stop heartbeats
    this.stop();

    // Clear all event listeners
    this.removeAllListeners();
  }

  /**
   * Sets a timeout for waiting for a heartbeat acknowledgement
   *
   * If no acknowledgement is received within the timeout, the heartbeat
   * is considered missed.
   *
   * @private
   */
  #setAckTimeout(): void {
    // Clear any existing timeout
    if (this.#ackTimeout) {
      clearTimeout(this.#ackTimeout);
    }

    // Set a timeout for acknowledgement
    // Use half the heartbeat interval as the timeout
    const timeoutDuration = Math.floor(this.#heartbeatInterval / 2);

    this.#ackTimeout = setTimeout(() => {
      // Increment missed heartbeat counter
      this.#missedHeartbeats++;

      // Emit timeout event
      this.emit("timeout", this.#missedHeartbeats);

      // Check if we've exceeded the maximum allowed missed heartbeats
      if (this.#missedHeartbeats >= this.#options.maxMissedHeartbeats) {
        // Connection is dead
        this.emit("dead");

        // Stop sending heartbeats
        this.stop();
      } else if (this.#options.autoRestart) {
        // If auto restart is enabled, send another heartbeat
        this.beat();
      }
    }, timeoutDuration);
  }
}
