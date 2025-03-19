/**
 * Represents a single field error in a JSON API response.
 */
export interface JsonErrorField {
  /**
   * The error code identifying the type of error
   */
  code: string;

  /**
   * Human-readable error message describing the issue
   */
  message: string;

  /**
   * Array representing the path to the field that caused the error
   */
  path: string[];
}

/**
 * Represents a standardized JSON error response from an API.
 */
export interface JsonErrorResponse {
  /**
   * The numeric error code (typically corresponds to HTTP status code)
   */
  code: number;

  /**
   * The main error message
   */
  message: string;

  /**
   * Optional object containing field-specific errors
   */
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

/**
 * Context information for an API error.
 */
export interface ApiErrorContext {
  /**
   * The HTTP status code of the error response
   */
  statusCode: number;

  /**
   * The API endpoint path that was accessed
   */
  path?: string;

  /**
   * The HTTP method used for the request
   */
  method?: string;

  /**
   * The request headers
   */
  headers?: Record<string, unknown>;
}

/**
 * Represents an API error with detailed information about the request and response.
 * This class extends the built-in Error class to provide additional context about API errors.
 *
 * @class ApiError
 * @extends {Error}
 */
export class ApiError extends Error {
  /**
   * Unique identifier for the request that caused the error
   */
  readonly requestId: string;

  /**
   * HTTP status code of the error response
   */
  readonly statusCode: number;

  /**
   * API endpoint path that was accessed
   */
  readonly path?: string;

  /**
   * HTTP method used for the request
   */
  readonly method?: string;

  /**
   * ISO timestamp when the error occurred
   */
  readonly timestamp: string;

  /**
   * Numeric error code from the JSON response
   */
  readonly code: number;

  /**
   * Field-specific errors if any
   */
  readonly errors?: Record<string, { _errors: JsonErrorField[] }>;

  /**
   * Creates a new ApiError instance.
   *
   * @param {string} requestId - Unique identifier for the request
   * @param {JsonErrorResponse} jsonError - The JSON error response from the API
   * @param {ApiErrorContext} context - Additional context about the API request
   */
  constructor(
    requestId: string,
    jsonError: JsonErrorResponse,
    context: ApiErrorContext,
  ) {
    super(jsonError.message);
    this.name = this.constructor.name;
    this.requestId = requestId;
    this.statusCode = context.statusCode;
    this.path = context.path;
    this.method = context.method;
    this.timestamp = new Date().toISOString();
    this.code = jsonError.code;
    this.errors = jsonError.errors;
  }

  /**
   * Converts the error to a plain JavaScript object suitable for serialization.
   *
   * @returns {Record<string, unknown>} A plain object representation of the error
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
      code: this.code,
      errors: this.errors,
    };
  }

  /**
   * Returns a string representation of the error including field-specific errors if present.
   * Overrides the standard toString method from Error.
   *
   * @returns {string} A formatted string representation of the error
   */
  override toString(): string {
    const baseMessage = `${this.name}: [${this.requestId}] ${this.message} (${this.method} ${this.path})`;

    if (!this.errors) {
      return baseMessage;
    }

    const fieldErrors = Object.entries(this.errors)
      .map(
        ([field, { _errors }]) =>
          `${field}: ${_errors.map((e) => e.message).join(", ")}`,
      )
      .join("\n");

    return `${baseMessage}\nField Errors:\n${fieldErrors}`;
  }
}
