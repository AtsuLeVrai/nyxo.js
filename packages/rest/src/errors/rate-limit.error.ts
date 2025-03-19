import type { RateLimitScope } from "../managers/index.js";

/**
 * Context information for a rate limit error.
 * Contains details about the request that exceeded the rate limit
 * and instructions for handling the rate limiting.
 */
export interface RateLimitErrorContext {
  /**
   * The API endpoint path that was rate limited
   */
  path: string;

  /**
   * The HTTP method used for the rate limited request
   */
  method: string;

  /**
   * Time in milliseconds to wait before retrying the request
   */
  retryAfter: number;

  /**
   * The scope of the rate limit (global, user, etc.)
   */
  scope: RateLimitScope;

  /**
   * Optional unique identifier for the rate limit bucket
   */
  bucketHash?: string;

  /**
   * Optional flag indicating if this is a global rate limit
   */
  global?: boolean;

  /**
   * Optional reason for the rate limit
   */
  reason?: string;
}

/**
 * Represents an error that occurs when an API request exceeds rate limits.
 * Provides detailed information about the rate limit and instructions for retry.
 *
 * @class RateLimitError
 * @extends {Error}
 */
export class RateLimitError extends Error {
  /**
   * Unique identifier for the request that triggered the rate limit
   */
  readonly requestId: string;

  /**
   * HTTP status code (always 429 for rate limit errors)
   */
  readonly statusCode: number;

  /**
   * API endpoint path that was rate limited
   */
  readonly path: string;

  /**
   * HTTP method used for the rate limited request
   */
  readonly method: string;

  /**
   * ISO timestamp when the rate limit error occurred
   */
  readonly timestamp: string;

  /**
   * Time in milliseconds to wait before retrying the request
   */
  readonly retryAfter: number;

  /**
   * The scope of the rate limit (global, user, etc.)
   */
  readonly scope: RateLimitScope;

  /**
   * Optional unique identifier for the rate limit bucket
   */
  readonly bucketHash?: string;

  /**
   * Optional flag indicating if this is a global rate limit
   */
  readonly global?: boolean;

  /**
   * Optional reason provided for the rate limit
   */
  readonly reason?: string;

  /**
   * Creates a new RateLimitError instance.
   *
   * @param {string} requestId - Unique identifier for the request
   * @param {RateLimitErrorContext} context - Context information about the rate limit
   */
  constructor(requestId: string, context: RateLimitErrorContext) {
    super(
      `Rate limit exceeded for ${context.path} (${context.method}): retry after ${context.retryAfter}ms`,
    );
    this.name = this.constructor.name;
    this.requestId = requestId;
    this.statusCode = 429;
    this.path = context.path;
    this.method = context.method;
    this.timestamp = new Date().toISOString();
    this.retryAfter = context.retryAfter;
    this.scope = context.scope;
    this.bucketHash = context.bucketHash;
    this.global = context.global;
    this.reason = context.reason;
  }

  /**
   * Converts the rate limit error to a plain JavaScript object suitable for serialization.
   *
   * @returns {Record<string, unknown>} A plain object representation of the rate limit error
   */
  toJson(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      requestId: this.requestId,
      statusCode: this.statusCode,
      path: this.path,
      method: this.method,
      timestamp: this.timestamp,
      retryAfter: this.retryAfter,
      scope: this.scope,
      bucketHash: this.bucketHash,
      global: this.global,
      reason: this.reason,
    };
  }

  /**
   * Returns a string representation of the rate limit error.
   * Overrides the standard toString method from Error.
   *
   * @returns {string} A formatted string representation of the rate limit error
   */
  override toString(): string {
    return `${this.name}: [${this.requestId}] ${this.message}${this.reason ? ` (${this.reason})` : ""}`;
  }
}
