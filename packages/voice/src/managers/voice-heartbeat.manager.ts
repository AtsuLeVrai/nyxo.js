import type { VoiceConnection } from "../core/index.js";
import {
  VoiceGatewayOpcodes,
  type VoiceHeartbeatAckPayload,
  type VoiceHeartbeatPayload,
} from "../types/index.js";

const MAX_MISSED_HEARTBEATS = 3;
const INITIAL_SEQUENCE = -1;

export class VoiceHeartbeatManager {
  #interval: NodeJS.Timeout | null = null;
  #missedHeartbeats = 0;
  #lastHeartbeatAck: number | null = null;
  #lastHeartbeatSend: number | null = null;
  #nonce = Date.now();
  #sequenceAck = INITIAL_SEQUENCE;

  readonly #connection: VoiceConnection;

  constructor(connection: VoiceConnection) {
    this.#connection = connection;
  }

  get latency(): number {
    if (!(this.#lastHeartbeatAck && this.#lastHeartbeatSend)) {
      return -1;
    }
    return this.#lastHeartbeatAck - this.#lastHeartbeatSend;
  }

  get missedHeartbeats(): number {
    return this.#missedHeartbeats;
  }

  get sequenceAck(): number {
    return this.#sequenceAck;
  }

  start(interval: number): void {
    this.destroy();

    this.sendHeartbeat();
    this.#interval = setInterval(() => {
      if (this.#missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
        this.#connection.emit(
          "error",
          "Too many missed heartbeats, disconnecting",
        );
        this.#connection.destroy();
        return;
      }

      this.sendHeartbeat();
    }, interval);

    this.#connection.emit(
      "debug",
      `Voice heartbeat started with interval ${interval}ms`,
    );
  }

  sendHeartbeat(): void {
    if (!this.#connection.canSend()) {
      return;
    }

    this.#lastHeartbeatSend = Date.now();

    const heartbeatData: VoiceHeartbeatPayload = {
      t: this.#nonce,
      seq_ack: this.#sequenceAck,
    };

    try {
      this.#connection.send(VoiceGatewayOpcodes.Heartbeat, heartbeatData);
      this.#missedHeartbeats++;
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to send heartbeat", { cause: error }),
      );
    }
  }

  ackHeartbeat(data: VoiceHeartbeatAckPayload): void {
    if (data.t !== this.#nonce) {
      this.#connection.emit(
        "error",
        `Received invalid heartbeat ack (expected ${this.#nonce}, got ${data.t})`,
      );
      return;
    }

    this.#lastHeartbeatAck = Date.now();
    this.#missedHeartbeats = 0;
    this.#nonce = Date.now();
  }

  updateSequenceAck(seq: number): void {
    if (seq < 0) {
      this.#connection.emit(
        "error",
        `Received invalid sequence number: ${seq}`,
      );
      return;
    }
    this.#sequenceAck = seq;
  }

  destroy(): void {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
    }

    this.#missedHeartbeats = 0;
    this.#lastHeartbeatAck = null;
    this.#lastHeartbeatSend = null;
    this.#nonce = Date.now();
    this.#sequenceAck = INITIAL_SEQUENCE;
  }
}
