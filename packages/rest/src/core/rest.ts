import { clearTimeout } from "node:timers";
import { ApiVersion } from "@nyxojs/core";
import { EventEmitter } from "eventemitter3";
import { Pool } from "undici";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  AuthenticationError,
  CloudflareError,
  DiscordApiError,
  JsonApiError,
  NotFoundError,
  PermissionError,
  RequestTimeoutError,
} from "../errors/index.js";
import { FileHandler } from "../handlers/index.js";
import {
  RateLimitManager,
  RateLimitOptions,
  RetryManager,
  RetryOptions,
} from "../managers/index.js";
import {
  ApplicationCommandRouter,
  ApplicationConnectionRouter,
  ApplicationRouter,
  AuditLogRouter,
  AutoModerationRouter,
  ChannelRouter,
  EmojiRouter,
  EntitlementRouter,
  GatewayRouter,
  GuildRouter,
  GuildTemplateRouter,
  InteractionRouter,
  InviteRouter,
  LobbyRouter,
  MessageRouter,
  OAuth2Router,
  PollRouter,
  ScheduledEventRouter,
  SkuRouter,
  SoundboardRouter,
  StageInstanceRouter,
  StickerRouter,
  SubscriptionRouter,
  UserRouter,
  VoiceRouter,
  WebhookRouter,
} from "../routes/index.js";
import type {
  HttpRequestOptions,
  HttpResponse,
  JsonErrorField,
  JsonErrorResponse,
  RestEvents,
} from "../types/index.js";

/**
 * Constants for REST client configuration and behavior.
 * Contains fixed values, patterns, and configurations used throughout the client.
 */
const REST_CONSTANTS = {
  /**
   * Regular expression to clean leading slashes from API paths.
   * Used to normalize paths before sending requests.
   */
  PATH_REGEX: /^\/+/,

  /**
   * Default HTTP pool configuration for connection management.
   * Optimized for Discord API interaction patterns.
   */
  HTTP_CONFIG: {
    /** Maximum number of concurrent connections in the pool */
    connections: 128,

    /** Maximum number of requests to pipeline per connection */
    pipelining: 10,

    /** Timeout for establishing new connections (ms) */
    connectTimeout: 30000,

    /** Default timeout for keeping idle connections alive (ms) */
    keepAliveTimeout: 60000,

    /** Maximum time a connection can remain idle (ms) */
    keepAliveMaxTimeout: 300000,

    /** Maximum time to wait for headers (ms) */
    headersTimeout: 30000,

    /** Maximum time to wait for the response body (ms) */
    bodyTimeout: 300000,

    /** Maximum size of headers in bytes */
    maxHeaderSize: 16384,

    /** Whether to enable HTTP/2 */
    allowH2: true,

    /** Whether to enforce strict content length validation */
    strictContentLength: true,
  },
} as const;

/**
 * Regular expression pattern for validating Discord bot user agents.
 * Discord requires a specific format for user agents making API requests.
 *
 * Format: `DiscordBot (URL, Version)`
 * Example: `DiscordBot (https://github.com/example/bot, 1.0.0)`
 *
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

/**
 * Configuration options for the REST client.
 *
 * Controls authentication, API version, endpoints, and behavior
 * for requests to the Discord API. Uses Zod for runtime validation
 * to ensure all options are valid before client initialization.
 */
export const RestOptions = z.object({
  /**
   * Discord Bot or Bearer token for authentication.
   * Required for all API requests to identify your application.
   */
  token: z.string(),

  /**
   * Type of authentication to use with the token.
   * Bot tokens use "Bot" prefix, OAuth2 tokens use "Bearer".
   * @default "Bot"
   */
  authType: z.enum(["Bot", "Bearer"]).default("Bot"),

  /**
   * Discord API version to use for all requests.
   * Currently limited to V10 as it's the only supported version.
   * @default ApiVersion.V10
   */
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

  /**
   * User agent string to send with requests.
   * Must follow Discord's user agent format requirements.
   * @default "DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"
   */
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"),

  /**
   * Base URL for Discord API requests.
   * Only change this if you're using a proxy or custom endpoint.
   * @default "https://discord.com"
   */
  baseUrl: z.string().url().default("https://discord.com"),

  /**
   * Timeout for API requests in milliseconds.
   * Requests that take longer than this will be aborted.
   * @default 30000
   */
  timeout: z.number().int().min(0).default(30000),

  /**
   * Request retry configuration.
   * Controls how failed requests are retried.
   * @default {}
   */
  retry: RetryOptions.default({}),

  /**
   * Rate limit configuration.
   * Controls how rate limits are tracked and respected.
   * @default {}
   */
  rateLimit: RateLimitOptions.default({}),
});

export type RestOptions = z.infer<typeof RestOptions>;

/**
 * Main REST client for Discord API interaction.
 *
 * Provides a comprehensive interface for making requests to the Discord API
 * with built-in support for:
 * - Rate limit handling and prevention
 * - Request retries for transient failures
 * - File uploads and multipart requests
 * - Error handling and normalization
 * - Event emission for monitoring and debugging
 * - Resource-specific route handling via specialized routers
 *
 * This is the primary entry point for all API interactions and manages
 * the lifecycle of requests from preparation to completion.
 */
export class Rest extends EventEmitter<RestEvents> {
  /**
   * Validated configuration options.
   * All options are guaranteed to be valid through Zod validation.
   */
  readonly #options: RestOptions;

  /**
   * HTTP connection pool for making requests.
   * Manages connection reuse and concurrency.
   */
  readonly #pool: Pool;

  /**
   * Rate limit handler.
   * Tracks and respects Discord's rate limits to prevent 429 errors.
   */
  readonly #rateLimiter: RateLimitManager;

  /**
   * Retry handler.
   * Manages automatic retries of failed requests.
   */
  readonly #retry: RetryManager;

  /**
   * Creates a new REST client.
   * Initializes the HTTP pool, rate limiter, and retry manager.
   *
   * @param options - Configuration options for the REST client
   * @throws {Error} Error if options validation fails
   */
  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#pool = new Pool(this.#options.baseUrl, REST_CONSTANTS.HTTP_CONFIG);
    this.#rateLimiter = new RateLimitManager(this, this.#options.rateLimit);
    this.#retry = new RetryManager(this, this.#options.retry);
  }

  /**
   * Access to the Discord API token.
   * Used for authentication in API requests.
   *
   * @returns The configured Discord API token
   */
  get token(): string {
    return this.#options.token;
  }

  /**
   * Access to all client configuration options.
   * Provides read-only access to the validated configuration.
   *
   * @returns The complete configuration object
   */
  get options(): RestOptions {
    return this.#options;
  }

  /**
   * Access to the retry manager.
   * Allows direct interaction with retry functionality.
   *
   * @returns The configured retry manager
   */
  get retry(): RetryManager {
    return this.#retry;
  }

  /**
   * Access to the rate limiter.
   * Allows direct interaction with rate limit tracking.
   *
   * @returns The configured rate limit manager
   */
  get rateLimiter(): RateLimitManager {
    return this.#rateLimiter;
  }

  /**
   * Access to application endpoints.
   * Provides methods for interacting with application resources.
   *
   * @returns Router for application-related endpoints
   */
  get applications(): ApplicationRouter {
    return new ApplicationRouter(this);
  }

  /**
   * Access to application command endpoints.
   * Provides methods for managing slash commands and interactions.
   *
   * @returns Router for application command endpoints
   */
  get commands(): ApplicationCommandRouter {
    return new ApplicationCommandRouter(this);
  }

  /**
   * Access to application connection endpoints.
   * Provides methods for managing application connections.
   *
   * @returns Router for application connection endpoints
   */
  get connections(): ApplicationConnectionRouter {
    return new ApplicationConnectionRouter(this);
  }

  /**
   * Access to guild-related endpoints.
   * Provides methods for managing guilds, members, and roles.
   *
   * @returns Router for guild-related endpoints
   */
  get guilds(): GuildRouter {
    return new GuildRouter(this);
  }

  /**
   * Access to channel-related endpoints.
   * Provides methods for managing channels of all types.
   *
   * @returns Router for channel-related endpoints
   */
  get channels(): ChannelRouter {
    return new ChannelRouter(this);
  }

  /**
   * Access to invite-related endpoints.
   * Provides methods for creating and managing invites.
   *
   * @returns Router for invite-related endpoints
   */
  get invites(): InviteRouter {
    return new InviteRouter(this);
  }

  /**
   * Access to guild template endpoints.
   * Provides methods for managing guild templates.
   *
   * @returns Router for guild template endpoints
   */
  get templates(): GuildTemplateRouter {
    return new GuildTemplateRouter(this);
  }

  /**
   * Access to user-related endpoints.
   * Provides methods for managing user data and connections.
   *
   * @returns Router for user-related endpoints
   */
  get users(): UserRouter {
    return new UserRouter(this);
  }

  /**
   * Access to audit log endpoints.
   * Provides methods for retrieving guild audit logs.
   *
   * @returns Router for audit log endpoints
   */
  get auditLogs(): AuditLogRouter {
    return new AuditLogRouter(this);
  }

  /**
   * Access to message-related endpoints.
   * Provides methods for sending and managing messages.
   *
   * @returns Router for message-related endpoints
   */
  get messages(): MessageRouter {
    return new MessageRouter(this);
  }

  /**
   * Access to interaction-related endpoints.
   * Provides methods for responding to interactions.
   *
   * @returns Router for interaction-related endpoints
   */
  get interactions(): InteractionRouter {
    return new InteractionRouter(this);
  }

  /**
   * Access to emoji-related endpoints.
   * Provides methods for managing custom emojis.
   *
   * @returns Router for emoji-related endpoints
   */
  get emojis(): EmojiRouter {
    return new EmojiRouter(this);
  }

  /**
   * Access to sticker-related endpoints.
   * Provides methods for managing custom stickers.
   *
   * @returns Router for sticker-related endpoints
   */
  get stickers(): StickerRouter {
    return new StickerRouter(this);
  }

  /**
   * Access to voice-related endpoints.
   * Provides methods for voice channel management.
   *
   * @returns Router for voice-related endpoints
   */
  get voice(): VoiceRouter {
    return new VoiceRouter(this);
  }

  /**
   * Access to soundboard-related endpoints.
   * Provides methods for managing soundboard sounds.
   *
   * @returns Router for soundboard-related endpoints
   */
  get soundboards(): SoundboardRouter {
    return new SoundboardRouter(this);
  }

  /**
   * Access to stage instance endpoints.
   * Provides methods for managing stage channels.
   *
   * @returns Router for stage instance endpoints
   */
  get stages(): StageInstanceRouter {
    return new StageInstanceRouter(this);
  }

  /**
   * Access to scheduled event endpoints.
   * Provides methods for creating and managing guild events.
   *
   * @returns Router for scheduled event endpoints
   */
  get scheduledEvents(): ScheduledEventRouter {
    return new ScheduledEventRouter(this);
  }

  /**
   * Access to poll-related endpoints.
   * Provides methods for creating and managing polls in messages.
   *
   * @returns Router for poll-related endpoints
   */
  get polls(): PollRouter {
    return new PollRouter(this);
  }

  /**
   * Access to auto-moderation endpoints.
   * Provides methods for configuring automatic content moderation.
   *
   * @returns Router for auto-moderation endpoints
   */
  get autoModeration(): AutoModerationRouter {
    return new AutoModerationRouter(this);
  }

  /**
   * Access to webhook-related endpoints.
   * Provides methods for creating and managing webhooks.
   *
   * @returns Router for webhook-related endpoints
   */
  get webhooks(): WebhookRouter {
    return new WebhookRouter(this);
  }

  /**
   * Access to OAuth2-related endpoints.
   * Provides methods for OAuth2 flows and token management.
   *
   * @returns Router for OAuth2-related endpoints
   */
  get oauth2(): OAuth2Router {
    return new OAuth2Router(this);
  }

  /**
   * Access to gateway-related endpoints.
   * Provides methods for retrieving gateway URLs and bot info.
   *
   * @returns Router for gateway-related endpoints
   */
  get gateway(): GatewayRouter {
    return new GatewayRouter(this);
  }

  /**
   * Access to SKU-related endpoints.
   * Provides methods for managing application SKUs.
   *
   * @returns Router for SKU-related endpoints
   */
  get skus(): SkuRouter {
    return new SkuRouter(this);
  }

  /**
   * Access to entitlement-related endpoints.
   * Provides methods for managing application entitlements.
   *
   * @returns Router for entitlement-related endpoints
   */
  get entitlements(): EntitlementRouter {
    return new EntitlementRouter(this);
  }

  /**
   * Access to subscription-related endpoints.
   * Provides methods for managing premium subscriptions.
   *
   * @returns Router for subscription-related endpoints
   */
  get subscriptions(): SubscriptionRouter {
    return new SubscriptionRouter(this);
  }

  /**
   * Access to lobby-related endpoints.
   * Provides methods for managing lobbies in voice channels.
   *
   * @returns Router for lobby-related endpoints
   */
  get lobby(): LobbyRouter {
    return new LobbyRouter(this);
  }

  /**
   * Makes a request to the Discord API with automatic rate limiting and retries.
   *
   * This is the core request method that:
   * 1. Generates a unique request ID for tracking
   * 2. Checks rate limits before proceeding
   * 3. Makes the HTTP request with retry handling
   * 4. Updates rate limit tracking from response
   * 5. Handles errors and returns parsed data
   *
   * @param options - Complete request options including path, method, and optional body
   * @returns Promise resolving to the parsed response data
   * @throws {Error} Error for failed requests or rate limit issues that can't be resolved
   */
  async request<T>(options: HttpRequestOptions): Promise<T> {
    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();

    // Check rate limit before making request
    const check = this.#rateLimiter.checkRateLimit(
      options.path,
      options.method,
      requestId,
    );

    // Wait if rate limited instead of throwing
    await this.#retry.handleRateLimit(
      check,
      requestId,
      options.method,
      options.path,
    );

    // Make the HTTP request with retry handling
    const response = await this.#retry.processResponse<T>(
      () => this.#makeHttpRequest<T>(options, requestId),
      requestId,
      options.method,
      options.path,
    );

    // Check if the request was successful
    if (response.statusCode >= 400) {
      // Use appropriate error class based on status code
      this.#throwAppropriateError(response, options, requestId);
    }

    // Update rate limit after successful request
    const update = this.#rateLimiter.updateRateLimit(
      options.path,
      options.method,
      response.headers,
      response.statusCode,
      requestId,
    );

    // Wait again if rate limited after update
    await this.#retry.handleRateLimit(
      update,
      requestId,
      options.method,
      options.path,
    );

    // Return the data if all checks pass
    return response.data;
  }

  /**
   * Makes a GET request to the Discord API.
   * Convenience method for read operations.
   *
   * @param path - API path to request
   * @param options - Additional request options (headers, query params, etc.)
   * @returns Promise resolving to the parsed response data
   * @throws Error for failed requests
   */
  get<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path });
  }

  /**
   * Makes a POST request to the Discord API.
   * Convenience method for creating resources.
   *
   * @param path - API path to request
   * @param options - Additional request options (body, headers, etc.)
   * @returns Promise resolving to the parsed response data
   * @throws Error for failed requests
   */
  post<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path });
  }

  /**
   * Makes a PUT request to the Discord API.
   * Convenience method for replacing resources.
   *
   * @param path - API path to request
   * @param options - Additional request options (body, headers, etc.)
   * @returns Promise resolving to the parsed response data
   * @throws Error for failed requests
   */
  put<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path });
  }

  /**
   * Makes a PATCH request to the Discord API.
   * Convenience method for updating resources.
   *
   * @param path - API path to request
   * @param options - Additional request options (body, headers, etc.)
   * @returns Promise resolving to the parsed response data
   * @throws Error for failed requests
   */
  patch<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path });
  }

  /**
   * Makes a DELETE request to the Discord API.
   * Convenience method for removing resources.
   *
   * @param path - API path to request
   * @param options - Additional request options (headers, query params, etc.)
   * @returns Promise resolving to the parsed response data
   * @throws Error for failed requests
   */
  delete<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path });
  }

  /**
   * Cleans up resources used by the REST client.
   * Should be called when the client is no longer needed to prevent memory leaks.
   *
   * Closes the HTTP connection pool, destroys the rate limiter,
   * and removes all event listeners.
   */
  async destroy(): Promise<void> {
    await this.#pool.close();
    this.#rateLimiter.destroy();
    this.removeAllListeners();
  }

  /**
   * Makes an HTTP request with event tracking.
   * Handles the low-level HTTP request, response parsing, and event emission.
   *
   * @param options - Request options with complete configuration
   * @param requestId - Unique identifier for tracking this request
   * @returns Promise resolving to a normalized HTTP response
   * @private
   */
  async #makeHttpRequest<T>(
    options: HttpRequestOptions,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const requestStart = Date.now();
    const requestHeaders = this.#buildRequestHeaders(options);

    // Emit the request start event for tracking
    this.emit("requestStart", {
      timestamp: new Date().toISOString(),
      requestId,
      path: options.path,
      method: options.method,
      headers: requestHeaders,
    });

    // Prepare and execute the request
    const preparedRequest = await this.#prepareRequest(options);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#options.timeout);

    try {
      // Send the HTTP request
      const response = await this.#pool.request({
        ...preparedRequest,
        signal: controller.signal,
      });
      const responseBody = Buffer.from(await response.body.arrayBuffer());

      // Handle empty responses (204 No Content or empty body)
      if (response.statusCode === 204 || responseBody.length === 0) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
        };
      }

      // Parse the response body as JSON
      const result = JSON.parse(responseBody.toString());

      // Check for API errors and enhance error messages
      if (response.statusCode >= 400 && this.#isJsonErrorEntity(result)) {
        const formattedFieldErrors = this.#formatFieldErrors(result.errors);
        const enhancedMessage = formattedFieldErrors
          ? `${result.message}. Details: ${formattedFieldErrors}`
          : result.message;

        return {
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
          data: result as T,
          reason: enhancedMessage,
        };
      }

      // Calculate request duration for metrics
      const duration = Date.now() - requestStart;

      // Emit request success event
      this.emit("requestSuccess", {
        timestamp: new Date().toISOString(),
        requestId,
        path: options.path,
        method: options.method,
        headers: response.headers as Record<string, string>,
        statusCode: response.statusCode,
        duration,
        responseSize: responseBody.length,
      });

      // Return the successful response
      return {
        data: result,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      // Check if this was a timeout (abort triggered)
      if (error instanceof Error && error.name === "AbortError") {
        throw new RequestTimeoutError({
          timeoutMs: this.#options.timeout,
          method: options.method,
          path: options.path,
          requestId,
        });
      }

      // Re-throw other errors
      throw error;
    } finally {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeout);
    }
  }

  /**
   * Checks if an object is a Discord API error response.
   * Validates the structure to identify standardized API errors.
   *
   * @param error - Object to check for error structure
   * @returns Whether the object follows the Discord error format
   * @private
   */
  #isJsonErrorEntity(error: unknown): error is JsonErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number" &&
      "message" in error &&
      typeof error.message === "string"
    );
  }

  /**
   * Prepares a request for sending.
   * Transforms the high-level options into a format ready for HTTP transmission.
   * Handles special cases like file uploads and JSON bodies.
   *
   * @param options - Request options to prepare
   * @returns Ready-to-use request options object or Promise resolving to one
   * @private
   */
  #prepareRequest(
    options: HttpRequestOptions,
  ): Promise<HttpRequestOptions> | HttpRequestOptions {
    const url = this.#buildUrl(options.path);
    const baseOptions = {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      headers: this.#buildRequestHeaders(options),
      reset: true,
    };

    // Special handling for file uploads (multipart/form-data)
    if (options.files) {
      return this.#handleFileUpload(options, baseOptions);
    }

    // Handle regular JSON body (automatic serialization)
    if (
      options.body !== undefined &&
      typeof options.body !== "string" &&
      !Buffer.isBuffer(options.body)
    ) {
      baseOptions.body = JSON.stringify(options.body);
    }

    return baseOptions;
  }

  /**
   * Builds a full URL for an API path.
   * Combines the base URL with API version and specific endpoint path.
   *
   * @param path - API path to build a URL for
   * @returns Constructed URL object
   * @private
   */
  #buildUrl(path?: string): URL {
    if (!path) {
      return new URL(`/api/v${this.#options.version}`, this.#options.baseUrl);
    }

    const cleanPath = path.replace(REST_CONSTANTS.PATH_REGEX, "");
    return new URL(
      `/api/v${this.#options.version}/${cleanPath}`,
      this.#options.baseUrl,
    );
  }

  /**
   * Builds headers for a request.
   * Creates the standard headers needed for Discord API requests.
   * Includes auth, content type, and optional custom headers.
   *
   * @param options - Request options containing optional headers
   * @returns Complete headers object ready for request
   * @private
   */
  #buildRequestHeaders(options: HttpRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
      "user-agent": this.#options.userAgent,
    };

    // Merge in custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add audit log reason if provided
    if (options.reason) {
      Object.assign(headers, {
        "x-audit-log-reason": encodeURIComponent(options.reason),
      });
    }

    return headers;
  }

  /**
   * Prepares a file upload request.
   * Handles multipart/form-data formatting for file uploads.
   * Integrates with FileHandler to process files and form data.
   *
   * @param options - Request options containing files
   * @param baseOptions - Base request options to build on
   * @returns Promise resolving to prepared request options
   * @private
   */
  async #handleFileUpload(
    options: HttpRequestOptions,
    baseOptions: HttpRequestOptions,
  ): Promise<HttpRequestOptions> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    // Create multipart form data with files and payload
    const formData = await FileHandler.createFormData(
      options.files,
      options.body,
    );

    // Prepare URL and options with form data
    const formUrl = new URL(baseOptions.path || "", baseOptions.origin);
    return {
      ...baseOptions,
      path: formUrl.pathname + formUrl.search,
      body: formData.getBuffer(),
      headers: {
        ...baseOptions.headers,
        ...formData.getHeaders(),
      },
    };
  }

  /**
   * Formats field errors into a readable string.
   * Recursively processes nested error objects to create a user-friendly
   * description of validation errors.
   *
   * @param errors - The errors object containing field-specific errors
   * @returns A formatted string of errors or undefined if no errors
   * @private
   */
  #formatFieldErrors(errors?: Record<string, unknown>): string | undefined {
    if (!errors) {
      return undefined;
    }

    const errorParts: string[] = [];

    // Recursive function to handle nested error structures
    const processErrors = (obj: Record<string, unknown>, path = ""): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (key === "_errors" && Array.isArray(value) && value.length > 0) {
          // We found errors, extract messages
          const fieldErrors = value
            .map((err: JsonErrorField) => `"${err.message}"`)
            .join(", ");
          errorParts.push(`${path || "general"}: ${fieldErrors}`);
        } else if (value && typeof value === "object") {
          // Recursively process nested objects
          processErrors(value as Record<string, unknown>, currentPath);
        }
      }
    };

    processErrors(errors);
    return errorParts.length > 0 ? errorParts.join("; ") : undefined;
  }

  /**
   * Throws the most appropriate error type based on the API response.
   * Maps HTTP status codes and response data to specific error classes
   * for more precise error handling.
   *
   * @param response - HTTP response containing status code and data
   * @param options - Original request options
   * @param requestId - Unique identifier for the request
   * @returns Never returns, always throws an error
   * @private
   */
  #throwAppropriateError<T>(
    response: HttpResponse<T>,
    options: HttpRequestOptions,
    requestId: string,
  ): never {
    const baseErrorOptions = {
      status: response.statusCode,
      method: options.method,
      path: options.path,
      requestId,
    };

    // Check if this is a JSON API error with specific code
    if (this.#isJsonErrorEntity(response.data)) {
      throw new JsonApiError(
        response.data as unknown as JsonErrorResponse,
        baseErrorOptions,
      );
    }

    // Otherwise, determine error type based on status code
    switch (response.statusCode) {
      case 401:
        throw new AuthenticationError(
          response.reason || "Authentication failed",
          baseErrorOptions,
        );

      case 403:
        throw new PermissionError(
          response.reason || "You lack permissions to perform this action",
          baseErrorOptions,
        );

      case 404:
        throw new NotFoundError(
          response.reason || "The requested resource was not found",
          {
            ...baseErrorOptions,
            resourceType: this.#extractResourceType(options.path),
            resourceId: this.#extractResourceId(options.path),
          },
        );

      case 429: {
        // Check if it's a Cloudflare ban
        if (response.headers["cf-ray"]) {
          throw new CloudflareError(
            response.reason || "Request blocked by Cloudflare",
            {
              ...baseErrorOptions,
              rayId: response.headers["cf-ray"],
            },
          );
        }

        throw new DiscordApiError(
          response.reason || "Rate limit exceeded",
          baseErrorOptions,
        );
      }
      default:
        // Generic API error for other status codes
        throw new DiscordApiError(
          response.reason ||
            `Request failed with status ${response.statusCode}`,
          baseErrorOptions,
        );
    }
  }

  /**
   * Extracts the resource type from a Discord API path.
   * Identifies the entity type being accessed based on URL pattern.
   *
   * @param path - API path to analyze
   * @returns The resource type (e.g., "channels", "guilds", "users") or undefined if not found
   * @private
   */
  #extractResourceType(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }

    // Match common Discord resource types from path
    const matches = path.match(/\/([a-z-]+)\/\d+/i);
    return matches?.[1];
  }

  /**
   * Extracts the resource ID from a Discord API path.
   * Identifies the specific entity ID being accessed.
   *
   * @param path - API path to analyze
   * @returns The resource ID (Discord snowflake) or undefined if not found
   * @private
   */
  #extractResourceId(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }

    // Extract the last ID in the path (common Discord pattern)
    const matches = path.match(/\/([0-9]+)(?:\/[a-z-]+)*\/?$/i);
    return matches?.[1];
  }
}
