import type {
  RateLimitExpireEvent,
  RateLimitHitEvent,
  RateLimitUpdateEvent,
  RequestEvent,
  RetryEvent,
} from "./events.types.js";

/**
 * Map of event names to their payload types.
 * Used for strongly-typed event handling.
 */
export interface RestEvents {
  /**
   * Emitted when an HTTP request completes successfully.
   * Contains response data, status code, and timing information.
   */
  request: [event: RequestEvent];

  /**
   * Emitted when a rate limit is encountered.
   * Contains information about the rate limit and when it will reset.
   */
  rateLimitHit: [event: RateLimitHitEvent];

  /**
   * Emitted when rate limit information is updated from a response.
   * Contains updated quota and reset timing information.
   */
  rateLimitUpdate: [event: RateLimitUpdateEvent];

  /**
   * Emitted when a rate limit bucket expires.
   * Contains bucket identification and lifespan information.
   */
  rateLimitExpire: [event: RateLimitExpireEvent];

  /**
   * Emitted when a request retry is attempted.
   * Contains error information, attempt count, and delay information.
   */
  retry: [event: RetryEvent];
}
