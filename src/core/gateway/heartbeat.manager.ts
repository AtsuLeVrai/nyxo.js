import { GatewayOpcodes } from "../../enum/index.js";
import type { Gateway } from "./gateway.js";

export class HeartbeatManager {
  latency = 0;
  missedHeartbeats = 0;
  intervalMs = 0;
  lastSend = 0;
  isAcked = true;

  #interval: NodeJS.Timeout | null = null;
  #initialTimeout: NodeJS.Timeout | null = null;

  readonly #gateway: Gateway;

  constructor(gateway: Gateway) {
    this.#gateway = gateway;
  }

  start(interval: number): void {
    if (this.#interval !== null) {
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

    if (this.#initialTimeout) {
      clearTimeout(this.#initialTimeout);
      this.#initialTimeout = null;
    }
  }

  ackHeartbeat(): void {
    const now = Date.now();
    this.isAcked = true;
    this.missedHeartbeats = 0;
    this.latency = now - this.lastSend;
    this.#gateway.emit("heartbeatAck", now, this.latency);
  }

  sendHeartbeat(): void {
    this.lastSend = Date.now();

    if (!this.isAcked) {
      this.missedHeartbeats++;
      return;
    }

    this.isAcked = false;
    this.#gateway.send(GatewayOpcodes.Heartbeat, this.#gateway.sequence);
    this.#gateway.emit("heartbeatSent", this.lastSend, this.#gateway.sequence);
  }
}
