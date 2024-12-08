import { open, stat } from "node:fs/promises";
import { basename } from "node:path";
import { ApiVersion } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import FormData from "form-data";
import { Gunzip } from "minizlib";
import { type Dispatcher, Pool, ProxyAgent, RetryAgent } from "undici";
import { RouterFactory } from "../factory/index.js";
import type {
  FileEntity,
  JsonErrorEntity,
  JsonErrorResponseEntity,
  PathLike,
  RateLimitEntity,
  RateLimitResponseEntity,
  RateLimitScope,
  RestEventMap,
  RestOptionsEntity,
  RouteEntity,
  RouterDefinitions,
  RouterKey,
  StatsEventEntity,
} from "../types/index.js";
import {
  AuthTypeFlag,
  HttpMethodFlag,
  HttpStatusCode,
} from "../utils/index.js";

export class Rest extends EventEmitter<RestEventMap> {
  static readonly #MAX_FILE_SIZE = 25 * 1024 * 1024;
  static readonly #BASE_URL = "https://discord.com";
  static readonly #DEFAULT_OPTIONS: Partial<RestOptionsEntity> = {
    version: ApiVersion.V10,
    authType: AuthTypeFlag.Bot,
    maxRetries: 3,
    baseRetryDelay: 1000,
    timeout: 15000,
    rateLimitRetryLimit: 3,
    maxConcurrentRequests: 5,
    compress: true,
  };

  readonly #pool: Pool;
  #retryAgent: RetryAgent;
  #routerFactory: RouterFactory;
  #proxyAgent: ProxyAgent | null = null;
  #globalRateLimit: number | null = null;
  #activeRequests = 0;
  #totalRequests = 0;
  #successfulRequests = 0;
  #failedRequests = 0;
  #lastRequestTime: number | null = null;

  readonly #options: Required<RestOptionsEntity>;
  readonly #rateLimitBuckets = new Map<
    string,
    Omit<RateLimitEntity, "bucket">
  >();

  constructor(options: RestOptionsEntity) {
    super();
    this.#validateConfiguration(options);
    this.#options = {
      ...Rest.#DEFAULT_OPTIONS,
      ...options,
    } as Required<RestOptionsEntity>;
    this.#setupProxyAgent();
    this.#pool = this.#createPool();
    this.#retryAgent = this.#createRetryAgent();
    this.#routerFactory = new RouterFactory(this);
  }

  async request<T>(options: RouteEntity): Promise<T> {
    const startTime = Date.now();
    this.#lastRequestTime = startTime;
    this.#totalRequests++;

    try {
      await this.#waitForAvailableSlot();
      this.#activeRequests++;

      const preparedOptions = options.files
        ? await this.#handleFiles(options)
        : options;

      const normalizedPath = this.normalizePath(options.path);
      await this.#handleRateLimits(normalizedPath);

      const response = await this.#retryAgent.request({
        origin: Rest.#BASE_URL,
        path: normalizedPath,
        method: options.method,
        headers: this.#buildHeaders(preparedOptions),
        body: preparedOptions.body,
        query: preparedOptions.query,
      });

      this.emit("responseReceived", {
        method: options.method,
        path: normalizedPath,
        status: response.statusCode,
        headers: response.headers,
      });

      this.#updateRateLimits(response.headers as Record<string, string>);
      const result = await this.#processResponse<T>(response);

      this.#successfulRequests++;
      const responseTime = Date.now() - startTime;

      this.emit("apiRequest", {
        method: options.method,
        path: normalizedPath,
        status: response.statusCode,
        responseTime,
        attempt: 1,
      });

      return result;
    } catch (error) {
      this.#failedRequests++;
      throw this.#wrapError(error);
    } finally {
      this.#activeRequests--;
    }
  }

  get<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Get, path, ...options });
  }

  post<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Post, path, ...options });
  }

  put<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Put, path, ...options });
  }

  patch<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Patch, path, ...options });
  }

  delete<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethodFlag.Delete, path, ...options });
  }

  getRouter<K extends RouterKey>(key: K): RouterDefinitions[K] {
    return this.#routerFactory.getRouter(key);
  }

  updateProxy(
    proxyOptions: NonNullable<RestOptionsEntity["proxy"]> | null,
  ): void {
    this.emit("debug", "Updating proxy configuration");

    if (this.#proxyAgent) {
      this.emit("debug", "Closing existing proxy agent");
      this.#proxyAgent.close().catch((error) => {
        this.emit(
          "error",
          new Error(`Failed to close proxy agent: ${error.message}`),
        );
      });
    }

    if (proxyOptions) {
      this.emit(
        "debug",
        `Setting up new proxy agent with URI: ${proxyOptions.uri}`,
      );
      this.#proxyAgent = new ProxyAgent(proxyOptions);
      this.#options.proxy = proxyOptions;
    } else {
      this.emit("debug", "Removing proxy configuration");
      this.#proxyAgent = null;
      this.#options.proxy = { uri: "" };
    }

    this.#retryAgent = this.#createRetryAgent();
    this.emit("proxyUpdate", proxyOptions);
  }

  getStats(): StatsEventEntity {
    return {
      activeRequests: this.#activeRequests,
      totalRequests: this.#totalRequests,
      successfulRequests: this.#successfulRequests,
      failedRequests: this.#failedRequests,
      bucketSize: this.#rateLimitBuckets.size,
      globalRateLimit: this.#globalRateLimit,
      lastRequestTime: this.#lastRequestTime,
      successRate:
        this.#totalRequests > 0
          ? (this.#successfulRequests / this.#totalRequests) * 100
          : 100,
    };
  }

  async destroy(): Promise<void> {
    this.emit("debug", "Starting REST client destruction");

    if (this.#proxyAgent) {
      this.emit("debug", "Closing proxy agent");
      await this.#proxyAgent.close();
    }

    this.emit("debug", "Destroying retry agent and connection pool");
    await this.#retryAgent.close();
    await this.#pool.destroy();

    this.emit("debug", "Clearing rate limit buckets");
    this.#rateLimitBuckets.clear();

    this.emit("debug", "Clearing routers");
    this.#routerFactory.clearRouters();

    this.#globalRateLimit = null;
    this.#lastRequestTime = null;
    this.#activeRequests = 0;
    this.#totalRequests = 0;
    this.#successfulRequests = 0;
    this.#failedRequests = 0;

    this.removeAllListeners();
  }

  normalizePath(path: string): PathLike {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/api/v${this.#options.version}${normalizedPath}`;
  }

  async #handleFiles(options: RouteEntity): Promise<RouteEntity> {
    const form = new FormData();
    const files = Array.isArray(options.files)
      ? options.files
      : [options.files];

    for (let i = 0; i < files.length; i++) {
      // @ts-expect-error
      await this.#processFile(form, files[i], i, files.length);
    }

    if (options.body) {
      form.append("payload_json", options.body);
    }

    return {
      ...options,
      body: form.getBuffer(),
      headers: form.getHeaders(options.headers),
    };
  }

  async #processFile(
    form: FormData,
    file: FileEntity,
    index: number,
    totalFiles: number,
  ): Promise<void> {
    if (!file) {
      return;
    }

    const { buffer, filename, contentType } = await this.#getFileData(file);
    const fieldName = totalFiles === 1 ? "file" : `files[${index}]`;

    form.append(fieldName, buffer, { filename, contentType });
  }

  #getFileData(file: FileEntity): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    if (typeof file === "string") {
      return this.#handleFilePathInput(file);
    }
    if (file instanceof File) {
      return this.#handleFileInput(file);
    }
    throw new Error("Invalid file type");
  }

  async #handleFilePathInput(filePath: string): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    const stats = await stat(filePath);
    if (stats.size > Rest.#MAX_FILE_SIZE) {
      throw new Error(
        `File too large: max size is ${Rest.#MAX_FILE_SIZE} bytes`,
      );
    }

    const handle = await open(filePath);
    try {
      const buffer = await handle.readFile();
      return {
        buffer,
        filename: basename(filePath),
        contentType: "application/octet-stream",
      };
    } finally {
      await handle.close();
    }
  }

  async #handleFileInput(file: File): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    if (file.size > Rest.#MAX_FILE_SIZE) {
      throw new Error(
        `File too large: max size is ${Rest.#MAX_FILE_SIZE} bytes`,
      );
    }

    return {
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name,
      contentType: file.type,
    };
  }

  async #processResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const data = await this.#decompressResponse(response);

    if (response.statusCode !== HttpStatusCode.Ok) {
      this.#handleErrorResponse(response.statusCode, data);
    }

    if (response.headers["content-type"]?.includes("application/json")) {
      return JSON.parse(data.toString()) as T;
    }

    return data as unknown as T;
  }

  #handleErrorResponse(statusCode: number, data: Buffer): void {
    const content = data.toString();

    if (statusCode === HttpStatusCode.TooManyRequests) {
      const error = JSON.parse(content) as RateLimitResponseEntity;
      const retryAfter = error.retry_after * 1000;

      if (error.global) {
        this.#globalRateLimit = Date.now() + retryAfter;
        throw new Error(
          `Global rate limit exceeded, retry after ${retryAfter}ms`,
        );
      }

      throw new Error(`Route rate limited, retry after ${retryAfter}ms`);
    }

    try {
      const errorData = JSON.parse(content);

      if (
        "code" in errorData &&
        typeof errorData.code === "number" &&
        "message" in errorData &&
        typeof errorData.message === "string"
      ) {
        const error = errorData as JsonErrorResponseEntity;
        throw new Error(`Discord API Error ${error.code}: ${error.message}`);
      }

      if (
        "code" in errorData &&
        typeof errorData.code === "number" &&
        "message" in errorData &&
        typeof errorData.message === "string"
      ) {
        const error = errorData as JsonErrorEntity;
        const errorMessage = `Discord API Error ${error.code}: ${error.message}`;

        if (error.errors) {
          const details = JSON.stringify(error.errors, null, 2);
          throw new Error(`${errorMessage}\nDetails: ${details}`);
        }

        throw new Error(errorMessage);
      }
    } catch {
      throw new Error(`HTTP error ${statusCode}: ${content}`);
    }
  }

  async #decompressResponse(
    response: Dispatcher.ResponseData,
  ): Promise<Buffer> {
    const buffer = Buffer.from(await response.body.arrayBuffer());

    if (
      !this.#options.compress ||
      response.headers["content-encoding"] !== "gzip"
    ) {
      return buffer;
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const decompressor = new Gunzip({ level: 9 });

      decompressor
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject)
        .end(buffer);
    });
  }

  async #handleRateLimits(path: string): Promise<void> {
    if (this.#isGloballyRateLimited()) {
      await this.#waitForGlobalRateLimit();
      return;
    }

    const bucketKey = this.#getBucketKey(path);
    const rateLimit = this.#rateLimitBuckets.get(bucketKey);

    if (this.#isBucketRateLimited(rateLimit)) {
      await this.#waitForBucketRateLimit(rateLimit);
    }
  }

  #isGloballyRateLimited(): boolean {
    return this.#globalRateLimit !== null && Date.now() < this.#globalRateLimit;
  }

  async #waitForGlobalRateLimit(): Promise<void> {
    if (this.#globalRateLimit) {
      const delay = this.#globalRateLimit - Date.now();
      await this.#waitForTimeout(delay);
      this.emit("debug", `Waited ${delay}ms for global rate limit`);
    }
  }

  #isBucketRateLimited(
    rateLimit?: Omit<RateLimitEntity, "bucket">,
  ): rateLimit is Omit<RateLimitEntity, "bucket"> {
    if (!rateLimit) {
      return false;
    }

    return rateLimit.remaining === 0 && Date.now() < rateLimit.reset * 1000;
  }

  async #waitForBucketRateLimit(
    rateLimit: Omit<RateLimitEntity, "bucket">,
  ): Promise<void> {
    const resetTime = rateLimit.reset * 1000;
    if (Date.now() < resetTime) {
      const delay = resetTime - Date.now();
      await this.#waitForTimeout(delay);
      this.emit("debug", `Waited ${delay}ms for bucket rate limit`);
    }
  }

  #getBucketKey(path: string): string {
    const majorIdMatch = path.match(/^\/(?:channels|guilds|webhooks)\/(\d+)/);
    if (majorIdMatch) {
      const [, majorId] = majorIdMatch;
      return `${majorId}:${path}`;
    }
    return path;
  }

  #updateRateLimits(headers: Record<string, string>): void {
    const rateLimitData = this.#extractRateLimitData(headers);
    if (!rateLimitData) {
      return;
    }

    const { bucket, reset, resetAfter, remaining, limit, global, scope } =
      rateLimitData;

    if (remaining === 0) {
      this.emit("rateLimitHit", {
        bucket,
        resetAfter,
        limit,
        scope,
      });
    }

    this.#rateLimitBuckets.set(bucket, {
      limit,
      remaining,
      reset,
      resetAfter,
      global,
      scope,
    });

    if (global) {
      this.#handleGlobalRateLimit(headers);
    }
  }

  #extractRateLimitData(
    headers: Record<string, string>,
  ): RateLimitEntity | null {
    const bucket = headers["x-ratelimit-bucket"];
    if (!bucket) {
      return null;
    }

    const reset = Number(headers["x-ratelimit-reset"]);
    const resetAfter = Number(headers["x-ratelimit-reset-after"]);
    const remaining = Number(headers["x-ratelimit-remaining"]);
    const limit = Number(headers["x-ratelimit-limit"]);
    const global = Boolean(headers["x-ratelimit-global"]);
    const scope = headers["x-ratelimit-scope"] as RateLimitScope;

    if ([reset, resetAfter, remaining, limit].some(Number.isNaN)) {
      this.emit("warn", "Invalid rate limit headers received");
      return null;
    }

    return {
      bucket,
      reset,
      resetAfter,
      remaining,
      limit,
      global,
      scope,
    };
  }

  #handleGlobalRateLimit(headers: Record<string, string>): void {
    const retryAfter = headers["retry-after"];
    if (retryAfter) {
      this.#globalRateLimit = Date.now() + Number(retryAfter) * 1000;
      this.emit("debug", `Setting global rate limit for ${retryAfter} seconds`);
    }
  }

  #buildHeaders(options: RouteEntity): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
      "content-type": "application/json",
    };

    if (this.#options.compress) {
      headers["accept-encoding"] = "gzip";
    }

    if (options.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return { ...headers, ...options.headers };
  }

  async #waitForAvailableSlot(): Promise<void> {
    if (this.#activeRequests >= this.#options.maxConcurrentRequests) {
      this.emit("debug", "Waiting for available request slot");
      while (this.#activeRequests >= this.#options.maxConcurrentRequests) {
        await this.#waitForTimeout(100);
      }
      this.emit("debug", "Request slot available");
    }
  }

  #waitForTimeout(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #validateConfiguration(options: Partial<RestOptionsEntity>): void {
    this.emit("debug", "Validating configuration");

    if (!this.#isValidToken(options.token)) {
      const error = new Error("Token is required");
      this.emit("error", error);
      throw error;
    }

    if (options.userAgent && !this.#isValidUserAgent(options.userAgent)) {
      const error = new Error("Invalid user agent format");
      this.emit("error", error);
      throw error;
    }

    this.emit("debug", "Configuration validated successfully");
  }

  #isValidToken(token?: string): boolean {
    if (!token) {
      return false;
    }
    return token.length > 0;
  }

  #isValidUserAgent(userAgent: string): boolean {
    return /^DiscordBot \(https?:\/\/.*?, [\d.]+\)$/.test(userAgent);
  }

  #wrapError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }

  #createPool(): Pool {
    return new Pool(Rest.#BASE_URL, {
      allowH2: true,
      connections: this.#options.maxConcurrentRequests * 2,
      pipelining: 1,
      keepAliveTimeout: 30000,
      keepAliveMaxTimeout: 60000,
      connect: {
        rejectUnauthorized: true,
        timeout: this.#options.timeout,
      },
      ...this.#options.pool,
    });
  }

  #setupProxyAgent(): void {
    if (this.#options.proxy) {
      this.#proxyAgent = new ProxyAgent({
        allowH2: true,
        ...this.#options.proxy,
      });
    }
  }

  #createRetryAgent(): RetryAgent {
    const agent = this.#proxyAgent ?? this.#pool;
    return new RetryAgent(agent, {
      maxRetries: this.#options.maxRetries,
      minTimeout: this.#options.baseRetryDelay,
      maxTimeout: 30000,
      timeoutFactor: 2,
      methods: Object.values(HttpMethodFlag),
      statusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
      retryAfter: true,
    });
  }
}
