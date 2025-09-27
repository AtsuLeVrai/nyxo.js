import type { JsonErrorCodes } from "../resources/index.js";

/**
 * Individual Discord API error with code and descriptive message.
 * Represents a single validation or request error from the Discord API.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json} for Discord error codes
 */
export interface DiscordError {
  /** JSON error code identifying the specific error type */
  readonly code: JsonErrorCodes;
  /** Human-readable error message describing the issue */
  readonly message: string;
}

/**
 * Complete Discord API error response containing top-level error information.
 * Returned by Discord API endpoints when requests fail validation or processing.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#http} for HTTP response codes
 */
export interface DiscordErrorResponse {
  /** Primary JSON error code for this response */
  readonly code: JsonErrorCodes;
  /** Primary error message describing the failure */
  readonly message: string;
  /** Nested error structure containing field-specific validation errors */
  readonly errors?: DiscordErrorStructure;
}

/**
 * Recursive error structure containing field-specific validation errors.
 * Organizes errors hierarchically by request field paths for detailed debugging.
 *
 * Each key represents a field name, with values being either nested structures
 * or arrays of errors for that specific field.
 */
export interface DiscordErrorStructure {
  /** Array of errors directly associated with this field or level */
  readonly _errors?: DiscordError[];
  /** Nested error structures or error arrays indexed by field names */
  readonly [key: string]: DiscordErrorStructure | DiscordError[] | undefined;
}

/**
 * Formatted error representation with flattened path information.
 * Simplifies nested Discord error structures into linear, addressable error entries.
 */
export interface DiscordFormattedError {
  /** Dot-separated path to the field that caused this error */
  readonly path: string;
  /** String representation of the error code */
  readonly code: string;
  /** Descriptive error message */
  readonly message: string;
}

/**
 * Configuration options for customizing Discord error formatting behavior.
 * Controls error display format, depth limits, and separator styling.
 */
export interface DiscordErrorFormatOptions {
  /** Whether to include error codes in formatted output */
  readonly includeErrorCodes?: boolean;
  /** Maximum recursion depth to prevent infinite loops (default: 10) */
  readonly maxDepth?: number;
  /** String separator between multiple error entries (default: "; ") */
  readonly separator?: string;
}

/**
 * Recursively parses nested Discord error structures into flat error arrays.
 * Handles arbitrary nesting levels while preventing infinite recursion through depth limiting.
 *
 * @param errors - Nested Discord error structure to parse
 * @param path - Current field path for error attribution (internal recursion use)
 * @param depth - Current recursion depth for loop prevention (internal recursion use)
 * @param maxDepth - Maximum allowed recursion depth before truncation
 * @returns Array of flattened error objects with full path information
 */
export function parseDiscordErrors(
  errors: DiscordErrorStructure,
  path = "",
  depth = 0,
  maxDepth = 10,
): DiscordFormattedError[] {
  if (depth > maxDepth) {
    return [{ path: path || "deep", code: "MAX_DEPTH", message: "Error structure too deep" }];
  }

  const result: DiscordFormattedError[] = [];

  for (const [key, value] of Object.entries(errors)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (key === "_errors" && Array.isArray(value)) {
      // Found error array - add all errors for this path
      for (const error of value) {
        if (error && typeof error === "object" && "code" in error && "message" in error) {
          result.push({
            path: path || "root",
            code: String(error.code),
            message: error.message,
          });
        }
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      // Nested object - recurse
      const nestedErrors = parseDiscordErrors(
        value as DiscordErrorStructure,
        currentPath,
        depth + 1,
        maxDepth,
      );
      result.push(...nestedErrors);
    }
  }

  return result;
}

/**
 * Formats Discord API error responses into human-readable error messages.
 * Combines top-level error information with detailed field-specific validation errors.
 *
 * @param errorResponse - Complete Discord error response to format
 * @param options - Formatting configuration options
 * @returns Formatted error string suitable for logging or user display
 */
export function formatDiscordError(
  errorResponse: DiscordErrorResponse,
  options: DiscordErrorFormatOptions = {},
): string {
  const { includeErrorCodes = false, separator = "; ", maxDepth = 10 } = options;

  if (!errorResponse.errors) {
    return errorResponse.message;
  }

  const parsedErrors = parseDiscordErrors(errorResponse.errors, "", 0, maxDepth);
  if (parsedErrors.length === 0) {
    return errorResponse.message;
  }

  const formattedParts = parsedErrors.map((error) => {
    const pathDisplay = error.path === "root" ? "request" : error.path;
    const codeDisplay = includeErrorCodes ? ` [${error.code}]` : "";
    return `${pathDisplay}: ${error.message}${codeDisplay}`;
  });

  return `${errorResponse.message}. Details: ${formattedParts.join(separator)}`;
}

/**
 * Type guard to determine if an unknown error object is a Discord API error response.
 * Validates the presence and types of required Discord error response fields.
 *
 * @param error - Unknown error object to validate
 * @returns True if error matches Discord API error response structure
 */
export function isDiscordErrorResponse(error: unknown): error is DiscordErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "number" &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}
