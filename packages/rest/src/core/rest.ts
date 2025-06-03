import { ApiVersion } from "@nyxojs/core";
import { EventEmitter } from "eventemitter3";
import { Pool } from "undici";
import { z } from "zod/v4";
import { FileHandler, FileHandlerOptions } from "../handlers/index.js";
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
 * Configuration options for the Undici connection pool.
 * Controls HTTP connection behavior and performance characteristics.
 */
export const PoolOptions = z.object({
  /**
   * Maximum number of connections per origin in the pool.
   * Higher values allow more concurrent requests but consume more resources.
   * @default 10
   */
  connections: z.number().int().positive().default(10),

  /**
   * Maximum number of requests to pipeline per connection.
   * Set to 1 to disable pipelining (recommended for compatibility).
   * @default 1
   */
  pipelining: z.number().int().min(0).default(1),

  /**
   * Timeout for idle connections in milliseconds.
   * Controls how long a connection stays open when inactive.
   * @default 30000
   */
  keepAliveTimeout: z.number().int().min(1).default(30000),

  /**
   * Maximum timeout for idle connections in milliseconds.
   * A ceiling value for keep-alive timeout negotiation.
   * @default 600000
   */
  keepAliveMaxTimeout: z.number().int().min(1).default(600000),

  /**
   * Maximum size allowed for response headers in bytes.
   * Helps prevent memory issues with abnormally large headers.
   * @default 16384 (16KB)
   */
  maxHeaderSize: z.number().int().min(1).default(16384),

  /**
   * Maximum number of redirections to follow.
   * Set to 0 to disable automatic redirections.
   * @default 0
   */
  maxRedirections: z.number().int().min(0).default(0),

  /**
   * Maximum number of requests per client.
   * Controls concurrency to prevent overwhelming the server.
   * @default 10
   */
  maxRequestsPerClient: z.number().int().positive().default(10),

  /**
   * Maximum size allowed for response body in bytes.
   * Helps prevent memory issues with extremely large responses.
   * @default 50 * 1024 * 1024 (50MB)
   */
  maxResponseSize: z
    .number()
    .int()
    .default(50 * 1024 * 1024),

  /**
   * Time in milliseconds to wait for connection establishment.
   * Separate from the overall request timeout.
   * @default 30000 (30 seconds)
   */
  connectTimeout: z.number().int().positive().default(30000),

  /**
   * Time in milliseconds to wait for response headers to arrive.
   * Helps identify slow servers or network issues.
   * @default 30000 (30 seconds)
   */
  headersTimeout: z.number().int().positive().default(30000),

  /**
   * Time in milliseconds to wait for the response body to complete.
   * Controls how long to wait for response data after headers arrive.
   * @default 30000 (30 seconds)
   */
  bodyTimeout: z.number().int().positive().default(30000),

  /**
   * Automatically select between IPv4 and IPv6 address families.
   * Improves connection reliability across different networks.
   * @default false
   */
  autoSelectFamily: z.boolean().default(false),

  /**
   * Whether to strictly enforce Content-Length consistency.
   * Improves security by validating response bodies match their declared size.
   * @default true
   */
  strictContentLength: z.boolean().default(true),

  /**
   * Whether to allow HTTP/2 connections.
   * HTTP/2 can improve performance for multiple concurrent requests.
   * @default false
   */
  allowH2: z.boolean().default(false),
});

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
  baseUrl: z.url().default("https://discord.com"),

  /**
   * Timeout for API requests in milliseconds.
   * Requests that take longer than this will be aborted.
   * @default 30000
   */
  timeout: z.number().int().min(0).default(30000),

  /**
   * HTTP connection pool configuration.
   * Controls how HTTP connections are managed for performance.
   * @default {}
   */
  pool: PoolOptions.prefault({}),

  /**
   * Request retry configuration.
   * Controls how failed requests are retried.
   * @default {}
   */
  retry: RetryOptions.prefault({}),

  /**
   * Rate limit configuration.
   * Controls how rate limits are tracked and respected.
   * @default {}
   */
  rateLimit: RateLimitOptions.prefault({}),

  /**
   * File handler options for file uploads.
   * Controls how files are processed and uploaded.
   * @default {}
   */
  file: FileHandlerOptions.prefault({}),
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
   * Access to application endpoints.
   * Provides methods for interacting with application resources.
   *
   * @returns Router for application-related endpoints
   */
  readonly applications = new ApplicationRouter(this);

  /**
   * Access to audit log endpoints.
   * Provides methods for retrieving guild audit logs.
   *
   * @returns Router for audit log endpoints
   */
  readonly auditLogs = new AuditLogRouter(this);

  /**
   * Access to auto-moderation endpoints.
   * Provides methods for configuring automatic content moderation.
   *
   * @returns Router for auto-moderation endpoints
   */
  readonly autoModeration = new AutoModerationRouter(this);

  /**
   * Access to channel-related endpoints.
   * Provides methods for managing channels of all types.
   *
   * @returns Router for channel-related endpoints
   */
  readonly channels = new ChannelRouter(this);

  /**
   * Access to application command endpoints.
   * Provides methods for managing slash commands and interactions.
   *
   * @returns Router for application command endpoints
   */
  readonly commands = new ApplicationCommandRouter(this);

  /**
   * Access to application connection endpoints.
   * Provides methods for managing application connections.
   *
   * @returns Router for application connection endpoints
   */
  readonly connections = new ApplicationConnectionRouter(this);

  /**
   * Access to emoji-related endpoints.
   * Provides methods for managing custom emojis.
   *
   * @returns Router for emoji-related endpoints
   */
  readonly emojis = new EmojiRouter(this);

  /**
   * Access to entitlement-related endpoints.
   * Provides methods for managing application entitlements.
   *
   * @returns Router for entitlement-related endpoints
   */
  readonly entitlements = new EntitlementRouter(this);

  /**
   * Access to gateway-related endpoints.
   * Provides methods for retrieving gateway URLs and bot info.
   *
   * @returns Router for gateway-related endpoints
   */
  readonly gateway = new GatewayRouter(this);

  /**
   * Access to guild-related endpoints.
   * Provides methods for managing guilds, members, and roles.
   *
   * @returns Router for guild-related endpoints
   */
  readonly guilds = new GuildRouter(this);

  /**
   * Access to interaction-related endpoints.
   * Provides methods for responding to interactions.
   *
   * @returns Router for interaction-related endpoints
   */
  readonly interactions = new InteractionRouter(this);

  /**
   * Access to invite-related endpoints.
   * Provides methods for creating and managing invites.
   *
   * @returns Router for invite-related endpoints
   */
  readonly invites = new InviteRouter(this);

  /**
   * Access to lobby-related endpoints.
   * Provides methods for managing lobbies in voice channels.
   *
   * @returns Router for lobby-related endpoints
   */
  readonly lobby = new LobbyRouter(this);

  /**
   * Access to message-related endpoints.
   * Provides methods for sending and managing messages.
   *
   * @returns Router for message-related endpoints
   */
  readonly messages = new MessageRouter(this);

  /**
   * Access to OAuth2-related endpoints.
   * Provides methods for OAuth2 flows and token management.
   *
   * @returns Router for OAuth2-related endpoints
   */
  readonly oauth2 = new OAuth2Router(this);

  /**
   * Access to poll-related endpoints.
   * Provides methods for creating and managing polls in messages.
   *
   * @returns Router for poll-related endpoints
   */
  readonly polls = new PollRouter(this);

  /**
   * Access to scheduled event endpoints.
   * Provides methods for creating and managing guild events.
   *
   * @returns Router for scheduled event endpoints
   */
  readonly scheduledEvents = new ScheduledEventRouter(this);

  /**
   * Access to SKU-related endpoints.
   * Provides methods for managing application SKUs.
   *
   * @returns Router for SKU-related endpoints
   */
  readonly skus = new SkuRouter(this);

  /**
   * Access to soundboard-related endpoints.
   * Provides methods for managing soundboard sounds.
   *
   * @returns Router for soundboard-related endpoints
   */
  readonly soundboards = new SoundboardRouter(this);

  /**
   * Access to stage instance endpoints.
   * Provides methods for managing stage channels.
   *
   * @returns Router for stage instance endpoints
   */
  readonly stages = new StageInstanceRouter(this);

  /**
   * Access to sticker-related endpoints.
   * Provides methods for managing custom stickers.
   *
   * @returns Router for sticker-related endpoints
   */
  readonly stickers = new StickerRouter(this);

  /**
   * Access to subscription-related endpoints.
   * Provides methods for managing premium subscriptions.
   *
   * @returns Router for subscription-related endpoints
   */
  readonly subscriptions = new SubscriptionRouter(this);

  /**
   * Access to guild template endpoints.
   * Provides methods for managing guild templates.
   *
   * @returns Router for guild template endpoints
   */
  readonly templates = new GuildTemplateRouter(this);

  /**
   * Access to user-related endpoints.
   * Provides methods for managing user data and connections.
   *
   * @returns Router for user-related endpoints
   */
  readonly users = new UserRouter(this);

  /**
   * Access to voice-related endpoints.
   * Provides methods for voice channel management.
   *
   * @returns Router for voice-related endpoints
   */
  readonly voice = new VoiceRouter(this);

  /**
   * Access to webhook-related endpoints.
   * Provides methods for creating and managing webhooks.
   *
   * @returns Router for webhook-related endpoints
   */
  readonly webhooks = new WebhookRouter(this);

  /**
   * HTTP connection pool for making requests.
   * Manages connections to Discord API for optimal performance.
   * @internal
   */
  readonly pool: Pool;

  /**
   * Rate limit handler.
   * Tracks and respects Discord's rate limits to prevent 429 errors.
   */
  readonly rateLimiter: RateLimitManager;

  /**
   * Retry handler.
   * Manages automatic retries of failed requests.
   */
  readonly retry: RetryManager;

  /**
   * File handler for processing file uploads.
   * Handles multipart/form-data requests for file uploads.
   */
  readonly file: FileHandler;

  /**
   * Validated configuration options.
   * All options are guaranteed to be valid through Zod validation.
   */
  readonly #options: RestOptions;

  /**
   * Creates a new REST client.
   * Initializes the HTTP pool, rate limiter, and retry manager.
   *
   * @param options - Configuration options for the REST client
   * @throws Error Error if options validation fails
   */
  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod validation errors to more readable format
        throw new Error(z.prettifyError(error));
      }

      // If validation fails, rethrow the error with additional context
      throw error;
    }

    // Initialize the HTTP connection pool
    this.pool = new Pool(this.#options.baseUrl, this.#options.pool);

    // Initialize managers for rate limiting and retries
    this.rateLimiter = new RateLimitManager(this, this.#options.rateLimit);
    this.retry = new RetryManager(this, this.#options.retry);

    // Initialize file handler for file uploads
    this.file = new FileHandler(this.#options.file);
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
   * @throws Error Error for failed requests or rate limit issues that can't be resolved
   */
  async request<T>(options: HttpRequestOptions): Promise<T> {
    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();

    // Check rate limit before making request
    const rateLimitCheck = await this.rateLimiter.checkAndWaitIfNeeded(
      options.path,
      options.method,
      requestId,
    );

    // If we can't proceed after waiting, throw an error
    if (!rateLimitCheck.canProceed) {
      throw new Error(
        `[${options.method} ${options.path}] Rate limit exceeded: ${rateLimitCheck.reason}. Try again in ${rateLimitCheck.retryAfter}ms.`,
      );
    }

    // Make the HTTP request with retry handling for non-rate limit errors
    const response = await this.retry.processResponse<T>(
      () => this.#makeHttpRequest<T>(options, requestId),
      requestId,
      options.method,
      options.path,
    );

    // Update rate limit tracking after every response
    await this.rateLimiter.updateRateLimitAndWaitIfNeeded(
      options.path,
      options.method,
      response.headers,
      response.statusCode,
      requestId,
    );

    // Check if the response status indicates an error
    if (response.statusCode >= 400) {
      throw this.#createErrorFromResponse(response, options, requestId);
    }

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
    await this.pool.close();
    this.rateLimiter.destroy();
    this.file.clear();
    this.removeAllListeners();
  }

  /**
   * Creates an appropriate error object from a response.
   * Formats error messages consistently based on status code and response data.
   *
   * @param response - HTTP response containing status code and data
   * @param options - Original request options
   * @param requestId - Unique identifier for the request
   * @returns An Error object with formatted message
   * @internal
   */
  #createErrorFromResponse<T>(
    response: HttpResponse<T>,
    options: HttpRequestOptions,
    requestId: string,
  ): Error {
    // Build a consistent error prefix
    const errorPrefix = `[${options.method} ${options.path}] ${response.statusCode} (requestId: ${requestId})`;

    // Check if this is a JSON API error with specific code
    if (this.#isJsonErrorEntity(response.data)) {
      const jsonError = response.data as unknown as JsonErrorResponse;
      const message = response.reason || jsonError.message;

      // Format field errors if present
      let errorDetails = "";
      if (jsonError.errors) {
        const fieldErrors = this.#formatFieldErrors(jsonError.errors);
        if (fieldErrors) {
          errorDetails = ` (${fieldErrors})`;
        }
      }

      return new Error(
        `${errorPrefix}: Discord API Error ${jsonError.code} - ${message}${errorDetails}`,
      );
    }

    // Otherwise, determine error message based on status code
    switch (response.statusCode) {
      case 401:
        return new Error(
          `${errorPrefix}: Authentication failed - ${response.reason || "Invalid credentials"}`,
        );

      case 403:
        return new Error(
          `${errorPrefix}: Permission denied - ${response.reason || "You lack permissions to perform this action"}`,
        );

      case 404: {
        const resourceType =
          this.#extractResourceType(options.path) || "resource";
        const resourceId = this.#extractResourceId(options.path) || "unknown";
        return new Error(
          `${errorPrefix}: Not found - ${resourceType} (ID: ${resourceId}) ${response.reason || "The requested resource was not found"}`,
        );
      }

      default:
        // Generic API error for other status codes
        return new Error(
          `${errorPrefix}: Request failed - ${response.reason || `Status ${response.statusCode}`}`,
        );
    }
  }

  /**
   * Makes an HTTP request with event tracking.
   * Handles the low-level HTTP request, response parsing, and event emission.
   *
   * @param options - Request options with complete configuration
   * @param requestId - Unique identifier for tracking this request
   * @returns Promise resolving to a normalized HTTP response
   * @internal
   */
  async #makeHttpRequest<T>(
    options: HttpRequestOptions,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const requestStart = Date.now();

    // Create an AbortController to handle request timeouts
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#options.timeout);

    try {
      // Prepare and execute the request
      const preparedRequest = options.files
        ? await this.#handleFileUpload(options)
        : options;

      // Build the path for the request
      const path = `/api/v${this.#options.version}/${preparedRequest.path.replace(/^\/+/, "")}`;

      // Build the request headers
      const headers = this.#buildRequestHeaders(preparedRequest);

      // Send the HTTP request using the pool
      const response = await this.pool.request<T>({
        path,
        method: preparedRequest.method,
        body: preparedRequest.body,
        query: preparedRequest.query,
        signal: controller.signal,
        headers: headers,
      });

      // Process response body with optimized buffer handling
      let responseBody: Buffer;
      const arrayBuffer = await response.body.arrayBuffer();

      // Apply additional optimizations for small responses
      if (arrayBuffer.byteLength < 4096) {
        // Threshold for small responses
        responseBody = Buffer.allocUnsafe(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer); // Create a view of the ArrayBuffer
        responseBody.set(view);
      } else {
        // Use the ArrayBuffer directly without intermediate copy
        responseBody = Buffer.from(arrayBuffer);
      }

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

      // Add error details for API errors
      let reason: string | undefined;
      if (response.statusCode >= 400 && this.#isJsonErrorEntity(result)) {
        const jsonError = result as JsonErrorResponse;
        const formattedFieldErrors = this.#formatFieldErrors(jsonError.errors);
        reason = formattedFieldErrors
          ? `${jsonError.message}. Details: ${formattedFieldErrors}`
          : jsonError.message;
      }

      // Calculate request duration for metrics
      const duration = Date.now() - requestStart;

      // Emit request success event
      this.emit("request", {
        timestamp: new Date().toISOString(),
        requestId,
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        duration,
        responseSize: responseBody.length,
      });

      // Return the response
      return {
        data: result,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        reason,
      };
    } catch (error) {
      // Check if this was a timeout (abort triggered)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Request timed out after ${this.#options.timeout}ms [${options.method} ${options.path}]`,
        );
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
   * @internal
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
   * Builds headers for a request.
   * Creates the standard headers needed for Discord API requests.
   * Includes auth, content type, and optional custom headers.
   *
   * @param options - Request options containing optional headers
   * @returns Complete headers object ready for request
   * @internal
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
   * @returns Promise resolving to prepared request options
   * @internal
   */
  async #handleFileUpload(
    options: HttpRequestOptions,
  ): Promise<HttpRequestOptions> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    // Create multipart form data with files and payload
    const formData = await this.file.createFormData(
      options.files,
      options.body,
    );

    return {
      ...options,
      body: formData.getBuffer(),
      headers: formData.getHeaders(options.headers),
    };
  }

  /**
   * Formats field errors into a readable string.
   * Recursively processes nested error objects to create a user-friendly
   * description of validation errors.
   *
   * @param errors - The errors object containing field-specific errors
   * @returns A formatted string of errors or undefined if no errors
   * @internal
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
   * Extracts the resource type from a Discord API path.
   * Identifies the entity type being accessed based on URL pattern.
   *
   * @param path - API path to analyze
   * @returns The resource type (e.g., "channels", "guilds", "users") or undefined if not found
   * @internal
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
   * @internal
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
