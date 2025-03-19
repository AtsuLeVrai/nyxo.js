import type { Rest } from "@nyxjs/rest";
import type { Gateway } from "../core/index.js";
import type { CircuitBreakerOptions } from "../options/index.js";

/**
 * Possible states for the circuit breaker
 */
export enum CircuitState {
  /** Closed circuit - operations are allowed */
  Closed = "closed",

  /** Open circuit - operations are blocked */
  Open = "open",

  /** Half-open circuit - a test operation is allowed */
  HalfOpen = "half-open",
}

/**
 * Types of failures that the circuit breaker can handle
 */
export enum FailureType {
  /** Authentication problem */
  Authentication = "authentication",

  /** Network connection problem */
  Network = "network",

  /** Rate limit problem */
  RateLimit = "rate_limit",

  /** Timeout problem */
  Timeout = "timeout",

  /** WebSocket error */
  WebSocket = "websocket",

  /** Gateway error */
  Gateway = "gateway",

  /** Unknown error */
  Unknown = "unknown",
}

/**
 * Event emitted during a circuit state change
 */
export interface CircuitStateChangeEvent {
  /** Event timestamp */
  timestamp: string;

  /** Previous state */
  previousState: CircuitState;

  /** New state */
  newState: CircuitState;

  /** Type of failure that caused the change, if applicable */
  failureType?: FailureType;

  /** Number of consecutive failures */
  failureCount: number;

  /** Time before automatic reset in milliseconds */
  resetTimeout: number;
}

/**
 * Circuit Breaker Service for failure management
 *
 * The Circuit Breaker is a design pattern that prevents an application
 * from making repeated calls to a service that is likely to fail.
 *
 * It maintains a state that determines if calls are allowed:
 * - Closed: Calls are allowed
 * - Open: Calls are blocked
 * - Half-open: A test call is allowed to check if the service is restored
 */
export class CircuitBreakerService {
  /** Current circuit state */
  #state: CircuitState = CircuitState.Closed;

  /** Failure counter by type */
  #failureCounts: Record<FailureType, number> = {
    [FailureType.Authentication]: 0,
    [FailureType.Network]: 0,
    [FailureType.RateLimit]: 0,
    [FailureType.Timeout]: 0,
    [FailureType.WebSocket]: 0,
    [FailureType.Gateway]: 0,
    [FailureType.Unknown]: 0,
  };

  /** Timestamp of the last failure */
  #lastFailureTime = 0;

  /** Type of the last failure */
  #lastFailureType: FailureType = FailureType.Unknown;

  /** Current reset time in milliseconds */
  #currentResetTimeout: number;

  /** Timeout for automatic reset */
  #resetTimer: NodeJS.Timeout | null = null;

  /** Configuration options */
  readonly #options: CircuitBreakerOptions;

  /** Gateway client for checking Discord API status */
  readonly #gateway: Gateway;

  /** REST client for checking Discord API status */
  readonly #rest: Rest;

  /**
   * Creates a new Circuit Breaker service
   *
   * @param gateway - Gateway client for emitting events
   * @param rest - REST client for checking API health
   * @param options - Configuration options
   */
  constructor(gateway: Gateway, rest: Rest, options: CircuitBreakerOptions) {
    this.#options = options;

    this.#currentResetTimeout = this.#options.resetTimeout;
    this.#gateway = gateway;
    this.#rest = rest;
  }

  /**
   * Gets the current state of the circuit
   */
  get state(): CircuitState {
    return this.#state;
  }

  /**
   * Gets the type of the last failure
   */
  get lastFailureType(): FailureType {
    return this.#lastFailureType;
  }

  /**
   * Gets the failure counters by type
   */
  get failureCounts(): Readonly<Record<FailureType, number>> {
    return { ...this.#failureCounts };
  }

  /**
   * Gets the time before the next automatic reset
   */
  get remainingTimeout(): number {
    if (this.#state !== CircuitState.Open || !this.#lastFailureTime) {
      return 0;
    }

    const elapsed = Date.now() - this.#lastFailureTime;
    return Math.max(0, this.#currentResetTimeout - elapsed);
  }

  /**
   * Detects the failure type from an error
   *
   * @param error - Error to analyze
   * @returns Detected failure type
   */
  static detectFailureType(error: Error): FailureType {
    const message = error.message.toLowerCase();

    if (
      message.includes("authentication") ||
      message.includes("unauthorized") ||
      message.includes("4004")
    ) {
      return FailureType.Authentication;
    }

    if (
      message.includes("network") ||
      message.includes("connectivity") ||
      message.includes("econnrefused")
    ) {
      return FailureType.Network;
    }

    if (
      message.includes("rate limit") ||
      message.includes("ratelimit") ||
      message.includes("429")
    ) {
      return FailureType.RateLimit;
    }

    if (message.includes("timeout") || message.includes("timed out")) {
      return FailureType.Timeout;
    }

    if (
      message.includes("websocket") ||
      message.includes("ws") ||
      message.includes("connection closed")
    ) {
      return FailureType.WebSocket;
    }

    if (message.includes("gateway") || message.includes("discord")) {
      return FailureType.Gateway;
    }

    return FailureType.Unknown;
  }

  /**
   * Checks if an operation is allowed by the circuit
   *
   * @param operationType - Type of operation to check
   * @returns true if the operation is allowed, false otherwise
   */
  canExecute(operationType: string): boolean {
    // If the circuit is closed, the operation is always allowed
    if (this.#state === CircuitState.Closed) {
      return true;
    }

    // If the circuit is half-open, only one test operation is allowed
    if (this.#state === CircuitState.HalfOpen) {
      // Immediately transition to open circuit to block other operations
      // until the test operation succeeds or fails
      this.#transitionTo(CircuitState.Open);
      return true;
    }

    // If the circuit is open, check if the reset time has elapsed
    const now = Date.now();
    if (
      this.#lastFailureTime &&
      now - this.#lastFailureTime >= this.#currentResetTimeout
    ) {
      this.#transitionTo(CircuitState.HalfOpen);
      return true;
    }

    // Emit an event for the blocked operation
    this.#gateway.emit("circuitBlocked", {
      timestamp: new Date().toISOString(),
      operationType,
      state: this.#state,
      remainingTimeout: this.remainingTimeout,
    });

    return false;
  }

  /**
   * Records an operation success
   *
   * Resets failure counters and closes the circuit
   */
  recordSuccess(): void {
    // Reset all failure counters
    for (const type in this.#failureCounts) {
      if (Object.prototype.hasOwnProperty.call(this.#failureCounts, type)) {
        this.#failureCounts[type as FailureType] = 0;
      }
    }

    // If the circuit is not already closed, close it
    if (this.#state !== CircuitState.Closed) {
      this.#transitionTo(CircuitState.Closed);
    }

    // Reset the reset time
    this.#currentResetTimeout = this.#options.resetTimeout;

    // Cancel the reset timer if it exists
    if (this.#resetTimer) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = null;
    }
  }

  /**
   * Records an operation failure
   *
   * @param error - Error that caused the failure
   * @param failureType - Type of failure
   * @returns true if the circuit is now open, false otherwise
   */
  recordFailure(
    error: Error,
    failureType: FailureType = FailureType.Unknown,
  ): boolean {
    // Update the failure counter for this type
    this.#failureCounts[failureType]++;

    // Update the last failure information
    this.#lastFailureTime = Date.now();
    this.#lastFailureType = failureType;

    // Emit a failure event
    this.#gateway.emit("circuitFailure", {
      timestamp: new Date().toISOString(),
      failureType,
      state: this.#state,
      failureCount: this.#failureCounts[failureType],
      error,
    });

    // Check the specific rules for this failure type
    const typeOptions = this.#options.failureTypeOptions[failureType];
    if (typeOptions?.breakImmediately) {
      // Immediately open the circuit for this critical type
      this.#transitionTo(CircuitState.Open, failureType);
      return true;
    }

    // Check if the failure threshold is reached
    const threshold = typeOptions?.threshold ?? this.#options.failureThreshold;
    if (this.#failureCounts[failureType] >= threshold) {
      this.#transitionTo(CircuitState.Open, failureType);
      return true;
    }

    return this.#state === CircuitState.Open;
  }

  /**
   * Cleans up resources used by the service
   */
  destroy(): void {
    // Reset all failure counters
    for (const type in this.#failureCounts) {
      if (Object.prototype.hasOwnProperty.call(this.#failureCounts, type)) {
        this.#failureCounts[type as FailureType] = 0;
      }
    }

    // Close the circuit
    this.#transitionTo(CircuitState.Closed);

    // Reset the reset time
    this.#currentResetTimeout = this.#options.resetTimeout;

    // Cancel the reset timer if it exists
    if (this.#resetTimer) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = null;
    }
  }

  /**
   * Checks the health of the Discord API
   *
   * @returns true if the API is available, false otherwise
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      // Use a lightweight endpoint to check the API status
      await this.#rest.gateway.getGateway();
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Performs a circuit state transition
   *
   * @param newState - New state
   * @param failureType - Type of failure that caused the transition
   * @private
   */
  #transitionTo(newState: CircuitState, failureType?: FailureType): void {
    // Do nothing if the state doesn't change
    if (this.#state === newState) {
      return;
    }

    const previousState = this.#state;
    this.#state = newState;

    // Cancel the existing timer if there is one
    if (this.#resetTimer) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = null;
    }

    // If the circuit is open, start a timer to transition it to half-open
    if (newState === CircuitState.Open) {
      this.#resetTimer = setTimeout(() => {
        if (this.#state === CircuitState.Open) {
          this.#transitionTo(CircuitState.HalfOpen);
        }
      }, this.#currentResetTimeout);

      // Increase the reset time for the next time
      this.#currentResetTimeout = Math.min(
        this.#currentResetTimeout * this.#options.resetTimeoutMultiplier,
        this.#options.maxResetTimeout,
      );
    }

    // Emit a state change event
    this.#gateway.emit("circuitStateChange", {
      timestamp: new Date().toISOString(),
      previousState,
      newState,
      failureType,
      failureCount: failureType ? this.#failureCounts[failureType] : 0,
      resetTimeout: this.#currentResetTimeout,
    });
  }
}
