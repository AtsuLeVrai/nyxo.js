import { clearTimeout } from "node:timers";
import { EventEmitter } from "eventemitter3";
import { type Dispatcher, Pool } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ApplicationApi,
  ApplicationCommandApi,
  ApplicationConnectionApi,
  AuditLogApi,
  AutoModerationApi,
  ChannelApi,
  EmojiApi,
  EntitlementApi,
  GatewayApi,
  GuildApi,
  GuildTemplateApi,
  InteractionApi,
  InviteApi,
  MessageApi,
  OAuth2Api,
  PollApi,
  ScheduledEventApi,
  SkuApi,
  SoundboardApi,
  StageInstanceApi,
  StickerApi,
  SubscriptionApi,
  UserApi,
  VoiceApi,
  WebhookApi,
} from "../api/index.js";
import { ApiError, type JsonErrorResponse } from "../errors/index.js";
import { FileHandler } from "../handlers/index.js";
import { RateLimitManager, RetryManager } from "../managers/index.js";
import { RestOptions } from "../options/index.js";
import type {
  ApiRequestOptions,
  HttpResponse,
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
    connections: 128,
    pipelining: 10,
    connectTimeout: 30000,
    keepAliveTimeout: 60000,
    keepAliveMaxTimeout: 300000,
    headersTimeout: 30000,
    bodyTimeout: 300000,
    maxHeaderSize: 16384,
    allowH2: true,
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

    this.#pool = new Pool(this.#options.baseUrl, REST_CONSTANTS.POOL_CONFIG);
    this.#rateLimiter = new RateLimitManager(this);
    this.#retry = new RetryManager(this, this.#options.retry);
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
   * Access to the REST client configuration options
   */
  get applications(): ApplicationApi {
    return new ApplicationApi(this);
  }

  /**
   * Access to application command endpoints
   */
  get commands(): ApplicationCommandApi {
    return new ApplicationCommandApi(this);
  }

  /**
   * Access to application connection endpoints
   */
  get connections(): ApplicationConnectionApi {
    return new ApplicationConnectionApi(this);
  }

  /**
   * Access to guild-related endpoints
   */
  get guilds(): GuildApi {
    return new GuildApi(this);
  }

  /**
   * Access to channel-related endpoints
   */
  get channels(): ChannelApi {
    return new ChannelApi(this);
  }

  /**
   * Access to invite-related endpoints
   */
  get invites(): InviteApi {
    return new InviteApi(this);
  }

  /**
   * Access to guild template endpoints
   */
  get templates(): GuildTemplateApi {
    return new GuildTemplateApi(this);
  }

  /**
   * Access to user-related endpoints
   */
  get users(): UserApi {
    return new UserApi(this);
  }

  /**
   * Access to audit log endpoints
   */
  get auditLogs(): AuditLogApi {
    return new AuditLogApi(this);
  }

  /**
   * Access to message-related endpoints
   */
  get messages(): MessageApi {
    return new MessageApi(this);
  }

  /**
   * Access to interaction-related endpoints
   */
  get interactions(): InteractionApi {
    return new InteractionApi(this);
  }

  /**
   * Access to emoji-related endpoints
   */
  get emojis(): EmojiApi {
    return new EmojiApi(this);
  }

  /**
   * Access to sticker-related endpoints
   */
  get stickers(): StickerApi {
    return new StickerApi(this);
  }

  /**
   * Access to voice-related endpoints
   */
  get voice(): VoiceApi {
    return new VoiceApi(this);
  }

  /**
   * Access to soundboard-related endpoints
   */
  get soundboards(): SoundboardApi {
    return new SoundboardApi(this);
  }

  /**
   * Access to stage instance endpoints
   */
  get stages(): StageInstanceApi {
    return new StageInstanceApi(this);
  }

  /**
   * Access to scheduled event endpoints
   */
  get scheduledEvents(): ScheduledEventApi {
    return new ScheduledEventApi(this);
  }

  /**
   * Access to poll-related endpoints
   */
  get polls(): PollApi {
    return new PollApi(this);
  }

  /**
   * Access to auto-moderation endpoints
   */
  get autoModeration(): AutoModerationApi {
    return new AutoModerationApi(this);
  }

  /**
   * Access to webhook-related endpoints
   */
  get webhooks(): WebhookApi {
    return new WebhookApi(this);
  }

  /**
   * Access to OAuth2-related endpoints
   */
  get oauth2(): OAuth2Api {
    return new OAuth2Api(this);
  }

  /**
   * Access to gateway-related endpoints
   */
  get gateway(): GatewayApi {
    return new GatewayApi(this);
  }

  /**
   * Access to SKU-related endpoints
   */
  get skus(): SkuApi {
    return new SkuApi(this);
  }

  /**
   * Access to entitlement-related endpoints
   */
  get entitlements(): EntitlementApi {
    return new EntitlementApi(this);
  }

  /**
   * Access to subscription-related endpoints
   */
  get subscriptions(): SubscriptionApi {
    return new SubscriptionApi(this);
  }

  /**
   * Makes a request to the Discord API with automatic rate limiting and retries
   *
   * @param options - Request options
   * @returns Parsed response data
   * @throws ApiError for failed requests
   */
  request<T>(options: ApiRequestOptions): Promise<T> {
    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();

    // Retry the request if it fails
    return this.#retry.execute(
      async () => {
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
          response.headers as Record<string, string>,
          response.statusCode,
          requestId,
        );

        return response.data;
      },
      { method: options.method, path: options.path, requestId },
    );
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
    const requestHeaders = this.#buildRequestHeaders(options);

    this.emit("requestStart", {
      timestamp: new Date().toISOString(),
      requestId,
      path: options.path,
      method: options.method,
      headers: requestHeaders,
    });

    try {
      // Prepare and execute the request
      const preparedRequest = await this.#prepareRequest(options);
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.#options.timeout,
      );

      try {
        const response = await this.#pool.request({
          ...preparedRequest,
          signal: controller.signal,
        });
        const responseBody = await this.#readResponseBody(response);
        const result = this.#processResponse<T>(
          response,
          responseBody,
          requestId,
        );

        // Check for API errors
        if (result.statusCode >= 400 && this.#isJsonErrorEntity(result.data)) {
          throw new ApiError(requestId, result.data, {
            statusCode: result.statusCode,
            headers: result.headers,
            method: options.method,
            path: options.path,
          });
        }

        // Calculate request duration
        const duration = Date.now() - requestStart;

        // Emit request success event
        this.emit("requestSuccess", {
          timestamp: new Date().toISOString(),
          requestId,
          path: options.path,
          method: options.method,
          headers: result.headers,
          statusCode: result.statusCode,
          duration,
          responseSize: responseBody.length,
        });

        return result;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      // Calculate request duration
      const duration = Date.now() - requestStart;

      // Emit request failure event
      this.emit("requestFailure", {
        timestamp: new Date().toISOString(),
        requestId,
        path: options.path,
        method: options.method,
        error: error instanceof Error ? error : new Error(String(error)),
        statusCode: error instanceof ApiError ? error.statusCode : undefined,
        headers:
          error instanceof ApiError
            ? (error.headers as Record<string, string>)
            : undefined,
        duration,
      });

      throw error;
    }
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
  ): Promise<Dispatcher.RequestOptions> | Dispatcher.RequestOptions {
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

    return baseOptions;
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
  ): Promise<Dispatcher.RequestOptions> {
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
    // Handle empty responses
    if (response.statusCode === 204 || bodyContent.length === 0) {
      return {
        data: {} as T,
        statusCode: response.statusCode,
        headers: response.headers,
      };
    }

    // Parse JSON response
    try {
      const data = JSON.parse(bodyContent.toString()) as T;

      return {
        data,
        statusCode: response.statusCode,
        headers: response.headers,
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
