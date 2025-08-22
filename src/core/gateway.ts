import { z } from "zod";
import { BitField } from "../common/index.js";
import { ApiVersion, GatewayIntentBits } from "../constants/index.js";
import { safeImport } from "../utils/index.js";

export interface PayloadEntity {
  op: number;
  d: object | number | null;
  s: number | null;
  t: string | null;
}

const MAX_PAYLOAD_SIZE = 4096;

export const GatewayOptions = z.object({
  token: z.string(),
  intents: z.union([
    z
      .array(z.enum(GatewayIntentBits))
      .transform((value) => Number(BitField.combine(value).valueOf())),
    z.number().int().min(0),
  ]),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  largeThreshold: z.number().int().min(50).max(250).default(50),
  encodingType: z.enum(["json", "etf"]).default("json"),
  compressionType: z.enum(["zlib-stream"]).optional(),
});

export type GatewayOptions = z.infer<typeof GatewayOptions>;

export class Gateway {
  #erlpack: typeof import("erlpack") | null = null;
  #zlibInflate: import("zlib-sync").Inflate | null = null;
  readonly #options: GatewayOptions;

  constructor(options: z.input<typeof GatewayOptions>) {
    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }

      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      if (this.#options.encodingType === "etf" && !this.#erlpack) {
        const result = await safeImport<typeof import("erlpack")>("erlpack");
        if (!result.success) {
          throw new Error(
            "The erlpack module is required for ETF encoding but is not available. " +
              "Please install it with: <npm,yarn,pnpm,bun> install/add erlpack",
          );
        }

        this.#erlpack = result.data;
      }

      if (this.#options.compressionType === "zlib-stream" && !this.#zlibInflate) {
        const result = await safeImport<typeof import("zlib-sync")>("zlib-sync");
        if (!result.success) {
          throw new Error(
            "The zlib-sync module is required for zlib-stream compression but is not available. " +
              "Please install it with: <npm,yarn,pnpm,bun> install/add zlib-sync",
          );
        }

        this.#zlibInflate = new result.data.Inflate();
      }
    } catch (error) {
      throw new Error(`Failed to initialize ${this.#options.encodingType} encoding service`, {
        cause: error,
      });
    }
  }

  destroy(): void {
    this.#erlpack = null;
    this.#zlibInflate = null;
  }

  encodePayload(data: PayloadEntity): Buffer | string {
    try {
      if (this.#options.encodingType === "etf" && !this.#erlpack) {
        throw new Error("Service not initialized. Call initialize() before using encode().");
      }

      const result =
        this.#options.encodingType === "etf"
          ? // biome-ignore lint/style/noNonNullAssertion: It's safe to assert that #erlpack is not null here
            this.#erlpack!.pack(data)
          : JSON.stringify(data);

      const size = Buffer.isBuffer(result) ? result.length : Buffer.byteLength(result);
      if (size > MAX_PAYLOAD_SIZE) {
        throw new Error(
          `Payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} bytes (actual: ${size} bytes). Consider splitting large payloads or removing unnecessary data.`,
        );
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to encode ${this.#options.encodingType} payload`, {
        cause: error,
      });
    }
  }

  decodePayload(data: Buffer | string): PayloadEntity {
    try {
      if (this.#options.encodingType === "etf" && !this.#erlpack) {
        throw new Error("Service not initialized. Call initialize() before using decode().");
      }

      return this.#options.encodingType === "etf"
        ? // biome-ignore lint/style/noNonNullAssertion: It's safe to assert that #erlpack is not null here
          this.#erlpack!.unpack(Buffer.isBuffer(data) ? data : Buffer.from(data))
        : JSON.parse(typeof data === "string" ? data : data.toString("utf-8"));
    } catch (error) {
      throw new Error(`Failed to decode ${this.#options.encodingType} payload`, {
        cause: error,
      });
    }
  }

  decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      return Buffer.alloc(0);
    }

    try {
      this.#zlibInflate.push(data);
      if (this.#zlibInflate.err < 0) {
        const errorMessage = this.#zlibInflate.msg || `Zlib error code: ${this.#zlibInflate.err}`;
        throw new Error(`Native zlib decompression failed: ${errorMessage}`);
      }

      return Buffer.isBuffer(this.#zlibInflate.result)
        ? this.#zlibInflate.result
        : Buffer.from(this.#zlibInflate.result || []);
    } catch (error) {
      throw new Error(
        `High-performance zlib decompression failed: ${(error as Error).message}. This may indicate corrupted data, stream state issues, or native module problems.`,
      );
    }
  }
}
