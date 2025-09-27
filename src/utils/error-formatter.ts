import type { JsonErrorCodes } from "../resources/index.js";

export interface DiscordError {
  readonly code: JsonErrorCodes;
  readonly message: string;
}

export interface DiscordErrorResponse {
  readonly code: JsonErrorCodes;
  readonly message: string;
  readonly errors?: DiscordErrorStructure;
}

export interface DiscordErrorStructure {
  readonly _errors?: DiscordError[];
  readonly [key: string]: DiscordErrorStructure | DiscordError[] | undefined;
}

export interface DiscordFormattedError {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export interface DiscordErrorFormatOptions {
  readonly includeErrorCodes?: boolean;
  readonly maxDepth?: number;
  readonly separator?: string;
}

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

export function getErrorCodes(errorResponse: DiscordErrorResponse): string[] {
  if (!errorResponse.errors) {
    return [];
  }

  const errors = parseDiscordErrors(errorResponse.errors);
  return [...new Set(errors.map((e) => e.code))];
}

export function getErrorsByPath(
  errorResponse: DiscordErrorResponse,
  pathPattern: string,
): DiscordFormattedError[] {
  if (!errorResponse.errors) {
    return [];
  }

  const errors = parseDiscordErrors(errorResponse.errors);
  const regex = new RegExp(pathPattern.replace(/\*/g, ".*").replace(/\./g, "\\."));

  return errors.filter((error) => regex.test(error.path));
}
