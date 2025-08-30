# TSDoc Documentation Guidelines

> **Clean, focused documentation standards for production npm packages**  
> Using essential TSDoc tags for maximum clarity and tool compatibility

## 🎯 Core Documentation Tags

We use **only** these TSDoc tags for consistency and maintainability:

- **@param** - Parameter descriptions
- **@returns** - Return value descriptions
- **@see @link** - Cross-references and external links
- **@throws** - Error conditions
- **@private** - Internal implementation details
- **@deprecated** - Legacy features and migration paths
- **@typeParam** - Generic type parameter descriptions

---

## 📋 Standard Documentation Pattern

```typescript
/**
 * Clear, concise description of the function's purpose and behavior.
 *
 * @typeParam T - Description of generic type parameter
 * @param paramName - Parameter description with constraints
 * @param optionalParam - Optional parameter with default behavior
 * @returns Description of return value and possible states
 * @throws {ErrorType} Condition that triggers this error
 * @see {@link RelatedFunction} for similar functionality
 * @see {@link https://example.com/docs} for detailed documentation
 */
```

---

## 🏗️ Documentation by Element Type

### 🔧 Functions

**Standard Functions**

```typescript
/**
 * Validates email address format according to RFC 5322 specification.
 * Performs both syntax and domain validation for production use.
 *
 * @param email - Email address string to validate
 * @param options - Validation configuration options
 * @returns True if email is valid, false otherwise
 * @throws {ValidationError} When email contains malicious content
 * @see {@link https://tools.ietf.org/html/rfc5322} for email format specification
 */
export function validateEmail(email: string, options?: ValidationOptions): boolean {
    // Implementation
}

/**
 * Transforms array elements using provided mapper function with type safety.
 *
 * @typeParam T - Input array element type
 * @typeParam U - Output array element type after transformation
 * @param items - Array of items to transform
 * @param mapper - Function to transform each element
 * @returns New array with transformed elements
 */
export function mapArray<T, U>(items: T[], mapper: (item: T) => U): U[] {
    // Implementation
}
```

**Async Functions**

```typescript
/**
 * Fetches user data from remote API with automatic retry and caching.
 * Uses exponential backoff for transient failures.
 *
 * @param userId - Unique identifier for the user
 * @param options - Request configuration and caching options
 * @returns Promise resolving to user data object
 * @throws {NetworkError} When API is unreachable after retries
 * @throws {NotFoundError} When user ID doesn't exist
 * @see {@link UserCache} for caching implementation details
 */
export async function fetchUser(userId: string, options?: FetchOptions): Promise<User> {
    // Implementation
}
```

### 🏛️ Classes

```typescript
/**
 * Thread-safe event emitter with typed event handling and memory leak protection.
 * Automatically removes listeners when max listener count is exceeded.
 */
export class TypedEventEmitter<T extends EventMap> {
    /**
     * @private
     * Internal map of event listeners for memory management
     */
    private listeners = new Map<keyof T, Set<Function>>();

    /**
     * Registers event listener with automatic cleanup capabilities.
     *
     * @typeParam K - Event name type constraint
     * @param event - Event name to listen for
     * @param listener - Callback function to handle event
     * @returns Cleanup function to remove listener
     * @throws {MaxListenersError} When listener limit exceeded
     */
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
        // Implementation
    }

    /**
     * Emits event to all registered listeners with error isolation.
     *
     * @typeParam K - Event name type constraint
     * @param event - Event name to emit
     * @param data - Event payload data
     * @returns Number of listeners that received the event
     */
    emit<K extends keyof T>(event: K, data: T[K]): number {
        // Implementation
    }

    /**
     * @deprecated Use `removeAllListeners()` instead. Will be removed in v3.0.0.
     * @see {@link removeAllListeners}
     */
    clear(): void {
        this.removeAllListeners();
    }
}
```

### 🏷️ Type Definitions

```typescript
/**
 * Configuration options for HTTP request handling with timeout and retry logic.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request} for native Request options
 */
export interface RequestConfig {
    /** Request timeout in milliseconds (default: 5000) */
    timeout?: number;

    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;

    /** Custom headers to include with request */
    headers?: Record<string, string>;
}

/**
 * Generic API response wrapper with consistent error handling.
 *
 * @typeParam T - Response data type
 * @see {@link ApiError} for error response structure
 */
export type ApiResponse<T> = {
    data: T;
    status: number;
    message?: string;
};

/**
 * @deprecated Use `ApiResponse<T>` instead. Will be removed in v3.0.0.
 * @see {@link ApiResponse}
 */
export type LegacyResponse<T> = ApiResponse<T>;
```

### 🔧 Utility Objects and Constants

```typescript
/**
 * Collection of string manipulation utilities for common text processing tasks.
 * All functions are pure and side-effect free for predictable behavior.
 *
 * @see {@link https://lodash.com/docs} for similar utility patterns
 */
export const StringUtils = {
        /**
         * Converts string to camelCase format removing special characters.
         *
         * @param input - String to convert to camelCase
         * @returns Converted camelCase string
         */
        toCamelCase: (input: string): string => {
            // Implementation
        },

        /**
         * Truncates string to specified length with ellipsis indicator.
         *
         * @param text - String to truncate
         * @param maxLength - Maximum allowed length including ellipsis
         * @param suffix - Custom suffix for truncated strings (default: "...")
         * @returns Truncated string with suffix if needed
         */
        truncate: (text: string, maxLength: number, suffix = "..."): string => {
            // Implementation
        }
    } as const;

/**
 * HTTP status codes following RFC 7231 specification.
 * Used throughout the API for consistent response handling.
 *
 * @see {@link https://tools.ietf.org/html/rfc7231#section-6} for complete specification
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
} as const;
```

### 🔒 Private APIs

```typescript
export class DatabaseManager {
    /**
     * @private
     * Internal connection pool management. Do not access directly.
     * Use `getConnection()` instead for proper connection lifecycle.
     *
     * @see {@link getConnection}
     */
    private connectionPool: ConnectionPool;

    /**
     * @private
     * Validates database schema integrity before operations.
     * Called automatically by public methods.
     *
     * @param tableName - Database table to validate
     * @throws {SchemaError} When table schema is corrupted
     */
    private validateSchema(tableName: string): void {
        // Implementation
    }

    /**
     * Retrieves database connection with automatic pool management.
     *
     * @param options - Connection configuration options
     * @returns Active database connection
     * @throws {ConnectionError} When no connections available
     */
    public getConnection(options?: ConnectionOptions): Connection {
        // Implementation
    }
}
```

---

## 📝 Documentation Quality Guidelines

### ✅ Best Practices

**Clear Parameter Descriptions**

```typescript
/**
 * // ✅ Good - Specific with constraints
 * @param email - Valid email address (RFC 5322 compliant, max 254 characters)
 *
 * // ❌ Bad - Too vague
 * @param email - User email
 */
```

**Meaningful Return Descriptions**

```typescript
/**
 * // ✅ Good - Describes all possible states
 * @returns Promise resolving to user data, or null if user not found
 *
 * // ❌ Bad - Incomplete information
 * @returns User data
 */
```

**Strategic Link Usage**

```typescript
/**
 * // ✅ Good - Adds value
 * @see {@link https://tools.ietf.org/html/rfc3986} for URI specification
 * @see {@link parseUri} for URI parsing utilities
 *
 * // ❌ Bad - Unnecessary noise
 * @see {@link String} for string documentation
 */
```

### 🔄 Deprecation Best Practices

```typescript
/**
 * @deprecated Use `newFunction()` instead. Will be removed in v3.0.0.
 * Migration guide: Replace `oldFunction(x, y)` with `newFunction({x, y})`
 * @see {@link newFunction}
 */
export function oldFunction(x: number, y: number): Result {
    return newFunction({x, y});
}
```

### ⚡ Performance Documentation

```typescript
/**
 * Sorts array in-place using optimized quicksort algorithm.
 * Time complexity: O(n log n) average, O(n²) worst case.
 * Space complexity: O(log n) for recursion stack.
 *
 * @param items - Array to sort (modified in place)
 * @param compareFn - Custom comparison function for sorting logic
 * @returns Reference to the same array for chaining
 */
export function quickSort<T>(items: T[], compareFn?: (a: T, b: T) => number): T[] {
    // Implementation
}
```

---


**This focused approach ensures consistent, maintainable documentation that integrates seamlessly with modern TypeScript
tooling while keeping cognitive overhead minimal for developers.**