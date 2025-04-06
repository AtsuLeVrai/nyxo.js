import type { GatewayReceiveEvents } from "@nyxjs/gateway";
import { EventEmitter } from "eventemitter3";
import type { Client } from "../core/index.js";
import { StandardGatewayDispatchEventMappings } from "../data/index.js";
import type { ClientEvents } from "../types/index.js";

/**
 * Function signature for event handlers with strongly typed parameters
 */
export type EventHandler<T extends unknown[]> = (
  ...args: T
) => void | Promise<void>;

/**
 * Function signature for middleware functions that can modify or intercept events
 */
export type EventMiddleware<T extends unknown[]> = (
  args: T,
  next: (newArgs?: T) => void | Promise<void>,
) => void | Promise<void>;

/**
 * Handler configuration options
 */
export interface HandlerOptions {
  /**
   * Priority value to determine execution order (higher executes first)
   * @default 0
   */
  priority?: number;

  /**
   * Whether to run this handler only once
   * @default false
   */
  once?: boolean;

  /**
   * Optional tag to group related handlers
   */
  group?: string;

  /**
   * Maximum execution time in milliseconds
   * @default 5000 (5 seconds)
   */
  timeout?: number;
}

/**
 * Internal handler information
 */
interface HandlerInfo<T extends unknown[]> {
  handler: EventHandler<T>;
  priority: number;
  once: boolean;
  group?: string;
  timeout: number;
  executed?: boolean;
}

/**
 * Gateway to client event mapping configuration
 */
export interface GatewayEventMapping<
  T extends keyof GatewayReceiveEvents,
  E extends keyof ClientEvents,
> {
  /**
   * Gateway event name
   */
  gatewayEvent: T;

  /**
   * Client event name that this maps to
   */
  clientEvent: E;

  /**
   * Transform function to convert gateway event data to client event data
   */
  transform: (client: Client, data: GatewayReceiveEvents[T]) => ClientEvents[E];
}

/**
 * A powerful and flexible event handler for Discord.js client
 * with support for priorities, middleware, and advanced event processing.
 */
// @ts-expect-error: Complex class with generics
export class ClientEventHandler extends EventEmitter<ClientEvents> {
  /**
   * Store for registered handlers
   */
  #handlers: Map<keyof ClientEvents, HandlerInfo<unknown[]>[]> = new Map();

  /**
   * Store for registered middleware
   */
  #middleware: Map<keyof ClientEvents, EventMiddleware<unknown[]>[]> =
    new Map();

  /**
   * Store for gateway event mappings
   */
  #gatewayMappings: Map<
    keyof GatewayReceiveEvents,
    {
      targetEvent: keyof ClientEvents;
      transform: (client: Client, data: unknown) => unknown[];
    }
  > = new Map();

  /**
   * Maximum number of handlers per event
   * @default 100
   */
  readonly #maxHandlersPerEvent: number;

  /**
   * Default handler timeout in milliseconds
   * @default 5000 (5 seconds)
   */
  readonly #defaultTimeout: number;

  /**
   * Creates a new ClientEventHandler
   *
   * @param options - Configuration options
   * @throws {Error} If client is not provided
   */
  constructor(
    options: {
      maxHandlersPerEvent?: number;
      defaultTimeout?: number;
    } = {},
  ) {
    super();
    this.#maxHandlersPerEvent = options.maxHandlersPerEvent ?? 100;
    this.#defaultTimeout = options.defaultTimeout ?? 5000;

    // Register standard event mappings
    for (const mapping of StandardGatewayDispatchEventMappings) {
      this.#gatewayMappings.set(mapping.gatewayEvent, {
        targetEvent: mapping.clientEvent,
        transform: mapping.transform as (
          client: Client,
          data: unknown,
        ) => unknown[],
      });
    }
  }

  /**
   * Registers an event handler with optional configuration
   *
   * @param event - The event name to listen for
   * @param handler - The handler function to call when the event is emitted
   * @param options - Optional configuration for the handler
   * @throws {Error} If event name or handler is missing
   * @throws {Error} If the maximum number of handlers is exceeded
   * @returns this for chaining
   */
  override on<K extends keyof ClientEvents>(
    event: K,
    handler: EventHandler<ClientEvents[K]>,
    options: HandlerOptions = {},
  ): this {
    if (!event) {
      throw new Error("Event name is required");
    }

    if (!handler || typeof handler !== "function") {
      throw new Error("Handler must be a function");
    }

    const {
      priority = 0,
      once = false,
      group,
      timeout = this.#defaultTimeout,
    } = options;

    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, []);

      // Set up the actual event listener
      super.on(event, async (...args: ClientEvents[K]) => {
        await this.#handleEvent(event, args);
      });
    }

    const handlers = this.#handlers.get(event) as HandlerInfo<unknown[]>[];

    // Check handler limit to prevent potential DoS
    if (handlers.length >= this.#maxHandlersPerEvent) {
      throw new Error(
        `Maximum number of handlers (${this.#maxHandlersPerEvent}) for event "${String(event)}" exceeded`,
      );
    }

    handlers.push({
      handler: handler as EventHandler<unknown[]>,
      priority,
      once,
      group,
      timeout,
    });

    // Sort handlers by priority (highest first)
    handlers.sort((a, b) => b.priority - a.priority);

    return this;
  }

  /**
   * Registers a one-time event handler that will be removed after being triggered once
   *
   * @param event - The event name to listen for
   * @param handler - The handler function to call when the event is emitted
   * @param options - Optional configuration for the handler
   * @throws {Error} If event name or handler is missing
   * @throws {Error} If the maximum number of handlers is exceeded
   * @returns this for chaining
   */
  override once<K extends keyof ClientEvents>(
    event: K,
    handler: EventHandler<ClientEvents[K]>,
    options: Omit<HandlerOptions, "once"> = {},
  ): this {
    return this.on(event, handler, { ...options, once: true });
  }

  /**
   * Removes a specific event handler
   *
   * @param event - The event name
   * @param handler - The handler function to remove
   * @throws {Error} If event name or handler is missing
   * @returns this for chaining
   */
  override off<K extends keyof ClientEvents>(
    event: K,
    handler: EventHandler<ClientEvents[K]>,
  ): this {
    if (!event) {
      throw new Error("Event name is required");
    }

    if (!handler || typeof handler !== "function") {
      throw new Error("Handler must be a function");
    }

    if (this.#handlers.has(event)) {
      const handlers = this.#handlers.get(event);
      if (!handlers) {
        return this;
      }

      const index = handlers.findIndex((info) => info.handler === handler);

      if (index !== -1) {
        handlers.splice(index, 1);

        // If no handlers left, remove the listener
        if (handlers.length === 0) {
          this.removeAllListeners(event);
          this.#handlers.delete(event);
        }
      }
    }

    return this;
  }

  /**
   * Removes all event handlers for a specific event or all events
   *
   * @param event - Optional event name, if not specified all events will be cleared
   * @param group - Optional group name to only remove handlers from a specific group
   * @returns this for chaining
   */
  override removeAllListeners<K extends keyof ClientEvents>(
    event?: K,
    group?: string,
  ): this {
    if (event) {
      if (group) {
        // Remove only handlers for the specified group
        if (this.#handlers.has(event)) {
          const handlers = this.#handlers.get(event);
          if (!handlers) {
            return this;
          }

          const filteredHandlers = handlers.filter(
            (info) => info.group !== group,
          );

          if (filteredHandlers.length === 0) {
            this.removeAllListeners(event);
            this.#handlers.delete(event);
          } else {
            this.#handlers.set(event, filteredHandlers);
          }
        }
      } else {
        // Remove all handlers for the specific event
        this.removeAllListeners(event);
        this.#handlers.delete(event);
      }
    } else if (group) {
      // Remove handlers only for the specified group across all events
      for (const [eventName, handlers] of this.#handlers.entries()) {
        const filteredHandlers = handlers.filter(
          (info) => info.group !== group,
        );

        if (filteredHandlers.length === 0) {
          this.removeAllListeners(eventName);
          this.#handlers.delete(eventName);
        } else {
          this.#handlers.set(eventName, filteredHandlers);
        }
      }
    } else {
      // Remove all handlers for all events
      this.removeAllListeners();
      this.#handlers.clear();
      this.#middleware.clear();
    }

    return this;
  }

  /**
   * Adds a middleware function for an event that can intercept, modify, or cancel events
   *
   * @param event - The event name
   * @param middleware - The middleware function
   * @throws {Error} If event name or middleware is missing
   * @returns this for chaining
   */
  use<K extends keyof ClientEvents>(
    event: K,
    middleware: EventMiddleware<ClientEvents[K]>,
  ): this {
    if (!event) {
      throw new Error("Event name is required");
    }

    if (!middleware || typeof middleware !== "function") {
      throw new Error("Middleware must be a function");
    }

    if (!this.#middleware.has(event)) {
      this.#middleware.set(event, []);
    }

    (this.#middleware.get(event) as EventMiddleware<unknown[]>[]).push(
      middleware as never,
    );
    return this;
  }

  /**
   * Removes a middleware function for an event
   *
   * @param event - The event name
   * @param middleware - The middleware function to remove
   * @throws {Error} If event name or middleware is missing
   * @returns this for chaining
   */
  removeMiddleware<K extends keyof ClientEvents>(
    event: K,
    middleware: EventMiddleware<ClientEvents[K]>,
  ): this {
    if (!event) {
      throw new Error("Event name is required");
    }

    if (!middleware || typeof middleware !== "function") {
      throw new Error("Middleware must be a function");
    }

    if (this.#middleware.has(event)) {
      const middlewareList = this.#middleware.get(event) as EventMiddleware<
        unknown[]
      >[];
      const index = middlewareList.indexOf(middleware as never);

      if (index !== -1) {
        middlewareList.splice(index, 1);

        if (middlewareList.length === 0) {
          this.#middleware.delete(event);
        }
      }
    }

    return this;
  }

  /**
   * Emits an event with the provided arguments
   *
   * @param event - The event name to emit
   * @param args - Arguments to pass to the event handlers
   * @throws {Error} If event name is missing
   * @returns boolean indicating if the event had listeners
   */
  override emit<K extends keyof ClientEvents>(
    event: K,
    ...args: ClientEvents[K]
  ): boolean {
    if (!event) {
      throw new Error("Event name is required");
    }

    try {
      return super.emit(event, ...(args as never));
    } catch {
      return false;
    }
  }

  /**
   * Maps a Gateway event to a client event with data transformation
   *
   * @param gatewayEvent - The Gateway event name
   * @param clientEvent - The client event name
   * @param transform - Function to transform the event data
   * @throws {Error} If any required parameter is missing
   * @returns this for chaining
   */
  mapGatewayEvent<
    T extends keyof GatewayReceiveEvents,
    E extends keyof ClientEvents,
  >(
    gatewayEvent: T,
    clientEvent: E,
    transform: (
      client: Client,
      data: GatewayReceiveEvents[T],
    ) => ClientEvents[E],
  ): this {
    if (!gatewayEvent) {
      throw new Error("Gateway event name is required");
    }

    if (!clientEvent) {
      throw new Error("Client event name is required");
    }

    if (!transform || typeof transform !== "function") {
      throw new Error("Transform function is required");
    }

    this.#gatewayMappings.set(gatewayEvent, {
      targetEvent: clientEvent,
      transform: transform as (client: Client, data: unknown) => unknown[],
    });

    return this;
  }

  /**
   * Sets up multiple Gateway to client event mappings
   *
   * @param mappings - Array of Gateway event mapping configurations
   * @throws {Error} If mappings are invalid
   * @returns this for chaining
   */
  registerGatewayEvents<
    T extends keyof GatewayReceiveEvents,
    E extends keyof ClientEvents,
  >(mappings: GatewayEventMapping<T, E>[]): this {
    if (!Array.isArray(mappings)) {
      throw new Error("Mappings must be an array");
    }

    for (const mapping of mappings) {
      if (!mapping || typeof mapping !== "object") {
        throw new Error("Invalid mapping: must be an object");
      }

      if (!mapping.gatewayEvent) {
        throw new Error("Gateway event name is required in mapping");
      }

      if (!mapping.clientEvent) {
        throw new Error("Client event name is required in mapping");
      }

      if (!mapping.transform || typeof mapping.transform !== "function") {
        throw new Error("Transform function is required in mapping");
      }

      this.mapGatewayEvent(
        mapping.gatewayEvent,
        mapping.clientEvent,
        mapping.transform,
      );
    }

    return this;
  }

  /**
   * Handles an incoming Gateway dispatch event
   *
   * @param client - The client instance
   * @param event - The Gateway event name
   * @param data - The event data
   * @throws {Error} If event name is missing
   */
  handleGatewayDispatch<T extends keyof GatewayReceiveEvents>(
    client: Client,
    event: T,
    data: GatewayReceiveEvents[T],
  ): void {
    if (!event) {
      throw new Error("Gateway event name is required");
    }

    if (this.#gatewayMappings.has(event)) {
      const { targetEvent, transform } = this.#gatewayMappings.get(event) as {
        targetEvent: keyof ClientEvents;
        transform: (client: Client, data: unknown) => unknown[];
      };

      // Transform data and emit the corresponding client event
      const transformedData = transform(client, data);
      // @ts-expect-error
      this.emit(targetEvent as keyof ClientEvents, ...transformedData);
    }
  }

  /**
   * Gets the number of listeners for an event
   *
   * @param event - The event name
   * @throws {Error} If event name is missing
   * @returns The number of listeners
   */
  override listenerCount<K extends keyof ClientEvents>(event: K): number {
    if (!event) {
      throw new Error("Event name is required");
    }

    return this.#handlers.has(event)
      ? (this.#handlers.get(event) as HandlerInfo<unknown[]>[]).length
      : 0;
  }

  /**
   * Gets all registered event names
   *
   * @returns Array of event names
   */
  override eventNames(): Array<keyof ClientEvents> {
    return Array.from(this.#handlers.keys());
  }

  /**
   * Gets all handlers for an event grouped by tag
   *
   * @param event - The event name
   * @throws {Error} If event name is missing
   * @returns Map of group names to arrays of handlers
   */
  getHandlersByGroup<K extends keyof ClientEvents>(
    event: K,
  ): Map<string | undefined, EventHandler<ClientEvents[K]>[]> {
    if (!event) {
      throw new Error("Event name is required");
    }

    const result = new Map<
      string | undefined,
      EventHandler<ClientEvents[K]>[]
    >();

    if (this.#handlers.has(event)) {
      const handlers = this.#handlers.get(event) as HandlerInfo<unknown[]>[];

      for (const handlerInfo of handlers) {
        const group = handlerInfo.group;

        if (!result.has(group)) {
          result.set(group, []);
        }

        (result.get(group) as EventHandler<ClientEvents[K]>[]).push(
          handlerInfo.handler as EventHandler<ClientEvents[K]>,
        );
      }
    }

    return result;
  }

  /**
   * Execute a handler with timeout protection
   *
   * @private
   * @param handlerInfo - The handler information
   * @param args - Arguments to pass to the handler
   */
  async #executeHandlerWithTimeout(
    handlerInfo: HandlerInfo<unknown[]>,
    args: unknown[],
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      // Create a timeout to abort long-running handlers
      const timeoutId = setTimeout(() => {
        resolve();
      }, handlerInfo.timeout);

      // Execute the handler
      Promise.resolve(handlerInfo.handler(...args)).finally(() => {
        clearTimeout(timeoutId);
        resolve();
      });
    });
  }

  /**
   * Handles the processing of an event including running middleware and handlers
   *
   * @private
   * @param event - The event name
   * @param args - The event arguments
   */
  async #handleEvent<K extends keyof ClientEvents>(
    event: K,
    args: ClientEvents[K],
  ): Promise<void> {
    // Create a local copy of the arguments to avoid mutation
    let processedArgs: ClientEvents[K] = [...args] as ClientEvents[K];

    // Run middleware chain
    if (this.#middleware.has(event)) {
      const middlewareList = this.#middleware.get(event);
      if (!middlewareList || middlewareList.length === 0) {
        return;
      }

      let index = 0;

      const runMiddleware = async (
        currentArgs: unknown[],
      ): Promise<unknown[] | null> => {
        if (index >= middlewareList.length) {
          return currentArgs;
        }

        let nextCalled = false;
        let nextArgs: unknown[] | undefined;

        const next = (newArgs?: unknown[]): void => {
          nextCalled = true;
          nextArgs = newArgs;
        };

        try {
          await (middlewareList[index++] as EventMiddleware<unknown[]>)(
            currentArgs,
            next,
          );
        } catch {
          return null;
        }

        // If next wasn't called, stop the chain
        if (!nextCalled) {
          return null;
        }

        // Continue with the next middleware
        return runMiddleware(nextArgs || currentArgs);
      };

      // Run the middleware chain
      const finalArgs = await runMiddleware(args as unknown[]);

      // If middleware chain was interrupted, don't run handlers
      if (finalArgs === null) {
        return;
      }

      // Update processedArgs with the final transformed arguments (fixed the bug)
      processedArgs = finalArgs as ClientEvents[K];
    }

    // Run handlers with processedArgs
    if (this.#handlers.has(event)) {
      const handlers = this.#handlers.get(event);
      if (!handlers || handlers.length === 0) {
        return;
      }

      const handlersToRemove: HandlerInfo<unknown[]>[] = [];

      for (const handlerInfo of handlers) {
        if (handlerInfo.executed && handlerInfo.once) {
          continue;
        }

        // Execute the handler with timeout protection
        await this.#executeHandlerWithTimeout(
          handlerInfo,
          processedArgs as unknown[],
        );

        if (handlerInfo.once) {
          handlerInfo.executed = true;
          handlersToRemove.push(handlerInfo);
        }
      }

      // Clean up once handlers
      if (handlersToRemove.length > 0) {
        const updatedHandlers = handlers.filter(
          (info: HandlerInfo<unknown[]>) => !handlersToRemove.includes(info),
        );

        if (updatedHandlers.length === 0) {
          this.removeAllListeners(event);
          this.#handlers.delete(event);
        } else {
          this.#handlers.set(event, updatedHandlers);
        }
      }
    }
  }
}
