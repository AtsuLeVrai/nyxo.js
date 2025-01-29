import type { ReconnectionOptions } from "../options/index.js";

export class ReconnectionService {
  #attempts = 0;
  readonly #options: ReconnectionOptions;

  constructor(options: ReconnectionOptions) {
    this.#options = options;
  }

  get attempts(): number {
    return this.#attempts;
  }

  reset(): void {
    this.#attempts = 0;
  }

  increment(): void {
    this.#attempts++;
  }

  getDelay(): number {
    return (
      this.#options.backoffSchedule[this.#attempts] ??
      this.#options.backoffSchedule.at(-1) ??
      0
    );
  }
}
