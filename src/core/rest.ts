import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename } from "node:path";
import FormData from "form-data";
import { extension, lookup } from "mime-types";
import { type Dispatcher, Pool } from "undici";
import { z } from "zod";
import { ApiVersion } from "../constants/index.js";
import { type APIEndpointDefinition, sleep } from "../utils/index.js";

type ExtractResponse<T> = T extends APIEndpointDefinition<
  any,
  any,
  infer Response,
  any,
  any,
  any,
  any,
  any
>
  ? Response
  : never;
type ExtractReason<T> = T extends APIEndpointDefinition<
  any,
  any,
  any,
  infer Reason,
  any,
  any,
  any,
  any
>
  ? Reason
  : never;
type ExtractFiles<T> = T extends APIEndpointDefinition<
  any,
  any,
  any,
  any,
  infer Files,
  any,
  any,
  any
>
  ? Files
  : never;
type ExtractBody<T> = T extends APIEndpointDefinition<any, any, any, any, any, infer Body, any, any>
  ? Body
  : never;
type ExtractQuery<T> = T extends APIEndpointDefinition<
  any,
  any,
  any,
  any,
  any,
  any,
  infer Query,
  any
>
  ? Query
  : never;
type ExtractHeaders<T> = T extends APIEndpointDefinition<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer Headers
>
  ? Headers
  : never;

type SupportsMethod<T, M extends HttpMethod> = T extends APIEndpointDefinition<
  any,
  infer Methods,
  any,
  any,
  any,
  any,
  any,
  any
>
  ? M extends Methods[number]
    ? true
    : false
  : false;

type EndpointWithMethod<T, M extends HttpMethod> = T extends APIEndpointDefinition<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>
  ? SupportsMethod<T, M> extends true
    ? T
    : never
  : never;

type RequestOptions<T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>> = {
  query?: ExtractQuery<T>;
  reason?: ExtractReason<T> extends true ? string : never;
  files?: ExtractFiles<T> extends true ? FileInput | FileInput[] : never;
  body?: ExtractBody<T>;
  headers?: ExtractHeaders<T>;
} & (ExtractBody<T> extends undefined ? {} : { body: ExtractBody<T> }) &
  (ExtractFiles<T> extends true ? { files?: FileInput | FileInput[] } : {}) &
  (ExtractReason<T> extends true ? { reason?: string } : {}) &
  (ExtractHeaders<T> extends undefined ? {} : { headers?: ExtractHeaders<T> });

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type DataUri = `data:${string};base64,${string}`;
export type FileInput = string | Buffer | DataUri;

interface RateLimitBucket {
  limit: number;
  remaining: number;
  reset: number; // timestamp
}

interface RateLimitResult {
  canProceed: boolean;
  retryAfter?: number;
}

export interface JsonErrorField {
  code: string;
  message: string;
  path: string[];
}

export interface JsonErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

export interface FileAsset {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
}

const MAX_FILE_COUNT = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const STREAM_THRESHOLD = 50 * 1024 * 1024;
const INVALID_STATUSES = [401, 403, 429];
const GLOBAL_EXEMPT_ROUTES = ["/interactions", "/webhooks"];
const DATA_URI_REGEX = /^data:(.+);base64,(.*)$/;
const RATE_LIMIT_HEADERS = {
  LIMIT: "x-ratelimit-limit",
  REMAINING: "x-ratelimit-remaining",
  RESET: "x-ratelimit-reset",
  BUCKET: "x-ratelimit-bucket",
  RETRY_AFTER: "retry-after",
} as const;

export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z.object({
  token: z.string(),
  authType: z.enum(["Bot", "Bearer"]).default("Bot"),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/AtsuLeVrai/nyxo.js, 1.0.0)"),
  baseUrl: z.url().default("https://discord.com"),
  pool: z
    .object({
      connections: z.int().min(1).default(8),
      headersTimeout: z.int().min(1000).default(10000),
      bodyTimeout: z.int().min(1000).default(30000),
      connectTimeout: z.int().min(1000).default(15000),
      keepAliveTimeout: z.int().min(1000).default(60000),
      keepAliveMaxTimeout: z.int().min(1000).default(300000),
      maxRequestsPerClient: z.int().min(1).default(2000),
      strictContentLength: z.boolean().default(false),
    })
    .prefault({}),
});

export type RestOptions = z.infer<typeof RestOptions>;

export class Rest {
  readonly pool: Pool;
  readonly #options: RestOptions;

  // Buckets par hash
  #buckets = new Map<string, RateLimitBucket>();

  // Mapping route → bucket hash
  #routeBuckets = new Map<string, string>();

  // Global rate limit (50 req/sec)
  #globalRequests = 0;
  #globalWindowStart = Date.now();

  // Cloudflare protection (10k invalid/10min)
  #invalidRequests = 0;
  #invalidWindowStart = Date.now();

  constructor(options: z.input<typeof RestOptions>) {
    try {
      this.#options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }

      throw error;
    }

    this.pool = new Pool(this.#options.baseUrl, this.#options.pool);
  }

  get<T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>>(
    endpoint: EndpointWithMethod<T, "GET">,
    options?: Pick<RequestOptions<T>, "query" | "reason" | "headers">,
  ): Promise<ExtractResponse<T>> {
    return this.request(endpoint, "GET", options as RequestOptions<T>);
  }

  post<T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>>(
    endpoint: EndpointWithMethod<T, "POST">,
    options: Pick<RequestOptions<T>, "body" | "query" | "reason" | "files" | "headers">,
  ): Promise<ExtractResponse<T>> {
    return this.request(endpoint, "POST", options as RequestOptions<T>);
  }

  patch<T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>>(
    endpoint: EndpointWithMethod<T, "PATCH">,
    options: Pick<RequestOptions<T>, "body" | "query" | "reason" | "files" | "headers">,
  ): Promise<ExtractResponse<T>> {
    return this.request(endpoint, "PATCH", options as RequestOptions<T>);
  }

  put<T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>>(
    endpoint: EndpointWithMethod<T, "PUT">,
    options: Pick<RequestOptions<T>, "body" | "query" | "reason" | "files" | "headers">,
  ): Promise<ExtractResponse<T>> {
    return this.request(endpoint, "PUT", options as RequestOptions<T>);
  }

  delete<T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>>(
    endpoint: EndpointWithMethod<T, "DELETE">,
    options?: Pick<RequestOptions<T>, "query" | "reason" | "headers">,
  ): Promise<ExtractResponse<T>> {
    return this.request(endpoint, "DELETE", options as RequestOptions<T>);
  }

  async request<
    T extends APIEndpointDefinition<any, any, any, any, any, any, any, any>,
    M extends HttpMethod,
  >(endpoint: T, method: M, options?: RequestOptions<T>): Promise<ExtractResponse<T>> {
    const path = `/api/v${this.#options.version}${endpoint}`;
    const rateLimitCheck = this.#checkRateLimit(path, method);
    if (!rateLimitCheck.canProceed && rateLimitCheck.retryAfter) {
      await sleep(rateLimitCheck.retryAfter);
    }

    const requestHeaders = this.#prepareHeaders({
      reason: options?.reason as string,
      headers: options?.headers as unknown as Record<string, string>,
    });

    const { body, headers: bodyHeaders } = await this.#prepareBody({
      body: options?.body as object,
      files: options?.files as FileInput | FileInput[],
    });

    const finalHeaders = { ...requestHeaders, ...bodyHeaders };
    const response = await this.pool.request<ExtractResponse<T>>({
      path,
      method,
      headers: finalHeaders,
      body,
      query: options?.query as Record<string, unknown>,
    });

    const responseHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(response.headers || {})) {
      responseHeaders[key.toLowerCase()] = String(value);
    }

    this.#updateRateLimit(path, method, responseHeaders, response.statusCode);

    // Handle 429 specifically
    if (response.statusCode === 429) {
      const retryAfter = Number(responseHeaders[RATE_LIMIT_HEADERS.RETRY_AFTER]) * 1000;
      if (retryAfter > 0) {
        await sleep(retryAfter);
        // Retry the request
        return this.request(endpoint, method, options);
      }
    }

    // Cleanup expired buckets occasionally (every 100 requests)
    if (this.#globalRequests % 100 === 0) {
      this.#cleanupBuckets();
    }

    return this.#handleResponse<ExtractResponse<T>>(response);
  }

  async destroy(): Promise<void> {
    await this.pool.close();
    this.#buckets.clear();
    this.#routeBuckets.clear();
  }

  async createFormData(files: FileInput | FileInput[], body?: string): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];
    if (filesArray.length > MAX_FILE_COUNT) {
      throw new Error(`Too many files: ${filesArray.length} (max: ${MAX_FILE_COUNT})`);
    }

    const form = new FormData();
    for (let i = 0; i < filesArray.length; i++) {
      const processedFile = await this.#processFile(filesArray[i] as FileInput);

      if (processedFile.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${processedFile.size} bytes`);
      }

      const fieldName = filesArray.length === 1 ? "file" : `files[${i}]`;
      form.append(fieldName, processedFile.buffer, {
        filename: processedFile.filename,
        contentType: processedFile.contentType,
        knownLength: processedFile.size,
      });
    }

    if (body) {
      form.append("payload_json", body);
    }

    return form;
  }

  #prepareHeaders(options?: {
    reason?: string;
    headers?: Record<string, string>;
  }): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent": this.#options.userAgent,
      "x-ratelimit-precision": "millisecond",
    };

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    if (options?.reason) {
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }

  async #prepareBody(options?: { body?: object; files?: FileInput | FileInput[] }): Promise<{
    body: string | Buffer | null;
    headers: Record<string, string>;
  }> {
    if (options?.files) {
      const formData = await this.createFormData(
        options.files,
        options.body ? JSON.stringify(options.body) : undefined,
      );

      return {
        body: formData.getBuffer(),
        headers: formData.getHeaders(),
      };
    }

    if (options?.body) {
      return {
        body: JSON.stringify(options.body),
        headers: { "content-type": "application/json" },
      };
    }

    return {
      body: null,
      headers: {},
    };
  }

  async #handleResponse<T>(response: Dispatcher.ResponseData<T>): Promise<T> {
    const responseBody = Buffer.from(await response.body.arrayBuffer());
    if (response.statusCode === 204 || responseBody.length === 0) {
      return {} as T;
    }

    const result: T = JSON.parse(responseBody.toString());
    if (response.statusCode >= 400 && this.#isJsonErrorEntity(result)) {
      const jsonError = result as unknown as JsonErrorResponse;
      const formattedFieldErrors = this.#formatFieldErrors(jsonError.errors);

      const errorMessage = formattedFieldErrors
        ? `${jsonError.message}. Details: ${formattedFieldErrors}`
        : jsonError.message;

      const error = new Error(errorMessage);
      (error as any).code = jsonError.code;
      (error as any).errors = jsonError.errors;
      (error as any).statusCode = response.statusCode;

      throw error;
    }

    return result;
  }

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

  #formatFieldErrors(errors?: Record<string, unknown>): string | undefined {
    if (!errors) {
      return undefined;
    }

    const errorParts: string[] = [];
    const processErrors = (obj: Record<string, unknown>, path = ""): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (key === "_errors" && Array.isArray(value) && value.length > 0) {
          const fieldErrors = value.map((err: JsonErrorField) => `"${err.message}"`).join(", ");
          errorParts.push(`${path || "general"}: ${fieldErrors}`);
        } else if (value && typeof value === "object") {
          processErrors(value as Record<string, unknown>, currentPath);
        }
      }
    };

    processErrors(errors);
    return errorParts.length > 0 ? errorParts.join("; ") : undefined;
  }

  async #processFile(input: FileInput): Promise<FileAsset> {
    let filename = "file";
    if (typeof input === "string") {
      const dataUriMatch = input.match(DATA_URI_REGEX);
      if (dataUriMatch) {
        const mimeType = dataUriMatch[1] as string;
        filename = `file.${extension(mimeType) || "bin"}`;
      } else {
        filename = basename(input);
      }
    }

    const contentType = lookup(filename) || "application/octet-stream";
    const buffer = await this.#toBuffer(input);

    return {
      buffer,
      filename,
      contentType,
      size: buffer.length,
    };
  }

  async #toBuffer(input: FileInput): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (typeof input === "string") {
      const dataUriMatch = input.match(DATA_URI_REGEX);
      if (dataUriMatch) {
        try {
          const base64Data = dataUriMatch[2] as string;
          return Buffer.from(base64Data, "base64");
        } catch (error) {
          throw new Error(
            `Invalid data URI: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      if (!existsSync(input)) {
        throw new Error(`File does not exist: ${input}`);
      }

      try {
        const fileStats = await stat(input);
        if (fileStats.size > STREAM_THRESHOLD) {
          return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            const stream = createReadStream(input, {
              highWaterMark: 64 * 1024, // 64KB chunks for optimal memory usage
            });

            stream.on("data", (chunk) => {
              const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
              chunks.push(bufferChunk);
            });

            stream.on("end", () => {
              resolve(Buffer.concat(chunks));
            });

            stream.on("error", (error) => {
              reject(new Error(`Stream reading failed for "${input}": ${error.message}`));
            });
          });
        }

        return await readFile(input);
      } catch (error) {
        throw new Error(
          `Failed to read file "${input}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    throw new Error(`Unsupported input type: ${typeof input}`);
  }

  #checkRateLimit(path: string, method: HttpMethod): RateLimitResult {
    const now = Date.now();

    // 1. Global rate limit (50 req/sec) - sauf routes exemptées
    const isExempt = GLOBAL_EXEMPT_ROUTES.some((route) => path.includes(route));
    if (!isExempt) {
      // Reset window si nécessaire
      if (now - this.#globalWindowStart >= 1000) {
        this.#globalRequests = 0;
        this.#globalWindowStart = now;
      }

      if (this.#globalRequests >= 50) {
        const retryAfter = 1000 - (now - this.#globalWindowStart);
        return { canProceed: false, retryAfter };
      }
    }

    // 2. Cloudflare protection (10k invalid/10min)
    if (now - this.#invalidWindowStart >= 600_000) {
      this.#invalidRequests = 0;
      this.#invalidWindowStart = now;
    }

    if (this.#invalidRequests >= 10_000) {
      const retryAfter = 600_000 - (now - this.#invalidWindowStart);
      return { canProceed: false, retryAfter };
    }

    // 3. Bucket rate limit
    const routeKey = `${method}:${path}`;
    const bucketHash = this.#routeBuckets.get(routeKey);

    if (bucketHash) {
      const bucket = this.#buckets.get(bucketHash);
      if (bucket && bucket.remaining <= 0 && bucket.reset > now) {
        const retryAfter = bucket.reset - now;
        return { canProceed: false, retryAfter };
      }
    }

    return { canProceed: true };
  }

  #updateRateLimit(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    // Update global counter
    this.#globalRequests++;

    // Track invalid requests
    if (INVALID_STATUSES.includes(statusCode)) {
      this.#invalidRequests++;
    }

    // Update bucket si présent
    const bucketHash = headers[RATE_LIMIT_HEADERS.BUCKET];
    if (bucketHash) {
      const limit = Number(headers[RATE_LIMIT_HEADERS.LIMIT]);
      const remaining = Number(headers[RATE_LIMIT_HEADERS.REMAINING]);
      const reset = Number(headers[RATE_LIMIT_HEADERS.RESET]) * 1000; // convert to ms

      this.#buckets.set(bucketHash, { limit, remaining, reset });
      this.#routeBuckets.set(`${method}:${path}`, bucketHash);
    }
  }

  #cleanupBuckets(): void {
    const now = Date.now();

    // Remove expired buckets
    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset <= now) {
        this.#buckets.delete(hash);
      }
    }

    // Remove mappings vers buckets inexistants
    for (const [routeKey, bucketHash] of this.#routeBuckets.entries()) {
      if (!this.#buckets.has(bucketHash)) {
        this.#routeBuckets.delete(routeKey);
      }
    }
  }
}
