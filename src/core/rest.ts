import { createReadStream, existsSync, type ReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename } from "node:path";
import FormData from "form-data";
import { extension, lookup } from "mime-types";
import { type Dispatcher, Pool } from "undici";
import { z } from "zod";
import type { APIEndpointDefinition } from "../common/index.js";
import { ApiVersion } from "../constants/index.js";
import { sleep } from "../utils/index.js";

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
  data: Buffer | ReadStream;
  filename: string;
  contentType: string;
  size: number | null;
}

const MAX_FILE_COUNT = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

export class Rest {
  readonly pool: Pool;
  readonly #options: z.infer<typeof RestOptions>;

  #buckets = new Map<string, RateLimitBucket>();
  #routeBuckets = new Map<string, string>();
  #globalRequests = 0;
  #globalWindowStart = Date.now();
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

    if (response.statusCode === 429) {
      const retryAfter = Number(responseHeaders[RATE_LIMIT_HEADERS.RETRY_AFTER]) * 1000;
      if (retryAfter > 0) {
        await sleep(retryAfter);
        // Retry the request
        return this.request(endpoint, method, options);
      }
    }

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
      const processed = await this.#processFile(filesArray[i] as FileInput);
      if (processed.size !== null && processed.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${processed.size} bytes`);
      }

      const fieldName = filesArray.length === 1 ? "file" : `files[${i}]`;
      form.append(fieldName, processed.data, {
        filename: processed.filename,
        contentType: processed.contentType,
        knownLength: Number(processed.size),
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
    body: any; // FormData | string | null
    headers: Record<string, string>;
  }> {
    if (options?.files) {
      const formData = await this.createFormData(
        options.files,
        options.body ? JSON.stringify(options.body) : undefined,
      );

      return {
        body: formData as any,
        headers: formData.getHeaders(),
      };
    }

    if (options?.body) {
      return {
        body: JSON.stringify(options.body),
        headers: { "content-type": "application/json" },
      };
    }

    return { body: null, headers: {} };
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
    let filename = "file.bin";
    if (typeof input === "string") {
      const dataUriMatch = input.match(DATA_URI_REGEX);
      if (dataUriMatch) {
        const mimeType = dataUriMatch[1] as string;
        filename = `file.${extension(mimeType) || "bin"}`;
      } else {
        filename = basename(input) || filename;
      }
    }

    const contentType = lookup(filename) || "application/octet-stream";
    const { data, size } = await this.#toBuffer(input);

    return { data, filename, contentType, size };
  }

  async #toBuffer(input: FileInput): Promise<{ data: Buffer | ReadStream; size: number | null }> {
    if (Buffer.isBuffer(input)) {
      return { data: input, size: input.length };
    }

    if (typeof input === "string") {
      const dataUriMatch = input.match(DATA_URI_REGEX);
      if (dataUriMatch) {
        try {
          const base64Data = dataUriMatch[2] as string;
          const buf = Buffer.from(base64Data, "base64");
          return { data: buf, size: buf.length };
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
        const stream = createReadStream(input, { highWaterMark: 64 * 1024 }); // 64KB
        return { data: stream, size: fileStats.size };
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

    const isExempt = GLOBAL_EXEMPT_ROUTES.some((route) => path.includes(route));
    if (!isExempt) {
      if (now - this.#globalWindowStart >= 1000) {
        this.#globalRequests = 0;
        this.#globalWindowStart = now;
      }

      if (this.#globalRequests >= 50) {
        const retryAfter = 1000 - (now - this.#globalWindowStart);
        return { canProceed: false, retryAfter };
      }
    }

    if (now - this.#invalidWindowStart >= 600_000) {
      this.#invalidRequests = 0;
      this.#invalidWindowStart = now;
    }

    if (this.#invalidRequests >= 10_000) {
      const retryAfter = 600_000 - (now - this.#invalidWindowStart);
      return { canProceed: false, retryAfter };
    }

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
    this.#globalRequests++;

    if (INVALID_STATUSES.includes(statusCode)) {
      this.#invalidRequests++;
    }

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
    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset <= now) {
        this.#buckets.delete(hash);
      }
    }

    for (const [routeKey, bucketHash] of this.#routeBuckets.entries()) {
      if (!this.#buckets.has(bucketHash)) {
        this.#routeBuckets.delete(routeKey);
      }
    }
  }
}
