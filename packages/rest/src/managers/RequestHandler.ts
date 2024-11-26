import { MimeType } from "@nyxjs/core";
import { BrotliDecompress, Gunzip } from "minizlib";
import type { Dispatcher } from "undici";
import { HttpStatusCode } from "../enums/index.js";
import type {
  RateLimitResponseEntity,
  RequestOptions,
} from "../types/index.js";
import type { RateLimitManager } from "./RateLimitManager.js";

export class RequestHandler {
  readonly #decompressionMap = new Map<
    string,
    typeof BrotliDecompress | typeof Gunzip
  >([
    ["br", BrotliDecompress],
    ["gzip", Gunzip],
  ]);

  async handleResponse<T>(
    response: Dispatcher.ResponseData,
    request: RequestOptions,
    rateLimit: RateLimitManager,
  ): Promise<T> {
    rateLimit.handleRateLimit(
      request,
      response.headers as Record<string, string>,
    );

    if (!this.#isSuccessStatus(response.statusCode)) {
      await this.#handleErrorResponse(response, rateLimit);
    }

    return this.#parseResponse<T>(response);
  }

  #isSuccessStatus(status: number): boolean {
    return status >= 200 && status < 300;
  }

  async #handleErrorResponse(
    response: Dispatcher.ResponseData,
    rateLimit: RateLimitManager,
  ): Promise<never> {
    const statusCode = response.statusCode;

    if (this.#isRateLimitError(statusCode)) {
      const error = (await response.body.json()) as RateLimitResponseEntity;
      if (error.global) {
        rateLimit.handleGlobalRateLimit(error.retry_after);
      }
      throw new Error(`Rate limited: ${error.message}`);
    }

    if (this.#isAuthError(statusCode)) {
      rateLimit.handleInvalidRequest();
    }

    const errorBody = await response.body.json();
    throw new Error(`HTTP Error ${statusCode}: ${JSON.stringify(errorBody)}`);
  }

  #isRateLimitError(status: number): boolean {
    return status === HttpStatusCode.TooManyRequests;
  }

  #isAuthError(status: number): boolean {
    return (
      status === HttpStatusCode.Unauthorized ||
      status === HttpStatusCode.Forbidden
    );
  }

  async #parseResponse<T>(response: Dispatcher.ResponseData): Promise<T> {
    const contentType = response.headers["content-type"] as string;
    const encoding = response.headers["content-encoding"] as string;

    if (contentType?.includes(MimeType.Json)) {
      const buffer = await this.#streamToBuffer(
        response.body.body as unknown as ReadableStream,
      );
      const decompressed = await this.#decompress(buffer, encoding);
      return JSON.parse(decompressed.toString());
    }

    return (await response.body.arrayBuffer()) as T;
  }

  async #streamToBuffer(stream: ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    return Buffer.concat(chunks);
  }

  async #decompress(data: Buffer, encoding: string): Promise<Buffer> {
    if (!encoding) {
      return data;
    }

    const Decompressor = this.#decompressionMap.get(encoding);
    if (!Decompressor) {
      return data;
    }

    return new Promise((resolve, reject) => {
      const decompressor = new Decompressor({ level: 9 });
      const chunks: Buffer[] = [];

      decompressor
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject)
        .end(data);
    });
  }
}
