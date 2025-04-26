import type { RateLimitScope } from "../managers/index.js";
import type { HttpMethod, JsonErrorResponse } from "../types/index.js";

/**
 * Options for the base DiscordApiError class.
 * Defines common properties shared by all API error types.
 */
export interface DiscordApiErrorOptions {
  /**
   * HTTP status code returned by the API.
   * Example: 400 for Bad Request, 404 for Not Found, etc.
   */
  status?: number;

  /**
   * HTTP method that was used for the request.
   * Example: "GET", "POST", "DELETE", etc.
   */
  method?: HttpMethod;

  /**
   * API path that was requested.
   * Example: "/channels/123456789/messages"
   */
  path?: string;

  /**
   * Unique identifier for tracking the request.
   * Used for correlation with logs and events.
   */
  requestId?: string;

  /**
   * Original error that caused this error.
   * Used for error chaining.
   */
  cause?: Error;
}

/**
 * Base class for all Discord API related errors.
 * Extends the standard Error class with additional properties relevant to API interactions.
 */
export class DiscordApiError extends Error {
  /**
   * HTTP status code returned by the API.
   * Example: 400 for Bad Request, 404 for Not Found, etc.
   */
  readonly status?: number;

  /**
   * HTTP method that was used for the request.
   * Example: "GET", "POST", "DELETE", etc.
   */
  readonly method?: HttpMethod;

  /**
   * API path that was requested.
   * Example: "/channels/123456789/messages"
   */
  readonly path?: string;

  /**
   * Unique identifier for tracking the request.
   * Used for correlation with logs and events.
   */
  readonly requestId?: string;

  /**
   * Creates a new DiscordApiError.
   *
   * @param message - Error message
   * @param options - Additional error properties and context
   */
  constructor(message: string, options: DiscordApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.status = options.status;
    this.method = options.method;
    this.path = options.path;
    this.requestId = options.requestId;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a string representation of the error.
   * Includes method, status, and path when available.
   *
   * @returns Formatted error message
   */
  override toString(): string {
    const details = [
      this.method && `${this.method}`,
      this.path && `${this.path}`,
      this.status && `${this.status}`,
    ]
      .filter(Boolean)
      .join(" ");

    return details
      ? `${this.name} [${details}]: ${this.message}`
      : `${this.name}: ${this.message}`;
  }
}

/**
 * Represents errors returned by the Discord API with a standard JSON format.
 * Contains detailed information about the error from the Discord API response.
 */
export class JsonApiError extends DiscordApiError {
  /**
   * Discord error code.
   * These are specific error codes defined by Discord.
   * Example: 50001 for "Missing Access", 10003 for "Unknown Channel", etc.
   */
  readonly code: number;

  /**
   * Detailed field errors, if provided by the API.
   * Contains validation errors for specific fields in the request.
   */
  readonly errors?: Record<
    string,
    { _errors: Array<{ code: string; message: string }> }
  >;

  /**
   * Creates a new JsonApiError.
   *
   * @param errorResponse - Discord API error response
   * @param options - Additional error context
   */
  constructor(
    errorResponse: JsonErrorResponse,
    options: DiscordApiErrorOptions = {},
  ) {
    super(errorResponse.message, {
      status: errorResponse.code,
      ...options,
    });

    this.code = errorResponse.code;
    this.errors = errorResponse.errors;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a formatted object with field errors for easier debugging.
   * Transforms the nested error structure into a flat map of field paths to error messages.
   *
   * @returns Object mapping field paths to error messages
   */
  formatFieldErrors(): Record<string, string[]> {
    if (!this.errors) {
      return {};
    }

    const formatted: Record<string, string[]> = {};

    for (const [field, fieldErrors] of Object.entries(this.errors)) {
      if (fieldErrors?._errors?.length > 0) {
        formatted[field] = fieldErrors._errors.map((err) => err.message);
      }
    }

    return formatted;
  }

  /**
   * Returns a string representation of the error with field details.
   * Includes formatted field errors when available.
   *
   * @returns Formatted error message with field details
   */
  override toString(): string {
    const baseString = super.toString();
    const fieldErrors = this.formatFieldErrors();

    if (Object.keys(fieldErrors).length === 0) {
      return baseString;
    }

    const formattedFields = Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
      .join("; ");

    return `${baseString}\nField errors: ${formattedFields}`;
  }
}

/**
 * Options for RateLimitError class.
 * Contains all necessary details about a rate limit.
 */
export interface RateLimitErrorOptions extends DiscordApiErrorOptions {
  /**
   * Time in milliseconds until the rate limit resets.
   * Indicates how long to wait before retrying.
   */
  retryAfter: number;

  /**
   * Whether this is a global rate limit.
   * Global rate limits affect all API requests, not just a specific endpoint.
   */
  global: boolean;

  /**
   * Unique identifier for the rate limit bucket.
   * Used to correlate with other requests affected by the same limit.
   */
  bucketId: string;

  /**
   * Scope of the rate limit.
   * Can be "user", "global", or "shared".
   */
  scope: RateLimitScope;

  /**
   * Maximum number of requests allowed in the current window.
   * Part of the bucket information when available.
   */
  limit?: number;

  /**
   * Remaining requests allowed in the current window.
   * Part of the bucket information when available.
   */
  remaining?: number;

  /**
   * Reset time as a Date object.
   * Absolute time when the rate limit will reset.
   */
  resetTime?: Date;
}

/**
 * Represents errors related to rate limiting by the Discord API.
 * Contains detailed information about the rate limit that was hit.
 */
export class RateLimitError extends DiscordApiError {
  /**
   * Time in milliseconds until the rate limit resets.
   * Indicates how long to wait before retrying.
   */
  readonly retryAfter: number;

  /**
   * Whether this is a global rate limit.
   * Global rate limits affect all API requests, not just a specific endpoint.
   */
  readonly global: boolean;

  /**
   * Unique identifier for the rate limit bucket.
   * Used to correlate with other requests affected by the same limit.
   */
  readonly bucketId: string;

  /**
   * Scope of the rate limit.
   * Can be "user", "global", or "shared".
   */
  readonly scope: RateLimitScope;

  /**
   * Maximum number of requests allowed in the current window.
   * Part of the bucket information when available.
   */
  readonly limit?: number;

  /**
   * Remaining requests allowed in the current window.
   * Part of the bucket information when available.
   */
  readonly remaining?: number;

  /**
   * Reset time as a Date object.
   * Absolute time when the rate limit will reset.
   */
  readonly resetTime?: Date;

  /**
   * Creates a new RateLimitError.
   *
   * @param message - Error message
   * @param options - Rate limit details and context
   */
  constructor(message: string, options: RateLimitErrorOptions) {
    super(message, options);

    this.retryAfter = options.retryAfter;
    this.global = options.global;
    this.bucketId = options.bucketId;
    this.scope = options.scope;
    this.limit = options.limit;
    this.remaining = options.remaining;
    this.resetTime = options.resetTime;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a string representation of the error with rate limit details.
   * Includes retry time and bucket information.
   *
   * @returns Formatted error message with rate limit details
   */
  override toString(): string {
    const baseString = super.toString();
    const resetTimeStr = this.resetTime
      ? `reset at ${this.resetTime.toISOString()}`
      : `retry after ${this.retryAfter}ms`;

    return `${baseString}\nRate limit: ${this.global ? "global" : this.bucketId} (${this.scope}) - ${resetTimeStr}`;
  }
}

/**
 * Options for RequestTimeoutError class.
 * Includes timeout details and standard API error properties.
 */
export interface RequestTimeoutErrorOptions extends DiscordApiErrorOptions {
  /**
   * Timeout limit in milliseconds.
   * The maximum time allowed for the request.
   */
  timeoutMs: number;
}

/**
 * Represents errors related to request timeouts.
 * Thrown when a request exceeds the configured timeout limit.
 */
export class RequestTimeoutError extends DiscordApiError {
  /**
   * Timeout limit in milliseconds.
   * The maximum time allowed for the request.
   */
  readonly timeoutMs: number;

  /**
   * Creates a new RequestTimeoutError.
   *
   * @param options - Timeout details and request context
   */
  constructor(options: RequestTimeoutErrorOptions) {
    super(`Request timed out after ${options.timeoutMs}ms`, options);

    this.timeoutMs = options.timeoutMs;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Options for AuthenticationError class.
 * Standard API error properties for auth failures.
 */
export interface AuthenticationErrorOptions extends DiscordApiErrorOptions {}

/**
 * Represents errors related to authentication failures.
 * Thrown when the API rejects the authentication credentials.
 */
export class AuthenticationError extends DiscordApiError {
  /**
   * Creates a new AuthenticationError.
   *
   * @param message - Error message
   * @param options - Error context details
   */
  constructor(
    message = "Authentication failed",
    options: AuthenticationErrorOptions = {},
  ) {
    super(message, { status: options.status || 401, ...options });

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Options for PermissionError class.
 * Includes required permissions and standard API error properties.
 */
export interface PermissionErrorOptions extends DiscordApiErrorOptions {
  /**
   * Discord permission flags that were missing.
   * Bitfield representing the required permissions.
   */
  requiredPermissions?: bigint;
}

/**
 * Represents errors related to insufficient permissions.
 * Thrown when the bot lacks the permissions required for an operation.
 */
export class PermissionError extends DiscordApiError {
  /**
   * Discord permission flags that were missing.
   * Bitfield representing the required permissions.
   */
  readonly requiredPermissions?: bigint;

  /**
   * Creates a new PermissionError.
   *
   * @param message - Error message
   * @param options - Error context and permission details
   */
  constructor(
    message = "Missing required permissions",
    options: PermissionErrorOptions = {},
  ) {
    super(message, { status: options.status || 403, ...options });
    this.requiredPermissions = options.requiredPermissions;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Options for NotFoundError class.
 * Includes resource details and standard API error properties.
 */
export interface NotFoundErrorOptions extends DiscordApiErrorOptions {
  /**
   * Type of resource that was not found.
   * Example: "channel", "guild", "user", etc.
   */
  resourceType?: string;

  /**
   * ID of the resource that was not found.
   * The Snowflake ID of the requested resource.
   */
  resourceId?: string;
}

/**
 * Represents errors related to resource not found.
 * Thrown when the requested resource does not exist.
 */
export class NotFoundError extends DiscordApiError {
  /**
   * Type of resource that was not found.
   * Example: "channel", "guild", "user", etc.
   */
  readonly resourceType?: string;

  /**
   * ID of the resource that was not found.
   * The Snowflake ID of the requested resource.
   */
  readonly resourceId?: string;

  /**
   * Creates a new NotFoundError.
   *
   * @param message - Error message
   * @param options - Error context and resource details
   */
  constructor(
    message = "Resource not found",
    options: NotFoundErrorOptions = {},
  ) {
    super(message, { status: 404, ...options });

    this.resourceType = options.resourceType;
    this.resourceId = options.resourceId;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a string representation of the error with resource details.
   * Includes resource type and ID when available.
   *
   * @returns Formatted error message with resource details
   */
  override toString(): string {
    const baseString = super.toString();

    if (!(this.resourceType || this.resourceId)) {
      return baseString;
    }

    const resourceDetails = [
      this.resourceType && `type: ${this.resourceType}`,
      this.resourceId && `id: ${this.resourceId}`,
    ]
      .filter(Boolean)
      .join(", ");

    return `${baseString} (${resourceDetails})`;
  }
}

/**
 * Options for CloudflareError class.
 * Includes Cloudflare ray ID and standard API error properties.
 */
export interface CloudflareErrorOptions extends DiscordApiErrorOptions {
  /**
   * Ray ID provided by Cloudflare.
   * Unique identifier for the Cloudflare request.
   */
  rayId?: string;
}

/**
 * Represents errors related to Cloudflare's protection mechanisms.
 * Thrown when Cloudflare blocks requests due to suspicious activity.
 */
export class CloudflareError extends DiscordApiError {
  /**
   * Ray ID provided by Cloudflare.
   * Unique identifier for the Cloudflare request.
   */
  readonly rayId?: string;

  /**
   * Creates a new CloudflareError.
   *
   * @param message - Error message
   * @param options - Error context and Cloudflare details
   */
  constructor(
    message = "Request blocked by Cloudflare",
    options: CloudflareErrorOptions = {},
  ) {
    super(message, { status: options.status || 429, ...options });
    this.rayId = options.rayId;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a string representation of the error with Cloudflare details.
   * Includes Ray ID when available.
   *
   * @returns Formatted error message with Cloudflare details
   */
  override toString(): string {
    const baseString = super.toString();
    return this.rayId ? `${baseString} (Ray ID: ${this.rayId})` : baseString;
  }
}

/**
 * Options for FileUploadError class.
 * Includes file details and standard API error properties.
 */
export interface FileUploadErrorOptions extends DiscordApiErrorOptions {
  /**
   * Name of the file that failed to upload.
   * The original filename.
   */
  filename?: string;

  /**
   * Size of the file in bytes.
   * Useful for diagnosing size limit issues.
   */
  fileSize?: number;

  /**
   * Content type of the file.
   * The MIME type of the file.
   */
  contentType?: string;
}

/**
 * Represents errors related to file uploads.
 * Thrown when there are issues with file uploads to Discord.
 */
export class FileUploadError extends DiscordApiError {
  /**
   * Name of the file that failed to upload.
   * The original filename.
   */
  readonly filename?: string;

  /**
   * Size of the file in bytes.
   * Useful for diagnosing size limit issues.
   */
  readonly fileSize?: number;

  /**
   * Content type of the file.
   * The MIME type of the file.
   */
  readonly contentType?: string;

  /**
   * Creates a new FileUploadError.
   *
   * @param message - Error message
   * @param options - Error context and file details
   */
  constructor(message: string, options: FileUploadErrorOptions = {}) {
    super(message, options);
    this.filename = options.filename;
    this.fileSize = options.fileSize;
    this.contentType = options.contentType;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a string representation of the error with file details.
   * Includes filename, size, and content type when available.
   *
   * @returns Formatted error message with file details
   */
  override toString(): string {
    const baseString = super.toString();

    const fileDetails = [
      this.filename && `name: ${this.filename}`,
      this.fileSize && `size: ${this.fileSize} bytes`,
      this.contentType && `type: ${this.contentType}`,
    ]
      .filter(Boolean)
      .join(", ");

    return fileDetails ? `${baseString} (${fileDetails})` : baseString;
  }
}

/**
 * Options for RetryError class.
 * Includes retry details and standard API error properties.
 */
export interface RetryErrorOptions extends DiscordApiErrorOptions {
  /**
   * Number of attempts that were made.
   * How many times the request was tried.
   */
  attempts: number;

  /**
   * Maximum allowed retry attempts.
   * The configured retry limit.
   */
  maxAttempts: number;

  /**
   * Array of errors from previous attempts.
   * Contains the errors that occurred during retry attempts.
   */
  attemptErrors: Error[];
}

/**
 * Represents errors related to maximum retry attempts.
 * Thrown when a request fails after exhausting all retry attempts.
 */
export class RetryError extends DiscordApiError {
  /**
   * Number of attempts that were made.
   * How many times the request was tried.
   */
  readonly attempts: number;

  /**
   * Maximum allowed retry attempts.
   * The configured retry limit.
   */
  readonly maxAttempts: number;

  /**
   * Array of errors from previous attempts.
   * Contains the errors that occurred during retry attempts.
   */
  readonly attemptErrors: Error[];

  /**
   * Creates a new RetryError.
   *
   * @param message - Error message
   * @param options - Error context and retry details
   */
  constructor(message: string, options: RetryErrorOptions) {
    super(message || `Request failed after ${options.attempts} attempts`, {
      ...options,
      cause: options.cause || options.attemptErrors.at(-1),
    });

    this.attempts = options.attempts;
    this.maxAttempts = options.maxAttempts;
    this.attemptErrors = options.attemptErrors;

    // Capture stack trace, excluding constructor call from stack
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns a string representation of the error with retry details.
   * Includes attempt count and last error message.
   *
   * @returns Formatted error message with retry details
   */
  override toString(): string {
    const baseString = super.toString();
    const lastError = this.attemptErrors.at(-1);

    return lastError
      ? `${baseString}\nLast error: ${lastError.message}`
      : baseString;
  }
}
