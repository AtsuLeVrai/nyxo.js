import type { VoiceConnection } from "../core/index.js";
import { type VoiceHeartbeatDataV8, VoiceOpcodes } from "../types/index.js";

export class VoiceHeartbeatManager {
  #interval: NodeJS.Timeout | null = null;
  #missedHeartbeats = 0;
  #lastHeartbeatAck: number | null = null;
  #lastHeartbeatSend: number | null = null;
  #nonce = 0;
  #sequenceAck = -1;

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

    this.#interval = setInterval(() => {
      this.sendHeartbeat();
    }, interval);

    this.#connection.emit(
      "debug",
      `Voice heartbeat started with interval ${interval}ms`,
    );
  }

  sendHeartbeat(): void {
    if (!this.#connection.isConnectionValid()) {
      return;
    }

    this.#lastHeartbeatSend = Date.now();
    this.#nonce++;

    const heartbeatData: VoiceHeartbeatDataV8 = {
      t: this.#nonce,
      seq_ack: this.#sequenceAck,
    };

    this.#connection.send(VoiceOpcodes.Heartbeat, heartbeatData);
    this.#missedHeartbeats++;
  }

  ackHeartbeat(nonce: number): void {
    if (nonce !== this.#nonce) {
      this.#connection.emit("warn", "Received invalid heartbeat ack");
      return;
    }

    this.#lastHeartbeatAck = Date.now();
    this.#missedHeartbeats = 0;
  }

  updateSequenceAck(seq: number): void {
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
    this.#nonce = 0;
    this.#sequenceAck = -1;
  }
}
