import { z } from "zod";
import type {
  Middleware,
  MiddlewareContext,
  MiddlewareResult,
} from "../types/index.js";

/**
 * Configuration options for the middleware manager.
 *
 * @example
 * ```typescript
 * const config: MiddlewareManagerOptions = {
 *   continueOnError: false,
 *   enableMetrics: true
 * };
 * ```
 *
 * @public
 */
export const MiddlewareManagerOptions = z.object({
  /**
   * Whether to continue executing remaining middleware if one fails.
   *
   * @default false - Stop on first error
   */
  continueOnError: z.boolean().default(false),

  /**
   * Whether to collect execution metrics for middleware.
   *
   * @default true
   */
  enabled: z.boolean().default(true),
});

export type MiddlewareManagerOptions = z.infer<typeof MiddlewareManagerOptions>;

/**
 * High-performance middleware execution engine for REST client pipeline.
 *
 * Manages the complete lifecycle of middleware execution including request preprocessing,
 * response postprocessing, and error handling. Provides comprehensive error isolation,
 * execution metrics, and configurable failure behavior for production environments.
 *
 * @example
 * ```typescript
 * // Create middleware manager
 * const manager = new MiddlewareManager({
 *   continueOnError: false,
 *   enableMetrics: true
 * });
 *
 * // Register middleware
 * manager.use(loggingMiddleware);
 * manager.use(authMiddleware);
 * manager.use(metricsMiddleware);
 *
 * // Execute middleware pipeline
 * const context = await manager.executeBeforeRequest(initialContext);
 * ```
 *
 * @public
 */
export class MiddlewareManager {
  /**
   * Registry of active middleware in execution order.
   * Middleware is executed in the order it was registered.
   *
   * @internal
   */
  readonly #middleware: Middleware[] = [];

  /**
   * Configuration options controlling manager behavior.
   *
   * @internal
   */
  readonly #options: Required<MiddlewareManagerOptions>;

  /**
   * Execution metrics for monitoring and debugging.
   * Tracks execution count, duration, and error rates per middleware.
   *
   * @internal
   */
  readonly #metrics = new Map<
    string,
    {
      executions: number;
      totalDuration: number;
      errors: number;
      lastExecution: number;
    }
  >();

  /**
   * Creates a new middleware manager with the specified configuration.
   *
   * @param options - Configuration options for middleware behavior
   *
   * @example
   * ```typescript
   * // Default configuration
   * const manager = new MiddlewareManager();
   *
   * // Custom configuration
   * const manager = new MiddlewareManager({
   *   continueOnError: true,
   *   enableMetrics: false
   * });
   * ```
   *
   * @public
   */
  constructor(options: MiddlewareManagerOptions) {
    this.#options = options;
  }

  /**
   * Registers a middleware to be executed in the request pipeline.
   *
   * Middleware is executed in the order it's registered. Each middleware
   * must have a unique name to prevent conflicts and enable proper metrics tracking.
   *
   * @param middleware - The middleware to register
   * @throws {Error} If a middleware with the same name is already registered
   *
   * @example
   * ```typescript
   * manager.use({
   *   name: "auth",
   *   beforeRequest: async (context) => {
   *     context.request.headers.authorization = `Bearer ${token}`;
   *     return context;
   *   }
   * });
   * ```
   *
   * @public
   */
  use(middleware: Middleware): void {
    // Prevent duplicate middleware names to avoid confusion in metrics
    if (this.#middleware.some((m) => m.name === middleware.name)) {
      throw new Error(
        `Middleware with name '${middleware.name}' is already registered`,
      );
    }

    this.#middleware.push(middleware);

    // Initialize metrics tracking for this middleware
    if (this.#options.enabled) {
      this.#metrics.set(middleware.name, {
        executions: 0,
        totalDuration: 0,
        errors: 0,
        lastExecution: 0,
      });
    }
  }

  /**
   * Removes a middleware from the execution pipeline.
   *
   * @param name - The name of the middleware to remove
   * @returns `true` if middleware was found and removed, `false` otherwise
   *
   * @example
   * ```typescript
   * // Remove specific middleware
   * const removed = manager.remove("auth");
   * if (removed) {
   *   console.log("Auth middleware removed");
   * }
   * ```
   *
   * @public
   */
  remove(name: string): boolean {
    const index = this.#middleware.findIndex((m) => m.name === name);
    if (index === -1) {
      return false;
    }

    this.#middleware.splice(index, 1);
    this.#metrics.delete(name);
    return true;
  }

  /**
   * Removes all middleware from the execution pipeline.
   *
   * @example
   * ```typescript
   * // Clear all middleware during testing
   * manager.clear();
   * ```
   *
   * @public
   */
  clear(): void {
    this.#middleware.length = 0;
    this.#metrics.clear();
  }

  /**
   * Returns a list of all registered middleware names in execution order.
   *
   * @returns Array of middleware names
   *
   * @example
   * ```typescript
   * const middlewareNames = manager.list();
   * console.log("Active middleware:", middlewareNames);
   * ```
   *
   * @public
   */
  list(): string[] {
    return this.#middleware.map((m) => m.name);
  }

  /**
   * Executes all beforeRequest hooks in the middleware pipeline.
   *
   * Processes middleware in registration order, allowing each to inspect and modify
   * the request context before the HTTP request is executed. If any middleware fails
   * and continueOnError is false, execution stops and the error is propagated.
   *
   * @param context - The initial request context
   * @returns Promise resolving to the final processed context
   * @throws {Error} If any middleware fails and continueOnError is false
   *
   * @example
   * ```typescript
   * const context: MiddlewareContext = {
   *   requestId: crypto.randomUUID(),
   *   method: "POST",
   *   path: "/channels/123/messages",
   *   request: { method: "POST", path: "/channels/123/messages", body: "{...}" },
   *   startTime: Date.now(),
   *   metadata: {}
   * };
   *
   * const processedContext = await manager.executeBeforeRequest(context);
   * ```
   *
   * @public
   */
  async executeBeforeRequest<T>(
    context: MiddlewareContext<T>,
  ): Promise<MiddlewareContext<T>> {
    let currentContext = context;

    for (const middleware of this.#middleware) {
      if (!middleware.beforeRequest) continue;

      const result = await this.#executeMiddlewareHook(middleware.name, () =>
        middleware.beforeRequest?.(currentContext),
      );

      if (!result.success) {
        if (!this.#options.continueOnError) {
          throw result.error;
        }
        // Log error but continue if configured to do so
        console.warn(
          `Middleware '${middleware.name}' beforeRequest hook failed:`,
          result.error,
        );
        continue;
      }

      currentContext = result.context as MiddlewareContext<T>;
    }

    return currentContext;
  }

  /**
   * Executes all afterResponse hooks in the middleware pipeline.
   *
   * Processes middleware in registration order, allowing each to inspect and modify
   * the response context after successful HTTP response. Useful for response caching,
   * transformation, and additional processing.
   *
   * @param context - The response context with completed request data
   * @returns Promise resolving to the final processed context
   * @throws {Error} If any middleware fails and continueOnError is false
   *
   * @example
   * ```typescript
   * const contextWithResponse = {
   *   ...context,
   *   response: {
   *     statusCode: 200,
   *     headers: {...},
   *     data: {...}
   *   }
   * };
   *
   * const processedContext = await manager.executeAfterResponse(contextWithResponse);
   * ```
   *
   * @public
   */
  async executeAfterResponse<T>(
    context: MiddlewareContext<T>,
  ): Promise<MiddlewareContext<T>> {
    let currentContext = context;

    for (const middleware of this.#middleware) {
      if (!middleware.afterResponse) continue;

      const result = await this.#executeMiddlewareHook(middleware.name, () =>
        middleware.afterResponse?.(currentContext),
      );

      if (!result.success) {
        if (!this.#options.continueOnError) {
          throw result.error;
        }
        console.warn(
          `Middleware '${middleware.name}' afterResponse hook failed:`,
          result.error,
        );
        continue;
      }

      currentContext = result.context as MiddlewareContext<T>;
    }

    return currentContext;
  }

  /**
   * Executes all onError hooks in the middleware pipeline.
   *
   * Processes middleware in registration order when an error occurs during request
   * processing. Allows middleware to handle errors, implement recovery logic,
   * or modify error responses before they're propagated to the caller.
   *
   * @param context - The error context with failure information
   * @returns Promise resolving to the final processed context
   * @throws {Error} If any middleware fails and continueOnError is false
   *
   * @example
   * ```typescript
   * const errorContext = {
   *   ...context,
   *   error: new Error("Network timeout")
   * };
   *
   * try {
   *   const processedContext = await manager.executeOnError(errorContext);
   *   // Check if middleware resolved the error
   *   if (!processedContext.error) {
   *     // Error was handled, continue processing
   *   }
   * } catch (error) {
   *   // Middleware couldn't handle the error
   * }
   * ```
   *
   * @public
   */
  async executeOnError<T>(
    context: MiddlewareContext<T>,
  ): Promise<MiddlewareContext<T>> {
    let currentContext = context;

    for (const middleware of this.#middleware) {
      if (!middleware.onError) continue;

      const result = await this.#executeMiddlewareHook(middleware.name, () =>
        middleware.onError?.(currentContext),
      );

      if (!result.success) {
        if (!this.#options.continueOnError) {
          throw result.error;
        }
        console.warn(
          `Middleware '${middleware.name}' onError hook failed:`,
          result.error,
        );
        continue;
      }

      currentContext = result.context as MiddlewareContext<T>;
    }

    return currentContext;
  }

  /**
   * Retrieves execution metrics for all middleware.
   *
   * Provides comprehensive performance and reliability metrics for monitoring
   * middleware behavior in production environments. Includes execution counts,
   * average duration, error rates, and timing information.
   *
   * @returns Map of middleware names to their execution metrics
   *
   * @example
   * ```typescript
   * const metrics = manager.getMetrics();
   * for (const [name, stats] of metrics) {
   *   console.log(`${name}: ${stats.executions} executions, ${stats.errors} errors`);
   *   console.log(`  Average duration: ${stats.totalDuration / stats.executions}ms`);
   * }
   * ```
   *
   * @public
   */
  getMetrics(): Map<
    string,
    {
      executions: number;
      totalDuration: number;
      errors: number;
      lastExecution: number;
      averageDuration: number;
      errorRate: number;
    }
  > {
    const result = new Map();

    for (const [name, metrics] of this.#metrics) {
      result.set(name, {
        executions: metrics.executions,
        totalDuration: metrics.totalDuration,
        errors: metrics.errors,
        lastExecution: metrics.lastExecution,
        averageDuration:
          metrics.executions > 0
            ? metrics.totalDuration / metrics.executions
            : 0,
        errorRate:
          metrics.executions > 0 ? metrics.errors / metrics.executions : 0,
      });
    }

    return result;
  }

  /**
   * Resets all collected metrics for fresh monitoring periods.
   *
   * @example
   * ```typescript
   * // Reset metrics at the start of each day
   * manager.resetMetrics();
   * ```
   *
   * @public
   */
  resetMetrics(): void {
    for (const metrics of this.#metrics.values()) {
      metrics.executions = 0;
      metrics.totalDuration = 0;
      metrics.errors = 0;
      metrics.lastExecution = 0;
    }
  }

  /**
   * Executes a middleware hook with error handling and metrics collection.
   *
   * @param name - Name of the middleware for metrics tracking
   * @param hookFn - The actual hook function to execute
   * @returns Promise resolving to execution result with success/error status
   *
   * @internal
   */
  async #executeMiddlewareHook<T>(
    name: string,
    hookFn: () => Promise<MiddlewareContext<T>>,
  ): Promise<MiddlewareResult<T>> {
    const startTime = Date.now();

    try {
      const context = await hookFn();

      // Record successful execution metrics
      if (this.#options.enabled) {
        const metrics = this.#metrics.get(name);
        if (metrics) {
          metrics.executions++;
          metrics.totalDuration += Date.now() - startTime;
          metrics.lastExecution = Date.now();
        }
      }

      return {
        success: true,
        context,
      };
    } catch (error) {
      // Record error metrics
      if (this.#options.enabled) {
        const metrics = this.#metrics.get(name);
        if (metrics) {
          metrics.executions++;
          metrics.errors++;
          metrics.totalDuration += Date.now() - startTime;
          metrics.lastExecution = Date.now();
        }
      }

      return {
        success: false,
        context: {} as MiddlewareContext<T>, // Placeholder context for error cases
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
