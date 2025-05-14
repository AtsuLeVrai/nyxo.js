/**
 * Represents a single field error in a JSON API response.
 * Used to provide detailed information about validation failures or other field-specific errors.
 */
export interface JsonErrorField {
  /**
   * The error code identifying the type of error.
   * Usually a machine-readable string like "INVALID_FORMAT" or "REQUIRED_FIELD".
   */
  code: string;

  /**
   * Human-readable error message describing the issue.
   * Should be clear enough for end-users to understand the problem.
   */
  message: string;

  /**
   * Array representing the path to the field that caused the error.
   * Example: ["user", "email"] for a user's email field.
   */
  path: string[];
}

/**
 * Represents a standardized JSON error response from an API.
 * Follows a consistent format to make client-side error handling more predictable.
 */
export interface JsonErrorResponse {
  /**
   * The numeric error code (typically corresponds to HTTP status code).
   * Examples: 400 for bad request, 404 for not found, 500 for server error.
   */
  code: number;

  /**
   * The main error message providing a general description of the problem.
   * Should be concise but informative.
   */
  message: string;

  /**
   * Optional object containing field-specific errors.
   * Organized by field name with arrays of specific error details.
   */
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}
