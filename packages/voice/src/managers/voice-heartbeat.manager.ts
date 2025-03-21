import type { VoiceConnection } from "../core/index.js";
import { VoiceOpcodes } from "../types/index.js";

/**
 * Manages heartbeat intervals and tracking for voice connections
 *
 * Responsible for:
 * - Sending periodic heartbeats to maintain the voice WebSocket connection
 * - Tracking heartbeat acknowledgements and calculating latency
 * - Detecting and handling missed heartbeats
 * - Initiating reconnection when heartbeats fail
 */
export class VoiceHeartbeatManager {
  /** Voice client reference */
  readonly #connection: VoiceConnection;

  /** Interval ID for heartbeat timer */
  #interval: NodeJS.Timeout | null = null;

  /** Timestamp of last heartbeat sent */
  #lastHeartbeatSent = 0;

  /** Timestamp of last heartbeat ACK received */
  #lastHeartbeatAck = 0;

  /** Heartbeat interval in milliseconds */
  #heartbeatInterval = 0;

  /** Number of consecutive missed heartbeats */
  #missedHeartbeats = 0;

  /** Maximum number of missed heartbeats before reconnect */
  readonly #maxMissedHeartbeats: number;

  /** Whether the client is currently reconnecting */
  #reconnecting = false;

  /** Total heartbeats sent */
  #totalHeartbeatsSent = 0;

  /**
   * Creates a new voice heartbeat manager
   *
   * @param connection - Voice client instance
   * @param maxMissedHeartbeats - Maximum number of missed heartbeats before reconnect
   */
  constructor(connection: VoiceConnection, maxMissedHeartbeats = 3) {
    this.#connection = connection;
    this.#maxMissedHeartbeats = maxMissedHeartbeats;
  }

  /**
   * Gets the current heartbeat interval
   */
  get interval(): number {
    return this.#heartbeatInterval;
  }

  /**
   * Gets the current heartbeat latency
   */
  get latency(): number {
    return this.#lastHeartbeatAck - this.#lastHeartbeatSent;
  }

  /**
   * Gets the number of missed heartbeats
   */
  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  /**
   * Gets the total number of heartbeats sent
   */
  get totalHeartbeatsSent(): number {
    return this.#totalHeartbeatsSent;
  }

  /**
   * Gets whether the client is currently reconnecting
   */
  isReconnecting(): boolean {
    return this.#reconnecting;
  }

  /**
   * Gets whether heartbeating is active
   */
  isActive(): boolean {
    return this.#interval !== null;
  }

  /**
   * Starts the heartbeat interval
   *
   * @param interval - Heartbeat interval in milliseconds
   * @throws {Error} If interval is invalid or heartbeating is already active
   */
  start(interval: number): void {
    // Clean up any existing interval
    this.stop();

    if (interval <= 0) {
      throw new Error(
        `Invalid heartbeat interval: ${interval}ms (must be positive)`,
      );
    }

    this.#heartbeatInterval = interval;
    this.#lastHeartbeatAck = Date.now(); // Initialize to avoid immediate timeout

    // Use jitter to prevent thundering herd
    const initialDelay = Math.random() * interval;

    // First heartbeat after a random delay
    setTimeout(() => {
      this.sendHeartbeat();

      // Setup the interval for subsequent heartbeats
      this.#interval = setInterval(() => {
        this.#checkHeartbeat();
        this.sendHeartbeat();
      }, interval);
    }, initialDelay);
  }

  /**
   * Stops the heartbeat interval
   */
  stop(): void {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    this.#missedHeartbeats = 0;
    this.#reconnecting = false;
  }

  /**
   * Sends a heartbeat to the voice gateway
   */
  sendHeartbeat(): void {
    try {
      const currentNonce = Date.now();
      this.#lastHeartbeatSent = currentNonce;
      this.#totalHeartbeatsSent++;

      // For v8, include sequence acknowledgement
      if (this.#connection.gatewayVersion >= 8) {
        this.#connection.send(VoiceOpcodes.Heartbeat, {
          t: currentNonce,
          seq_ack: this.#connection.sequence,
        });
      } else {
        this.#connection.send(VoiceOpcodes.Heartbeat, currentNonce);
      }
    } catch (error) {
      this.#connection.emit(
        "error",
        error instanceof Error
          ? error
          : new Error(`Failed to send heartbeat: ${String(error)}`),
      );
    }
  }

  /**
   * Acknowledges a heartbeat
   */
  ackHeartbeat(): void {
    this.#lastHeartbeatAck = Date.now();
    this.#missedHeartbeats = 0;
  }

  /**
   * Destroys the heartbeat manager
   */
  destroy(): void {
    this.stop();
  }

  /**
   * Checks if heartbeats are being acknowledged
   * @private
   */
  #checkHeartbeat(): void {
    if (this.#reconnecting) {
      return;
    }

    // Don't check for missed heartbeats if we have never received an ACK
    // This happens on initial connection
    if (this.#lastHeartbeatAck === 0) {
      return;
    }

    const timeSinceLastAck = Date.now() - this.#lastHeartbeatAck;

    // Check if we've missed a heartbeat (1.5x interval is a good threshold)
    if (timeSinceLastAck > this.#heartbeatInterval * 1.5) {
      this.#missedHeartbeats++;

      // Emit heartbeat timeout event
      this.#connection.emit("heartbeatTimeout", {
        missedHeartbeats: this.#missedHeartbeats,
        maxRetries: this.#maxMissedHeartbeats,
        timestamp: new Date().toISOString(),
      });

      if (this.#missedHeartbeats >= this.#maxMissedHeartbeats) {
        this.#handleMissedHeartbeats();
      }
    }
  }

  /**
   * Handles missed heartbeats by requesting reconnection
   * @private
   */
  #handleMissedHeartbeats(): void {
    if (this.#reconnecting) {
      return;
    }

    this.#reconnecting = true;

    // Stop heartbeating
    this.stop();

    // Request reconnection from the voice client
    this.#connection
      .reconnect()
      .catch((error) => {
        this.#connection.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
        );
      })
      .finally(() => {
        this.#reconnecting = false;
      });
  }
}
