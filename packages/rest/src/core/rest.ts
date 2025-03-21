import { EventEmitter } from "eventemitter3";
import { type Dispatcher, Pool } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { ApiError, type JsonErrorResponse } from "../errors/index.js";
import { FileHandler, HeaderHandler } from "../handlers/index.js";
import {
  QueueManager,
  RateLimitManager,
  RetryManager,
} from "../managers/index.js";
import { RestOptions } from "../options/index.js";
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
  ApiRequestOptions,
  HttpResponse,
  ParsedRequest,
  RestEvents,
} from "../types/index.js";

/**
 * Constants for REST client
 */
const REST_CONSTANTS = {
  /** Regular expression to clean leading slashes from API paths */
  PATH_REGEX: /^\/+/,

  /** Default HTTP pool configuration */
  POOL_CONFIG: {
    connections: 32,
    pipelining: 1,
    connectTimeout: 30000,
    keepAliveTimeout: 60000,
    keepAliveMaxTimeout: 300000,
    headersTimeout: 30000,
    bodyTimeout: 300000,
    maxHeaderSize: 16384,
    allowH2: false,
    strictContentLength: true,
  },
} as const;

/**
 * Main REST client for Discord API
 *
 * Handles HTTP requests, rate limiting, retries, and provides
 * access to resource-specific routers.
 */
export class Rest extends EventEmitter<RestEvents> {
  /** Validated configuration options */
  readonly #options: RestOptions;

  /** HTTP connection pool */
  readonly #pool: Pool;

  /** Rate limit handler */
  readonly #rateLimiter: RateLimitManager;

  /** Retry handler */
  readonly #retry: RetryManager;

  /** Queue handler */
  readonly #queue: QueueManager;

  /**
   * Creates a new REST client
   *
   * @param options - Configuration options for the REST client
   * @throws Error if options validation fails
   */
  constructor(options: z.input<typeof RestOptions>) {
    super();

    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    // Initialize HTTP connection pool
    this.#pool = new Pool(this.#options.baseUrl, REST_CONSTANTS.POOL_CONFIG);

    // Initialize managers
    this.#rateLimiter = new RateLimitManager(this);
    this.#retry = new RetryManager(this, this.#options.retry);
    this.#queue = new QueueManager(this, this.#options.queue);
  }

  /**
   * Access to the Discord API token
   */
  get token(): string {
    return this.#options.token;
  }

  /**
   * Access to the Discord API base URL
   */
  get options(): RestOptions {
    return this.#options;
  }

  /**
   * Access to the Discord API base URL
   */
  get retry(): RetryManager {
    return this.#retry;
  }

  /**
   * Access to the Discord API base URL
   */
  get rateLimiter(): RateLimitManager {
    return this.#rateLimiter;
  }

  /**
   * Access to the Discord API base URL
   */
  get queue(): QueueManager {
    return this.#queue;
  }

  /**
   * Access to the REST client configuration options
   */
  get applications(): ApplicationRouter {
    return new ApplicationRouter(this);
  }

  /**
   * Access to application command endpoints
   */
  get commands(): ApplicationCommandRouter {
    return new ApplicationCommandRouter(this);
  }

  /**
   * Access to application connection endpoints
   */
  get connections(): ApplicationConnectionRouter {
    return new ApplicationConnectionRouter(this);
  }

  /**
   * Access to guild-related endpoints
   */
  get guilds(): GuildRouter {
    return new GuildRouter(this);
  }

  /**
   * Access to channel-related endpoints
   */
  get channels(): ChannelRouter {
    return new ChannelRouter(this);
  }

  /**
   * Access to invite-related endpoints
   */
  get invites(): InviteRouter {
    return new InviteRouter(this);
  }

  /**
   * Access to guild template endpoints
   */
  get templates(): GuildTemplateRouter {
    return new GuildTemplateRouter(this);
  }

  /**
   * Access to user-related endpoints
   */
  get users(): UserRouter {
    return new UserRouter(this);
  }

  /**
   * Access to audit log endpoints
   */
  get auditLogs(): AuditLogRouter {
    return new AuditLogRouter(this);
  }

  /**
   * Access to message-related endpoints
   */
  get messages(): MessageRouter {
    return new MessageRouter(this);
  }

  /**
   * Access to interaction-related endpoints
   */
  get interactions(): InteractionRouter {
    return new InteractionRouter(this);
  }

  /**
   * Access to emoji-related endpoints
   */
  get emojis(): EmojiRouter {
    return new EmojiRouter(this);
  }

  /**
   * Access to sticker-related endpoints
   */
  get stickers(): StickerRouter {
    return new StickerRouter(this);
  }

  /**
   * Access to voice-related endpoints
   */
  get voice(): VoiceRouter {
    return new VoiceRouter(this);
  }

  /**
   * Access to soundboard-related endpoints
   */
  get soundboards(): SoundboardRouter {
    return new SoundboardRouter(this);
  }

  /**
   * Access to stage instance endpoints
   */
  get stages(): StageInstanceRouter {
    return new StageInstanceRouter(this);
  }

  /**
   * Access to scheduled event endpoints
   */
  get scheduledEvents(): ScheduledEventRouter {
    return new ScheduledEventRouter(this);
  }

  /**
   * Access to poll-related endpoints
   */
  get polls(): PollRouter {
    return new PollRouter(this);
  }

  /**
   * Access to auto-moderation endpoints
   */
  get autoModeration(): AutoModerationRouter {
    return new AutoModerationRouter(this);
  }

  /**
   * Access to webhook-related endpoints
   */
  get webhooks(): WebhookRouter {
    return new WebhookRouter(this);
  }

  /**
   * Access to OAuth2-related endpoints
   */
  get oauth2(): OAuth2Router {
    return new OAuth2Router(this);
  }

  /**
   * Access to gateway-related endpoints
   */
  get gateway(): GatewayRouter {
    return new GatewayRouter(this);
  }

  /**
   * Access to SKU-related endpoints
   */
  get skus(): SkuRouter {
    return new SkuRouter(this);
  }

  /**
   * Access to entitlement-related endpoints
   */
  get entitlements(): EntitlementRouter {
    return new EntitlementRouter(this);
  }

  /**
   * Access to subscription-related endpoints
   */
  get subscriptions(): SubscriptionRouter {
    return new SubscriptionRouter(this);
  }

  /**
   * Makes a request to the Discord API with automatic rate limiting and retries
   *
   * @param options - Request options
   * @returns Parsed response data
   * @throws ApiError for failed requests
   */
  request<T>(options: ApiRequestOptions): Promise<T> {
    const requestId = crypto.randomUUID();

    // Wrap the actual request in a function that can be queued
    const executeRequest = (): Promise<T> =>
      this.#retry.execute(
        async () => {
          try {
            // Check rate limits before making the request
            this.#rateLimiter.enforceRateLimit(
              options.path,
              options.method,
              requestId,
            );

            // Make the actual HTTP request
            const response = await this.#makeHttpRequest<T>(options, requestId);

            // Update rate limit information
            this.#rateLimiter.updateRateLimit(
              options.path,
              options.method,
              response.headers,
              response.statusCode,
              requestId,
            );

            return response.data;
          } catch (error) {
            // Emit failure event
            this.emit("requestFailure", {
              timestamp: new Date().toISOString(),
              error: error instanceof Error ? error : new Error(String(error)),
              path: options.path,
              method: options.method,
              headers: this.#buildRequestHeaders(options),
              statusCode:
                error instanceof ApiError ? error.statusCode : undefined,
              requestId: requestId,
              duration: 0,
            });
            throw error;
          }
        },
        { method: options.method, path: options.path },
        requestId,
      );

    // Add to queue (or execute immediately if queue is disabled)
    return this.#queue.enqueue<T>(options, requestId, executeRequest);
  }

  /**
   * Makes a GET request to the Discord API
   *
   * @param path - API path
   * @param options - Additional request options
   * @returns Parsed response data
   */
  get<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "GET", path });
  }

  /**
   * Makes a POST request to the Discord API
   *
   * @param path - API path
   * @param options - Additional request options
   * @returns Parsed response data
   */
  post<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "POST", path });
  }

  /**
   * Makes a PUT request to the Discord API
   *
   * @param path - API path
   * @param options - Additional request options
   * @returns Parsed response data
   */
  put<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PUT", path });
  }

  /**
   * Makes a PATCH request to the Discord API
   *
   * @param path - API path
   * @param options - Additional request options
   * @returns Parsed response data
   */
  patch<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH", path });
  }

  /**
   * Makes a DELETE request to the Discord API
   *
   * @param path - API path
   * @param options - Additional request options
   * @returns Parsed response data
   */
  delete<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "path"> = {},
  ): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE", path });
  }

  /**
   * Cleans up resources used by the REST client
   */
  async destroy(): Promise<void> {
    await this.#pool.close();
    this.#rateLimiter.destroy();
    this.removeAllListeners();
  }

  /**
   * Makes an HTTP request with event tracking
   *
   * @param options - Request options
   * @param requestId - Unique identifier for the request
   * @returns HTTP response with parsed data
   * @private
   */
  async #makeHttpRequest<T>(
    options: ApiRequestOptions,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const requestStart = Date.now();

    // Emit event when request starts
    this.emit("requestStart", {
      timestamp: new Date().toISOString(),
      requestId,
      path: options.path,
      method: options.method,
      headers: this.#buildRequestHeaders(options),
    });

    // Prepare and execute the request
    const preparedRequest = await this.#prepareRequest(options);
    const response = await this.#pool.request(preparedRequest.options);
    const responseBody = await this.#readResponseBody(response);
    const result = this.#processResponse<T>(response, responseBody, requestId);

    // Check for API errors
    if (result.statusCode >= 400 && this.#isJsonErrorEntity(result.data)) {
      throw new ApiError(requestId, result.data, {
        statusCode: result.statusCode,
        headers: result.headers,
        method: options.method,
        path: options.path,
      });
    }

    // Emit event when request completes successfully
    this.emit("requestComplete", {
      timestamp: new Date().toISOString(),
      requestId,
      path: options.path,
      method: options.method,
      headers: this.#buildRequestHeaders(options),
      statusCode: result.statusCode,
      responseHeaders: result.headers,
      duration: Date.now() - requestStart,
    });

    return result;
  }

  /**
   * Checks if an object is a Discord API error response
   *
   * @param error - Object to check
   * @returns Whether the object is a JSON error response
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
   * Prepares a request for sending
   *
   * @param options - Request options
   * @returns Prepared request
   * @private
   */
  #prepareRequest(
    options: ApiRequestOptions,
  ): Promise<ParsedRequest> | ParsedRequest {
    const url = this.#buildUrl(options.path);
    const baseOptions = {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      headers: this.#buildRequestHeaders(options),
      reset: true,
    };

    // Special handling for file uploads
    if (options.files) {
      return this.#handleFileUpload(options, baseOptions);
    }

    return { url, options: baseOptions };
  }

  /**
   * Builds a full URL for an API path
   *
   * @param path - API path
   * @returns Constructed URL
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
   * Builds headers for a request
   *
   * @param options - Request options
   * @returns Prepared headers
   * @private
   */
  #buildRequestHeaders(options: ApiRequestOptions): Record<string, string> {
    const headers = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "content-type": "application/json",
      "x-ratelimit-precision": "millisecond",
      "user-agent": this.#options.userAgent,
    };

    // Merge in custom headers
    if (options.headers) {
      Object.assign(headers, HeaderHandler.parse(options.headers).headers);
    }

    // Add audit log reason if provided
    if (options.reason) {
      Object.assign("x-audit-log-reason", encodeURIComponent(options.reason));
    }

    return headers;
  }

  /**
   * Prepares a file upload request
   *
   * @param options - Request options with files
   * @param baseOptions - Base request options
   * @returns Prepared request
   * @private
   */
  async #handleFileUpload(
    options: ApiRequestOptions,
    baseOptions: Dispatcher.RequestOptions,
  ): Promise<ParsedRequest> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    // Create multipart form data
    const formData = await FileHandler.createFormData(
      options.files,
      options.body,
    );

    // Prepare URL and options
    const formUrl = new URL(baseOptions.path || "", baseOptions.origin);
    return {
      url: formUrl,
      options: {
        ...baseOptions,
        body: formData.getBuffer(),
        headers: {
          ...baseOptions.headers,
          ...formData.getHeaders(),
        },
      },
    };
  }

  /**
   * Reads the response body as a buffer
   *
   * @param response - HTTP response
   * @returns Buffer containing response body
   * @private
   */
  async #readResponseBody(response: Dispatcher.ResponseData): Promise<Buffer> {
    try {
      return Buffer.from(await response.body.arrayBuffer());
    } catch (error) {
      // Handle case where stream is already consumed
      if (error instanceof Error && error.message.includes("stream")) {
        return Buffer.alloc(0);
      }
      throw error;
    }
  }

  /**
   * Processes an HTTP response
   *
   * @param response - HTTP response
   * @param bodyContent - Response body buffer
   * @param requestId - Unique identifier for the request
   * @returns Processed HTTP response with parsed data
   * @private
   */
  #processResponse<T>(
    response: Dispatcher.ResponseData,
    bodyContent: Buffer,
    requestId: string,
  ): HttpResponse<T> {
    const headers = HeaderHandler.parse(response.headers).headers;

    // Handle empty responses
    if (response.statusCode === 204 || bodyContent.length === 0) {
      return {
        data: {} as T,
        statusCode: response.statusCode,
        headers,
      };
    }

    // Parse JSON response
    try {
      const data = JSON.parse(bodyContent.toString()) as T;

      return {
        data,
        statusCode: response.statusCode,
        headers,
      };
    } catch {
      throw new ApiError(
        requestId,
        { code: 0, message: "Failed to parse response body" },
        {
          statusCode: response.statusCode,
        },
      );
    }
  }
}
