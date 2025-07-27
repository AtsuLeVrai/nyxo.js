/**
 * Success result containing resolved value.
 * Represents positive path with no errors.
 *
 * @typeParam T - Type of successful result value
 *
 * @public
 */
export interface TryCatchSuccess<T> {
  /** Discriminant indicating successful result */
  success: true;
  /** Resolved value from operation */
  data: T;
  /** No error occurred */
  error: null;
}

/**
 * Error result containing caught error.
 * Represents negative path with error information.
 *
 * @typeParam E - Type of error that occurred
 *
 * @public
 */
export interface TryCatchError<E = Error> {
  /** Discriminant indicating error result */
  success: false;
  /** No data available due to error */
  data: null;
  /** Error that occurred during execution */
  error: E;
}

/**
 * Union type representing either success or error result.
 * Provides explicit error handling without throwing exceptions.
 *
 * @typeParam T - Type of successful result value
 * @typeParam E - Type of error
 *
 * @example
 * ```typescript
 * const result: TryCatchResult<User, ApiError> = await tryCatch(api.fetchUser(id));
 *
 * if (result.success) {
 *   console.log(`Hello ${result.data.name}!`);
 * } else {
 *   console.error(`Failed: ${result.error.message}`);
 * }
 * ```
 *
 * @public
 */
export type TryCatchResult<T, E = Error> =
  | TryCatchSuccess<T>
  | TryCatchError<E>;

/**
 * Error boundary wrapper for Promise-based operations.
 * Transforms throwing async functions into explicit Result types.
 *
 * @typeParam T - Resolved type of Promise
 * @typeParam E - Expected error type
 *
 * @param promise - Promise to execute with error handling
 * @returns Promise resolving to TryCatchResult
 *
 * @example
 * ```typescript
 * const result = await tryCatch(fetch('/api/users'));
 *
 * if (result.success) {
 *   const users = await result.data.json();
 *   console.log('Users loaded:', users.length);
 * } else {
 *   console.error('API call failed:', result.error.message);
 * }
 * ```
 *
 * @see {@link tryCatchSync} - For synchronous operations
 *
 * @public
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<TryCatchResult<T, E>> {
  try {
    const data = await promise;

    return {
      success: true,
      data,
      error: null,
    } as const;
  } catch (caught) {
    const error =
      caught instanceof Error
        ? (caught as E)
        : (new Error(String(caught)) as E);

    return {
      success: false,
      data: null,
      error,
    } as const;
  }
}

/**
 * Error boundary wrapper for synchronous operations.
 * Provides explicit error handling for functions that may throw.
 *
 * @typeParam T - Return type of synchronous function
 * @typeParam E - Expected error type
 *
 * @param fn - Synchronous function to execute safely
 * @returns TryCatchResult with success or error
 *
 * @example
 * ```typescript
 * const parseResult = tryCatchSync(() => JSON.parse(userInput));
 *
 * if (parseResult.success) {
 *   console.log('Parsed data:', parseResult.data);
 * } else {
 *   console.error('Invalid JSON:', parseResult.error.message);
 * }
 * ```
 *
 * @see {@link tryCatch} - For Promise-based operations
 *
 * @public
 */
export function tryCatchSync<T, E = Error>(fn: () => T): TryCatchResult<T, E> {
  try {
    const data = fn();

    return {
      success: true,
      data,
      error: null,
    } as const;
  } catch (caught) {
    const error =
      caught instanceof Error
        ? (caught as E)
        : (new Error(String(caught)) as E);

    return {
      success: false,
      data: null,
      error,
    } as const;
  }
}

/**
 * Type guard to check if TryCatchResult represents success.
 *
 * @typeParam T - Success data type
 * @typeParam E - Error type
 *
 * @param result - TryCatchResult to check
 * @returns Type predicate for successful result
 *
 * @example
 * ```typescript
 * const results = await Promise.all([
 *   tryCatch(api.getUser(1)),
 *   tryCatch(api.getUser(2))
 * ]);
 *
 * const successfulUsers = results
 *   .filter(isSuccess)
 *   .map(result => result.data);
 * ```
 *
 * @see {@link isError} - For checking error results
 *
 * @public
 */
export function isSuccess<T, E = Error>(
  result: TryCatchResult<T, E>,
): result is TryCatchSuccess<T> {
  return result.success;
}

/**
 * Type guard to check if TryCatchResult represents error.
 *
 * @typeParam T - Success data type
 * @typeParam E - Error type
 *
 * @param result - TryCatchResult to check
 * @returns Type predicate for error result
 *
 * @example
 * ```typescript
 * const results = await Promise.all([
 *   tryCatch(api.getUser(1)),
 *   tryCatch(api.getUser(2))
 * ]);
 *
 * results
 *   .filter(isError)
 *   .forEach(result => {
 *     console.error('Failed:', result.error.message);
 *   });
 * ```
 *
 * @see {@link isSuccess} - For checking successful results
 *
 * @public
 */
export function isError<T, E = Error>(
  result: TryCatchResult<T, E>,
): result is TryCatchError<E> {
  return !result.success;
}
