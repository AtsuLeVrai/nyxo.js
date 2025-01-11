import type { ShardSession, ShardStatus } from "../schemas/index.js";

export class ShardController {
  readonly #data: ShardSession;
  #lastStatusChange: number = Date.now();
  #reconnectAttempts = 0;
  #lastError?: Error;

  constructor(session: ShardSession) {
    this.#data = { ...session };
  }

  get shardId(): number {
    return this.#data.shardId;
  }

  get numShards(): number {
    return this.#data.numShards;
  }

  get status(): ShardStatus {
    return this.#data.status ?? "idle";
  }

  get guildCount(): number {
    return this.#data.guildCount;
  }

  get lastStatusChange(): number {
    return this.#lastStatusChange;
  }

  get reconnectAttempts(): number {
    return this.#reconnectAttempts;
  }

  get lastError(): Error | undefined {
    return this.#lastError;
  }

  get session(): Readonly<ShardSession> {
    return { ...this.#data };
  }

  setStatus(status: ShardStatus): void {
    this.#data.status = status;
    this.#lastStatusChange = Date.now();
  }

  incrementReconnectAttempts(): number {
    return ++this.#reconnectAttempts;
  }

  resetReconnectAttempts(): void {
    this.#reconnectAttempts = 0;
  }

  updateGuildCount(count: number): void {
    this.#data.guildCount = count;
  }

  setError(error: Error): void {
    this.#lastError = error;
    this.setStatus("error");
  }

  reset(): void {
    this.#reconnectAttempts = 0;
    this.#lastError = undefined;
    this.setStatus("idle");
  }
}
