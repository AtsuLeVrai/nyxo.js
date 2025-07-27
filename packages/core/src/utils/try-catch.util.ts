/**
 * Success result containing the resolved value from a successful operation.
 *
 * Represents the positive path where no errors occurred during execution.
 * The success discriminant enables TypeScript to correctly narrow types.
 *
 * @typeParam T - The type of the successful result value
 *
 * @public
 */
export interface TryCatchSuccess<T> {
  /** Discriminant indicating this is a successful result */
  success: true;
  /** The resolved value from the operation */
  data: T;
  /** No error occurred */
  error: null;
}

/**
 * Error result containing the caught error and failure information.
 *
 * Represents the negative path where an error was caught during execution.
 * The success discriminant enables TypeScript to correctly narrow types.
 *
 * @typeParam E - The type of the error that occurred
 *
 * @public
 */
export interface TryCatchError<E = Error> {
  /** Discriminant indicating this is an error result */
  success: false;
  /** No data available due to error */
  data: null;
  /** The error that occurred during execution */
  error: E;
}

/**
 * Union type representing either a successful result or an error result.
 *
 * This pattern, heavily advocated by Theo from T3.gg and inspired by Rust's
 * Result type, provides explicit error handling without throwing exceptions.
 * It makes error states visible in the type system and impossible to ignore,
 * leading to more robust and predictable code.
 *
 * The discriminated union enables TypeScript's control flow analysis to
 * correctly narrow types based on the `success` property, providing excellent
 * developer experience and type safety.
 *
 * @typeParam T - The type of the successful result value
 * @typeParam E - The type of the error (defaults to Error)
 *
 * @example
 * ```typescript
 * const result: TryCatchResult<User, ApiError> = await tryCatch(
 *   api.fetchUser(id)
 * );
 *
 * if (result.success) {
 *   // TypeScript knows result.data is User and result.error is null
 *   console.log(`Hello ${result.data.name}!`);
 * } else {
 *   // TypeScript knows result.error is ApiError and result.data is null
 *   console.error(`Failed to fetch user: ${result.error.message}`);
 * }
 * ```
 *
 * @see {@link https://www.youtube.com/c/TheoBrowne1017 | Theo's T3 Stack content}
 * @see {@link https://doc.rust-lang.org/std/result/ | Rust's Result type inspiration}
 *
 * @public
 */
export type TryCatchResult<T, E = Error> =
  | TryCatchSuccess<T>
  | TryCatchError<E>;

/**
 * High-performance error boundary wrapper for Promise-based operations.
 *
 * Transforms throwing async functions into explicit Result types, eliminating
 * the need for try-catch blocks throughout your codebase. This pattern,
 * heavily promoted by Theo from T3.gg, makes error handling explicit and
 * impossible to ignore while maintaining excellent TypeScript inference.
 *
 * The function provides zero-overhead error handling with optimal performance
 * characteristics. No configuration, no magic - just reliable error boundaries
 * that make your async code safer and more predictable.
 *
 * @typeParam T - The resolved type of the Promise
 * @typeParam E - The expected error type (defaults to Error)
 *
 * @param promise - The Promise to execute and wrap with error handling
 *
 * @returns Promise resolving to TryCatchResult with either success or error
 *
 * @example
 * ```typescript
 * // Basic usage - transforms throwing code to Result type
 * const result = await tryCatch(fetch('/api/users'));
 *
 * if (result.success) {
 *   const users = await result.data.json(); // data is Response
 *   console.log('Users loaded:', users.length);
 * } else {
 *   console.error('API call failed:', result.error.message);
 *   // Handle error gracefully without crashing
 * }
 *
 * // With custom error type for better type safety
 * const userResult = await tryCatch<User[], ValidationError>(
 *   validateAndFetchUsers(input)
 * );
 *
 * // No more unhandled promise rejections
 * const dbResult = await tryCatch(database.connect());
 * if (!dbResult.success) {
 *   return res.status(500).json({ error: 'Database unavailable' });
 * }
 * ```
 *
 * @see {@link tryCatchSync} - For synchronous operations
 * @see {@link https://t3.gg | T3 Stack methodology}
 *
 * @public
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<TryCatchResult<T, E>> {
  try {
    // Execute the promise and capture the resolved value
    const data = await promise;

    // Return success result with resolved data
    // Using 'as const' for better type inference and immutability
    return {
      success: true,
      data,
      error: null,
    } as const;
  } catch (caught) {
    // Normalize the error to ensure it's properly typed
    // Handle cases where non-Error objects are thrown
    const error =
      caught instanceof Error
        ? (caught as E)
        : (new Error(String(caught)) as E);

    // Return error result with normalized error information
    return {
      success: false,
      data: null,
      error,
    } as const;
  }
}

/**
 * High-performance error boundary wrapper for synchronous operations.
 *
 * Provides the same explicit error handling benefits as the async version
 * but for synchronous functions that may throw. Particularly useful for
 * JSON parsing, data validation, mathematical operations, and other
 * operations that can fail synchronously.
 *
 * Zero-overhead implementation that simply wraps the function execution
 * in a try-catch and returns a discriminated union. No performance penalty
 * compared to manual try-catch blocks, but with much better ergonomics.
 *
 * @typeParam T - The return type of the synchronous function
 * @typeParam E - The expected error type (defaults to Error)
 *
 * @param fn - The synchronous function to execute safely
 *
 * @returns TryCatchResult with either success or error
 *
 * @example
 * ```typescript
 * // Safe JSON parsing without try-catch blocks
 * const parseResult = tryCatchSync(() => JSON.parse(userInput));
 *
 * if (parseResult.success) {
 *   console.log('Parsed data:', parseResult.data);
 *   return parseResult.data;
 * } else {
 *   console.error('Invalid JSON:', parseResult.error.message);
 *   return null;
 * }
 *
 * // Data validation with Zod schemas
 * const validationResult = tryCatchSync(() => UserSchema.parse(rawData));
 * if (!validationResult.success) {
 *   return res.status(400).json({
 *     error: validationResult.error.message
 *   });
 * }
 *
 * // Mathematical operations that might fail
 * const divisionResult = tryCatchSync(() => {
 *   if (denominator === 0) throw new Error('Division by zero');
 *   return numerator / denominator;
 * });
 * ```
 *
 * @see {@link tryCatch} - For Promise-based operations
 *
 * @public
 */
export function tryCatchSync<T, E = Error>(fn: () => T): TryCatchResult<T, E> {
  try {
    // Execute the synchronous function and capture the result
    const data = fn();

    // Return success result with function output
    return {
      success: true,
      data,
      error: null,
    } as const;
  } catch (caught) {
    // Normalize the error to ensure it's properly typed
    // Handle cases where non-Error objects are thrown
    const error =
      caught instanceof Error
        ? (caught as E)
        : (new Error(String(caught)) as E);

    // Return error result with normalized error information
    return {
      success: false,
      data: null,
      error,
    } as const;
  }
}

/**
 * Type guard utility to check if a TryCatchResult represents a success.
 *
 * Provides a clean way to check result status while leveraging TypeScript's
 * control flow analysis for automatic type narrowing. Useful for functional
 * programming patterns and result chaining.
 *
 * @typeParam T - The success data type
 * @typeParam E - The error type
 *
 * @param result - The TryCatchResult to check
 *
 * @returns Type predicate indicating if the result is successful
 *
 * @example
 * ```typescript
 * const results = await Promise.all([
 *   tryCatch(api.getUser(1)),
 *   tryCatch(api.getUser(2)),
 *   tryCatch(api.getUser(3))
 * ]);
 *
 * // Filter successful results using the type guard
 * const successfulUsers = results
 *   .filter(isSuccess)
 *   .map(result => result.data); // TypeScript knows data is User[]
 *
 * // Or use it in conditionals
 * if (isSuccess(userResult)) {
 *   // TypeScript knows userResult.data is User
 *   console.log(userResult.data.name);
 * }
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
 * Type guard utility to check if a TryCatchResult represents an error.
 *
 * Complementary to isSuccess, provides a clean way to check for error
 * results while leveraging TypeScript's control flow analysis for
 * automatic type narrowing.
 *
 * @typeParam T - The success data type
 * @typeParam E - The error type
 *
 * @param result - The TryCatchResult to check
 *
 * @returns Type predicate indicating if the result is an error
 *
 * @example
 * ```typescript
 * const results = await Promise.all([
 *   tryCatch(api.getUser(1)),
 *   tryCatch(api.getUser(2)),
 *   tryCatch(api.getUser(3))
 * ]);
 *
 * // Filter error results and log them
 * results
 *   .filter(isError)
 *   .forEach(result => {
 *     // TypeScript knows result.error is Error
 *     console.error('Failed to fetch user:', result.error.message);
 *   });
 *
 * // Or use it in conditionals
 * if (isError(userResult)) {
 *   // TypeScript knows userResult.error is Error
 *   throw new ApiError(userResult.error.message);
 * }
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
