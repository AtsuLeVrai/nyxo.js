import type { VoiceConnection } from "../core/index.js";
import { VoiceOpcodes } from "../types/index.js";

/**
 * Manages heartbeat intervals and tracking for voice connections
 *
 * Tracks missed heartbeats and handles reconnection when necessary
 */
export class VoiceHeartbeatManager {
  /** Voice client reference */
  readonly #connection: VoiceConnection;

  /** Interval ID for heartbeat */
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

  /** Nonce for next heartbeat */
  #nonce = 0;

  /** Whether the client is currently reconnecting */
  #reconnecting = false;

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
   * Gets whether the client is currently reconnecting
   */
  isReconnecting(): boolean {
    return this.#reconnecting;
  }

  /**
   * Starts the heartbeat interval
   *
   * @param interval - Heartbeat interval in milliseconds
   */
  start(interval: number): void {
    this.stop();

    this.#heartbeatInterval = interval;
    this.#lastHeartbeatAck = Date.now();

    this.#interval = setInterval(() => {
      this.#checkHeartbeat();
      this.sendHeartbeat();
    }, interval);
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
      this.#nonce = currentNonce;
      this.#lastHeartbeatSent = currentNonce;

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
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Acknowledges a heartbeat
   *
   * @param receivedNonce - Nonce received in heartbeat ACK
   */
  ackHeartbeat(receivedNonce?: number): void {
    const now = Date.now();
    this.#lastHeartbeatAck = now;
    this.#missedHeartbeats = 0;

    // Calculate and emit latency if nonce matches
    if (receivedNonce && receivedNonce === this.#nonce) {
      const latency = now - this.#lastHeartbeatSent;
      this.#connection.emit("heartbeatAck", latency);
    }
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

    // Check if we've missed a heartbeat
    if (timeSinceLastAck > this.#heartbeatInterval * 1.5) {
      this.#missedHeartbeats++;

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
    this.#connection.emit(
      "debug",
      `Missed ${this.#missedHeartbeats} heartbeats, reconnecting`,
    );

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
