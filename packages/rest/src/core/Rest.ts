import { open, stat } from "node:fs/promises";
import { basename } from "node:path";
import FormData from "form-data";
import { Gunzip } from "minizlib";
import { type Dispatcher, request } from "undici";
import type {
  PathLike,
  RateLimitData,
  RateLimitResponseEntity,
  RequestOptions,
  RestOptions,
} from "../types/index.js";
import { HttpMethod, HttpStatusCode } from "../utils/index.js";

export class Rest {
  static readonly MAX_FILE_SIZE = 25 * 1024 * 1024;
  readonly #options: RestOptions;
  readonly #buckets = new Map<string, RateLimitData>();
  #globalRateLimit: number | null = null;

  constructor(options: RestOptions) {
    this.#options = options;
  }

  get<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethod.Get, path, ...options });
  }

  post<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethod.Post, path, ...options });
  }

  put<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethod.Put, path, ...options });
  }

  patch<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethod.Patch, path, ...options });
  }

  delete<T>(
    path: PathLike,
    options?: Omit<RequestOptions, "method" | "path">,
  ): Promise<T> {
    return this.request({ method: HttpMethod.Delete, path, ...options });
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const normalizedPath: PathLike = options.path.startsWith("/")
      ? options.path
      : `/${options.path}`;
    const path = `https://discord.com/api/v${this.#options.version.toString()}${normalizedPath}`;

    await this.#handleRateLimits(normalizedPath);

    try {
      let requestOptions = { ...options };
      if (requestOptions.files) {
        requestOptions = await this.#handleFiles(requestOptions);
      }

      const response = await request(path, {
        reset: true,
        throwOnError: true,
        headers: this.#buildHeaders(requestOptions),
        method: requestOptions.method,
        body: requestOptions.body,
        query: requestOptions.query,
      });

      this.#updateRateLimits(
        response.headers as Record<string, string>,
        normalizedPath,
      );
      return this.#handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }

  async #handleResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const data = await this.#decompressResponse(response);

    if (response.statusCode !== HttpStatusCode.Ok) {
      if (response.statusCode === HttpStatusCode.TooManyRequests) {
        const error = JSON.parse(data.toString()) as RateLimitResponseEntity;
        const retryAfter = error.retry_after * 1000;

        if (error.global) {
          this.#globalRateLimit = Date.now() + retryAfter;
          throw new Error(
            `Global rate limit exceeded, retry after ${retryAfter}ms`,
          );
        }

        throw new Error(`Route rate limited, retry after ${retryAfter}ms`);
      }

      throw new Error(`HTTP error ${response.statusCode}: ${data.toString()}`);
    }

    if (response.headers["content-type"]?.includes("application/json")) {
      return JSON.parse(data.toString()) as T;
    }

    return data as unknown as T;
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

  #buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.#options.authType} ${this.#options.token}`,
      "user-agent":
        this.#options.userAgent ??
        "DiscordBot (https://github.com/your/bot, 1.0.0)",
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

  async #handleFiles(options: RequestOptions): Promise<RequestOptions> {
    const form = new FormData();
    const files = Array.isArray(options.files)
      ? options.files
      : [options.files];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        continue;
      }

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      if (typeof file === "string") {
        const stats = await stat(file);
        if (stats.size > Rest.MAX_FILE_SIZE) {
          throw new Error(
            `File too large: max size is ${Rest.MAX_FILE_SIZE} bytes`,
          );
        }

        const handle = await open(file);
        try {
          buffer = await handle.readFile();
          filename = basename(file);
          contentType = "application/octet-stream";
        } finally {
          await handle.close();
        }
      } else if (file instanceof File) {
        if (file.size > Rest.MAX_FILE_SIZE) {
          throw new Error(
            `File too large: max size is ${Rest.MAX_FILE_SIZE} bytes`,
          );
        }
        buffer = Buffer.from(await file.arrayBuffer());
        filename = file.name;
        contentType = file.type;
      } else {
        throw new Error(`Invalid file type at index ${i}`);
      }

      form.append(files.length === 1 ? "file" : `files[${i}]`, buffer, {
        filename,
        contentType,
      });
    }

    if (options.body) {
      form.append("payload_json", options.body);
    }

    return {
      ...options,
      body: form.getBuffer(),
      headers: form.getHeaders(),
    };
  }

  #updateRateLimits(headers: Record<string, string>, _path: string): void {
    const bucket = headers["x-ratelimit-bucket"];
    if (!bucket) {
      return;
    }

    const reset = Number(headers["x-ratelimit-reset"]);
    const resetAfter = Number(headers["x-ratelimit-reset-after"]);
    const remaining = Number(headers["x-ratelimit-remaining"]);
    const limit = Number(headers["x-ratelimit-limit"]);

    if ([reset, resetAfter, remaining, limit].some(Number.isNaN)) {
      return;
    }

    this.#buckets.set(bucket, {
      bucket,
      limit,
      remaining,
      reset,
      resetAfter,
      global: false,
      scope: (headers["x-ratelimit-scope"] as RateLimitData["scope"]) ?? "user",
    });

    if (headers["x-ratelimit-global"] === "true") {
      const retryAfter = headers["retry-after"];
      if (retryAfter) {
        this.#globalRateLimit = Date.now() + Number(retryAfter) * 1000;
      }
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

  async #handleRateLimits(path: string): Promise<void> {
    if (this.#globalRateLimit && Date.now() < this.#globalRateLimit) {
      const delay = this.#globalRateLimit - Date.now();
      await this.#wait(delay);
      return;
    }

    const bucketKey = this.#getBucketKey(path);
    const rateLimit = this.#buckets.get(bucketKey);

    if (rateLimit?.remaining === 0) {
      const resetTime = rateLimit.reset * 1000;
      if (Date.now() < resetTime) {
        await this.#wait(resetTime - Date.now());
      }
    }
  }

  async #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
