import { ApiVersion } from "@nyxojs/core";
import { EventEmitter } from "eventemitter3";
import { Pool } from "undici";
import { z } from "zod";
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
  RestEvents,
} from "../types/index.js";

/**
 * Regular expression for validating Discord bot user agents.
 * Validates Discord bot user agent strings according to Discord's specification.
 *
 * @public
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

/**
 * Configuration schema for the Undici HTTP connection pool.
 * Defines connection pool behavior for Discord API requests.
 *
 * @public
 */
export const PoolOptions = z.object({
  /**
   * Maximum number of persistent connections per origin.
   *
   * @default 10
   */
  connections: z.number().int().positive().default(10),

  /**
   * Maximum number of requests to pipeline per connection.
   *
   * @default 1
   */
  pipelining: z.number().int().min(0).default(1),

  /**
   * Timeout for idle connections.
   *
   * @default 30000
   */
  keepAliveTimeout: z.number().int().min(1).default(30000),

  /**
   * Maximum timeout ceiling for idle connections.
   *
   * @default 600000
   */
  keepAliveMaxTimeout: z.number().int().min(1).default(600000),

  /**
   * Maximum size allowed for HTTP response headers.
   *
   * @default 16384
   */
  maxHeaderSize: z.number().int().min(1).default(16384),

  /**
   * Maximum number of HTTP redirections to follow.
   *
   * @default 0
   */
  maxRedirections: z.number().int().min(0).default(0),

  /**
   * Maximum number of concurrent requests per client.
   *
   * @default 10
   */
  maxRequestsPerClient: z.number().int().positive().default(10),

  /**
   * Maximum size allowed for response body content.
   *
   * @default 52428800
   */
  maxResponseSize: z
    .number()
    .int()
    .default(50 * 1024 * 1024),

  /**
   * Connection establishment timeout.
   *
   * @default 30000
   */
  connectTimeout: z.number().int().positive().default(30000),

  /**
   * Response headers arrival timeout.
   *
   * @default 30000
   */
  headersTimeout: z.number().int().positive().default(30000),

  /**
   * Response body completion timeout.
   *
   * @default 30000
   */
  bodyTimeout: z.number().int().positive().default(30000),

  /**
   * Automatically select address family.
   *
   * @default false
   */
  autoSelectFamily: z.boolean().default(false),

  /**
   * Enforce strict Content-Length validation.
   *
   * @default true
   */
  strictContentLength: z.boolean().default(true),

  /**
   * Enable HTTP/2 connection support.
   *
   * @default true
   */
  allowH2: z.boolean().default(true),
});

/**
 * Configuration schema for the Discord REST client.
 * Defines comprehensive configuration options for the Discord REST API client.
 *
 * @public
 */
export const RestOptions = z.object({
  /**
   * Discord Bot or Bearer token for API authentication.
   */
  token: z.string(),

  /**
   * Authentication type for the Authorization header.
   *
   * @default "Bot"
   */
  authType: z.enum(["Bot", "Bearer"]).default("Bot"),

  /**
   * Discord API version for all requests.
   *
   * @default ApiVersion.V10
   */
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

  /**
   * User agent string for identification.
   *
   * @default "DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"
   */
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"),

  /**
   * Base URL for Discord API requests.
   *
   * @default "https://discord.com"
   */
  baseUrl: z.url().default("https://discord.com"),

  /**
   * Global timeout for all API requests.
   *
   * @default 30000
   */
  timeout: z.number().int().min(0).default(30000),

  /**
   * HTTP connection pool configuration.
   */
  pool: PoolOptions.prefault({}),

  /**
   * Request retry configuration.
   */
  retry: RetryOptions.prefault({}),

  /**
   * Rate limit handling configuration.
   */
  rateLimit: RateLimitOptions.prefault({}),

  /**
   * File upload processing configuration.
   */
  file: FileHandlerOptions.prefault({}),
});

export type RestOptions = z.infer<typeof RestOptions>;

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

/**
 * Advanced Discord REST API client with comprehensive bot development features.
 * Provides production-ready interface for Discord API interaction.
 *
 * @example
 * ```typescript
 * const rest = new Rest({
 *   token: process.env.DISCORD_TOKEN!,
 *   userAgent: 'DiscordBot (https://github.com/mybot, 1.0.0)'
 * });
 *
 * const message = await rest.channels.createMessage('123456789', {
 *   content: 'Hello, Discord!'
 * });
 * ```
 *
 * @public
 */
export class Rest extends EventEmitter<RestEvents> {
  /**
   * Application management router.
   * Handles application information and configuration operations.
   *
   * @public
   */
  readonly applications = new ApplicationRouter(this);

  /**
   * Audit log router.
   * Enables retrieval and analysis of moderation actions.
   *
   * @public
   */
  readonly auditLogs = new AuditLogRouter(this);

  /**
   * Auto-moderation router.
   * Manages automatic content moderation rules and actions.
   *
   * @public
   */
  readonly autoModeration = new AutoModerationRouter(this);

  /**
   * Channel management router.
   * Handles text channels, voice channels, and permissions.
   *
   * @public
   */
  readonly channels = new ChannelRouter(this);

  /**
   * Application command router.
   * Manages slash commands and interaction endpoints.
   *
   * @public
   */
  readonly commands = new ApplicationCommandRouter(this);

  /**
   * Application connection router.
   * Handles linked accounts and integrations.
   *
   * @public
   */
  readonly connections = new ApplicationConnectionRouter(this);

  /**
   * Emoji management router.
   * Manages guild custom emojis.
   *
   * @public
   */
  readonly emojis = new EmojiRouter(this);

  /**
   * Entitlement management router.
   * Handles premium subscription endpoints.
   *
   * @public
   */
  readonly entitlements = new EntitlementRouter(this);

  /**
   * Gateway information router.
   * Retrieves gateway URLs and shard information.
   *
   * @public
   */
  readonly gateway = new GatewayRouter(this);

  /**
   * Guild management router.
   * Manages guilds, members, roles, and bans.
   *
   * @public
   */
  readonly guilds = new GuildRouter(this);

  /**
   * Interaction response router.
   * Manages responses to slash commands and interactions.
   *
   * @public
   */
  readonly interactions = new InteractionRouter(this);

  /**
   * Invite management router.
   * Handles guild and channel invite operations.
   *
   * @public
   */
  readonly invites = new InviteRouter(this);

  /**
   * Lobby management router.
   * Manages voice channel lobbies and party functionality.
   *
   * @public
   */
  readonly lobby = new LobbyRouter(this);

  /**
   * Message management router.
   * Handles message sending, editing, and reactions.
   *
   * @public
   */
  readonly messages = new MessageRouter(this);

  /**
   * OAuth2 management router.
   * Handles token management and authorization flows.
   *
   * @public
   */
  readonly oauth2 = new OAuth2Router(this);

  /**
   * Poll management router.
   * Manages message poll creation and voting.
   *
   * @public
   */
  readonly polls = new PollRouter(this);

  /**
   * Scheduled event router.
   * Manages guild scheduled events and RSVPs.
   *
   * @public
   */
  readonly scheduledEvents = new ScheduledEventRouter(this);

  /**
   * SKU management router.
   * Handles application monetization endpoints.
   *
   * @public
   */
  readonly skus = new SkuRouter(this);

  /**
   * Soundboard router.
   * Manages custom sounds and audio content.
   *
   * @public
   */
  readonly soundboards = new SoundboardRouter(this);

  /**
   * Stage instance router.
   * Manages stage channels and live events.
   *
   * @public
   */
  readonly stages = new StageInstanceRouter(this);

  /**
   * Sticker management router.
   * Manages guild stickers and sticker packs.
   *
   * @public
   */
  readonly stickers = new StickerRouter(this);

  /**
   * Subscription router.
   * Manages premium subscription endpoints.
   *
   * @public
   */
  readonly subscriptions = new SubscriptionRouter(this);

  /**
   * Guild template router.
   * Manages server templates for guild creation.
   *
   * @public
   */
  readonly templates = new GuildTemplateRouter(this);

  /**
   * User management router.
   * Manages user profiles, DMs, and connections.
   *
   * @public
   */
  readonly users = new UserRouter(this);

  /**
   * Voice channel router.
   * Manages voice states and voice regions.
   *
   * @public
   */
  readonly voice = new VoiceRouter(this);

  /**
   * Webhook management router.
   * Manages webhook creation and message sending.
   *
   * @public
   */
  readonly webhooks = new WebhookRouter(this);

  /**
   * HTTP connection pool managing persistent connections.
   * Handles connection lifecycle and performance optimization.
   *
   * @internal
   */
  readonly pool: Pool;

  /**
   * Rate limit manager providing proactive protection.
   * Monitors and enforces Discord's rate limits.
   *
   * @public
   */
  readonly rateLimiter: RateLimitManager;

  /**
   * Retry manager providing intelligent failure recovery.
   * Implements retry strategies for transient failures.
   *
   * @public
   */
  readonly retry: RetryManager;

  /**
   * File handler managing multipart uploads.
   * Provides secure file validation and processing.
   *
   * @public
   */
  readonly file: FileHandler;

  /**
   * Validated and immutable configuration options.
   * All options are guaranteed valid through Zod validation.
   *
   * @internal
   */
  readonly #options: RestOptions;

  /**
   * Creates a new Discord REST API client.
   * Initializes all subsystems with configuration validation.
   *
   * @param options - Complete client configuration
   *
   * @throws {Error} Configuration validation errors
   * @throws {Error} Authentication errors if token format is invalid
   *
   * @example
   * ```typescript
   * const rest = new Rest({
   *   token: process.env.DISCORD_TOKEN!,
   *   userAgent: 'DiscordBot (https://github.com/mybot, 1.0.0)'
   * });
   * ```
   *
   * @public
   */
  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }

    this.pool = new Pool(this.#options.baseUrl, this.#options.pool);
    this.rateLimiter = new RateLimitManager(this, this.#options.rateLimit);
    this.retry = new RetryManager(this, this.#options.retry);
    this.file = new FileHandler(this.#options.file);
  }

  /**
   * Executes a complete Discord API request.
   * Orchestrates rate limiting, retry handling, and error processing.
   *
   * @param options - Complete request configuration
   * @returns Promise resolving to parsed response data
   *
   * @throws {Error} Rate limit errors when limits cannot be resolved
   * @throws {Error} Authentication errors with clear description
   * @throws {Error} Permission errors with resource context
   * @throws {Error} Not found errors with resource identification
   *
   * @example
   * ```typescript
   * const user = await rest.request<User>({
   *   method: 'GET',
   *   path: '/users/@me'
   * });
   * ```
   *
   * @public
   */
  async request<T>(options: HttpRequestOptions): Promise<T> {
    const requestId = crypto.randomUUID();

    const rateLimitCheck = await this.rateLimiter.checkAndWaitIfNeeded(
      options.path,
      options.method,
      requestId,
    );

    if (!rateLimitCheck.canProceed) {
      throw new Error(
        `[${options.method} ${options.path}] Rate limit exceeded: ${rateLimitCheck.reason}. Try again in ${rateLimitCheck.retryAfter}ms.`,
      );
    }

    const response = await this.retry.processResponse<T>(
      () => this.#makeHttpRequest<T>(options, requestId),
      requestId,
      options.method,
      options.path,
    );

    await this.rateLimiter.updateRateLimitAndWaitIfNeeded(
      options.path,
      options.method,
      response.headers,
      response.statusCode,
      requestId,
    );

    if (response.statusCode >= 400) {
      throw this.#createErrorFromResponse(response, options, requestId);
    }

    return response.data as T;
  }

  /**
   * Executes a GET request with automatic handling.
   * Convenience method optimized for read operations.
   *
   * @param path - Discord API endpoint path
   * @param options - Additional request configuration
   * @returns Promise resolving to parsed response data
   *
   * @example
   * ```typescript
   * const user = await rest.get<User>('/users/@me');
   * ```
   *
   * @public
   */
  get<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path });
  }

  /**
   * Executes a POST request with automatic handling.
   * Convenience method optimized for resource creation.
   *
   * @param path - Discord API endpoint path
   * @param options - Request configuration including body data
   * @returns Promise resolving to created resource data
   *
   * @example
   * ```typescript
   * const message = await rest.post<Message>('/channels/123/messages', {
   *   body: JSON.stringify({ content: 'Hello!' })
   * });
   * ```
   *
   * @public
   */
  post<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path });
  }

  /**
   * Executes a PUT request with automatic handling.
   * Convenience method optimized for complete resource replacement.
   *
   * @param path - Discord API endpoint path
   * @param options - Request configuration including replacement data
   * @returns Promise resolving to updated resource data
   *
   * @example
   * ```typescript
   * await rest.put(`/guilds/123/members/456/roles/789`, {
   *   reason: 'Promoting user'
   * });
   * ```
   *
   * @public
   */
  put<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path });
  }

  /**
   * Executes a PATCH request with automatic handling.
   * Convenience method optimized for partial resource updates.
   *
   * @param path - Discord API endpoint path
   * @param options - Request configuration including update data
   * @returns Promise resolving to modified resource data
   *
   * @example
   * ```typescript
   * const guild = await rest.patch<Guild>('/guilds/123', {
   *   body: JSON.stringify({ name: 'Updated Name' })
   * });
   * ```
   *
   * @public
   */
  patch<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path });
  }

  /**
   * Executes a DELETE request with automatic handling.
   * Convenience method optimized for resource removal.
   *
   * @param path - Discord API endpoint path
   * @param options - Request configuration including deletion reason
   * @returns Promise resolving to deletion result
   *
   * @example
   * ```typescript
   * await rest.delete('/channels/123/messages/456', {
   *   reason: 'Spam content removed'
   * });
   * ```
   *
   * @public
   */
  delete<T>(
    path: string,
    options: Omit<HttpRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path });
  }

  /**
   * Gracefully destroys the REST client and cleans up resources.
   * Performs comprehensive cleanup to prevent memory leaks.
   *
   * @returns Promise that resolves when cleanup is complete
   *
   * @example
   * ```typescript
   * process.on('SIGTERM', async () => {
   *   await rest.destroy();
   *   process.exit(0);
   * });
   * ```
   *
   * @public
   */
  async destroy(): Promise<void> {
    await this.pool.close();
    this.rateLimiter.destroy();
    this.file.clear();
    this.removeAllListeners();
  }

  /**
   * Creates comprehensive error objects from failed API responses.
   * Analyzes response status codes to provide detailed error information.
   *
   * @param response - Failed HTTP response
   * @param options - Original request options
   * @param requestId - Unique request identifier
   * @returns Enhanced Error object with detailed information
   *
   * @internal
   */
  #createErrorFromResponse<T>(
    response: HttpResponse<T>,
    options: HttpRequestOptions,
    requestId: string,
  ): Error {
    const errorPrefix = `[${options.method} ${options.path}] ${response.statusCode} (requestId: ${requestId})`;

    if (this.#isJsonErrorEntity(response.data)) {
      const jsonError = response.data as unknown as JsonErrorResponse;
      const message = response.reason || jsonError.message;

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
        return new Error(
          `${errorPrefix}: Request failed - ${response.reason || `Status ${response.statusCode}`}`,
        );
    }
  }

  /**
   * Executes low-level HTTP requests with event tracking.
   * Handles request preparation, execution, and response parsing.
   *
   * @param options - Complete request configuration
   * @param requestId - Unique identifier for tracking
   * @returns Promise resolving to normalized HTTP response
   *
   * @internal
   */
  async #makeHttpRequest<T>(
    options: HttpRequestOptions,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const requestStart = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#options.timeout);

    try {
      const preparedRequest = options.files
        ? await this.#handleFileUpload(options)
        : options;

      const path = `/api/v${this.#options.version}/${preparedRequest.path.replace(/^\/+/, "")}`;

      const headers = this.#buildRequestHeaders(preparedRequest);

      const query = preparedRequest.query
        ? this.#formatBooleanQueryParams(preparedRequest.query)
        : undefined;

      const response = await this.pool.request<T>({
        path,
        method: preparedRequest.method,
        body: preparedRequest.body,
        query: query,
        signal: controller.signal,
        headers: headers,
      });

      let responseBody: Buffer;
      const arrayBuffer = await response.body.arrayBuffer();

      if (arrayBuffer.byteLength < 4096) {
        responseBody = Buffer.allocUnsafe(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);
        responseBody.set(view);
      } else {
        responseBody = Buffer.from(arrayBuffer);
      }

      if (response.statusCode === 204 || responseBody.length === 0) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
        };
      }

      const result: T = JSON.parse(responseBody.toString());

      let reason: string | undefined;
      if (response.statusCode >= 400 && this.#isJsonErrorEntity(result)) {
        const jsonError = result as JsonErrorResponse;
        const formattedFieldErrors = this.#formatFieldErrors(jsonError.errors);
        reason = formattedFieldErrors
          ? `${jsonError.message}. Details: ${formattedFieldErrors}`
          : jsonError.message;
      }

      const duration = Date.now() - requestStart;

      this.emit("request", {
        timestamp: new Date().toISOString(),
        requestId,
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        duration,
        responseSize: responseBody.length,
      });

      return {
        data: result,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
        reason,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Request timed out after ${this.#options.timeout}ms [${options.method} ${options.path}]`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Validates whether an object follows Discord's API error structure.
   * Performs runtime type checking for Discord error format.
   *
   * @param error - Unknown object to validate
   * @returns Type predicate for JsonErrorResponse
   *
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
   * Constructs HTTP headers for Discord API requests.
   * Builds comprehensive headers including authentication and content metadata.
   *
   * @param options - Request options containing headers and body
   * @returns Complete headers object with authentication
   *
   * @internal
   */
  #buildRequestHeaders(options: HttpRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "x-ratelimit-precision": "millisecond",
    };

    if (options.body && !options.files) {
      if (typeof options.body === "string") {
        headers["content-length"] = Buffer.byteLength(
          options.body,
          "utf8",
        ).toString();
        headers["content-type"] = "application/json";
      } else if (Buffer.isBuffer(options.body)) {
        headers["content-length"] = options.body.length.toString();
        headers["content-type"] = "application/json";
      }
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (options.reason) {
      Object.assign(headers, {
        "x-audit-log-reason": encodeURIComponent(options.reason),
      });
    }

    return headers;
  }

  /**
   * Prepares multipart/form-data requests for file uploads.
   * Transforms request options into multipart format for Discord uploads.
   *
   * @param options - Request options containing files to upload
   * @returns Promise resolving to multipart request options
   *
   * @throws {Error} If no files are provided
   *
   * @internal
   */
  async #handleFileUpload(
    options: HttpRequestOptions,
  ): Promise<HttpRequestOptions> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

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
   * Formats boolean query parameters for Discord API compatibility.
   * Converts JavaScript booleans to string representations.
   *
   * @param params - Query parameters with mixed types
   * @returns Sanitized parameters with string values
   *
   * @internal
   */
  #formatBooleanQueryParams(params: object): object {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "boolean") {
        result[key] = value ? "true" : "false";
      } else if (value !== undefined && value !== null) {
        result[key] = String(value);
      }
    }

    return result;
  }

  /**
   * Formats nested field validation errors into readable messages.
   * Recursively traverses Discord's nested error structure.
   *
   * @param errors - Nested error object from Discord API response
   * @returns Formatted error string or undefined if no errors
   *
   * @internal
   */
  #formatFieldErrors(errors?: Record<string, unknown>): string | undefined {
    if (!errors) {
      return undefined;
    }

    const errorParts: string[] = [];

    const processErrors = (obj: Record<string, unknown>, path = ""): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (key === "_errors" && Array.isArray(value) && value.length > 0) {
          const fieldErrors = value
            .map((err: JsonErrorField) => `"${err.message}"`)
            .join(", ");
          errorParts.push(`${path || "general"}: ${fieldErrors}`);
        } else if (value && typeof value === "object") {
          processErrors(value as Record<string, unknown>, currentPath);
        }
      }
    };

    processErrors(errors);
    return errorParts.length > 0 ? errorParts.join("; ") : undefined;
  }

  /**
   * Extracts resource type information from Discord API paths.
   * Analyzes URL patterns to identify resource type.
   *
   * @param path - Discord API path to analyze
   * @returns Resource type string or undefined
   *
   * @internal
   */
  #extractResourceType(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }

    const matches = path.match(/\/([a-z-]+)\/\d+/i);
    return matches?.[1];
  }

  /**
   * Extracts resource ID from API paths.
   * Uses regex matching to identify Discord snowflake IDs.
   *
   * @param path - Discord API path to analyze
   * @returns Discord snowflake ID or undefined
   *
   * @internal
   */
  #extractResourceId(path?: string): string | undefined {
    if (!path) {
      return undefined;
    }

    const matches = path.match(/\/([0-9]+)(?:\/[a-z-]+)*\/?$/i);
    return matches?.[1];
  }
}
