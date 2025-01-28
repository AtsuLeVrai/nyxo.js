export class ReconnectionService {
  #attempts = 0;
  readonly #backoffSchedule: number[];

  constructor(backoffSchedule: number[] = [1000, 5000, 10000]) {
    this.#backoffSchedule = backoffSchedule;
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
      this.#backoffSchedule[this.#attempts] ?? this.#backoffSchedule.at(-1) ?? 0
    );
  }
}
