import QuickLRU from "quick-lru";
import { z } from "zod";
import { sleep } from "../../utils/index.js";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
  nextAttemptTime: number;
}

export const ResilienceOptions = z.object({
  maxRetries: z.int().min(0).default(3),
  baseDelay: z.int().min(100).default(1000),
  maxDelay: z.int().min(1000).default(30000),
  backoffMultiplier: z.number().min(1).default(2),
  jitterFactor: z.number().min(0).max(1).default(0.1),
  failureThreshold: z.int().min(1).default(5),
  recoveryTimeout: z.int().min(1000).default(60000),
  successThreshold: z.int().min(1).default(2),
  monitoringWindow: z.int().min(1000).default(300000),
});

export class ResilienceManager {
  readonly #circuits = new QuickLRU<string, CircuitBreakerState>({ maxSize: 50 });
  readonly #options: z.infer<typeof ResilienceOptions>;

  constructor(options: z.input<typeof ResilienceOptions> = {}) {
    try {
      this.#options = ResilienceOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }
  }

  async executeWithResilience<T>(operation: () => Promise<T>, context = "default"): Promise<T> {
    const circuit = this.#getOrCreateCircuit(context);

    // Check circuit breaker state
    if (!this.#canExecute(circuit)) {
      throw new Error(`Circuit breaker OPEN for context: ${context}`);
    }

    let lastError: Error;
    for (let attempt = 0; attempt <= this.#options.maxRetries; attempt++) {
      try {
        // Execute operation
        const result = await operation();

        // Success: update circuit breaker
        this.#recordSuccess(circuit);
        return result;
      } catch (error) {
        lastError = error as Error;

        // Update circuit on failure
        this.#recordFailure(circuit);

        // Don't retry certain errors
        if (!this.#shouldRetry(error as Error, attempt)) {
          break;
        }

        // Don't retry if it's the last attempt
        if (attempt === this.#options.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff + jitter
        const delay = this.#calculateDelay(attempt);
        await sleep(delay);
      }
    }

    // @ts-expect-error - lastError is always set if we reach here
    throw lastError;
  }

  getCircuitState(context = "default"): CircuitState {
    const circuit = this.#circuits.get(context);
    if (!circuit) return "CLOSED";

    this.#updateCircuitState(circuit);
    return circuit.state;
  }

  clear(): void {
    this.#circuits.clear();
  }

  #getOrCreateCircuit(context: string): CircuitBreakerState {
    if (!this.#circuits.has(context)) {
      this.#circuits.set(context, {
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
        nextAttemptTime: 0,
      });
    }

    const circuit = this.#circuits.get(context) as CircuitBreakerState;
    this.#updateCircuitState(circuit);
    return circuit;
  }

  #canExecute(circuit: CircuitBreakerState): boolean {
    const now = Date.now();

    switch (circuit.state) {
      case "CLOSED":
        return true;

      case "OPEN":
        return now >= circuit.nextAttemptTime;

      case "HALF_OPEN":
        return true;

      default:
        return false;
    }
  }

  #updateCircuitState(circuit: CircuitBreakerState): void {
    const now = Date.now();

    switch (circuit.state) {
      case "CLOSED":
        if (circuit.failureCount >= this.#options.failureThreshold) {
          circuit.state = "OPEN";
          circuit.nextAttemptTime = now + this.#options.recoveryTimeout;
        }
        break;

      case "OPEN":
        if (now >= circuit.nextAttemptTime) {
          circuit.state = "HALF_OPEN";
          circuit.successCount = 0;
        }
        break;

      case "HALF_OPEN":
        if (circuit.successCount >= this.#options.successThreshold) {
          circuit.state = "CLOSED";
          circuit.failureCount = 0;
        }
        break;
    }

    // Reset failure count after monitoring window
    if (now - circuit.lastFailureTime > this.#options.monitoringWindow) {
      circuit.failureCount = Math.max(0, circuit.failureCount - 1);
    }
  }

  #recordSuccess(circuit: CircuitBreakerState): void {
    if (circuit.state === "HALF_OPEN") {
      circuit.successCount++;
    }

    // Gradually reduce failure count on success
    if (circuit.failureCount > 0) {
      circuit.failureCount = Math.max(0, circuit.failureCount - 1);
    }
  }

  #recordFailure(circuit: CircuitBreakerState): void {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();
    circuit.successCount = 0;

    if (circuit.state === "HALF_OPEN") {
      circuit.state = "OPEN";
      circuit.nextAttemptTime = Date.now() + this.#options.recoveryTimeout;
    }
  }

  #shouldRetry(error: Error, attempt: number): boolean {
    // Don't retry certain HTTP status codes
    if ("statusCode" in error) {
      const statusCode = (error as any).statusCode;

      // Don't retry client errors (4xx) except rate limits and auth errors
      if (statusCode >= 400 && statusCode < 500) {
        return statusCode === 401 || statusCode === 403 || statusCode === 429;
      }
    }

    // Don't retry validation errors
    if (error.name === "ZodError" || error.name === "ValidationError") {
      return false;
    }

    // Don't retry if we've hit max attempts
    return attempt < this.#options.maxRetries;
  }

  #calculateDelay(attempt: number): number {
    // Exponential backoff: baseDelay * (backoffMultiplier ^ attempt)
    let delay = this.#options.baseDelay * this.#options.backoffMultiplier ** attempt;

    // Cap at maxDelay
    delay = Math.min(delay, this.#options.maxDelay);

    // Add jitter to prevent thundering herd
    const jitter = delay * this.#options.jitterFactor * Math.random();
    delay += jitter;

    return Math.round(delay);
  }
}
