import { type Dispatcher, Pool, RetryAgent } from "undici";
import type { Rest } from "../core/index.js";
import { FileHandler, HeaderHandler } from "../handlers/index.js";
import type { RestOptions } from "../options/index.js";
import {
  JsonErrorCode,
  type JsonErrorEntity,
  type JsonErrorField,
  type RequestOptions,
} from "../types/index.js";

export interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
}

export class HttpService {
  readonly #rest: Rest;
  readonly #options: RestOptions;
  readonly #pool: Pool;
  readonly #retryAgent: RetryAgent;

  constructor(rest: Rest, options: RestOptions) {
    this.#rest = rest;
    this.#options = options;

    this.#pool = new Pool(this.#options.baseUrl, this.#options.pool);
    this.#retryAgent = new RetryAgent(this.#pool, this.#options.retry);
  }

  async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    const url = new URL(
      `/api/v${this.#options.version}/${options.path.replace(/^\/+/, "")}`,
      this.#options.baseUrl,
    );

    const requestOptions: Dispatcher.RequestOptions = {
      ...options,
      origin: url.origin,
      path: url.pathname + url.search,
      headers: {
        authorization: `Bot ${this.#options.token}`,
        "user-agent": this.#options.userAgent,
        "content-type": "application/json",
        "x-ratelimit-precision": "millisecond",
        ...HeaderHandler.parse(options.headers).headers,
      },
    };

    if (options.files) {
      const formData = await FileHandler.createFormData(
        options.files,
        options.body,
      );
      requestOptions.body = formData.getBuffer();
      requestOptions.headers = {
        ...requestOptions.headers,
        ...formData.getHeaders(),
      };
    }

    if (options.reason && requestOptions.headers) {
      (requestOptions.headers as Record<string, string>)["x-audit-log-reason"] =
        encodeURIComponent(options.reason);
    }

    try {
      const response = await this.#retryAgent.request(requestOptions);
      const latency = Date.now() - startTime;

      if (response.statusCode === 204) {
        return {
          data: {} as T,
          statusCode: response.statusCode,
          headers: response.headers as Record<string, string>,
        };
      }

      const buffer = Buffer.from(await response.body.arrayBuffer());
      let data: unknown;

      try {
        data = JSON.parse(buffer.toString());
      } catch {
        data = {
          code: JsonErrorCode.GeneralError,
          message: "Invalid JSON response",
        };
      }

      if (response.statusCode >= 400) {
        const error = data as JsonErrorEntity;

        if (error.errors) {
          const transformedErrors: Record<
            string,
            { _errors: JsonErrorField[] }
          > = {};

          for (const [key, value] of Object.entries(error.errors)) {
            if (value._errors) {
              transformedErrors[key] = {
                _errors: value._errors.map((err) => ({
                  ...err,
                  path: [key, ...(err.path || [])],
                })),
              };
            }
          }

          error.errors = transformedErrors;
        }

        if (!error.code) {
          error.code = response.statusCode;
        }

        throw error;
      }

      this.#rest.emit("request", {
        path: options.path,
        method: options.method,
        statusCode: response.statusCode,
        latency,
        timestamp: Date.now(),
      });

      return {
        data: data as T,
        statusCode: response.statusCode,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "number"
      ) {
        throw error;
      }

      throw new Error("Request failed", {
        cause: error,
      });
    }
  }

  async destroy(): Promise<void> {
    await Promise.all([this.#pool.close(), this.#retryAgent.close()]);
  }
}
