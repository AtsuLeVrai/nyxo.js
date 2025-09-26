import { createReadStream, existsSync, type ReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename } from "node:path";
import FormData from "form-data";
import { extension, lookup } from "mime-types";
import { request } from "undici";
import { z } from "zod";
import { ApiVersion } from "../../resources/index.js";
import type {
  ExtractQueryParams,
  ExtractRequestBody,
  ExtractResponseBody,
  TypedRoute,
} from "../../utils/index.js";
import { RateLimitManager } from "./rate-limit.manager.js";
import type {
  ApiErrorResponse,
  DataUri,
  FileAsset,
  FileInput,
  HttpRequestOptions,
  HttpResponse,
} from "./rest.types.js";

const MAX_FILE_COUNT = 10 as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DATA_URI_REGEX = /^data:(.+);base64,(.*)$/;

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
  maxInvalidRequests: z.int().positive().default(10000),
  maxGlobalRequestsPerSecond: z.int().positive().default(50),
});

export class Rest {
  readonly rateLimit: RateLimitManager;
  private readonly options: z.infer<typeof RestOptions>;

  constructor(options: z.input<typeof RestOptions>) {
    try {
      this.options = RestOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }

    this.rateLimit = new RateLimitManager(
      this.options.maxInvalidRequests,
      this.options.maxGlobalRequestsPerSecond,
    );
  }

  async request<T>(options: HttpRequestOptions): Promise<T> {
    const rateLimitCheck = await this.rateLimit.checkRateLimit(options.path);
    if (!rateLimitCheck.canProceed) {
      throw new Error(`Rate limit exceeded: ${rateLimitCheck.reason}`);
    }

    const response = await this.makeHttpRequest<T>(options);
    await this.rateLimit.updateRateLimit(response.headers, response.statusCode);
    return response.data as T;
  }

  get<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path"> & {
      query?: ExtractQueryParams<T["__routeSchema"]["GET"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["GET"]>> {
    return this.request({ ...options, method: "GET", path: path as string });
  }

  post<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path" | "body"> & {
      body?: ExtractRequestBody<T["__routeSchema"]["POST"]>;
      query?: ExtractQueryParams<T["__routeSchema"]["POST"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["POST"]>> {
    return this.request({
      ...options,
      method: "POST",
      path: path as string,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  }

  patch<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path" | "body"> & {
      body?: ExtractRequestBody<T["__routeSchema"]["PATCH"]>;
      query?: ExtractQueryParams<T["__routeSchema"]["PATCH"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["PATCH"]>> {
    return this.request({
      ...options,
      method: "PATCH",
      path: path as string,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  }

  put<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path" | "body"> & {
      body?: ExtractRequestBody<T["__routeSchema"]["PUT"]>;
      query?: ExtractQueryParams<T["__routeSchema"]["PUT"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["PUT"]>> {
    return this.request({
      ...options,
      method: "PUT",
      path: path as string,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  }

  delete<T extends TypedRoute>(
    path: T,
    options?: Omit<HttpRequestOptions, "method" | "path"> & {
      query?: ExtractQueryParams<T["__routeSchema"]["DELETE"]>;
    },
  ): Promise<ExtractResponseBody<T["__routeSchema"]["DELETE"]>> {
    return this.request({ ...options, method: "DELETE", path: path as string });
  }

  async createFormData(
    files: FileInput | FileInput[],
    body?: HttpRequestOptions["body"],
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];
    if (filesArray.length > MAX_FILE_COUNT) {
      throw new Error(`Too many files: ${filesArray.length} (max: ${MAX_FILE_COUNT})`);
    }

    const form = new FormData();
    for (let i = 0; i < filesArray.length; i++) {
      const processed = await this.processFile(filesArray[i] as FileInput);
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

  async toBuffer(input: FileInput): Promise<{ data: Buffer | ReadStream; size: number | null }> {
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
        const stream = createReadStream(input, {
          highWaterMark: 64 * 1024,
          autoClose: true,
        });

        stream.on("error", () => {
          stream.destroy();
        });

        return { data: stream, size: fileStats.size };
      } catch (error) {
        throw new Error(
          `Failed to read file "${input}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    throw new Error(`Unsupported input type: ${typeof input}`);
  }

  async toDataUri(input: FileInput): Promise<DataUri> {
    if (typeof input === "string" && DATA_URI_REGEX.test(input)) {
      return input as DataUri;
    }

    const processed = await this.processFile(input);
    return `data:${processed.contentType};base64,${processed.data.toString("base64")}`;
  }

  private async processFile(input: FileInput): Promise<FileAsset> {
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
    const { data, size } = await this.toBuffer(input);
    return { data, filename, contentType, size };
  }

  private async makeHttpRequest<T>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const preparedRequest = options.files ? await this.handleFileUpload(options) : options;
    const path = `${this.options.baseUrl}/api/v${this.options.version}/${preparedRequest.path.replace(/^\/+/, "")}`;
    const headers = this.buildRequestHeaders(preparedRequest);

    const response = await request<T>(path, {
      method: preparedRequest.method,
      body: preparedRequest.body,
      query: preparedRequest.query,
      headers: headers,
    });

    const result = (await response.body.json()) as T;

    let reason = "";
    if (response.statusCode >= 400 && this.isJsonErrorEntity(result)) {
      const jsonError = result as ApiErrorResponse;
      const formattedFieldErrors = this.formatFieldErrors(jsonError.errors);
      reason = formattedFieldErrors
        ? `${jsonError.message}. Details: ${formattedFieldErrors}`
        : jsonError.message;
    }

    return {
      data: result,
      statusCode: response.statusCode,
      headers: response.headers as Record<string, string>,
      reason,
    };
  }

  private async handleFileUpload(options: HttpRequestOptions): Promise<HttpRequestOptions> {
    if (!options.files) {
      throw new Error("Files are required for file upload");
    }

    const formData = await this.createFormData(options.files, options.body);
    return {
      ...options,
      body: formData.getBuffer(),
      headers: formData.getHeaders(options.headers),
    };
  }

  private buildRequestHeaders(options: HttpRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `${this.options.authType} ${this.options.token}`,
      "user-agent": this.options.userAgent,
      "x-ratelimit-precision": "millisecond",
    };

    if (options.body && !options.files) {
      if (typeof options.body === "string") {
        headers["content-length"] = Buffer.byteLength(options.body, "utf8").toString();
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
      headers["x-audit-log-reason"] = encodeURIComponent(options.reason);
    }

    return headers;
  }

  private isJsonErrorEntity(error: unknown): error is ApiErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number" &&
      "message" in error &&
      typeof error.message === "string"
    );
  }

  private formatFieldErrors(errors?: Record<string, unknown>): string | undefined {
    if (!errors) {
      return undefined;
    }

    const errorParts: string[] = [];
    const processErrors = (obj: Record<string, unknown>, path = ""): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (key === "_errors" && Array.isArray(value) && value.length > 0) {
          const fieldErrors = value.map((err: ApiErrorResponse) => `"${err.message}"`).join(", ");
          errorParts.push(`${path || "general"}: ${fieldErrors}`);
        } else if (value && typeof value === "object") {
          processErrors(value as Record<string, unknown>, currentPath);
        }
      }
    };

    processErrors(errors);
    return errorParts.length > 0 ? errorParts.join("; ") : undefined;
  }
}
