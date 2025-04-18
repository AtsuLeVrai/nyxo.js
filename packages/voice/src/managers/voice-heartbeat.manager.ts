import { z } from "zod";
import { type VoiceClient, VoiceClientState } from "../core/index.js";
import { VoiceOpcodes } from "../types/index.js";

/**
 * Options for configuring voice heartbeat behavior
 */
export const VoiceHeartbeatOptions = z.object({
  /**
   * Maximum number of consecutive missed heartbeats before considering the connection lost
   * @default 3
   */
  maxMissedHeartbeats: z.number().int().positive().default(3),

  /**
   * If true, automatically attempts to reconnect after missed heartbeats
   * @default true
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Delay in ms before attempting to reconnect after missed heartbeats
   * @default 1000
   */
  reconnectDelay: z.number().int().positive().default(1000),

  /**
   * Maximum random jitter (as percentage of interval) to add to intervals
   * Helps prevent "thundering herd" problems with many clients
   * @default 0.1 (10%)
   */
  jitterFactor: z.number().min(0).max(0.5).default(0.1),
});

export type VoiceHeartbeatOptions = z.infer<typeof VoiceHeartbeatOptions>;

/**
 * Manager for voice gateway heartbeats
 *
 * This class handles the periodic sending of heartbeats required to maintain
 * the WebSocket voice connection with Discord. It also monitors acknowledgements
 * to detect connection problems.
 *
 * Main features:
 * - Automatic sending of heartbeats at the interval specified by Discord
 * - Tracking acknowledgements (ACK) and calculating latency
 * - Detecting missed heartbeats and automatic reconnection
 * - Support for V8+ protocol with sequence tracking for buffered resume
 * - Emitting events for connection status tracking
 *
 * This manager is a critical part of the voice infrastructure as Discord
 * closes connections that don't properly maintain their heartbeats.
 */
export class VoiceHeartbeatManager {
  /**
   * Timestamp of the last heartbeat sent (ms)
   * Used to calculate latency
   * @private
   */
  #lastSendTime = 0;

  /**
   * Interval in ms between heartbeats
   * Set by Discord in the Hello opcode
   * @private
   */
  #interval = 0;

  /**
   * JavaScript timer for periodic heartbeat sending
   * @private
   */
  #heartbeatTimer: NodeJS.Timeout | null = null;

  /**
   * Timer for automatic reconnection
   * @private
   */
  #reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Incremental nonce used in heartbeats
   * @private
   */
  #nonce = 0;

  /**
   * If the last sent heartbeat received an ACK
   * @private
   */
  #acknowledged = true;

  /**
   * Counter for consecutive missed heartbeats
   * @private
   */
  #missedHeartbeats = 0;

  /**
   * Calculated latency between sending heartbeat and receiving ACK (ms)
   * @private
   */
  #latency = 0;

  /**
   * Sequence number of the last received message
   * For V8+ session resume support
   * @private
   */
  #lastSeqAck = -1;

  /**
   * Voice gateway client that sends heartbeats
   * @private
   */
  readonly #voice: VoiceClient;

  /**
   * Configured options for this manager
   * @private
   */
  readonly #options: VoiceHeartbeatOptions;

  /**
   * Creates a new voice heartbeat manager
   *
   * @param voice - Voice gateway client that will send heartbeats
   * @param options - Configuration options for heartbeat behavior
   */
  constructor(voice: VoiceClient, options: VoiceHeartbeatOptions) {
    this.#voice = voice;
    this.#options = options;
  }

  /**
   * Gets the current latency in milliseconds
   * This is the round-trip time between sending a heartbeat and receiving the ACK
   *
   * @returns The latency in milliseconds
   */
  get latency(): number {
    return this.#latency;
  }

  /**
   * Gets the number of consecutive missed heartbeats
   *
   * @returns The number of missed heartbeats
   */
  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  /**
   * Checks if the last heartbeat was acknowledged
   *
   * @returns true if the last heartbeat received an ACK
   */
  get isAcknowledged(): boolean {
    return this.#acknowledged;
  }

  /**
   * Checks if the heartbeat manager is active
   *
   * @returns true if heartbeats are active
   */
  get isActive(): boolean {
    return this.#heartbeatTimer !== null;
  }

  /**
   * Starts sending heartbeats at the specified interval
   *
   * @param interval - Interval in ms between heartbeats (provided by Discord)
   * @throws {Error} If the interval is invalid or if heartbeats are already active
   */
  start(interval: number): void {
    // Validate the interval
    if (interval <= 0) {
      throw new Error(`Invalid heartbeat interval: ${interval}ms`);
    }

    // Stop existing heartbeats if present
    this.destroy();

    // Store the interval
    this.#interval = interval;

    // Reset the state
    this.#lastSendTime = 0;
    this.#acknowledged = true;
    this.#missedHeartbeats = 0;

    // Calculate an initial delay with jitter to avoid all clients synchronizing
    const jitterAmount = interval * this.#options.jitterFactor;
    const initialDelay = Math.random() * jitterAmount;

    // Start with an initial delay to prevent "thundering herd"
    setTimeout(() => {
      // Send a first heartbeat
      this.sendHeartbeat();

      // Set up the regular interval for subsequent heartbeats
      this.#heartbeatTimer = setInterval(
        () => this.sendHeartbeat(),
        this.#interval,
      );
    }, initialDelay);
  }

  /**
   * Immediately sends a heartbeat to the server
   * Usually called automatically by the timer, but can be used
   * for special situations like an explicit request from the server
   *
   * @throws {Error} If the gateway client is not connected
   */
  sendHeartbeat(): void {
    // Check if the client is ready to send
    if (
      !this.#voice.isWsConnected ||
      this.#voice.state === VoiceClientState.Failed ||
      this.#voice.state === VoiceClientState.Disconnecting ||
      this.#voice.state === VoiceClientState.Disconnected
    ) {
      // Stop the timer instead of throwing an exception
      this.destroy();
      return;
    }

    // Check if the previous heartbeat was acknowledged
    if (!this.#acknowledged) {
      this.#handleMissedHeartbeat();
      return;
    }

    // Mark as unacknowledged until ACK is received
    this.#acknowledged = false;

    // Record the send time for latency calculation
    this.#lastSendTime = Date.now();

    // Increment the nonce
    const nonce = this.#nonce++;

    // Send the heartbeat
    this.#voice.send(VoiceOpcodes.Heartbeat, {
      t: nonce,
      seq_ack: this.#lastSeqAck >= 0 ? this.#lastSeqAck : undefined,
    });
  }

  /**
   * Processes receipt of a heartbeat acknowledgement
   *
   * @param sequence - Optional sequence number of the message
   */
  acknowledgeHeartbeat(sequence?: number): void {
    // Check if we're waiting for an ACK
    if (!this.#acknowledged) {
      // Mark as acknowledged
      this.#acknowledged = true;

      // Reset the missed heartbeats counter
      this.#missedHeartbeats = 0;

      // Calculate latency
      const receiveTime = Date.now();
      this.#latency = receiveTime - this.#lastSendTime;
    }

    // Update the sequence number if provided
    // This is done even if we weren't waiting for an ACK, as sequence
    // numbers can come from any message
    if (sequence !== undefined && sequence > -1) {
      this.#lastSeqAck = sequence;
    }
  }

  /**
   * Sets the sequence number of the last received message
   * Used for V8+ session resume support
   *
   * @param sequence - Sequence number to set
   */
  setSequenceAck(sequence: number): void {
    if (sequence > this.#lastSeqAck) {
      this.#lastSeqAck = sequence;
    }
  }

  /**
   * Gets the sequence number of the last acknowledged message
   * Used during session resuming
   *
   * @returns The sequence number or -1 if none
   */
  getSequenceAck(): number {
    return this.#lastSeqAck;
  }

  /**
   * Releases all resources used by this manager
   */
  destroy(): void {
    // Stop the heartbeat interval
    if (this.#heartbeatTimer) {
      clearInterval(this.#heartbeatTimer);
      this.#heartbeatTimer = null;
    }

    // Stop any pending reconnection
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }

    // Reset state
    this.#interval = 0;
    this.#acknowledged = true;
    this.#missedHeartbeats = 0;
  }

  /**
   * Handles logic when a heartbeat is missed
   * @private
   */
  #handleMissedHeartbeat(): void {
    // Increment the counter
    this.#missedHeartbeats++;

    // Check if we need to reconnect
    const willReconnect =
      this.#options.autoReconnect &&
      this.#missedHeartbeats >= this.#options.maxMissedHeartbeats;

    if (willReconnect) {
      this.#triggerReconnect();
    }
  }

  /**
   * Triggers a reconnection after missed heartbeats
   * @private
   */
  #triggerReconnect(): void {
    // Stop current heartbeats
    if (this.#heartbeatTimer) {
      clearInterval(this.#heartbeatTimer);
      this.#heartbeatTimer = null;
    }

    // Avoid multiple reconnections
    if (this.#reconnectTimer) {
      return;
    }

    // Set up reconnection
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;

      // If the interval is known, restart heartbeats
      if (this.#interval > 0) {
        this.start(this.#interval);
      }
    }, this.#options.reconnectDelay);
  }
}
